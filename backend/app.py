from flask import Flask, request, jsonify
from flask_cors import CORS
import cv2
import numpy as np
import base64
import json
import os
import uuid
from sklearn.metrics.pairwise import cosine_similarity
from facenet_pytorch import InceptionResnetV1, MTCNN
import torch
import time
import firebase_admin
from firebase_admin import credentials, firestore
from PIL import Image
import gc

app = Flask(__name__)
# Enable CORS for all routes
CORS(app, resources={r"/*": {"origins": "*"}}) 

app.config['MAX_CONTENT_LENGTH'] = 16 * 1024 * 1024 # 16MB limit

@app.before_request
def log_request_info():
    print(f"Incoming {request.method} request to {request.path}")
    # Removed body logging to prevent memory issues with large payloads

# Global variables for models (Lazy persistence)
mtcnn_detector = None
facenet_model = None
device = None

def get_models():
    global mtcnn_detector, facenet_model, device
    if mtcnn_detector is None or facenet_model is None:
        print("Loading models for the first time...")
        # Determine device
        device = torch.device('cuda:0' if torch.cuda.is_available() else 'cpu')
        print(f"Running on device: {device}")
        
        # Disable gradients globally for inference to save memory
        torch.set_grad_enabled(False)
        torch.set_num_threads(1) # CRITICAL: Limit CPU threads to prevent OOM on Render free tier

        
        # Load MTCNN
        mtcnn_detector = MTCNN(keep_all=False, select_largest=True, device=device)
        
        # Load FaceNet
        facenet_model = InceptionResnetV1(pretrained='vggface2').eval().to(device)
        
        # QUANTIZATION: Reduce model size for CPU (Render Free Tier)
        if device.type == 'cpu':
            print("Quantizing model for CPU optimization...")
            facenet_model = torch.quantization.quantize_dynamic(
                facenet_model, {torch.nn.Linear}, dtype=torch.qint8
            )

        # Force garbage collection
        gc.collect()
        
        # Clear intermediate variables
        if 'img_tensor' in locals(): del img_tensor
        torch.cuda.empty_cache() # harmless on CPU
        gc.collect()
        
        print("Models loaded successfully. Memory cleanup done.")
        
    return mtcnn_detector, facenet_model, device

# Initialize Firebase
db = None
try:
    # Check local file (dev) or Render secret path (prod)
    cred_path = "serviceAccountKey.json"
    if not os.path.exists(cred_path):
        cred_path = "/etc/secrets/serviceAccountKey.json"

    if os.path.exists(cred_path):
        cred = credentials.Certificate(cred_path)
        firebase_admin.initialize_app(cred)
        db = firestore.client()
        print(f"Firebase initialized successfully using {cred_path}")
    else:
        print("Warning: serviceAccountKey.json not found in local or /etc/secrets/. Running in local mode.")
except Exception as e:
    print(f"Error initializing Firebase: {e}")
    print("Running in local mode.")

# Function to extract features from an image using FaceNet model
def extract_features_facenet(image):
    _, model, dev = get_models() # Ensure loaded
    try:
        # ... (rest of function) ...
        # (Replace 'device' usage with 'dev' if needed or rely on global if simpler, 
        # but 'dev' is safer from the getter)
        
        if isinstance(image, np.ndarray):
            pass
        
        pil_image = Image.fromarray(image)
        pil_image = pil_image.resize((160, 160))
        
        img_tensor = torch.tensor(np.array(pil_image), dtype=torch.float32).to(dev)
        img_tensor = img_tensor.permute(2, 0, 1).unsqueeze(0)
        img_tensor = (img_tensor - 127.5) / 128.0

        features = model(img_tensor)
        features = features.detach().cpu().numpy().flatten()
        return features
    except Exception as e:
        print(f"Error extraction features: {e}")
        return None

# ... (read_database and write_to_db remain the same) ...

# ...

