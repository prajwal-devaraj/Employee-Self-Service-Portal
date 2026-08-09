FROM python:3.12-slim

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PIP_DISABLE_PIP_VERSION_CHECK=1 \
    PYTHONPATH=/srv/ess-api

WORKDIR /srv/ess-api

COPY pyproject.toml ./
COPY alembic.ini ./
COPY alembic ./alembic
COPY app ./app

RUN python -m pip install --no-cache-dir .

RUN addgroup --system ess && \
    adduser --system --ingroup ess ess && \
    chown -R ess:ess /srv/ess-api

USER ess

EXPOSE 8000

CMD ["python", "-m", "uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
