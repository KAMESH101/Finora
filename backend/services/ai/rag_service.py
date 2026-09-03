"""RAG retrieval — scoped strictly by user_id at the SQL layer before any
similarity scoring, so one user's data can never surface in another's
context. Used only for unstructured/contextual text (conversation recall,
insights) — never for numeric financial facts (see financial_data_service)."""
import numpy as np
from sqlalchemy.orm import Session

from models.db_models import KnowledgeChunk
from services.ai.embeddings import cosine_similarity, get_embedding_provider

try:
    from sklearn.feature_extraction.text import TfidfVectorizer
except ImportError:
    TfidfVectorizer = None


def ingest_chunk(db: Session, user_id: int, text: str, data_type: str, source_ref: str = "") -> None:
    provider = get_embedding_provider()
    if provider == "gemini":
        from services.ai.embeddings import _gemini_embed

        try:
            vec = np.array(_gemini_embed(text), dtype=np.float32)
            embedding_bytes = vec.tobytes()
            dim = len(vec)
        except Exception:
            embedding_bytes = b""
            dim = 0
            provider = "tfidf"
    else:
        embedding_bytes = b""  # tfidf vectors are recomputed at query time (see retrieve below)
        dim = 0

    db.add(
        KnowledgeChunk(
            user_id=user_id,
            data_type=data_type,
            source_ref=source_ref,
            chunk_text=text,
            embedding=embedding_bytes,
            embedding_dim=dim,
            embedding_provider=provider,
        )
    )
    db.commit()


def retrieve_relevant_chunks(db: Session, user_id: int, query: str, top_k: int = 5) -> list[dict]:
    # CRITICAL: filter by user_id in SQL before any scoring.
    chunks = db.query(KnowledgeChunk).filter(KnowledgeChunk.user_id == user_id).all()
    if not chunks:
        return []

    provider = get_embedding_provider()
    scored: list[tuple[float, KnowledgeChunk]] = []

    if provider == "gemini":
        from services.ai.embeddings import _gemini_embed

        try:
            query_vec = np.array(_gemini_embed(query), dtype=np.float32)
            for c in chunks:
                if c.embedding_provider != "gemini" or not c.embedding:
                    continue
                chunk_vec = np.frombuffer(c.embedding, dtype=np.float32)
                score = cosine_similarity(query_vec, chunk_vec)
                scored.append((score, c))
        except Exception:
            provider = "tfidf"  # fall back below

    if provider == "tfidf" and TfidfVectorizer is not None:
        texts = [c.chunk_text for c in chunks] + [query]
        try:
            matrix = TfidfVectorizer(max_features=256, stop_words="english").fit_transform(texts)
            query_vec = matrix[-1].toarray()[0]
            for i, c in enumerate(chunks):
                chunk_vec = matrix[i].toarray()[0]
                score = cosine_similarity(np.array(query_vec), np.array(chunk_vec))
                scored.append((score, c))
        except ValueError:
            return []  # empty vocabulary (e.g. all-stopword corpus)

    scored.sort(key=lambda x: x[0], reverse=True)
    RELEVANCE_THRESHOLD = 0.1
    top = [c for score, c in scored[:top_k] if score >= RELEVANCE_THRESHOLD]
    return [{"text": c.chunk_text, "data_type": c.data_type, "source_ref": c.source_ref} for c in top]
