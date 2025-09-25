 
import pyaudio

p = pyaudio.PyAudio()
print("Verfügbare Mikrofone mit Eingabekanälen:\n")

for i in range(p.get_device_count()):
    info = p.get_device_info_by_index(i)
    if info["maxInputChannels"] > 0:
        print(f"[{i}] {info['name']} – Kanäle: {info['maxInputChannels']}")
