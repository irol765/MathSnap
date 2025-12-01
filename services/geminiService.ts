
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
  const apiKey = process.env.API_KEY;
  let apiBaseUrl = process.env.API_BASE_URL; 
  const isZh = lang === 'zh';

  // Debug log to help users verify their config
  console.log("Gemini Service Config:", { 
    hasKey: !!apiKey, 
    keyPrefix: apiKey?.substring(0, 4) + "...", 
    baseUrl: apiBaseUrl || "(Default Google)" 
  });

  if (!apiKey) {
    console.error("API_KEY is missing in process.env");
    throw new Error(
      isZh 
        ? "系统未配置 API Key。请在部署平台（如 Vercel）的环境变量中设置 API_KEY。" 
        : "API Key not configured. Please set API_KEY in your environment variables."
    );
  }

  try {
    const clientConfig: any = { apiKey: apiKey };
    
    if (apiBaseUrl) {
      // Remove trailing slash if present to avoid double slashes in SDK path construction
      if (apiBaseUrl.endsWith('/')) {
        apiBaseUrl = apiBaseUrl.slice(0, -1);
      }
      clientConfig.baseUrl = apiBaseUrl;
    }

    const ai = new GoogleGenAI(clientConfig);

    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: 'image/jpeg',
              data: base64Image
            }
          },
          {
            text: isZh 
              ? "请分析图片内容，并按 JSON 格式分别输出：简洁答案、详细解析和互动测验。"
              : "Please analyze the image and output the answer, detailed explanation, and quiz in JSON format."
          }
        ]
      },
      config: {
        systemInstruction: isZh ? SYSTEM_INSTRUCTION_ZH : SYSTEM_INSTRUCTION_EN,
        responseMimeType: 'application/json', // Force JSON output
        thinkingConfig: {
          thinkingBudget: 2048 
        },
        temperature: 0.2,
      }
    });

    if (!response.text) {
      throw new Error(isZh ? "无法生成解释。" : "No explanation generated.");
    }

    // Parse JSON response
    try {
      const jsonResponse = JSON.parse(response.text) as MathResponse;
      
      // Basic validation
      if (!jsonResponse.explanation || !jsonResponse.quiz) {
        throw new Error("Invalid JSON structure");
      }
      
      // Fallback for answer if model misses it
      if (!jsonResponse.answer) {
        jsonResponse.answer = isZh ? "见详细解析" : "See explanation below";
      }
      
      return jsonResponse;
    } catch (parseError) {
      console.error("JSON Parse Error:", parseError, "Raw text:", response.text);
      throw new Error(isZh ? "AI 返回数据格式错误。" : "Failed to parse AI response.");
    }

  } catch (error: any) {
    console.error("Gemini API Error:", error);
    
    const msg = error.message || error.toString();

    // 1. Handle API Key errors specifically
    if (msg.includes("API key not valid") || msg.includes("API_KEY_INVALID")) {
      // Diagnostic check: User has a Proxy Key (sk-...) but Base URL is empty/default
      if (apiKey?.startsWith("sk-") && !apiBaseUrl) {
        const errorMsg = isZh
          ? "API Key 无效。检测到您使用的是代理 Key (sk-...)，但未配置 API_BASE_URL。如果您已在 Vercel 添加了变量，请务必执行 Redeploy (重新部署) 以使其生效。"
          : "Invalid API Key. You are using a proxy key (sk-...) but API_BASE_URL is not active. If you added the variable in Vercel, you MUST Redeploy for it to take effect.";
        throw new Error(errorMsg);
      }
      
      throw new Error(isZh ? "API Key 无效，请检查配置。" : "API Key is invalid.");
    }

    // 2. Handle Network/Fetch errors (common with Firewall/GFW or AdBlockers)
    if (msg.includes("Load failed") || msg.includes("Failed to fetch") || msg.includes("NetworkError")) {
       const networkErrorMsg = isZh 
         ? "网络连接失败。请检查：1. 是否开启代理/VPN（如在中国大陆）；2. API_BASE_URL 是否正确；3. Vercel 是否已重新部署。"
         : "Network request failed. Please check: 1. VPN connection; 2. API_BASE_URL configuration; 3. Ensure you have Redeployed Vercel.";
       throw new Error(networkErrorMsg);
    }

    throw new Error(msg || "Failed to analyze the image.");
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
