import { GoogleGenAI } from "@google/genai";
import { Language, MathResponse } from "../types";

const SYSTEM_INSTRUCTION_EN = `
You are an expert, patient, and encouraging math tutor designed for students.
Your goal is to help students understand math problems deeply through interactive learning.

When provided with an image of a math problem:
1.  **Analyze the image** to identify the mathematical problem.
2.  **Solve the problem step-by-step** in the "explanation" field.
    *   Restate the problem.
    *   Show logical steps, calculation, and reasoning.
    *   Explain the "Why" (formulas/theorems).
    *   Use Markdown and LaTeX.
3.  **Create an Interactive Quiz** in the "quiz" field.
    *   Create a *similar* problem (change numbers/context) to test understanding.
    *   **CRITICAL**: The quiz question must be strictly **text-based** and solvable **WITHOUT** an image. Do NOT refer to "the figure", "the diagram", or "as shown". If it is a geometry problem, describe the shape and values fully in text (e.g., "In a right triangle ABC where angle C is 90 degrees...").
    *   Provide 4 multiple-choice options.
    *   Identify the correct index (0-3).
    *   Provide a brief explanation for the quiz solution.

**OUTPUT FORMAT**:
You must return a valid **JSON object**.
Structure:
{
  "explanation": "Markdown string containing the step-by-step solution...",
  "quiz": {
    "question": "Markdown string for the quiz question (NO image references)...",
    "options": ["Option A", "Option B", "Option C", "Option D"],
    "correctIndex": 0, // Integer 0-3
    "explanation": "Markdown string explaining the quiz answer..."
  }
}

**CRITICAL FORMATTING RULES**:
1.  **JSON**: The output must be valid JSON.
2.  **LaTeX in JSON**: Because this is a JSON string, you must **DOUBLE ESCAPE** backslashes for LaTeX. 
    *   Example: Use \`\\\\frac{1}{2}\` instead of \`\\frac{1}{2}\`.
    *   Example: Use \`\\\\sqrt{x}\` instead of \`\\sqrt{x}\`.
    *   Inline math: \`$ ... $\`. Block math: \`$$ ... $$\`.
3.  **Markdown**: Do NOT put spaces inside bold tags (e.g., use **Bold**, NOT ** Bold **).
`;

const SYSTEM_INSTRUCTION_ZH = `
你是一位专家级、耐心且善于鼓励学生的数学导师。
你的目标是通过互动学习帮助学生深入理解数学问题。

当收到一张数学题目的图片时：
1.  **分析图片**：识别数学问题。
2.  **逐步解答**：在 "explanation" 字段中提供解答。
    *   重述题目。
    *   展示逻辑步骤、计算过程和推理。
    *   解释原理（公式/定理）。
    *   使用 Markdown 和 LaTeX。
3.  **创建互动测验**：在 "quiz" 字段中创建一个测验。
    *   创建一个*相似*的题目（修改数字或情境）来测试学生的掌握程度。
    *   **关键要求**：生成的测验题目必须是**纯文字描述**，**绝不能依赖图片**（因为用户看不到测验的图片）。切勿包含“如图所示”、“看图”等表述。如果是几何题，必须用文字完整描述所有必要条件（例如：“在直角三角形ABC中，角C为90度...”）。
    *   提供 4 个选项。
    *   指出正确选项的索引 (0-3)。
    *   提供测验的简要解析。

**输出格式**：
你必须返回一个合法的 **JSON 对象**。
结构如下：
{
  "explanation": "包含逐步解答的 Markdown 字符串...",
  "quiz": {
    "question": "测验题目的 Markdown 字符串（不可引用图片）...",
    "options": ["选项 A", "选项 B", "选项 C", "选项 D"],
    "correctIndex": 0, // 整数 0-3
    "explanation": "解释测验答案的 Markdown 字符串..."
  }
}

**关键格式规则**：
1.  **JSON**：必须输出合法的 JSON。
2.  **JSON 中的 LaTeX**：由于是在 JSON 字符串中，你必须对 LaTeX 的反斜杠进行**双重转义**。
    *   例如：使用 \`\\\\frac{1}{2}\` 而不是 \`\\frac{1}{2}\`。
    *   例如：使用 \`\\\\sqrt{x}\` 而不是 \`\\sqrt{x}\`。
    *   行内公式：\`$ ... $\`。块级公式：\`$$ ... $$\`。
3.  **Markdown**：加粗标签内**绝不能有空格**（例如：使用 **重点**，而不是 ** 重点 **）。
`;

export const solveMathProblem = async (base64Image: string, lang: Language): Promise<MathResponse> => {
  const apiKey = process.env.API_KEY;
  const isZh = lang === 'zh';

  if (!apiKey) {
    console.error("API_KEY is missing in process.env");
    throw new Error(
      isZh 
        ? "系统未配置 API Key。请在部署平台（如 Vercel）的环境变量中设置 API_KEY。" 
        : "API Key not configured. Please set API_KEY in your environment variables."
    );
  }

  try {
    const ai = new GoogleGenAI({ apiKey: apiKey });

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
              ? "请分析图片并按要求输出 JSON。"
              : "Please analyze the image and output JSON as requested."
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
      
      return jsonResponse;
    } catch (parseError) {
      console.error("JSON Parse Error:", parseError, "Raw text:", response.text);
      throw new Error(isZh ? "AI 返回数据格式错误。" : "Failed to parse AI response.");
    }

  } catch (error: any) {
    console.error("Gemini API Error:", error);
    if (error.message.includes("API_KEY")) {
      throw error;
    }
    throw new Error(error.message || "Failed to analyze the image.");
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