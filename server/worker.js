import { Worker } from "bullmq";
import { PDFLoader } from "@langchain/community/document_loaders/fs/pdf";
import { GoogleGenerativeAIEmbeddings } from "@langchain/google-genai";
import fs from "fs";
import path from "path";
import dotenv from "dotenv";
import { QdrantVectorStore } from "@langchain/qdrant";

dotenv.config();

// ✅ Fail fast if required env vars are missing
["GOOGLE_API_KEY", "QDRANT_URL"].forEach((key) => {
  if (!process.env[key]) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
});

const worker = new Worker(
  "file-upload-queue",
  async (job) => {
    console.log(`📦 Received job:`, job.data);

    try {
      const jobData =
        typeof job.data === "string" ? JSON.parse(job.data) : job.data;

      // ✅ Validate path before using trim()
      if (!jobData.path || typeof jobData.path !== "string") {
        throw new Error("Invalid or missing file path in job data");
      }

      const cleanPath = path.resolve(jobData.path.trim());

      if (!fs.existsSync(cleanPath)) {
        throw new Error(`File does not exist: ${cleanPath}`);
      }

      console.log("📄 Loading PDF from:", cleanPath);
      const loader = new PDFLoader(cleanPath);
      const docs = await loader.load();

      console.log(`✅ Loaded ${docs.length} document(s) from PDF`);

      // ✅ Correct Gemini embedding model
      const embeddings = new GoogleGenerativeAIEmbeddings({
        modelName: "models/embedding-001",
        apiKey: process.env.GOOGLE_API_KEY,
      });

      console.log("⚙️ Storing documents & embeddings in Qdrant...");
      const vectorStore = await QdrantVectorStore.fromExistingCollection(
        embeddings,
        {
          url: process.env.QDRANT_URL,
          collectionName: "pdf_embeddings",
        }
      );

      await vectorStore.addDocuments(docs);

      console.log(`✅ Successfully stored ${docs.length} documents in Qdrant`);
    } catch (error) {
      console.error("❌ Error processing job:", error);
    }
  },
  {
    concurrency: 5,
    connection: {
      host: process.env.REDIS_HOST || "localhost",
      port: parseInt(process.env.REDIS_PORT) || 6379,
    },
  }
);

console.log("📥 Worker started and waiting for jobs...");
