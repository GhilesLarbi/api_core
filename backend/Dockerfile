# FROM python:3.13.1-slim-bookworm --- Docker Hub is rate limited, pull from the ECR mirror instead.
FROM public.ecr.aws/docker/library/python:3.13.1-slim-bookworm AS base
WORKDIR /app

ENV PYTHONDONTWRITEBYTECODE 1
ENV PYTHONUNBUFFERED 1

RUN apt-get update && apt-get install -y \
    git build-essential ca-certificates libmagic1 \
    --no-install-recommends && \
    update-ca-certificates && \
    rm -rf /var/lib/apt/lists/*

RUN pip install --no-cache-dir pipenv
COPY Pipfile Pipfile.lock ./
RUN pipenv sync --system --verbose

COPY . /app/

# =================================================================
# =================================================================
FROM base AS api
CMD [ "python", "-m", "app.main" ]

# =================================================================
# =================================================================
FROM base AS worker
CMD [ "python", "-m", "app.taskiq.worker" ]

# =================================================================
# =================================================================
FROM base AS scheduler
CMD [ "python", "-m", "app.taskiq.scheduler" ]
