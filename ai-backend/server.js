import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { GoogleGenerativeAI } from "@google/generative-ai";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// Inicializar cliente Gemini
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Selecciona el modelo (recomendado: rápido, gratis y bueno en español)
const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

app.post("/api/chat", async (req, res) => {
    try {
        const { message } = req.body;

        if (!message || message.trim() === "") {
            return res.status(400).json({ error: "Mensaje vacío." });
        }

        // Preparar conversación para el asistente
        const aiResponse = await model.generateContent({
            contents: [
                {
                    role: "user",
                    parts: [
                        {
                            text:
                                "Eres el asistente de 4PetsCare. Habla de forma amable, cálida y educativa. " +
                                "Ayuda sobre cuidado, alimentación y comportamiento de mascotas. " +
                                "NO des diagnósticos médicos ni recetas. " +
                                "Pregunta del usuario: " + message,
                        },
                    ],
                },
            ],
        });

        const reply = aiResponse.response.text();

        console.log("✅ Respuesta IA:", reply);
        res.json({ reply });
    } catch (error) {
        console.error("❌ Error en la API de Google Gemini:", error.message);
        res.status(500).json({
            error: "Error al procesar la solicitud de IA.",
            details: error.message,
        });
    }
});

const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Servidor IA (Gemini) activo en http://localhost:${PORT}`);
});