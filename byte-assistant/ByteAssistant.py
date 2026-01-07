# byte-assistant/ByteAssistant.py
import sys
import os
import asyncio
import json
import websockets
import speech_recognition as sr
from gtts import gTTS
import tempfile
import subprocess
import pyaudio
import aiohttp
from pathlib import Path

# stdout UTF-8 (v.a. Windows)
try:
    sys.stdout.reconfigure(encoding="utf-8")
except Exception:
    pass

# Audio-Hardware-Check
p = pyaudio.PyAudio()
for i in range(p.get_device_count()):
    info = p.get_device_info_by_index(i)
    print(f"[{i}] {info['name']} – Channels: {info['maxInputChannels']}")

# Konfiguration
TRIGGER = "Mini"
DEACTIVATE = "over and out"
WS_PORT = 8765
DEVICE_INDEX = 0

CHAT_PORT = os.getenv("CHAT_PORT", "5050")
CHAT_API_URL = f"http://127.0.0.1:{CHAT_PORT}/api/chat"

DELAY_AFTER_GREETING = 1.5
DELAY_AFTER_REPLY = 2.0
EXECUTOR = None

# Blocking-Operationen im Threadpool
async def run_in_thread(fn, *args, **kwargs):
    loop = asyncio.get_event_loop()
    return await loop.run_in_executor(EXECUTOR, lambda: fn(*args, **kwargs))

def _blocking_tts_and_play(text: str):
    try:
        tts = gTTS(text=text, lang="de")
        with tempfile.NamedTemporaryFile(delete=False, suffix=".mp3") as fp:
            tts.write_to_fp(fp)
            fp.flush()
            tmp = fp.name
        subprocess.run(
            ["ffplay", "-nodisp", "-autoexit", "-loglevel", "quiet", tmp],
            check=False,
        )
        try:
            Path(tmp).unlink()
        except Exception:
            pass
    except Exception as e:
        print(f"[TTS error] {e}")

async def speak(text: str):
    print(f"[TTS] {text}")
    await run_in_thread(_blocking_tts_and_play, text)

# WebSocket-Status an Frontend
clients = set()

async def ws_handler(ws):
    clients.add(ws)
    try:
        await ws.wait_closed()
    finally:
        clients.remove(ws)

async def broadcast(message: str):
    for ws in clients.copy():
        try:
            await ws.send(message)
        except Exception:
            clients.remove(ws)

async def status_ws_sender(status_queue: asyncio.Queue):
    async with websockets.serve(ws_handler, "localhost", WS_PORT):
        print(f"[WS] running on ws://localhost:{WS_PORT}")
        while True:
            status = await status_queue.get()
            payload = json.dumps({"status": status})
            await broadcast(payload)

# HTTP-Aufruf an ChatAPI
async def ask_llm(prompt: str, api_url: str = CHAT_API_URL, timeout: int = 40) -> str:
    print(f"[LLM] calling {api_url} with: {prompt!r}")
    try:
        async with aiohttp.ClientSession() as session:
            async with session.post(
                    api_url,
                    json={"message": prompt},
                    timeout=timeout,
            ) as resp:
                text = await resp.text()
                print(f"[LLM] HTTP {resp.status} body: {text[:500]}")
                if resp.status != 200:
                    return "Der Sprachserver meldet einen Fehler."
                data = json.loads(text)
                return data.get("reply", "Keine Antwort erhalten.")
    except asyncio.TimeoutError:
        print("[LLM] request timed out")
        return "Das Sprachmodell hat nicht rechtzeitig geantwortet."
    except Exception as e:
        print(f"[LLM error] {repr(e)}")
        return "Ich konnte den Sprachserver nicht erreichen."

# Haupt-Loop
async def run_assistant(status_queue: asyncio.Queue):
    recognizer = sr.Recognizer()
    mic = sr.Microphone(DEVICE_INDEX, sample_rate=16000)

    print("[Mic] available devices:")
    for i, name in enumerate(sr.Microphone.list_microphone_names()):
        print(f"  [{i}] {name}")

    print(f"\n[Info] Ready — Trigger: '{TRIGGER}', Deactivate: '{DEACTIVATE}'")
    print(f"[Info] Using CHAT_API_URL={CHAT_API_URL}")
    await status_queue.put("standby")

    with mic as source:
        recognizer.adjust_for_ambient_noise(source)

    while True:
        try:
            with mic as source:
                print("[Mic] Listening...")
                audio = recognizer.listen(source, timeout=None, phrase_time_limit=8)

            text = recognizer.recognize_google(audio, language="de-DE")
            print(f"[Input] {text}")

            if TRIGGER in text:
                print("[Status] Activated")
                await status_queue.put("active")

                await speak("Hallo, wie kann ich helfen?")
                await asyncio.sleep(DELAY_AFTER_GREETING)

                with mic as source:
                    print("[Mic] Listening for follow-up...")
                    audio2 = recognizer.listen(
                        source,
                        timeout=5,
                        phrase_time_limit=8,
                    )

                try:
                    followup = recognizer.recognize_google(audio2, language="de-DE")
                    print(f"[Follow-up] {followup}")
                    await status_queue.put("thinking")

                    reply = await ask_llm(followup)
                    print(f"[LLM Reply] {reply}")
                    await speak(reply)

                    await asyncio.sleep(DELAY_AFTER_REPLY)
                    await status_queue.put("active")
                except sr.UnknownValueError:
                    print("[Info] Could not understand follow-up.")
                    await speak("Ich habe dich leider nicht verstanden.")
                    await asyncio.sleep(DELAY_AFTER_REPLY)
                    await status_queue.put("active")
                except Exception as e:
                    print(f"[Error] during follow-up: {e}")
                    await speak("Ein Fehler ist aufgetreten.")
                    await asyncio.sleep(DELAY_AFTER_REPLY)
                    await status_queue.put("standby")

            elif DEACTIVATE in text:
                print("[Status] Deactivated")
                await status_queue.put("standby")
                await speak("Verstanden. Ich höre nur noch zu.")

            else:
                print("[Info] No trigger word — ignoring.")

        except sr.UnknownValueError:
            print("[Info] Nothing recognized.")
        except sr.RequestError as e:
            print(f"[Error] Speech API error: {e}")
        except Exception as e:
            print(f"[Error] Unexpected: {e}")
            break

# Entry-Point
async def main():
    global EXECUTOR
    from concurrent.futures import ThreadPoolExecutor

    EXECUTOR = ThreadPoolExecutor(max_workers=2)
    status_queue = asyncio.Queue()
    tasks = [
        asyncio.create_task(status_ws_sender(status_queue)),
        asyncio.create_task(run_assistant(status_queue)),
    ]
    done, pending = await asyncio.wait(tasks, return_when=asyncio.FIRST_EXCEPTION)
    for t in pending:
        t.cancel()

if __name__ == "__main__":
    try:
        asyncio.run(main())
    except KeyboardInterrupt:
        print("[Stopped] Assistant manually stopped.")
