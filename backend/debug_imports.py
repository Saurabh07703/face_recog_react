import numpy
print(f"Numpy: {numpy.__version__}")
import scipy
print(f"Scipy: {scipy.__version__}")
try:
    from sklearn.metrics.pairwise import cosine_similarity
    print("Sklearn loaded successfully.")
except Exception as e:
    print(f"Sklearn Import Error: {e}")
