# Finora — AI-Powered Finance & Payments Platform

Finora is a full-stack fintech web app: a wallet, credit card, and payments platform with a real LLM-powered financial assistant, voice-driven payments, and biometric-style transaction security. It started as a hackathon project (Prompt-a-thon 2025, VIT Chennai) and has since been rebuilt with a real backend, database, and AI layer.

---

## What's implemented

### 1. Branding
Finora's logo (navy "F" mark merging into a green upward arrow) is wired into the login screen, sidebar navigation (desktop + mobile, expanded + collapsed), the Wallet page header, and the AI Assistant widget — with a transparent background so it reads correctly on both light and dark surfaces.

### 2. Real LLM + RAG financial assistant
The AI Assistant is backed by a real backend AI service, not a mock:

- **LLM routing:** Gemini (primary, when `GEMINI_API_KEY` is configured) → **Ollama** running `qwen2.5:latest` locally (automatic fallback on any Gemini failure, timeout, or rate limit). If no Gemini key is set, it goes straight to Ollama.
- **Structured facts vs. RAG:** Numeric financial facts (balance, transactions, credit limit/utilization, credit score, recent recipients) are always fetched directly from the database (`financial_data_service.py`) — never from embeddings, and never invented by the model. Unstructured/contextual recall (e.g. "what did we talk about earlier") uses a lightweight RAG pipeline: chunking, embeddings (Gemini `gemini-embedding-001` when available, otherwise a local TF-IDF vectorizer so it works fully offline), and per-user cosine-similarity retrieval.
- **Per-user isolation:** every structured lookup and every RAG query is scoped by the authenticated user's ID from the JWT — never by anything the client or the LLM supplies. One user can never retrieve another's data (verified in testing).
- **No hallucination:** a lightweight intent router decides if a message is a financial question; if it is and there's no supporting data, the assistant says so explicitly instead of guessing. Prompt-injection defenses are built into the system prompt (retrieved context is explicitly labeled as data, not instructions).
- General conversation (greetings, "what can you do") gets a normal conversational reply — only financial questions with no backing data are refused.

### 3. Credit-limit & utilization alerts (text + voice)
A reusable alert system (`CreditAlertContext` + `CreditLimitAlertModal`), invoked from the Credit Card page, the wallet/payment flow, and the voice payment flow:

- Blocks a transaction outright if it would exceed the available credit limit.
- Warns (with an option to proceed or cancel) if a transaction would push utilization past a configurable threshold (`CREDIT_UTILIZATION_WARNING_THRESHOLD`, default 80%).
- A speaker button reads the alert aloud via the browser's native `speechSynthesis` API (no paid TTS service) and can be stopped mid-speech.

### 4. Transaction PIN + face verification
- **PIN:** 4–6 digit transaction PIN, bcrypt-hashed (never stored or logged in plain text), set/changed from Settings → Security. Backend enforces rate limiting: 5 incorrect attempts locks the account for 15 minutes, even against the *correct* PIN.
- **Face verification:** a consent-based enrollment flow in Settings. Verification is backend-authoritative — it issues a short-lived, signed, purpose-scoped JWT ("face verified") that the payment endpoint independently validates; a client-asserted boolean is never trusted. **Note:** to keep the demo reliable regardless of camera hardware/browser permissions, the match step itself is simulated (always succeeds once enrolled) rather than doing live face-descriptor matching — the *security architecture* (consent, backend-issued token, server-side validation) is real, the *biometric comparison* is not. This is documented here deliberately for evaluation transparency.

### 5. Voice payment assistant (inside the Wallet page)
A full voice-driven payment flow, reachable from a "Voice Pay" button on the Wallet page:

1. **Face verification** (must be enrolled first, in Settings).
2. **Voice command** via the browser's native Web Speech API (`SpeechRecognition`) — e.g. "Send 500 to Dinesh". A regex parser extracts amount + recipient; if the phrasing doesn't match, it falls back to an LLM extraction call. A **typed-command fallback** is always available in the same screen, so the flow still works if voice recognition isn't supported or the mic is denied.
3. **Contact resolution** — searches the user's own contacts; if multiple people match, shows a picker (never auto-selects between people).
4. **Confirmation screen** — recipient + amount shown explicitly, requires an explicit tap to proceed.
5. **Transaction PIN** — validated server-side.
6. **Atomic, idempotent execution** — the payment only executes after auth + face token + PIN + balance + limit checks all pass server-side, inside one atomic DB transaction. A duplicate request (e.g. a double-click or network retry) replays the cached result instead of charging twice.
7. **Success screen** with recipient, amount, reference ID, and updated balance.

The LLM is only ever used to *parse* intent — it never authorizes or executes a payment; every check (PIN, face token, balance, contact ownership) is re-validated independently server-side regardless of what the client or LLM claims.

---

## Architecture

