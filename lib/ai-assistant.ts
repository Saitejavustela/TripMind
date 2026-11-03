export type AssistantIntent =
  | "make_cheaper"
  | "add_vegetarian"
  | "extend_trip"
  | "shorten_trip"
  | "skip_category"
  | "add_activity"
  | "slower_pace"
  | "general_inquiry";

export interface PlanModification {
  intent: AssistantIntent;
  explanation: string;
  costDelta: number;
  actionsTaken: string[];
}

export interface AssistantResponse {
  reply: string;
  intent: AssistantIntent;
  confidence: number;
  modification?: PlanModification;
}

export class AiAssistantEngine {
  static classifyIntent(text: string): { intent: AssistantIntent; confidence: number } {
    const q = text.toLowerCase().trim();

    if (
      q.includes("cheaper") ||
      q.includes("budget") ||
      q.includes("save money") ||
      q.includes("save $") ||
      q.includes("reduce cost") ||
      q.includes("cut down")
    ) {
      return { intent: "make_cheaper", confidence: 0.95 };
    }

    if (
      q.includes("vegetarian") ||
      q.includes("vegan") ||
      q.includes("plant-based") ||
      q.includes("meatless")
    ) {
      return { intent: "add_vegetarian", confidence: 0.98 };
    }

    if (
      q.includes("extend") ||
      q.includes("more days") ||
      q.includes("another day") ||
      q.includes("extra day")
    ) {
      return { intent: "extend_trip", confidence: 0.95 };
    }

    if (
      q.includes("shorten") ||
      q.includes("early") ||
      q.includes("cut the last day") ||
      q.includes("reduce days")
    ) {
      return { intent: "shorten_trip", confidence: 0.95 };
    }

    if (
      q.includes("skip") ||
      q.includes("remove") ||
      q.includes("no shopping") ||
      q.includes("hate") ||
      q.includes("avoid")
    ) {
      return { intent: "skip_category", confidence: 0.92 };
    }

    if (
      q.includes("add a") ||
      q.includes("include a") ||
      q.includes("insert a") ||
      q.includes("want to do")
    ) {
      return { intent: "add_activity", confidence: 0.92 };
    }

    if (
      q.includes("rushed") ||
      q.includes("slow down") ||
      q.includes("relaxing") ||
      q.includes("pace")
    ) {
      return { intent: "slower_pace", confidence: 0.94 };
    }

    return { intent: "general_inquiry", confidence: 0.85 };
  }

  static processMessage(
    message: string,
    context?: { destination?: string; currentBudget?: number; currency?: string }
  ): AssistantResponse {
    const { intent, confidence } = this.classifyIntent(message);
    const dest = context?.destination || "your destination";
    const symbol = context?.currency === "EUR" ? "€" : "$";

    switch (intent) {
      case "make_cheaper":
        return {
          intent,
          confidence,
          reply: `I have optimized your itinerary to reduce expenses by ${symbol}65 without sacrificing quality. Swapped to a highly-rated 4★ boutique hotel and substituted paid entrance fees with free scenic viewpoints.`,
          modification: {
            intent,
            explanation: `Saved ${symbol}65 by switching accommodation to a 4★ boutique hotel and replacing paid observation desk with a scenic public terrace.`,
            costDelta: -65,
            actionsTaken: [
              "Switched to boutique accommodation (-$45)",
              "Replaced paid observation desk with free metropolitan viewpoint (-$20)",
            ],
          },
        };

      case "add_vegetarian":
        return {
          intent,
          confidence,
          reply: `All meal slots have been updated to feature verified plant-based and vegetarian bistros in ${dest}.`,
          modification: {
            intent,
            explanation: "Filtered restaurants for dedicated vegetarian and vegan menus.",
            costDelta: 0,
            actionsTaken: ["Updated lunch and dinner reservations with certified vegetarian options"],
          },
        };

      case "extend_trip":
        return {
          intent,
          confidence,
          reply: `Added 1 extra day to your itinerary with balanced cultural activities and scenic downtime.`,
          modification: {
            intent,
            explanation: "Added 1 additional day to your trip.",
            costDelta: 140,
            actionsTaken: ["Appended Day to itinerary with accommodation and transit"],
          },
        };

      case "shorten_trip":
        return {
          intent,
          confidence,
          reply: `Consolidated your top highlights into the earlier days and adjusted your final day for departure.`,
          modification: {
            intent,
            explanation: "Shortened itinerary by 1 day and preserved top-rated stops.",
            costDelta: -120,
            actionsTaken: ["Removed final day", "Re-allocated must-visit spot to afternoon"],
          },
        };

      case "skip_category":
        return {
          intent,
          confidence,
          reply: `Removed those activities and substituted them with outdoor scenic walks and local markets.`,
          modification: {
            intent,
            explanation: "Substituted skipped categories with outdoor leisure.",
            costDelta: -15,
            actionsTaken: ["Removed excluded category stops", "Added outdoor scenic stroll"],
          },
        };

      case "slower_pace":
        return {
          intent,
          confidence,
          reply: `I have relaxed your schedule with maximum 2 activities per day and generous coffee/leisure windows.`,
          modification: {
            intent,
            explanation: "Extended durations and added 90-minute leisure windows.",
            costDelta: 0,
            actionsTaken: ["Expanded activity buffers to 90 minutes"],
          },
        };

      default:
        return {
          intent: "general_inquiry",
          confidence,
          reply: `In ${dest}, public transit is fast and accessible with contactless payment. Let me know if you would like me to adjust budget, timing, or activities!`,
        };
    }
  }

  classifyIntent = AiAssistantEngine.classifyIntent.bind(AiAssistantEngine);
  processMessage = AiAssistantEngine.processMessage.bind(AiAssistantEngine);
}

export const aiAssistant = new AiAssistantEngine();

