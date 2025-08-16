import { QdrantVectorStore } from "@langchain/qdrant";
import {
  GoogleGenerativeAIEmbeddings,
  ChatGoogleGenerativeAI,
} from "@langchain/google-genai";
import dotenv from "dotenv";

dotenv.config();

export const chatController = async (req, res) => {
  try {
    const { query } = req.body;
    console.log("📩 Incoming request with query:", query);

    if (!query || typeof query !== "string") {
      console.warn("⚠️ Invalid query received:", query);
      return res
        .status(400)
        .json({ error: "Query is required and must be a string" });
    }

    // ✅ Create embeddings
    console.log("🔹 Initializing embeddings model...");
    const embeddings = new GoogleGenerativeAIEmbeddings({
      model: "models/embedding-001",
      apiKey: process.env.GOOGLE_API_KEY,
    });

    // ✅ Connect to Qdrant
    console.log("🔹 Connecting to Qdrant at:", process.env.QDRANT_URL);
    const vectorStore = await QdrantVectorStore.fromExistingCollection(
      embeddings,
      {
        url: process.env.QDRANT_URL,
        collectionName: "pdf_embeddings",
      }
    );

    const retriever = vectorStore.asRetriever({ k: 2 });
    console.log("🔹 Retriever created with top-k = 2");

    // ✅ Retrieve similar docs
    console.log("🔹 Performing similarity search...");
    const similaritySearchResults = await retriever.invoke(query);
    console.log(
      "📄 Similarity Search Results:",
      JSON.stringify(similaritySearchResults, null, 2)
    );

    // Build system + context prompt
    const SYSTEM_PROMPT = `
      You are a helpful AI assistant. 
      Use the following context from a PDF to answer the user’s question and answer in 50 words atleast.
      
      Context: ${JSON.stringify(similaritySearchResults, null, 2)}
      
      User Question: ${query}
    `;
    console.log("📝 Built system prompt.");

    // ✅ Call Gemini LLM
    console.log("🤖 Calling Gemini model...");
    const llm = new ChatGoogleGenerativeAI({
      apiKey: process.env.GOOGLE_API_KEY,
      model: "gemini-1.5-flash",
      temperature: 0.7,
    });

    const data = await llm.invoke(SYSTEM_PROMPT);
    console.log("✅ Gemini response received.");

    const aiContent = data;
    console.log("AI Content:", aiContent);

    return res.json({
      aiContent,
      similaritySearchResults,
    });
  } catch (error) {
    console.error("❌ Error in /chat:", error);
    res.status(500).json({ error: error.message });
  }
};