@app.route('/upload', methods=['POST'])
def upload():
    if not request.json or 'image' not in request.json or 'name' not in request.json or 'orientation' not in request.json:
        return jsonify({'error': 'Incomplete data or invalid JSON'}), 400

    name = request.json['name']
    orientation = request.json['orientation']
    
    try:
        # Support both 'data:image/jpeg;base64,xxxx' and raw 'xxxx'
        if ',' in request.json['image']:
            image_data = request.json['image'].split(',')[1]
        else:
            image_data = request.json['image']
        
        # Decode base64 to bytes
        try:
            image_bytes = base64.b64decode(image_data)
        except Exception as e:
             return jsonify({'error': 'Invalid base64 image data'}), 400

        if not image_bytes:
            return jsonify({'error': 'Empty image data'}), 400

        # Robust decoding
        image = None
        try:
            nparr = np.array(bytearray(image_bytes), dtype=np.uint8)
            image = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
        except Exception as e:
             print(f"cv2.imdecode exception: {e}")

        # Fallback if memory decode failed
        if image is None:
            print("Fallback to file decoding...")
            try:
                temp_filename = f"temp_{uuid.uuid4().hex}.png"
                with open(temp_filename, "wb") as f:
                    f.write(image_bytes)
                image = cv2.imread(temp_filename)
                if os.path.exists(temp_filename):
                    os.remove(temp_filename)
            except Exception as e2:
                 return jsonify({'error': f'Failed to decode image: {str(e2)}'}), 400

        if image is None:
             return jsonify({'error': 'Failed to decode image'}), 400

        # Ensure models are loaded before processing
        detector, model, dev = get_models()

        # Convert BGR to RGB for MTCNN
        image_rgb = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)
        
        # RESIZE for Memory Optimization if too large
        max_width = 640
        h, w, _ = image_rgb.shape
        if w > max_width:
            scale = max_width / float(w)
            new_h = int(h * scale)
            image_rgb = cv2.resize(image_rgb, (max_width, new_h))
            print(f"Resized image for detection to {max_width}x{new_h}")
        
        # Perform face detection using facenet-pytorch MTCNN
        # Detect returns bounding boxes and probabilities
        try:
            boxes, _ = detector.detect(Image.fromarray(image_rgb))
        except Exception as e:
             print(f"MTCNN detect error: {e}")
             return jsonify({'error': f"Face detection error: {str(e)}"}), 500

        if boxes is None:
            return jsonify({'error': 'No faces detected'}), 400

        # Take the first face (since select_largest=True)
        box = boxes[0]
        x1, y1, x2, y2 = [int(b) for b in box]
        
        # Ensure within bounds
        h, w, _ = image_rgb.shape
        x1 = max(0, x1)
        y1 = max(0, y1)
        x2 = min(w, x2)
        y2 = min(h, y2)
        
        # Extract face ROI
        face_roi = image_rgb[y1:y2, x1:x2]
        
        if face_roi.size == 0:
             return jsonify({'error': 'Face ROI is empty'}), 400

        features = extract_features_facenet(face_roi)

        if features is None:
            return jsonify({'error': 'Failed to extract features'}), 500

        write_success = write_to_db(name, orientation, features)
        if not write_success:
             return jsonify({'error': 'Failed to save to database'}), 500
        
        return jsonify({'message': 'Face registered successfully', 'name': name})

    except Exception as e:
        print(f"Error in upload: {e}")
        return jsonify({'error': str(e)}), 500

def read_database(filename='features.txt'):
    # If using Firebase
    if db:
        try:
            docs = db.collection('faces').stream()
            entries = []
            for doc in docs:
                data = doc.to_dict()
                # Ensure features usually stored as list in firestore are retrieved correctly
                entries.append(data)
            return entries
        except Exception as e:
            print(f"Error reading from Firestore: {e}")
            return []
            
    # Fallback to local file
    entries = []
    if os.path.exists(filename):
        with open(filename, 'r') as file:
            for line in file:
                try:
                    entry = json.loads(line)
                    entries.append(entry)
                except json.JSONDecodeError:
                    continue
    return entries

def write_to_db(name, orientation, features):
    # If using Firebase
    if db:
        try:
            faces_ref = db.collection('faces')
            # Check if exists
            query = faces_ref.where('name', '==', name).where('orientation', '==', orientation).limit(1).get()
            
            data = {
                'name': name,
                'orientation': orientation,
                'features': features.tolist()
            }
            
            if query:
                # Update existing
                doc_id = query[0].id
                faces_ref.document(doc_id).update({'features': data['features']})
                print(f"Updated Firestore document for {name}")
            else:
                # Add new
                faces_ref.add(data)
                print(f"Created new Firestore document for {name}")
            return True
        except Exception as e:
            print(f"Error writing to Firestore: {e}")
            return False

    # Fallback to local file
    entries = read_database()
    filename = 'features.txt'
    
    existing_entry_index = next((i for i, entry in enumerate(entries) if entry['name'] == name and entry['orientation'] == orientation), None)

    if existing_entry_index is not None:
        entries[existing_entry_index]['features'] = features.tolist()
    else:
        entry = {'name': name, 'orientation': orientation, 'features': features.tolist()}
        entries.append(entry)
    
    with open(filename, 'w') as file:
        for entry in entries:
            line = json.dumps(entry)
            file.write(line + '\n')
            
    return True

@app.route('/')
def home():
    return jsonify({
        'message': 'Face Recognition API is running',
        'endpoints': ['/upload', '/match', '/health'],
        'backend': 'firebase' if db else 'local'
    })

import threading

@app.route('/health', methods=['GET'])
def health():
    # Trigger model loading in background
    def prewarm():
        try:
            get_models()
            print("Models pre-warmed successfully in background.")
        except Exception as e:
            print(f"Background pre-warm error: {e}")
            
    threading.Thread(target=prewarm).start()
    
    return jsonify({
        "status": "ok", 
        "backend": "firebase" if db else "local",
        "message": "Warm-up triggered"
    })

