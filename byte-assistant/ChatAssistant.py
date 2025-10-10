"""
ChatAssistant.py — Stable FastAPI backend for Electron Byte Assistant
Author: GPT-5
"""

import asyncio
from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import logging

# Optional: You can replace this with your real AI logic later
async def generate_response(message: str) -> str:
    await asyncio.sleep(0.4)  # Simulate thinking time
    return f"Byte received: {message}"

# -------------------------------------------
# FastAPI setup
# -------------------------------------------
app = FastAPI(title="Byte Chat Assistant", version="1.0.0")

# Allow requests from Electron frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Electron is local
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
# Main chat endpoint
# -------------------------------------------
@app.post("/api/chat")
async def chat_endpoint(payload: ChatMessage, request: Request):
    try:
        msg = payload.message.strip()
        if not msg:
            raise HTTPException(status_code=400, detail="Empty message")

        logging.info(f"🧠 Received: {msg}")
        reply = await generate_response(msg)
        return {"reply": reply}

    except HTTPException as e:
        logging.warning(f"⚠️ User error: {e.detail}")
        raise e
    except Exception as e:
        logging.error(f"💥 Internal error: {e}")
        raise HTTPException(status_code=500, detail="Internal server error")

# -------------------------------------------
# Startup / Shutdown hooks
# -------------------------------------------
@app.on_event("startup")
async def on_startup():
    logging.info("🚀 ChatAssistant API is starting...")

@app.on_event("shutdown")
async def on_shutdown():
    logging.info("🛑 ChatAssistant API is shutting down...")
