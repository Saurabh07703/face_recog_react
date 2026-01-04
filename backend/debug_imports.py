import numpy
print(f"Numpy: {numpy.__version__}")
import scipy
print(f"Scipy: {scipy.__version__}")
try:
    from sklearn.metrics.pairwise import cosine_similarity
    print("Sklearn loaded successfully.")
except Exception as e:
    print(f"Sklearn Import Error: {e}")

try:
    import torch
    print(f"Torch: {torch.__version__}")
except Exception as e:
    print(f"Torch Import Error: {e}")

try:
    import torchvision
    print(f"Torchvision: {torchvision.__version__}")
except Exception as e:
    print(f"Torchvision Import Error: {e}")

try:
    import facenet_pytorch
    print("facenet_pytorch loaded successfully.")
except Exception as e:
    print(f"facenet_pytorch Import Error: {e}")
    
try:
    import cv2
    print(f"OpenCV: {cv2.__version__}")
except Exception as e:
    print(f"OpenCV Import Error: {e}")
