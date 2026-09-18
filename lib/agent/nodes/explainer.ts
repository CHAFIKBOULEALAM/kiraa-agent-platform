import { KiraaState } from "@/lib/schemas/state";
import { ChatGroq } from "@langchain/groq";
import { retrieveRelevantPolicies } from "@/lib/rag";

const groqModel = new ChatGroq({
  model: process.env.LLM_MODEL || process.env.GROQ_MODEL || "llama-3.1-8b-instant",
  temperature: 0.3,
});

export async function explainerNode(state: KiraaState): Promise<Partial<KiraaState>> {
  console.log("-> [Node] Explainer");

  if (state.intent === "out_of_scope") {
    const explanation = "Desole, je suis un assistant specialise dans la location de vehicules. Je ne peux pas repondre a cette demande.";
    return {
      explanation,
      messages: [{ role: "bot", content: explanation }],
      graphTrace: [...state.graphTrace, "explainer"],
    };
  }

  if (state.intent === "human_escalation" || state.needsHumanReview) {
    const explanation = "Votre demande necessite l'intervention d'un agent humain. Un conseiller va prendre le relais.";
    return {
      explanation,
      messages: [{ role: "bot", content: explanation }],
      graphTrace: [...state.graphTrace, "explainer"],
    };
  }

  if (state.bookingStatus === "MISSING_DETAILS") {
    let missingList = state.params?.missingSlots || [];
    const explanation = "Pour finaliser votre demande, veuillez préciser : " + missingList.join(", ") + ".";
    return {
      explanation,
      messages: [{ role: "bot", content: explanation }],
      graphTrace: [...state.graphTrace, "explainer"],
    };
  }

  // RAG retrieval ONLY for policy_query — never for pricing/eligibility/availability
  let ragPassages = state.ragPassages;
  if (state.intent === "policy_query" && ragPassages.length === 0 && state.rawInput) {
    console.log("   [Explainer] Retrieving RAG passages for policy_query...");
    try {
      ragPassages = await retrieveRelevantPolicies(state.rawInput);
      console.log("   [Explainer] Retrieved " + String(ragPassages.length) + " RAG passages.");
    } catch (err) {
      console.error("   [Explainer] RAG Error:", err);
      const explanation = "Une erreur de base de données (RAG) est survenue. Veuillez réessayer.";
      return {
        errors: [...state.errors, "RAG PostgreSQL Database is unavailable."],
        explanation,
        messages: [{ role: "bot", content: explanation }],
        graphTrace: [...state.graphTrace, "explainer"],
      };
    }
  }

  // Build context from deterministic engine results only
  let contextStr = "Resultats deterministes du moteur Kiraa :\n";
  if (state.eligibilityResult) {
    contextStr += "- Eligibilite: " + (state.eligibilityResult.eligible ? "Oui" : "Non") + "\n";
    if (!state.eligibilityResult.eligible) {
      contextStr += "- Raisons rejet: " + state.eligibilityResult.rejectionReasons.join(", ") + "\n";
    }
  }
  if (state.priceResult) {
    contextStr += "- Sous-total: " + String(state.priceResult.subtotal) + " MAD\n";
    contextStr += "- Remise effective: " + String(state.priceResult.discountAmount) + " MAD\n";
    contextStr += "- Caution: " + String(state.priceResult.deposit) + " MAD\n";
    contextStr += "- Total a payer: " + String(state.priceResult.totalPrice) + " MAD\n";
  }
  if (ragPassages.length > 0) {
    contextStr += "\nPassages RAG (rental_policies.md via pgvector):\n";
    contextStr += ragPassages.map((p: { content: string }) => p.content).join("\n---\n");
  }

  try {
    const response = await groqModel.invoke([
      {
        role: "system",
        content: "Tu es Kiraa. Explique les resultats du moteur deterministe au client. Ne contredis JAMAIS les chiffres ou decisions. Sois concis.",
      },
      {
        role: "user",
        content: "Requete: " + state.rawInput + "\n\n" + contextStr + "\n\nReponse au client:",
      }
    ]);

    const explanation = response.content.toString();
    return {
      explanation,
      messages: [{ role: "bot", content: explanation }],
      ragPassages,
      graphTrace: [...state.graphTrace, "explainer"],
    };
  } catch (error: any) {
    console.error("Explainer LLM Error:", error);
    let explanation = "Une erreur est survenue. Veuillez réessayer.";
    
    if (error?.status === 429 || error?.toString().includes("429") || error?.toString().includes("Rate limit")) {
       explanation = "Je suis temporairement surchargé (limite de requêtes atteinte). Veuillez réessayer dans quelques instants.";
    }

    return {
      errors: [...state.errors, "Failed to generate explanation."],
      explanation,
      messages: [{ role: "bot", content: explanation }],
      ragPassages,
      graphTrace: [...state.graphTrace, "explainer"],
    };
  }
}
