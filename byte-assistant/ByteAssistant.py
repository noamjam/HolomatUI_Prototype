import asyncio
import json
import websockets
import speech_recognition as sr
from gtts import gTTS
import tempfile
import subprocess
import pyaudio

p = pyaudio.PyAudio()
for i in range(p.get_device_count()):
    info = p.get_device_info_by_index(i)
    print(f"[{i}] {info['name']} – Kanäle: {info['maxInputChannels']}")

TRIGGER = "Mini"
DEACTIVATE = "over and out"
PORT = 8765
DEVICE_INDEX = 0  # <- Den kennst du ja

def speak(text):
    print(f"[TTS] Antwort: {text}")
    tts = gTTS(text=text, lang="de")
    with tempfile.NamedTemporaryFile(delete=True, suffix=".mp3") as fp:
        tts.write_to_fp(fp)
        fp.flush()
        try:
            subprocess.run(
                ["ffplay", "-nodisp", "-autoexit", "-loglevel", "quiet", fp.name],
                check=True
            )
        except Exception as e:
            print(f"❌ Audio-Ausgabe fehlgeschlagen: {e}")

async def status_ws_sender(status_queue):
    async with websockets.serve(handler, "localhost", PORT):
        print(f"📡 WebSocket läuft auf ws://localhost:{PORT}")
        while True:
            status = await status_queue.get()
            message = json.dumps({"status": status})
            await broadcast(message)

clients = set()

async def handler(websocket):
    clients.add(websocket)
    try:
        await websocket.wait_closed()
    finally:
        clients.remove(websocket)

async def broadcast(message):
    for ws in clients.copy():
        try:
            await ws.send(message)
        except:
            clients.remove(ws)

async def run_assistant(status_queue):
    recognizer = sr.Recognizer()
    mic = sr.Microphone(DEVICE_INDEX, sample_rate=16000)


    print("🎙 Verfügbare Mikrofone:")
    for i, name in enumerate(sr.Microphone.list_microphone_names()):
        print(f"  [{i}] {name}")

    print(f"\n🟢 Byte steht bereit – Trigger: '{TRIGGER}', Deaktivierung: '{DEACTIVATE}'")
    await status_queue.put("standby")

    with mic as source:
        recognizer.adjust_for_ambient_noise(source)

    while True:
        try:
            with mic as source:
                print("🎧 Höre...")
                audio = recognizer.listen(source, timeout=None, phrase_time_limit=5)

            text = recognizer.recognize_google(audio, language="de-DE").lower()
            print(f"[Eingabe] {text}")

            if TRIGGER in text:
                print("🟡 Aktiviert")
                await status_queue.put("active")
                speak("Hallo, wie kann ich helfen?")
            elif DEACTIVATE in text:
                print("🔵 Deaktiviert")
                await status_queue.put("standby")
                speak("Verstanden. Ich höre nur noch zu.")
            else:
                print("⏸ Kein Triggerwort – ignoriert.")

        except sr.UnknownValueError:
            print("🤷 Nichts verstanden.")
        except sr.RequestError as e:
            print(f"🔌 API-Fehler: {e}")
        except Exception as e:
            print(f"💥 Unerwarteter Fehler: {e}")
            break

async def main():
    status_queue = asyncio.Queue()
    await asyncio.gather(
        status_ws_sender(status_queue),
        run_assistant(status_queue)
    )

if __name__ == "__main__":
    try:
        asyncio.run(main())
    except KeyboardInterrupt:
        print("🛑 Byte beendet durch Tastaturbefehl.")
