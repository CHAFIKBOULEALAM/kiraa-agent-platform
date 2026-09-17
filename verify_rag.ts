import { db } from "./db";
import { sql } from "drizzle-orm";
import { rentalPoliciesVectors } from "./db/schema";
import { pipeline } from "@xenova/transformers";

async function run() {
  console.log("Fetching sample vector from db...");
  const res = await db.execute(sql`SELECT id, vector_dims(embedding) AS dims, embedding FROM rental_policies_vectors LIMIT 1`);
  const row = res[0] as any;
  console.log("Vector Dimension:", row.dims);
  
  // Calculate L2 Norm
  let sum = 0;
  // pgvector returns the array directly or as string depending on the driver, let s parse it safely
  let arr: number[] = [];
  if (typeof row.embedding === "string") {
      arr = JSON.parse(row.embedding);
  } else {
      arr = row.embedding;
  }
  for(let num of arr) {
      sum += num * num;
  }
  const norm = Math.sqrt(sum);
  console.log("Sample Vector Norm:", norm);
  
  console.log("Testing retrieval for \"What is the policy for late returns?\"");
  const pipe = await pipeline("feature-extraction", "Xenova/all-MiniLM-L6-v2");
  const qOut = await pipe("What is the policy for late returns?", { pooling: "mean", normalize: true });
  const qEmbed = Array.from(qOut.data);
  const qEmbedString = "[" + qEmbed.join(",") + "]";
  
  const search = await db.execute(sql`SELECT content_chunk, 1 - (embedding <=> ${qEmbedString}::vector) AS similarity FROM rental_policies_vectors ORDER BY embedding <=> ${qEmbedString}::vector LIMIT 1`);
  console.log("Top result similarity:", search[0].similarity);
  console.log("Passage:", search[0].content_chunk);
  
  process.exit(0);
}
run().catch(console.error);