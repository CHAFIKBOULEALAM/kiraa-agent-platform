import { KiraaState } from "@/lib/schemas/state";
import { processUploadedFiles } from "@/lib/ingestor/index";

export async function ingestorNode(state: KiraaState): Promise<Partial<KiraaState>> {
  console.log("-> [Node] Ingestor");
  const result = await processUploadedFiles(state);
  
  return {
    ...result,
    graphTrace: [...state.graphTrace, "ingestor"],
  };
}
