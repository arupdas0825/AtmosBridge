FROM python:3.11-slim

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Install Python requirements
COPY backend/requirements.txt /app/backend/
RUN pip install --no-cache-dir -r /app/backend/requirements.txt

# Copy source code and scripts
COPY backend /app/backend
COPY scripts /app/scripts
COPY docs /app/docs

# Seed simulated datasets & train model
RUN python /app/scripts/seed_data.py && python /app/scripts/train_model.py

WORKDIR /app/backend

ENV PORT=8080
ENV HOST=0.0.0.0
ENV ENVIRONMENT=production

EXPOSE 8080

CMD exec uvicorn main:app --host 0.0.0.0 --port ${PORT}
