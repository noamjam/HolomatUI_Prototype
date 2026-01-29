// server.js
const express = require("express");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const crypto = require("crypto");

const app = express();

// Upload-Ordner (öffentlich erreichbar)
const uploadDir = path.join(__dirname, "public", "uploads");
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

// Multer: wir speichern erst in ein Temp-File
const storage = multer.memoryStorage();
const upload = multer({ storage });

app.use("/uploads", express.static(uploadDir));

app.post("/upload", upload.single("file"), async (req, res) => {
    const file = req.file;
    if (!file) return res.status(400).json({ error: "No file" });

    // Hash über den Inhalt
    const hash = crypto.createHash("sha1").update(file.buffer).digest("hex");
    const ext = path.extname(file.originalname) || ".png";
    const fileName = `${hash}${ext}`;
    const filePath = path.join(uploadDir, fileName);

    // Wenn Datei mit diesem Hash bereits existiert: nicht neu schreiben
    if (!fs.existsSync(filePath)) {
        fs.writeFileSync(filePath, file.buffer);
    }

    const url = `http://127.0.0.1:${PORT}/uploads/${fileName}`;
    res.json({ url });
});

const PORT = 3001;
// Markdown-Speicherordner (z.B. public/notes)
const notesDir = path.join(__dirname, "public", "notes");
if (!fs.existsSync(notesDir)) fs.mkdirSync(notesDir, { recursive: true });

app.post("/save-markdown", (req, res) => {
    const { fileName, content } = req.body || {};
    if (typeof fileName !== "string" || typeof content !== "string") {
        return res.status(400).json({ error: "Invalid payload" });
    }

    // einfache Sanitization: keine Pfadtrennzeichen erlauben
    const safeName = fileName.replace(/[\\/]/g, "_");
    const filePath = path.join(notesDir, safeName);

    try {
        fs.writeFileSync(filePath, content, "utf8");
        return res.json({ ok: true, path: filePath });
    } catch (err) {
        console.error("Failed to save markdown:", err);
        return res.status(500).json({ error: "Failed to save file" });
    }
});

app.listen(PORT, () => {
    console.log("Upload server listening on port", PORT);
});
