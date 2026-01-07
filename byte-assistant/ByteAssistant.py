# ByteAssistant.py (integrated, async LLM calls, robust)
import sys
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

# Try to force UTF-8 stdout for Windows PowerShell
try:
    sys.stdout.reconfigure(encoding="utf-8")
except Exception:
    pass

# Audio / hardware
p = pyaudio.PyAudio()
for i in range(p.get_device_count()):
    info = p.get_device_info_by_index(i)
    print(f"[{i}] {info['name']} – Channels: {info['maxInputChannels']}")

TRIGGER = "Mini"
DEACTIVATE = "over and out"
PORT = 8765
DEVICE_INDEX = 0
CHAT_API_URL = "http://127.0.0.1:5050/api/chat"  # replace if your main process chooses a different port

#Timing
DELAY_AFTER_GREETING = 1.5
DELAY_AFTER_REPLY = 2.0

# Thread-executor for blocking ops
EXECUTOR = None

async def run_in_thread(fn, *args, **kwargs):
    loop = asyncio.get_event_loop()
    return await loop.run_in_executor(EXECUTOR, lambda: fn(*args, **kwargs))

# TTS: run gTTS + ffplay in executor (blocking) to avoid blocking loop
def _blocking_tts_and_play(text: str):
    try:
        tts = gTTS(text=text, lang="de")
        with tempfile.NamedTemporaryFile(delete=False, suffix=".mp3") as fp:
            tts.write_to_fp(fp)
            fp.flush()
            tmp = fp.name
        # Use ffplay to play; '-nodisp -autoexit -loglevel quiet'
        subprocess.run(["ffplay", "-nodisp", "-autoexit", "-loglevel", "quiet", tmp], check=False)
        try:
            Path(tmp).unlink()
        except Exception:
            pass
    except Exception as e:
        print(f"[TTS error] {e}")

async def speak(text: str):
    print(f"[TTS] {text}")
    await run_in_thread(_blocking_tts_and_play, text)

# WebSocket status broadcasting
clients = set()

async def handler(ws):
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
    async with websockets.serve(handler, "localhost", PORT):
        print(f"[WS] running on ws://localhost:{PORT}")
        while True:
            status = await status_queue.get()
            payload = json.dumps({"status": status})
            await broadcast(payload)


# Async LLM request using aiohttp
async def ask_llm(prompt: str, api_url: str = CHAT_API_URL, timeout: int = 40) -> str:
    try:
        async with aiohttp.ClientSession() as session:
            async with session.post(api_url, json={"message": prompt}, timeout=timeout) as resp:
                if resp.status != 200:
                    text = await resp.text()
                    print(f"[LLM HTTP {resp.status}] {text}")
                    return "LLM returned an error."
                data = await resp.json()
                return data.get("reply", "No reply field in response.")
    except asyncio.TimeoutError:
        print("[LLM] request timed out")
        return "The language model did not respond in time."
    except Exception as e:
        print(f"[LLM error] {e}")
        return "Could not contact the language server."

# Main assistant loop
async def run_assistant(status_queue: asyncio.Queue):
    recognizer = sr.Recognizer()
    mic = sr.Microphone(DEVICE_INDEX, sample_rate=16000)

    print("[Mic] available devices:")
    for i, name in enumerate(sr.Microphone.list_microphone_names()):
        print(f"  [{i}] {name}")

    print(f"\n[Info] Ready — Trigger: '{TRIGGER}', Deactivate: '{DEACTIVATE}'")
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

                # Greeting
                await speak("Hallo, wie kann ich helfen?")

                # Small pause so the user can think before speaking
                await asyncio.sleep(DELAY_AFTER_GREETING)

                # Listen for the user's follow‑up utterance
                with mic as source:
                    print("[Mic] Listening for follow-up...")
                    audio2 = recognizer.listen(
                        source,
                        timeout=5,          # you can increase this too, e.g. 8–10
                        phrase_time_limit=8
                    )

                try:
                    followup = recognizer.recognize_google(audio2, language="de-DE")
                    print(f"[Follow-up] {followup}")
                    await status_queue.put("thinking")

                    # Query LLM
                    reply = await ask_llm(followup)
                    print(f"[LLM Reply] {reply}")
                    await speak(reply)

                    # Pause after the answer so you don't immediately get re‑triggered
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

# Entrypoint
async def main():
    global EXECUTOR
    # Use a ThreadPoolExecutor for blocking TTS/audio ops
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
