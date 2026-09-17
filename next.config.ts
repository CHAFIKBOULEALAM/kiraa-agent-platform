import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: [
    "pdfkit", "fontkit", "pdf-parse", "tesseract.js",
    "@langchain/core", "@langchain/groq", "@langchain/langgraph", 
    "@langchain/langgraph-checkpoint", "@langchain/langgraph-checkpoint-postgres"
  ],
};

export default nextConfig;
