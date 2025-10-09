# byte-assistant/ChatAssistant.py
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
import ollama
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

# 🔧 Allow Electron renderer to connect
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# 🩺 Healthcheck route (frontend expects this)
@app.get("/health")
def health():
    return {"status": "ok"}

class Message(BaseModel):
    text: str

@app.post("/chat")
def chat(message: Message):
    return {"response": f"Echo: {message.text}"}

app = FastAPI()

# 🔓 Erlaubt lokale Frontend-Zugriffe
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.post("/api/chat")
async def chat(request: Request):
    """Empfängt Textnachrichten vom UI und antwortet über Ollama."""
    data = await request.json()
    user_message = data.get("message", "")

    if not user_message.strip():
        return {"reply": "Bitte gib eine Nachricht ein."}

    # 💬 Anfrage an Ollama
    response = ollama.chat(
        model="llama3",
        messages=[
            {"role": "system", "content": "Du bist Byte, ein freundlicher Assistent in einer futuristischen Benutzeroberfläche."},
            {"role": "user", "content": user_message},
        ],
    )

    reply = response["message"]["content"]
    return {"reply": reply}
