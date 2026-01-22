# byte-assistant/ChatAssistant.py
from fastapi import FastAPI
from pydantic import BaseModel
import httpx
import os
from typing import Optional, Dict, Any

OLLAMA_HOST = os.getenv("OLLAMA_HOST", "http://127.0.0.1:11434")
DEFAULT_MODEL = "llama3.1:8b"

app = FastAPI()

class Command(BaseModel):
    tool: str
    args: Dict[str, Any] = {}

class ChatRequest(BaseModel):
    message: str

class ChatResponse(BaseModel):
    reply: str
    command: Optional[Command] = None

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

    timeout = httpx.Timeout(120.0)  # 120s total timeout

    try:
        async with httpx.AsyncClient(timeout=timeout) as client:
            r = await client.post(f"{OLLAMA_HOST}/api/generate", json=payload)
            print("Ollama status:", r.status_code)
            print("Ollama body:", r.text[:500])
            r.raise_for_status()
            data = r.json()

    except httpx.ReadTimeout as e:
        print("ChatAssistant connection error (ReadTimeout):", repr(e))
        return ChatResponse(
            reply="Das Sprachmodell hat zu lange gebraucht und die Anfrage ist abgelaufen. "
                  "Bitte versuche es noch einmal oder formuliere die Eingabe kürzer."
        )

    except httpx.RequestError as e:
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

    # ----- decide reply + optional command -----
    reply = (data.get("response") or "").strip() or "Keine Antwort vom Modell."

    text = prompt.lower()
    command: Optional[Command] = None

    # Simple keyword trigger for testing
    if "freecad" in text or "starte freecad" in text:
        command = Command(tool="open_freecad", args={})
        if not reply:
            reply = "Ich öffne jetzt FreeCAD für dich."

    if "bambustudio" in text or "starte bambustudio" in text or "bambu studio" in text or "starte bambu studio" in text:
        command = Command(tool="open_BambuStudio", args={})
        if not reply:
            reply = "Ich öffne jetzt BambuStudio für dich."

    if "orcaslicer" in text or "starte orcaslicer" in text or "orca slicer" in text or "starte orca slicer" in text:
        command = Command(tool="open_OrcaSlicer", args={})
        if not reply:
            reply = "Ich öffne jetzt OrcaSlicer für dich."

    print("DEBUG command:", command)
    return ChatResponse(reply=reply, command=command)