```
frontend/          React 18 + TypeScript + Vite
  src/components/  UI (Wallet, Credit Score, Settings, AIAssistant, VoicePaymentAssistant, ...)
  src/utils/        API clients (walletAPI, creditCardAPI, contactsAPI, pinAPI, faceAPI, aiAPI, voicePaymentAPI, ...)
  src/hooks/        useSpeechRecognition, useSpeechSynthesis
  src/contexts/     CreditAlertContext

backend/            FastAPI + SQLAlchemy + SQLite
  main.py            App entrypoint, router registration, CORS, Ollama warm-up
  database.py        SQLAlchemy engine/session
  models/db_models.py  User, Wallet, CreditCard, Transaction, Contact, PinAuth,
                        FaceProfile, ChatMessage, KnowledgeChunk, IdempotencyKey
  routes/            auth, wallet, creditcard, contacts, pin, face, voice, ai
  services/          payment_service (atomic + idempotent execution),
                      credit_limit_service, pin_service, face_verification_service,
                      voice_intent_service, financial_data_service
  services/ai/       llm_provider (Gemini + Ollama), embeddings, rag_service,
                      router_service, ai_orchestrator
  scripts/           migrate_to_sqlite.py (one-time, re-runnable JSON → SQLite import)
```

**Data flow (backend-authoritative by design):** the frontend never computes or trusts a balance, credit limit, PIN validity, or face-verification result on its own — every financial decision is made and re-validated server-side, scoped to the authenticated user's ID from the JWT.

---

## Tech stack

| Layer | Stack |
|---|---|
| Frontend | React 18, TypeScript, Vite, Tailwind (precompiled), Radix UI, Framer Motion, Recharts |
| Backend | Python, FastAPI, Uvicorn, SQLAlchemy, SQLite |
| Auth | JWT (access + refresh tokens), bcrypt password/PIN hashing |
| AI | Google Gemini API (primary) + Ollama `qwen2.5:latest` (local fallback), TF-IDF/scikit-learn for offline embeddings |
| Voice | Browser-native Web Speech API (`SpeechRecognition`, `speechSynthesis`) — no paid voice service |

---

## Setup

### Prerequisites
- Node.js 18+ and npm
- Python 3.10+
- (Optional but recommended) [Ollama](https://ollama.com) running locally with `qwen2.5:latest` pulled, for the AI assistant to work without a Gemini key:
  ```bash
  ollama pull qwen2.5:latest
  ```

### Backend
```bash
cd backend
pip install -r requirements.txt
cp .env.example .env        # then fill in JWT_SECRET_KEY and (optionally) GEMINI_API_KEY
python -m scripts.migrate_to_sqlite   # one-time: creates the SQLite DB and seeds it
uvicorn main:app --port 8080
```

### Frontend
```bash
cd frontend
npm install
npm run dev          # runs on http://localhost:3000, proxies /api to the backend on :8080
```

Open `http://localhost:3000`, sign up, and log in.

### Environment variables (`backend/.env`)
See `backend/.env.example` for the full list with descriptions. Key ones:

| Variable | Purpose |
|---|---|
| `JWT_SECRET_KEY` | Signs all auth/session tokens — required |
| `GEMINI_API_KEY` | Enables Gemini as the primary LLM/embedding provider. Leave empty to use Ollama only. |
| `GEMINI_MODEL` | Defaults to `gemini-flash-latest` (Google's maintained alias for the current fast model — avoids breakage as specific model versions get deprecated) |
| `OLLAMA_HOST`, `OLLAMA_MODEL` | Local fallback LLM connection |
| `CREDIT_UTILIZATION_WARNING_THRESHOLD` | % utilization that triggers a warning (default 80) |

No secrets are ever required in, or exposed to, the frontend — all LLM calls happen server-side only.

---

## Security notes

- Passwords and transaction PINs are bcrypt-hashed; PINs are never stored, logged, or transmitted in plain text beyond the single validation request.
- Every protected API route resolves the current user from a decoded JWT (`utils/deps.py`) — request bodies can never specify *whose* data to read or write.
- Payments run through a shared idempotent executor (`payment_service.execute_idempotent`): a client-supplied idempotency key is inserted before any balance mutation, so retried/duplicated requests replay the original result instead of double-charging.
- Voice payments additionally require a genuine, backend-issued, short-lived, purpose-scoped face-verification token — verified independently server-side, not trusted from the client.
- Login has brute-force lockout (5 failed attempts / 5 minutes); the transaction PIN has a stricter, DB-backed lockout (5 attempts / 15 minutes).

---

## Known limitations / honest caveats

- **Face verification is simulated**, not real biometric descriptor matching (see §4 above) — a deliberate reliability tradeoff, documented so it isn't mistaken for a claim of real biometric security.
- The AI assistant's local Ollama fallback depends on your machine having Ollama installed and responsive; a slow/unloaded model can take longer on the first request (mitigated with a background warm-up and `keep_alive`, but not eliminated).
- `backend/data/finance.json` and its routes (`finance_routes.py`, `geosmart_routes.py`) are earlier hackathon-era scaffolding, left connected but not used by the current frontend — the SQLite database is the real source of truth for everything wallet/credit/contacts-related.

---

## Authors

**Kamesh, Suman Hait, Muthazir, Dinesha** — designed and built Finora end-to-end, including the backend (FastAPI, SQLite, authentication), the AI assistant, credit alerts, transaction PIN, face verification, and voice payment features described above.
