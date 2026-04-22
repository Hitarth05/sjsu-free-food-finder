import Groq from "groq-sdk";
 
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
 
export interface ClassificationResult {
  has_free_food: boolean;
  has_free_stuff: boolean;
  free_food_details: string;
  confidence: "high" | "medium" | "low";
}
 
export async function classifyEvents(
  events: { id: string; title: string; description_text: string }[]
): Promise<Map<string, ClassificationResult>> {
  const results = new Map<string, ClassificationResult>();
 
  const batchSize = 10;
 
  for (let i = 0; i < events.length; i += batchSize) {
    const batch = events.slice(i, i + batchSize);
 
    const eventsText = batch
      .map(
        (e, idx) =>
          `EVENT ${idx + 1} (ID: ${e.id}):\nTitle: ${e.title}\nDescription: ${e.description_text?.slice(0, 500) || "No description"}`
      )
      .join("\n\n---\n\n");
 
    const prompt = `You are a classifier that determines whether university events offer FREE FOOD or FREE PHYSICAL ITEMS to attendees. You must be accurate and avoid false positives.
 
Here are the events to classify:
 
${eventsText}
 
For each event, set has_free_food and has_free_stuff.
 
WHAT COUNTS AS FREE FOOD (has_free_food = true):
- Food or drinks explicitly provided to attendees: pizza, snacks, refreshments, coffee, lunch, dinner, breakfast, catering, boba, ice cream, etc.
- Phrases like "food will be provided", "refreshments served", "lunch included", "snacks available"
- A "reception" often implies food — mark true with medium confidence
 
WHAT COUNTS AS FREE STUFF (has_free_stuff = true):
- Physical items given to attendees: t-shirts, stickers, swag, merchandise, giveaways, raffle prizes, tote bags, supplies
 
WHAT DOES NOT COUNT (both should be false):
- "Free event" or "free admission" — this means the event is free to attend, NOT that food is given out
- "Free parking" — not food or stuff
- "Free performance" or "free concert" or "free show" — entertainment, not food
- "Free workshop" or "free lecture" or "free class" — educational, not food
- "Free screening" or "free film" — entertainment, not food
- "Gluten-free", "sugar-free", "barrier-free" — these describe attributes, not giveaways
- Athletic events (games, matches) unless food is explicitly mentioned
- Art exhibitions, installations, gallery shows unless food is explicitly mentioned
 
Be conservative. When the description does not mention food or physical giveaways, both should be false. Most events will NOT have free food.
 
Respond with ONLY a valid JSON array. Every value must be properly quoted. Do not include any text before or after the JSON:
[{"id": "12345", "has_free_food": false, "has_free_stuff": false, "free_food_details": "", "confidence": "low"}]`;
 
    try {
      const response = await groq.chat.completions.create({
        model: "llama-3.3-70b-versatile",
        messages: [{ role: "user", content: prompt }],
        temperature: 0,
        max_tokens: 4000,
      });
 
      const text = response.choices[0]?.message?.content?.trim() || "";
      const cleaned = text
        .replace(/```json\n?/g, "")
        .replace(/```\n?/g, "")
        .replace(/:\s*(?<!")(high|medium|low)(?!")\s*/g, ': "$1"')
        .trim();
 
      const parsed: {
        id: string;
        has_free_food: boolean;
        has_free_stuff: boolean;
        free_food_details: string;
        confidence: "high" | "medium" | "low";
      }[] = JSON.parse(cleaned);
 
      for (const item of parsed) {
        results.set(item.id, {
          has_free_food: item.has_free_food === true,
          has_free_stuff: item.has_free_stuff === true,
          free_food_details: item.free_food_details || "",
          confidence: ["high", "medium", "low"].includes(item.confidence)
            ? item.confidence
            : "low",
        });
      }
    } catch (error) {
      console.error("Batch classification error:", error);
      for (const event of batch) {
        results.set(event.id, {
          has_free_food: false,
          has_free_stuff: false,
          free_food_details: "",
          confidence: "low",
        });
      }
    }
 
    if (i + batchSize < events.length) {
      await new Promise((resolve) => setTimeout(resolve, 3000));
    }
  }
 
  return results;
}
 