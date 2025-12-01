import { GoogleGenAI } from "@google/genai";
import { Language, MathResponse } from "../types";

const SYSTEM_INSTRUCTION_EN = `
You are an expert, patient, and encouraging academic tutor for ALL subjects (Math, Science, History, Language Arts, Physics, Coding, etc.).
Your goal is to help students understand concepts deeply through interactive learning.

When provided with an image of a question or concept:
1.  **Analyze the image** to identify the subject and specific problem.
2.  **Formulate the Output**: You must provide three distinct parts:
    *   **Answer**: The concise final result or key fact (e.g., "x = 5", "Paris", "Newton's Second Law").
    *   **Explanation**: A detailed step-by-step derivation or comprehensive analysis.
    *   **Quiz**: An interactive text-based question to test understanding.

**OUTPUT FORMAT**:
You must return a valid **JSON object**.
Structure:
{
  "answer": "Markdown string containing ONLY the concise final answer...",
  "explanation": "Markdown string containing the detailed step-by-step solution/explanation...",
  "quiz": {
    "question": "Markdown string for the quiz question (NO image references, self-contained text)...",
    "options": ["Option A", "Option B", "Option C", "Option D"],
    "correctIndex": 0, // Integer 0-3
    "explanation": "Markdown string explaining the quiz answer..."
  }
}

**QUIZ RULES**:
*   The quiz question must be strictly **text-based** and answerable **WITHOUT** seeing any new image. 
*   Do NOT refer to "the figure", "the map", "the diagram", or "the text above". 
*   If the concept relies on visual data (like a geometry shape), describe all necessary details fully in the text.

**CRITICAL FORMATTING RULES**:
1.  **JSON**: The output must be valid JSON.
2.  **LaTeX in JSON**: You must **DOUBLE ESCAPE** backslashes for LaTeX. 
    *   Example: Use \`\\\\frac{1}{2}\` instead of \`\\frac{1}{2}\`.
    *   Inline math: \`$ ... $\`. Block math: \`$$ ... $$\`.
3.  **Markdown**: Do NOT put spaces inside bold tags.
`;

const SYSTEM_INSTRUCTION_ZH = `
你是一位专家级、耐心且善于鼓励学生的全科辅导老师（涵盖数学、物理、化学、历史、地理、语文、英语等所有学科）。
你的目标是通过互动学习帮助学生深入理解知识点。

当收到一张题目或知识点的图片时：
1.  **分析图片**：识别学科和具体问题。
2.  **构建输出**：你需要提供三个明确的部分：
    *   **Answer（答案）**：简洁的最终结果或核心结论（例如：“x = 5”、“巴黎”、“牛顿第二定律”）。
    *   **Explanation（解析）**：详细的逐步解题过程、背景分析或深度讲解。
    *   **Quiz（练一练）**：一道互动选择题。

**输出格式**：
你必须返回一个合法的 **JSON 对象**。
结构如下：
{
  "answer": "仅包含最终答案的 Markdown 字符串...",
  "explanation": "包含详细步骤或讲解的 Markdown 字符串...",
  "quiz": {
    "question": "测验题目的 Markdown 字符串（必须是自包含的纯文字，不可引用图片）...",
    "options": ["选项 A", "选项 B", "选项 C", "选项 D"],
    "correctIndex": 0, // 整数 0-3
    "explanation": "解释测验答案的 Markdown 字符串..."
  }
}

**测验规则**：
*   生成的测验题目必须是**纯文字描述**，**绝不能依赖图片**。
*   切勿包含“如图所示”、“参考上图”等表述。
*   如果是几何题，必须用文字完整描述图形条件。

**关键格式规则**：
1.  **JSON**：必须输出合法的 JSON。
2.  **JSON 中的 LaTeX**：必须对 LaTeX 的反斜杠进行**双重转义**。
    *   例如：使用 \`\\\\frac{1}{2}\` 而不是 \`\\frac{1}{2}\`。
    *   行内公式：\`$ ... $\`。块级公式：\`$$ ... $$\`。
3.  **Markdown**：加粗标签内**绝不能有空格**。
`;

