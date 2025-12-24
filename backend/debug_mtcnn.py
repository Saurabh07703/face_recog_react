import torch
import numpy as np
import cv2
from facenet_pytorch import MTCNN
from PIL import Image
import sys

print(f"Python: {sys.version}")
print(f"NumPy: {np.__version__}")
print(f"PyTorch: {torch.__version__}")
print(f"OpenCV: {cv2.__version__}")

try:
    print("Initializing MTCNN...")
    device = torch.device('cuda:0' if torch.cuda.is_available() else 'cpu')
    mtcnn = MTCNN(keep_all=False, select_largest=True, device=device)
    print("MTCNN Initialized.")

    # Create dummy image
    print("Creating dummy image...")
    dummy_img = np.zeros((480, 640, 3), dtype=np.uint8)
    cv2.circle(dummy_img, (320, 240), 50, (255, 255, 255), -1) # White circle
    
    rgb_img = cv2.cvtColor(dummy_img, cv2.COLOR_BGR2RGB)
    pil_img = Image.fromarray(rgb_img)
    
    print("Running detection...")
    boxes, probs = mtcnn.detect(pil_img)
    print(f"Detection result: {boxes}")
    print("Success!")

except Exception as e:
    print(f"FAILURE: {e}")
    import traceback
    traceback.print_exc()
