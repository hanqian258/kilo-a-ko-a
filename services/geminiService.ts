import { GoogleGenAI } from "@google/genai";

// Initialize Gemini Client
// We assume process.env.API_KEY is available.
// In a real app, you would handle the missing key more gracefully in the UI.
const apiKey = process.env.API_KEY || '';
const ai = new GoogleGenAI({ apiKey });

export const analyzeCoralImage = async (base64Image: string): Promise<string> => {
  if (!apiKey) return "API Key missing. Unable to analyze image.";

  try {
    const model = 'gemini-2.5-flash-image';
    
    const response = await ai.models.generateContent({
      model: model,
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: 'image/jpeg', // Assuming JPEG for simplicity in this demo
              data: base64Image
            }
          },
          {
            text: "Analyze this image of a coral. Identify the likely species (scientific and common name) if possible, describe its health condition (bleached, healthy, diseased), and provide one fun fact about this type of coral. Keep the response concise and formatted."
          }
        ]
      }
    });

    return response.text || "No analysis available.";
  } catch (error) {
    console.error("Gemini Analysis Error:", error);
    return "Error analyzing image. Please try again.";
  }
};

export const generateSurveyQuestion = async (topic: string): Promise<string> => {
  if (!apiKey) return "How was your experience today?";

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `Generate a single, engaging survey question for a donor at a coral conservation booth about: ${topic}.`
    });
    return response.text || "How was your experience today?";
  } catch (error) {
    return "How was your experience today?";
  }
};