export const solveMathProblem = async (base64Image: string, lang: Language): Promise<MathResponse> => {
  // Robustly handle API Key: trim whitespace which is a common copy-paste error
  const apiKey = (process.env.API_KEY || "").trim();
  let apiBaseUrl = (process.env.API_BASE_URL || "").trim(); 
  const isZh = lang === 'zh';

  // Format base URL
  if (apiBaseUrl) {
    if (apiBaseUrl.endsWith('/')) {
      apiBaseUrl = apiBaseUrl.slice(0, -1);
    }
  }

  const debugConfig = {
    hasKey: !!apiKey,
    keyPrefix: apiKey ? apiKey.substring(0, 5) + "..." : "Missing",
    baseUrl: apiBaseUrl || "(Default Google)",
  };

  console.log("Gemini Service Config:", debugConfig);

  if (!apiKey) {
    throw new Error(
      isZh 
        ? "未检测到 API Key。请在 Vercel 环境变量中配置 API_KEY 并重新部署。" 
        : "API Key is missing. Please configure API_KEY in Vercel and Redeploy."
    );
  }

  const clientConfig: any = { apiKey: apiKey };
  if (apiBaseUrl) {
    clientConfig.baseUrl = apiBaseUrl;
  }
  const ai = new GoogleGenAI(clientConfig);

  // Helper to parse response
  const parseResponse = (responseText: string): MathResponse => {
    try {
      // Clean up markdown code blocks if present (common issue with some models)
      const cleanText = responseText.replace(/```json/g, '').replace(/```/g, '').trim();
      const jsonResponse = JSON.parse(cleanText) as MathResponse;
      
      if (!jsonResponse.explanation || !jsonResponse.quiz) {
        throw new Error("Invalid structure");
      }
      if (!jsonResponse.answer) {
        jsonResponse.answer = isZh ? "见详细解析" : "See explanation below";
      }
      return jsonResponse;
    } catch (e) {
      console.error("JSON Parse Error:", e, "Raw:", responseText);
      throw new Error(isZh ? "AI 返回数据格式错误。" : "Invalid JSON response from AI.");
    }
  };

  const handleError = (error: any, modelAttempted: string) => {
    console.error(`Gemini API Error (${modelAttempted}):`, error);
    const msg = (error.message || error.toString()).toLowerCase();

    // 1. Auth Errors (401)
    if (msg.includes("401") || msg.includes("unauthenticated") || msg.includes("key")) {
      const info = `(Key: ${debugConfig.keyPrefix}, BaseURL: ${debugConfig.baseUrl})`;
      throw new Error(isZh 
        ? `API Key 无效或未授权 (401)。请检查 Key 是否正确，或代理地址是否配置正确。${info}`
        : `API Key invalid or unauthorized (401). Check Key and Base URL. ${info}`);
    }

    // 2. Model Not Found (404)
    if (msg.includes("404") || msg.includes("not found")) {
      // If 404, we might want to try fallback, so re-throw specially or handle in caller
      throw new Error("MODEL_NOT_FOUND");
    }

    // 3. Rate Limit / Quota (429)
    if (msg.includes("429") || msg.includes("quota") || msg.includes("exhausted")) {
      throw new Error(isZh ? "API 调用次数超限 (429)。请稍后再试。" : "API Quota Exceeded (429). Please try again later.");
    }
    
    // 4. Network
    if (msg.includes("fetch") || msg.includes("network") || msg.includes("load failed")) {
      throw new Error(isZh 
        ? `网络请求失败。请检查 API_BASE_URL (${debugConfig.baseUrl})。` 
        : `Network failed. Check API_BASE_URL (${debugConfig.baseUrl}).`);
    }

    throw error;
  };

  // ATTEMPT 1: Gemini 3 Pro (Preferred)
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: {
        parts: [
          { inlineData: { mimeType: 'image/jpeg', data: base64Image } },
          { text: isZh ? "请分析图片并输出 JSON 答案。" : "Analyze image and output JSON." }
        ]
      },
      config: {
        systemInstruction: isZh ? SYSTEM_INSTRUCTION_ZH : SYSTEM_INSTRUCTION_EN,
        responseMimeType: 'application/json',
        thinkingConfig: { thinkingBudget: 2048 }, // 2.5/3.0 feature
        temperature: 0.2,
      }
    });

    if (!response.text) throw new Error("Empty response");
    return parseResponse(response.text);

  } catch (error: any) {
    // If it's NOT a model/param error, stop here (e.g. Auth error should not retry)
    try {
      handleError(error, 'gemini-3-pro-preview');
    } catch (e: any) {
      if (e.message !== "MODEL_NOT_FOUND" && !e.message.includes("400") && !e.message.includes("thinking")) {
        throw e; // Re-throw fatal errors
      }
      console.warn("Primary model failed, attempting fallback to Gemini 2.5 Flash...");
    }

    // ATTEMPT 2: Fallback to Gemini 2.5 Flash
    // Remove thinkingConfig and use a more standard model if the pro model fails
    try {
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: {
          parts: [
            { inlineData: { mimeType: 'image/jpeg', data: base64Image } },
            { text: isZh ? "请分析图片并输出 JSON 答案。" : "Analyze image and output JSON." }
          ]
        },
        config: {
          systemInstruction: isZh ? SYSTEM_INSTRUCTION_ZH : SYSTEM_INSTRUCTION_EN,
          responseMimeType: 'application/json',
          temperature: 0.2,
          // Note: No thinkingConfig here to be safe
        }
      });

      if (!response.text) throw new Error("Empty response from fallback");
      return parseResponse(response.text);
      
    } catch (fallbackError: any) {
      handleError(fallbackError, 'gemini-2.5-flash');
      throw fallbackError;
    }
  }
};

export const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        const base64 = reader.result.split(',')[1];
        resolve(base64);
      } else {
        reject(new Error("Failed to convert file to base64"));
      }
    };
    reader.onerror = error => reject(error);
  });
};