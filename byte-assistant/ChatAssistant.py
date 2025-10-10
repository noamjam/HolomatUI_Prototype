import asyncio
from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import logging
import ollama

# -------------------------------------------
# Ollama integration
# -------------------------------------------
async def generate_response(message: str) -> str:
    try:
        loop = asyncio.get_event_loop()
        # Run blocking Ollama call in a thread
        result = ollama.chat(model="llama3.1:8b", messages=[{"role": "user", "content": message}])


        # Extract model output safely
        if "message" in result and "content" in result["message"]:
            return result["message"]["content"].strip()

        return "Ollama returned no content."

    except Exception as e:
        logging.error(f"Ollama error: {e}")
        return "Ollama is not responding. Make sure it's running (ollama serve)."

# -------------------------------------------
# FastAPI setup
# -------------------------------------------
app = FastAPI(title="Byte Chat Assistant", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# -------------------------------------------
# Data model
# -------------------------------------------
class ChatMessage(BaseModel):
    message: str

# -------------------------------------------
# Health check endpoint
# -------------------------------------------
@app.get("/health")
async def health_check():
    return {"status": "ok"}

# -------------------------------------------
# Chat endpoint
# -------------------------------------------
@app.post("/api/chat")
async def chat_endpoint(payload: ChatMessage, request: Request):
    try:
        msg = payload.message.strip()
        if not msg:
            raise HTTPException(status_code=400, detail="Empty message")

        logging.info(f" Received from user: {msg}")
        reply = await generate_response(msg)
        logging.info(f" Reply: {reply[:100]}...")
        return {"reply": reply}

    except HTTPException as e:
        logging.warning(f" User error: {e.detail}")
        raise e
    except Exception as e:
        logging.error(f"Internal error: {e}")
        raise HTTPException(status_code=500, detail="Internal server error")

# -------------------------------------------
# Startup / Shutdown
# -------------------------------------------
@app.on_event("startup")
async def on_startup():
    logging.info("ChatAssistant API is starting...")

@app.on_event("shutdown")
async def on_shutdown():
    logging.info("ChatAssistant API is shutting down...")
