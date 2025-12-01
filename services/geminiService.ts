import { GoogleGenAI, Type } from "@google/genai";
import { AnalysisResult } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const MODEL_NAME = 'gemini-2.5-flash';

export const analyzeImageForAIArtifacts = async (
  base64Data: string,
  mimeType: string
): Promise<AnalysisResult> => {
  try {
    const prompt = `
      你是一位专业的数字取证分析师和艺术评论家，专门鉴别AI生成的图像。
      请仔细分析提供的图片，寻找AI生成常见的物理不一致性、光影错误、纹理伪影和逻辑谬误（例如手指、文字、背景连贯性、光源方向等）。

      请用中文（简体）返回一个JSON对象，包含以下结构：
      - isLikelyAI: boolean (如果你认为是AI生成的则为true，如果看起来像真实照片或手绘艺术则为false)。
      - confidenceScore: number (0到100，你有多确信？)。
      - verdictTitle: string (简短的标题，例如“极有可能是AI生成”或“真实照片”).
      - reasoning: string (一段简洁的分析段落，解释你的整体评估).
      - flaws: array of strings (如果 isLikelyAI 为 true，请列出具体的缺陷点，例如“左侧阴影不一致”、“手指扭曲”、“背景纹理循环”等。如果是真实图片，请留空).
      - remediationPrompt: string (如果 isLikelyAI 为 true，请编写一段专门用于发送给AI绘图模型（如 Gemini Flash Image / Nano Banana）的提示词。这段提示词的目标是**“重绘并修复”**这张图。请基于原图的画面内容，但**专门针对你上面列出的每一个瑕疵（flaws）加入强制性的修正描述**。例如：如果你检测到“手指扭曲”，提示词必须包含“解剖学完美的手指，细节清晰的关节”；如果你检测到“光影冲突”，提示词必须包含“符合物理规律的自然光照，一致的阴影投射”。请输出一段完整、详细、高质量的Prompt，用于生成一张内容相同但没有这些错误的完美图片。如果是真实图片，留空).
    `;

    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: {
        parts: [
          {
            inlineData: {
              data: base64Data,
              mimeType: mimeType,
            },
          },
          {
            text: prompt,
          },
        ],
      },
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            isLikelyAI: { type: Type.BOOLEAN },
            confidenceScore: { type: Type.NUMBER },
            verdictTitle: { type: Type.STRING },
            reasoning: { type: Type.STRING },
            flaws: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
            },
            remediationPrompt: { type: Type.STRING },
          },
          required: ["isLikelyAI", "confidenceScore", "verdictTitle", "reasoning"],
        },
      },
    });

    const text = response.text;
    if (!text) throw new Error("AI未返回响应");

    return JSON.parse(text) as AnalysisResult;

  } catch (error) {
    console.error("Gemini Analysis Error:", error);
    throw new Error("图片分析失败，请重试。");
  }
};

export const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      const result = reader.result as string;
      // Remove the data URL prefix (e.g., "data:image/jpeg;base64,")
      const base64 = result.split(',')[1];
      resolve(base64);
    };
    reader.onerror = (error) => reject(error);
  });
};