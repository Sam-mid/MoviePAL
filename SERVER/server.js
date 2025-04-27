import express from 'express';
import cors from 'cors';
import { AzureChatOpenAI } from "@langchain/openai";
import { HumanMessage, SystemMessage, AIMessage } from "@langchain/core/messages";
import { createVectorstore } from "./vectorestore.js";
import { FaissStore } from "@langchain/community/vectorstores/faiss";
import { AzureOpenAIEmbeddings } from "@langchain/openai";

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));


const model = new AzureChatOpenAI({
    temperature: 1,
    verbose: true,
    maxTokens: 1000,
    streaming: true,
});

let vectorStore;

//functie om de server te strarten
async function startServer() {
    await createVectorstore();
    console.log("Vectordatabase gemaakt.");

    const embeddings = new AzureOpenAIEmbeddings({
        azureOpenAIApiKey: process.env.AZURE_OPENAI_API_KEY,
        azureOpenAIApiInstanceName: process.env.AZURE_OPENAI_INSTANCE_NAME,
        azureOpenAIApiDeploymentName: process.env.AZURE_OPENAI_API_EMBEDDINGS_DEPLOYMENT_NAME,
        azureOpenAIApiVersion: process.env.AZURE_OPENAI_API_VERSION,
        temperature: 0,
    });

    vectorStore = await FaissStore.load("vectordatabase", embeddings);
    console.log("Vectordatabase geladen!");

    app.listen(3000, () => {
        console.log("Server draait op http://localhost:3000");
    });
}

// Streaming endpoint
app.post("/ask", async (req, res) => {
    const rawMessages = req.body.messages;

    if (!Array.isArray(rawMessages)) {
        return res.status(400).json({ error: "Ongeldige berichtstructuur." });
    }

    try {
        const formattedMessages = rawMessages
            .filter(([role, content]) => typeof content === "string" && content.trim() !== "" && (role === "human" || role === "system"))
            .map(([role, content]) => {
                if (role === "system") return new SystemMessage({ content });
                if (role === "human") return new HumanMessage({ content });
                if (role === "AI") return new AIMessage({ content });
                return null;
            })
            .filter(Boolean);

        const lastHumanMessage = [...rawMessages].reverse().find(([role, _]) => role === "human");
        const userQuestion = lastHumanMessage ? lastHumanMessage[1] : "";

        let context = "";
        if (userQuestion) {
            const relevantDocs = await vectorStore.similaritySearch(userQuestion, 3);
            context = relevantDocs.map(doc => doc.pageContent).join("\n\n");
        }

        if (context.trim() !== "") {
            formattedMessages.unshift(new SystemMessage({ content: `Gebruik deze extra context:\n\n${context}` }));
        }

        console.log("Prompt naar model (streaming):");
        formattedMessages.forEach(msg => {
            console.log(`[${msg._getType()}]`, msg.content);
        });

        // Start streaming
        res.setHeader("Content-Type", "text/plain; charset=utf-8");

        const stream = await model.stream(formattedMessages);
        for await (const chunk of stream) {
            if (chunk.content) {
                res.write(chunk.content);
            }
        }
        res.end();

    } catch (error) {
        console.error("Fout bij prompt:", error);
        res.status(500).json({ error: "Serverfout tijdens AI-antwoorden." });
    }
});

startServer();