@app.route('/faces', methods=['GET'])
def get_faces():
    """List distinct names in the database."""
    entries = read_database()
    # Extract distinct names and their orientations count
    names_data = {}
    for entry in entries:
        if not isinstance(entry, dict): continue
        name = entry.get('name')
        if not name: continue
        
        orientation = entry.get('orientation', 'unknown')
        if name not in names_data:
            names_data[name] = []
        names_data[name].append(orientation)
    
    result = []
    for name, orientations in names_data.items():
        result.append({
            'name': name,
            'orientations': orientations,
            'count': len(orientations)
        })
        
    return jsonify(result)

@app.route('/delete_face', methods=['POST'])
def delete_face():
    """Delete all entries for a given name."""
    if 'name' not in request.json:
        return jsonify({'error': 'Name is required'}), 400
    
    name = request.json['name']
    
    try:
        # If using Firebase
        if db:
            faces_ref = db.collection('faces')
            docs = faces_ref.where('name', '==', name).stream()
            deleted_count = 0
            for doc in docs:
                doc.reference.delete()
                deleted_count += 1
            return jsonify({'message': f'Deleted {deleted_count} entries for {name}'})
            
        # Fallback to local file
        entries = read_database()
        new_entries = [e for e in entries if e['name'] != name]
        
        if len(entries) == len(new_entries):
             return jsonify({'error': 'Name not found'}), 404
             
        filename = 'features.txt'
        with open(filename, 'w') as file:
            for entry in new_entries:
                line = json.dumps(entry)
                file.write(line + '\n')
        
        return jsonify({'message': f'Deleted entries for {name} successfully'})
        
    except Exception as e:
        print(f"Error in delete_face: {e}")
        return jsonify({'error': str(e)}), 500

@app.route('/match', methods=['POST'])
def perform_match():
    time1 = time.time()
    if not request.json or 'image' not in request.json:
        return jsonify({'error': 'No image data or invalid JSON'}), 400

    try:
        # Support both 'data:image/jpeg;base64,xxxx' and raw 'xxxx'
        if ',' in request.json['image']:
            image_data = request.json['image'].split(',')[1]
        else:
            image_data = request.json['image']
            
        image_bytes = base64.b64decode(image_data)
        
        # Robust decoding (reuse logic)
        image = None
        try:
            nparr = np.array(bytearray(image_bytes), dtype=np.uint8)
            image = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
        except:
             pass
             
        if image is None:
             try:
                temp_filename = f"temp_{uuid.uuid4().hex}.png"
                with open(temp_filename, "wb") as f:
                    f.write(image_bytes)
                image = cv2.imread(temp_filename)
                if os.path.exists(temp_filename):
                    os.remove(temp_filename)
             except:
                  return jsonify({'error': 'Failed to decode image'}), 400
                  
        if image is None:
             return jsonify({'error': 'Failed to decode image'}), 400

        # Ensure models are loaded
        detector, model, dev = get_models()

        image_rgb = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)
        
        # Detect face
        boxes, _ = detector.detect(Image.fromarray(image_rgb))

        if boxes is None:
            return jsonify({'error': 'No faces detected'}), 400

        box = boxes[0]
        x1, y1, x2, y2 = [int(b) for b in box]
        
        h, w, _ = image_rgb.shape
        x1, y1, x2, y2 = max(0, x1), max(0, y1), min(w, x2), min(h, y2)
        
        face_roi = image_rgb[y1:y2, x1:x2]
        
        start_time = time.time()
        captured_features = extract_features_facenet(face_roi)
        end_time = time.time()
        print("the time taken by model is: ", end_time-start_time)

        if captured_features is None:
            return jsonify({'error': 'Failed to extract features'}), 500

        entries = read_database()
        best_matched_name = None
        best_similarity_score = -1

        for entry in entries:
            entry_name = entry['name']
            entry_features = entry['features']
            if entry_features is None: continue
            
            captured_features_normalized = captured_features / np.linalg.norm(captured_features)
            entry_features_normalized = np.array(entry_features) / np.linalg.norm(entry_features)
            
            similarity_score = cosine_similarity([captured_features_normalized], [entry_features_normalized])[0, 0]
            
            if similarity_score > best_similarity_score:
                best_similarity_score = similarity_score
                best_matched_name = entry_name

        threshold = 0.7
        is_match = True
        if best_similarity_score < threshold:
            best_matched_name = "Unknown"
            is_match = False

        time2 = time.time()
        print("Total time:", time2-time1)

        return jsonify({
            'matched_name': best_matched_name,
            'similarity_score': float(best_similarity_score),
            'is_match': is_match
        })

    except Exception as e:
        print(f"Error in match: {e}")
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    app.run(host='0.0.0.0', port=port)
