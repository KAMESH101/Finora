import os
import threading
from fastapi import FastAPI
from dotenv import load_dotenv
from routes.auth_routes import router as auth_router
from routes.finance_routes import router as finance_router
from routes.geosmart_routes import router as geosmart_router
from routes.wallet_routes import router as wallet_router
from routes.creditcard_routes import router as creditcard_router
from routes.contacts_routes import router as contacts_router
from routes.pin_routes import router as pin_router
from routes.voice_routes import router as voice_router
from routes.face_routes import router as face_router
from routes.ai_routes import router as ai_router
from fastapi.middleware.cors import CORSMiddleware

load_dotenv()

app = FastAPI()

allowed_origins = [
    origin.strip()
    for origin in os.environ.get("FRONTEND_ORIGIN", "http://localhost:3000").split(",")
    if origin.strip()
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Register routes
app.include_router(auth_router, prefix="/api/auth", tags=["Auth"])
app.include_router(finance_router, prefix="/api/finance", tags=["Finance"])
app.include_router(geosmart_router, prefix="/api/geosmart", tags=["GeoSmart"])
app.include_router(wallet_router, prefix="/api/wallet", tags=["Wallet"])
app.include_router(creditcard_router, prefix="/api/creditcard", tags=["CreditCard"])
app.include_router(contacts_router, prefix="/api/contacts", tags=["Contacts"])
app.include_router(pin_router, prefix="/api/pin", tags=["PIN"])
app.include_router(voice_router, prefix="/api/voice", tags=["Voice"])
app.include_router(face_router, prefix="/api/face", tags=["Face"])
app.include_router(ai_router, prefix="/api/ai", tags=["AI"])

@app.on_event("startup")
def _warm_up_local_llm():
    from services.ai.llm_provider import GEMINI_API_KEY, warm_up_ollama

    if not GEMINI_API_KEY:
        # Preload the Ollama model in the background so the first user
        # request doesn't pay the cold-load cost (can be 60s+).
        threading.Thread(target=warm_up_ollama, daemon=True).start()


@app.get("/")
def home():
    return {"message": "Welcome to Finora Backend API"}
