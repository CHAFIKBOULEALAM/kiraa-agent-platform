import { Client } from "pg";
import { v4 as uuidv4 } from "uuid";

async function run() {
  const client = new Client({
    connectionString: "postgresql://kiraa:kiraa@localhost:5432/kiraa"
  });
  await client.connect();
  
  console.log("=== PostgresSaver Recovery Test ===");
  
  // 1. Get initial checkpoint count
  const initialRes = await client.query(`SELECT COUNT(*) FROM checkpoints`);
  const initialCount = Number(initialRes.rows[0]?.count || 0);
  console.log(`Initial checkpoints in DB: ${initialCount}`);

  const threadId = `TEST-${uuidv4().substring(0, 8).toUpperCase()}`;
  console.log(`Using Thread ID: ${threadId}`);

  // 2. Make first request to API
  const formData1 = new FormData();
  formData1.append("message", "Bonjour, je cherche un véhicule économique");
  formData1.append("threadId", threadId);

  console.log("\n-> Sending Request 1 (Initial)");
  let res1 = await fetch("http://localhost:3000/api/chat", {
    method: "POST",
    body: formData1 as any,
  });
  console.log(`   Response 1 Status: ${res1.status}`);

  // 3. Check DB again
  const midRes = await client.query(`SELECT COUNT(*) FROM checkpoints`);
  const midCount = Number(midRes.rows[0]?.count || 0);
  console.log(`Checkpoints in DB after Request 1: ${midCount} (+${midCount - initialCount})`);

  if (midCount === initialCount) {
    console.error("❌ FAILED: No new checkpoints written.");
    process.exit(1);
  }

  // 4. Send second request (simulating follow up on the same thread, testing LangGraph recovery)
  const formData2 = new FormData();
  formData2.append("message", "Quel est le prix pour 3 jours ?");
  formData2.append("threadId", threadId);

  console.log("\n-> Sending Request 2 (Follow-up on same thread)");
  let res2 = await fetch("http://localhost:3000/api/chat", {
    method: "POST",
    body: formData2 as any,
  });
  console.log(`   Response 2 Status: ${res2.status}`);

  // 5. Check DB again
  const finalRes = await client.query(`SELECT COUNT(*) FROM checkpoints`);
  const finalCount = Number(finalRes.rows[0]?.count || 0);
  console.log(`Checkpoints in DB after Request 2: ${finalCount} (+${finalCount - midCount})`);

  await client.end();
  console.log("\n✅ PostgresSaver verification passed.");
  process.exit(0);
}

run().catch(console.error);
