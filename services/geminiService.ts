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

// Helper: Parse JSON response
const parseResponse = (responseText: string, isZh: boolean): MathResponse => {
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

/**
 * Strategy 1: OpenAI Compatible API (NewAPI, OneAPI, etc.)
 * Used when API_BASE_URL is provided.
 */
const callOpenAICompatible = async (
  apiKey: string, 
  baseUrl: string, 
  model: string, 
  base64Image: string, 
  systemInstruction: string,
  userPrompt: string
): Promise<string> => {
  // Construct OpenAI-compatible endpoint
  let url = baseUrl.trim();
  // Remove trailing slash
  if (url.endsWith('/')) url = url.slice(0, -1);
  
  // Append /chat/completions if not present
  if (!url.endsWith('/chat/completions')) {
     url = `${url}/chat/completions`;
  }

  const payload = {
    model: model,
    messages: [
      { role: "system", content: systemInstruction },
      {
        role: "user",
        content: [
          { type: "text", text: userPrompt },
          { type: "image_url", image_url: { url: `data:image/jpeg;base64,${base64Image}` } }
        ]
      }
    ],
    temperature: 0.2
  };

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`
    },
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`OpenAI API Error (${response.status}): ${errorText}`);
  }

  const data = await response.json();
  const content = data.choices?.[0]?.message?.content;
  if (!content) throw new Error("Empty response from OpenAI compatible API");
  
  return content;
};

/**
 * Strategy 2: Google Native API
 * Used when no API_BASE_URL is provided (Default).
 */
const callGoogleNative = async (
  apiKey: string,
  model: string,
  base64Image: string,
  systemInstruction: string,
  userPrompt: string,
  isZh: boolean
): Promise<string> => {
  const ai = new GoogleGenAI({ apiKey });

  const config: any = {
    systemInstruction,
    responseMimeType: 'application/json',
    temperature: 0.2,
  };

  // Enable thinking for Pro models (Gemini 2.5/3.0 feature) if available in SDK
  if (model.includes('pro')) {
    config.thinkingConfig = { thinkingBudget: 2048 };
  }

  const response = await ai.models.generateContent({
    model,
    contents: {
      parts: [
        { inlineData: { mimeType: 'image/jpeg', data: base64Image } },
        { text: userPrompt }
      ]
    },
    config
  });

  if (!response.text) throw new Error("Empty response");
  return response.text;
};

export const solveMathProblem = async (base64Image: string, lang: Language): Promise<MathResponse> => {
  const apiKey = (process.env.API_KEY || "").trim();
  const apiBaseUrl = (process.env.API_BASE_URL || "").trim(); 
  const isZh = lang === 'zh';

  if (!apiKey) {
    throw new Error(
      isZh 
        ? "未检测到 API Key。请在 Vercel 环境变量中配置 API_KEY。" 
        : "API Key is missing. Please configure API_KEY in Vercel."
    );
  }

  // Determine Strategy: If API_BASE_URL is present, use OpenAI compatibility mode
  const useOpenAI = !!apiBaseUrl && apiBaseUrl.length > 0;
  
  const systemInstruction = isZh ? SYSTEM_INSTRUCTION_ZH : SYSTEM_INSTRUCTION_EN;
  const userPrompt = isZh ? "请分析图片并输出 JSON 答案。" : "Analyze image and output JSON.";

  // Define models (Consistency between strategies)
  const models = {
    primary: 'gemini-3-pro-preview',
    fallback: 'gemini-2.5-flash'
  };

  const attemptCall = async (model: string) => {
    if (useOpenAI) {
      console.log(`Calling OpenAI Compatible API (${model}) at ${apiBaseUrl}`);
      return await callOpenAICompatible(apiKey, apiBaseUrl, model, base64Image, systemInstruction, userPrompt);
    } else {
      console.log(`Calling Google Native API (${model})`);
      return await callGoogleNative(apiKey, model, base64Image, systemInstruction, userPrompt, isZh);
    }
  };

  try {
    // ATTEMPT 1: Primary Model
    const text = await attemptCall(models.primary);
    return parseResponse(text, isZh);

  } catch (error: any) {
    console.warn(`Primary model (${models.primary}) failed:`, error);
    
    // Check for fatal auth errors (401)
    const msg = (error.message || "").toLowerCase();
    if (msg.includes("401") || msg.includes("unauthenticated") || msg.includes("invalid api key")) {
       throw new Error(
         isZh 
           ? `API Key 无效或未授权 (401)。请检查 Key 是否正确。`
           : `Invalid API Key or Unauthorized (401).`
       );
    }

    // ATTEMPT 2: Fallback Model
    try {
      console.log(`Falling back to ${models.fallback}...`);
      const text = await attemptCall(models.fallback);
      return parseResponse(text, isZh);
    } catch (fallbackError: any) {
      console.error("Fallback failed:", fallbackError);
      
      // Simplify error message for UI
      const fallbackMsg = (fallbackError.message || "").toLowerCase();
      if (fallbackMsg.includes("404") || fallbackMsg.includes("not found")) {
         throw new Error(isZh ? "未找到模型 (404)。请检查 API 提供商是否支持 Gemini 模型。" : "Model not found (404). Check if provider supports Gemini.");
      }
      
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
