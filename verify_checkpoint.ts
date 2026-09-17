import { createAgent } from "./lib/agent/graph";
import { db } from "./db";
import { sql } from "drizzle-orm";
import { PostgresSaver } from "@langchain/langgraph-checkpoint-postgres";
import { v4 as uuidv4 } from "uuid";

async function run() {
  const thread_id = "verify-thread-001";
  console.log("Running agent with thread_id:", thread_id);
  const config = { configurable: { thread_id } };
  
  // Make sure to setup the database checkpointer
  const checkpointer = PostgresSaver.fromConnString(process.env.DATABASE_URL!);
  await checkpointer.setup();
  
  const graph = createAgent();
  
  // First run
  console.log("--- First Invocation ---");
  const state1 = await graph.invoke({
    requestId: "TEST-01",
    rawInput: "I want to rent a compact car for tomorrow.",
    uploadedFiles: [],
    errors: [],
    graphTrace: []
  }, config);
  
  console.log("Trace 1:", state1.graphTrace);
  
  let res = await db.execute(sql`SELECT COUNT(*) FROM checkpoints WHERE thread_id = ${thread_id}`);
  console.log("Checkpoints count after 1st run:", res[0].count);
  
  // Second run: fresh graph instance
  console.log("--- Second Invocation (Resume) ---");
  const graph2 = createAgent();
  const state2 = await graph2.invoke({
    requestId: "TEST-02",
    rawInput: "Actually, change that to an SUV.",
  }, config);
  
  console.log("Trace 2:", state2.graphTrace);
  
  res = await db.execute(sql`SELECT COUNT(*) FROM checkpoints WHERE thread_id = ${thread_id}`);
  console.log("Checkpoints count after 2nd run:", res[0].count);
  
  process.exit(0);
}
run().catch(console.error);
