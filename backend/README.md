---
title: Face Recognition Backend
emoji: 🧑‍ |
colorFrom: blue
colorTo: purple
sdk: docker
pinned: false
app_port: 7860
---

# Face Recognition Backend

This is the backend for the Face Recognition Application, deployed on Hugging Face Spaces using Docker.

## Endpoints

- `GET /`: Health check and info.
- `POST /upload`: Register a new face.
- `POST /match`: Match an uploaded image against the database.
- `GET /faces`: List registered faces.
