# byte-assistant/ChatAssistant.py
from fastapi import FastAPI
from pydantic import BaseModel
import httpx
import os

OLLAMA_HOST = os.getenv("OLLAMA_HOST", "http://127.0.0.1:11434")
DEFAULT_MODEL = "llama3.1:8b"

app = FastAPI()

class ChatRequest(BaseModel):
    message: str

class ChatResponse(BaseModel):
    reply: str

@app.post("/api/chat", response_model=ChatResponse)
async def chat(req: ChatRequest):
    prompt = (req.message or "").strip()
    if not prompt:
        return ChatResponse(reply="Bitte eine Nachricht eingeben.")

    payload = {
        "model": DEFAULT_MODEL,
        "prompt": prompt,
        "stream": False,
    }

    # More generous and explicit timeout: (connect, read)
    timeout = httpx.Timeout(60.0)  # 60s total timeout

    try:
        async with httpx.AsyncClient(timeout=timeout) as client:
            r = await client.post(f"{OLLAMA_HOST}/api/generate", json=payload)
            print("Ollama status:", r.status_code)
            print("Ollama body:", r.text[:500])
            r.raise_for_status()
            data = r.json()

    except httpx.ReadTimeout as e:
        # This is your intermittent "ChatAssistant connection error: ReadTimeout('')" case
        print("ChatAssistant connection error (ReadTimeout):", repr(e))
        return ChatResponse(
            reply="Das Sprachmodell hat zu lange gebraucht und die Anfrage ist abgelaufen. "
                  "Bitte versuche es noch einmal oder formuliere die Eingabe kürzer."
        )

    except httpx.RequestError as e:
        # Networking / connection issues (DNS, refused, etc.)
        print("ChatAssistant connection error:", repr(e))
        return ChatResponse(
            reply="Ich kann das Sprachmodell nicht erreichen. Läuft Ollama auf Port 11434?"
        )

    except httpx.HTTPStatusError as e:
        print("ChatAssistant HTTP error:", repr(e))
        return ChatResponse(
            reply=f"Das Sprachmodell hat einen Fehler gemeldet (HTTP {e.response.status_code})."
        )

    except Exception as e:
        print("ChatAssistant unexpected error:", repr(e))
        return ChatResponse(
            reply="Ein unerwarteter Fehler ist im Sprachserver aufgetreten."
        )

    reply = (data.get("response") or "").strip() or "Keine Antwort vom Modell."
    return ChatResponse(reply=reply)
