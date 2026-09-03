"""Pluggable embedding provider: Gemini text-embedding-004 when
GEMINI_API_KEY is configured, otherwise a local TF-IDF vectorizer (fit
per-query over the user's own chunk corpus in rag_service, since TF-IDF
vectors are only comparable when fit together) so RAG works fully offline.
Either way, embeddings are only used for unstructured/contextual retrieval —
never for numeric financial facts."""
import os

import httpx
import numpy as np

GEMINI_API_KEY = os.environ.get("GEMINI_API_KEY", "").strip()
GEMINI_EMBEDDING_MODEL = os.environ.get("GEMINI_EMBEDDING_MODEL", "gemini-embedding-001")


def get_embedding_provider() -> str:
    return "gemini" if GEMINI_API_KEY else "tfidf"


def _gemini_embed(text: str) -> list[float]:
    url = f"https://generativelanguage.googleapis.com/v1beta/models/{GEMINI_EMBEDDING_MODEL}:embedContent"
    body = {"content": {"parts": [{"text": text}]}}
    headers = {"x-goog-api-key": GEMINI_API_KEY, "Content-Type": "application/json"}
    with httpx.Client(timeout=8) as client:
        resp = client.post(url, json=body, headers=headers)
        resp.raise_for_status()
        return resp.json()["embedding"]["values"]


def cosine_similarity(a: np.ndarray, b: np.ndarray) -> float:
    if a.shape != b.shape or np.linalg.norm(a) == 0 or np.linalg.norm(b) == 0:
        return 0.0
    return float(np.dot(a, b) / (np.linalg.norm(a) * np.linalg.norm(b)))
