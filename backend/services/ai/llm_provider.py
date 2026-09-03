import os

import httpx

GEMINI_API_KEY = os.environ.get("GEMINI_API_KEY", "").strip()
GEMINI_MODEL = os.environ.get("GEMINI_MODEL", "gemini-flash-latest")
OLLAMA_HOST = os.environ.get("OLLAMA_HOST", "http://localhost:11434")
OLLAMA_MODEL = os.environ.get("OLLAMA_MODEL", "qwen2.5:latest")
LLM_TIMEOUT_SECONDS = float(os.environ.get("LLM_TIMEOUT_SECONDS", 20))
# Bounded so a stuck/overloaded local Ollama fails fast with a clear message
# instead of hanging the UI for minutes — the frontend has its own retry
# button for a manual second attempt. Covers a typical cold model-load;
# raise via env var if your hardware needs more.
OLLAMA_TIMEOUT_SECONDS = float(os.environ.get("OLLAMA_TIMEOUT_SECONDS", 35))
# Ollama unloads idle models from memory after a few minutes; reloading a
# multi-GB model can take 60s+ on CPU. keep_alive keeps it resident so a
# cold reload doesn't happen mid-demo after a few minutes of inactivity.
OLLAMA_KEEP_ALIVE = os.environ.get("OLLAMA_KEEP_ALIVE", "30m")
# Used only for the background startup warm-up (not the request path),
# where a longer wait is fine since nothing user-facing is blocked on it.
OLLAMA_WARMUP_TIMEOUT_SECONDS = float(os.environ.get("OLLAMA_WARMUP_TIMEOUT_SECONDS", 90))


def _call_gemini(prompt: str, system_prompt: str) -> str:
    # The key goes in the x-goog-api-key header, not a ?key= query param —
    # some Gemini key types silently fall into an unauthenticated/zero-quota
    # path with the query-param form (causing generateContent to hang
    # indefinitely instead of failing fast).
    url = f"https://generativelanguage.googleapis.com/v1beta/models/{GEMINI_MODEL}:generateContent"
    body = {
        "system_instruction": {"parts": [{"text": system_prompt}]},
        "contents": [{"role": "user", "parts": [{"text": prompt}]}],
        "generationConfig": {"temperature": 0.3, "maxOutputTokens": 500},
    }
    headers = {"x-goog-api-key": GEMINI_API_KEY, "Content-Type": "application/json"}
    with httpx.Client(timeout=LLM_TIMEOUT_SECONDS) as client:
        resp = client.post(url, json=body, headers=headers)
        resp.raise_for_status()
        data = resp.json()
        return data["candidates"][0]["content"]["parts"][0]["text"].strip()


def _call_ollama(prompt: str, system_prompt: str, timeout: float) -> str:
    url = f"{OLLAMA_HOST}/api/generate"
    body = {
        "model": OLLAMA_MODEL,
        "prompt": prompt,
        "system": system_prompt,
        "stream": False,
        "keep_alive": OLLAMA_KEEP_ALIVE,
        "options": {"temperature": 0.3},
    }
    with httpx.Client(timeout=timeout) as client:
        resp = client.post(url, json=body)
        resp.raise_for_status()
        data = resp.json()
        return data.get("response", "").strip()


def warm_up_ollama() -> None:
    """Fire-and-forget model preload, called once at server startup so the
    first real user request doesn't pay the cold-load cost. Runs in a
    background thread — a slow/stuck Ollama here never blocks server boot
    or any user request."""
    try:
        _call_ollama("Hi", "Reply with one word.", timeout=OLLAMA_WARMUP_TIMEOUT_SECONDS)
    except Exception:
        pass  # Ollama may not be running yet — the next real request will just retry normally


def get_llm_response(prompt: str, system_prompt: str) -> tuple[str, str]:
    """Returns (text, provider). Tries Gemini first (if configured), falls
    back to local Ollama automatically on any failure/timeout/rate-limit.
    Never raises, and never blocks longer than OLLAMA_TIMEOUT_SECONDS —
    always returns a user-facing string within a bounded time."""
    if GEMINI_API_KEY:
        try:
            return _call_gemini(prompt, system_prompt), "gemini"
        except Exception:
            pass  # fall through to Ollama

    try:
        return _call_ollama(prompt, system_prompt, OLLAMA_TIMEOUT_SECONDS), "ollama"
    except Exception:
        return (
            "I'm unable to reach the AI service right now. Please try again shortly.",
            "unavailable",
        )
