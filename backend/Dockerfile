# Use Python 3.10 slim image
FROM python:3.10-slim

# Set working directory
WORKDIR /app

# Install system dependencies required for OpenCV and other libraries
RUN apt-get update && apt-get install -y \
    libgl1 \
    libglib2.0-0 \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements file
COPY requirements.txt .

# Install Python dependencies
# Increase timeout for large downloads (like torch)
RUN pip install --no-cache-dir -r requirements.txt --timeout=1000

# Copy application code
COPY . .

# Create a writable directory for the temporary files and cache
# Hugging Face Spaces runs as user 1000 by default, so we need to ensure permissions
RUN mkdir -p /app/cache && chmod 777 /app/cache
ENV MPLCONFIGDIR=/app/cache
ENV TORCH_HOME=/app/cache

# Expose the port used by Hugging Face Spaces
EXPOSE 7860

# Command to run the application
# Using gunicorn with threads for concurrency
# Binding to 0.0.0.0:7860 as required by Spaces
CMD ["gunicorn", "-b", "0.0.0.0:7860", "-w", "1", "-k", "gthread", "--threads", "8", "--timeout", "0", "app:app"]
