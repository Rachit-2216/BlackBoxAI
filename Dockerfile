FROM python:3.11-slim

ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

WORKDIR /app

RUN apt-get update \
    && apt-get install -y --no-install-recommends build-essential \
    && rm -rf /var/lib/apt/lists/*

COPY requirements_api.txt .
RUN pip install --no-cache-dir -r requirements_api.txt

COPY api_server.py README.md ./
COPY standard_model ./standard_model
COPY proprietary_model ./proprietary_model
COPY datasets ./datasets
COPY docs ./docs

ENV MODEL_API_HOST=0.0.0.0
ENV MODEL_API_PORT=5000

EXPOSE 5000

CMD ["gunicorn", "api_server:app", "--bind", "0.0.0.0:5000", "--workers", "1", "--timeout", "180"]
