import express from "express";
import cors from "cors";

const app = express();
app.use(cors());
app.use(express.json());

app.post("/api/run", (req, res) => {
    const { language, code, filename } = req.body || {};
    console.log("Run request:", { language, filename });
    res.json({
        output: `Fake runner\nLanguage: ${language}\nFile: ${filename}\nLength: ${code?.length ?? 0}`,
    });
});

app.listen(5000, () => {
    console.log("Run API listening on http://localhost:5000");
});
