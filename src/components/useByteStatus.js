import { useEffect, useState } from "react";

export default function useByteStatus() {
  const [isActive, setIsActive] = useState(false);

  useEffect(() => {
    const ws = new WebSocket("ws://localhost:8765");

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      setIsActive(data.status === "active");
    };

    ws.onerror = () => console.error("WebSocket-Fehler.");
    ws.onclose = () => console.warn("WebSocket getrennt.");

    return () => ws.close();
  }, []);

  return isActive;
}
