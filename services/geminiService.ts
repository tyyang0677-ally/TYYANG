
import { GoogleGenAI } from "@google/genai";

// Use process.env.API_KEY directly as required by guidelines
export const generateLearningSummary = async (content: string) => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Analyze the following student interaction log and provide a one-sentence academic summary in Chinese: ${content}`,
    });
    // Access response.text directly (property, not method)
    return response.text;
  } catch (error) {
    console.error("Gemini Error:", error);
    return "无法生成AI总结，请稍后重试。";
  }
};