# FROM python:3.13.1-slim-bookworm AS base --- THIS PULLS FROM DOCKER HUB WHICH IS RATE LIMITED
FROM public.ecr.aws/docker/library/python:3.13.1-slim-bookworm AS base

ENV PYTHONDONTWRITEBYTECODE 1
ENV PYTHONUNBUFFERED 1

RUN apt-get update && apt-get install -y curl unzip software-properties-common git        
RUN apt-get clean && rm -rf /var/lib/apt/lists/*

# =================================================================
# STAGE 2: BUILDER
# =================================================================
FROM base AS builder
WORKDIR /install

RUN pip install --no-cache-dir --upgrade pip setuptools wheel
RUN pip install --no-cache-dir --default-timeout=100 pipenv
COPY Pipfile Pipfile.lock ./
RUN pipenv install --system --verbose


# =================================================================
# STAGE 3: APP
# =================================================================
FROM builder AS app
WORKDIR /code
COPY . /code/
CMD [ "python", "-m", "app.main" ]