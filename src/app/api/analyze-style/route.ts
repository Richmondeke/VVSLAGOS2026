import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

// Ensure the API key is available
const apiKey = process.env.GEMINI_API_KEY;
const genAI = new GoogleGenerativeAI(apiKey || "");

export const runtime = "edge";
export const maxDuration = 300;

export async function POST(req: NextRequest) {
    // If no API key is set, return a simulated mock response for testing
    if (!apiKey || apiKey === "insert_your_key_here") {
        console.log("No Gemini API Key found. Returning simulated mock response.");
        
        // Simulate a 3-second AI processing delay
        await new Promise(resolve => setTimeout(resolve, 3000));
        
        return NextResponse.json({
            archetype: "STREETWEAR",
            reading: "Your silhouette speaks of a cyber-punk tomorrow. The stark architectural lines combined with raw metal accents show a fearless embrace of the digital age.",
            colors: ["#000000", "#c5a059", "#444444"]
        });
    }

    try {
        const body = await req.json();
        const { images } = body;

        if (!images || !Array.isArray(images) || images.length === 0) {
            return NextResponse.json({ error: "No images provided" }, { status: 400 });
        }

        // Parse base64 images
        const imageParts = images.map((base64String: string) => {
            // Remove data URL prefix if present
            const base64Data = base64String.replace(/^data:image\/(png|jpeg|jpg|webp);base64,/, "");
            return {
                inlineData: {
                    data: base64Data,
                    mimeType: "image/jpeg" // Defaulting to jpeg
                }
            };
        });

        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

        const prompt = `
You are an elite fashion analyst for VVS Lagos. Analyze the provided images of clothing, outfits, or style grids.
Classify the user into exactly ONE of these 10 style archetypes based on visible clothing, silhouettes, colors, and accessories:

"FUTURIST" — sleek, experimental, tech-inspired
"STREETWEAR" — urban, casual, sneaker-focused
"MINIMALIST" — clean lines, neutral colors, understated
"VINTAGE" — retro-inspired, nostalgic influences
"FORMAL" — refined, polished, traditional tailoring
"CASUAL" — relaxed, everyday, effortless style
"ATHLEISURE" — sporty, functional, comfort-focused
"BOHEMIAN" — eclectic, free-spirited, layered textures
"LUXURY" — premium, designer-oriented, high-end
"AVANT_GARDE" — artistic, unconventional, boundary-pushing

Include a personalized 2-sentence 'fashion reading' and identify their 3 dominant wardrobe colors as hex codes.

Respond strictly in valid JSON format like this:
{
  "archetype": "STREETWEAR",
  "reading": "Your wardrobe radiates urban confidence. Bold graphic layers and statement sneakers mark you as a true street culture connoisseur.",
  "colors": ["#000000", "#c5a059", "#444444"]
}
`;

        const result = await model.generateContent([prompt, ...imageParts]);
        const response = await result.response;
        let text = response.text();

        // Strip markdown codeblocks if Gemini added them
        text = text.replace(/```json/g, "").replace(/```/g, "").trim();
        
        try {
            const parsedData = JSON.parse(text);
            return NextResponse.json(parsedData);
        } catch (parseError) {
            console.error("Failed to parse Gemini response as JSON:", text);
            return NextResponse.json({ error: "Failed to parse AI response" }, { status: 500 });
        }

    } catch (error: any) {
        console.error("Error in analyze-style API:", error);
        return NextResponse.json({ error: error.message || "Failed to analyze images" }, { status: 500 });
    }
}
