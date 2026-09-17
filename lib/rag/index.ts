import { db } from "@/db";
import { rentalPoliciesVectors } from "@/db/schema";
import { cosineDistance, desc, sql } from "drizzle-orm";

import { pipeline } from "@xenova/transformers";

/**
 * Generates an embedding using a local Transformers.js model
 */
async function generateEmbedding(text: string): Promise<number[]> {
  const extractor = await pipeline("feature-extraction", "Xenova/all-MiniLM-L6-v2");
  const output = await extractor(text, { pooling: "mean", normalize: true });
  return Array.from(output.data);
}


export interface RagPassage {
  content: string;
  score: number;
}

/**
 * Searches the rental policies knowledge base for relevant passages
 * using pgvector cosine distance.
 */
export async function retrieveRelevantPolicies(query: string, limit: number = 3): Promise<RagPassage[]> {
  try {
    const queryEmbedding = await generateEmbedding(query);

    // Perform vector search
    // Note: If using dummy zero vectors, cosine distance will be 0 or NaN.
    // Drizzle syntax for pgvector:
    const similarity = sql<number>`1 - (${cosineDistance(rentalPoliciesVectors.embedding, queryEmbedding)})`;

    const results = await db
      .select({
        content: rentalPoliciesVectors.contentChunk,
        metadata: rentalPoliciesVectors.metadata,
        score: similarity,
      })
      .from(rentalPoliciesVectors)
      .orderBy((t) => desc(t.score))
      .limit(limit);

    console.log(`-> [pgvector] Executed cosine distance search for: "${query.substring(0, 50)}..."`);
    results.forEach((r, i) => {
      console.log(`   [pgvector] Match ${i+1}: score=${Number(r.score).toFixed(4)}, metadata=${r.metadata}`);
    });

    return results.map(r => ({
      content: r.content,
      score: Number(r.score) || 0,
    }));
  } catch (error) {
    console.error("RAG pgvector Retrieval Error:", error);
    // Explicitly do not fall back to in-memory as per prompt requirement
    throw new Error("RAG PostgreSQL Database is unavailable.");
  }
}
