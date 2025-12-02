import "dotenv/config";
import express from "express";
import cors from "cors";

import { streamText, convertToModelMessages } from "ai";
import { createOpenAI } from "@ai-sdk/openai";
import { DataAPIClient } from "@datastax/astra-db-ts";
import OpenAI from "openai";

const app = express();
app.use(cors());
app.use(express.json());

const {
    ASTRA_DB_NAMESPACE,
    ASTRA_DB_COLLECTION,
    ASTRA_DB_API_ENDPOINTS,
    ASTRA_DB_APPLICATION_TOKEN,
    OPENAI_API_KEY,
} = process.env;

const openaiEmbeddings = new OpenAI({ apiKey: OPENAI_API_KEY });
const openai = createOpenAI({ apiKey: OPENAI_API_KEY });

const client = new DataAPIClient(ASTRA_DB_APPLICATION_TOKEN);
const db = client.db(ASTRA_DB_API_ENDPOINTS, { keyspace: ASTRA_DB_NAMESPACE });

function getLatestUserText(messages = []) {
    const lastUser = [...messages].reverse().find((m) => m.role === "user");
    if (!lastUser) return "";

    return (
        lastUser.parts
        ?.filter((p) => p.type === "text")
        .map((p) => p.text)
        .join(" ")
        .trim() || ""
    );
}

app.post("/api/chat", async (req, res) => {
    try {
        const { messages } = req.body || {};

        if (!messages || !Array.isArray(messages)) {
            return res.status(400).send("Missing 'messages' array in request body");
        }

        const latestMessage = getLatestUserText(messages);
        if (!latestMessage) {
            return res.status(400).send("No message provided");
        }

        let docContext = "";

        try {
            const embedding = await openaiEmbeddings.embeddings.create({
                model: "text-embedding-3-small",
                input: latestMessage,
                encoding_format: "float",
            });

            const collection = await db.collection(ASTRA_DB_COLLECTION);

            const cursor = collection.find({},{
                sort: {
                    $vector: embedding.data[0].embedding,
                },
                limit: 10,
            });

            const documents = await cursor.toArray();
            docContext = documents.map((d) => d.text).join("\n\n");
        } catch (err) {
            console.error("Error querying db...", err);
            docContext = "";
        }

        const systemPrompt = `
            You are MedicalGPT — an educational medical assistant who provides general health information but does NOT diagnose, prescribe, or give personal medical advice.

            Use the context below if relevant:
            -----------------
            ${docContext}
            -----------------

            Question: ${latestMessage}
            Provide a clear, accurate, and concise answer based on trustworthy medical sources. If the context does not contain relevant information, answer based on your general medical knowledge. Always remind users to consult a licensed healthcare professional for personal medical advice.
        `;

        const result = await streamText({
            model: openai("gpt-4o-mini"),
            messages: [
                { role: "system", content: systemPrompt },
                ...convertToModelMessages(messages),
            ],
        });

        let fullText = "";
        for await (const delta of result.textStream) {
            fullText += delta;
        }

        return res.json({
            reply: fullText,
        });
    } catch (err) {
        console.error("Error in POST /api/chat handler: ", err);
        return res.status(500).send("Internal Server Error");
    }
});

app.listen(3001, () => console.log("Backend running on port 3001"));
