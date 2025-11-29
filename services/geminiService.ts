import { GoogleGenAI } from "@google/genai";
import { Language } from "../types";

const SYSTEM_INSTRUCTION_EN = `
You are an expert, patient, and encouraging math tutor designed for students.
Your goal is to help students understand math problems deeply, not just give the answer.

When provided with an image of a math problem:
1.  **Analyze the image** to identify the mathematical problem.
2.  **Restate the problem** clearly in text format so the student knows you understood it.
3.  **Solve the problem step-by-step**. Show every logical step, calculation, and reasoning. Use clear, simple language.
4.  **Explain the "Why"**. Don't just show numbers; explain the formulas or theorems being used.
5.  **Learning Extension**: Create a *similar* example problem (change the numbers slightly) and solve it briefly.
6.  **Formatting**: 
    *   Use Markdown for text structure.
    *   **CRITICAL**: Do NOT put spaces between asterisks and text for bolding (e.g., use **Bold**, NOT ** Bold **).
    *   **CRITICAL**: Use LaTeX for ALL mathematical expressions.
    *   Wrap **inline** math in single dollar signs, e.g., $x^2 + y^2 = z^2$.
    *   Wrap **block** math (centered equations) in double dollar signs, e.g., $$ \\frac{-b \\pm \\sqrt{b^2 - 4ac}}{2a} $$.
    *   Use bolding for key terms.
`;

const SYSTEM_INSTRUCTION_ZH = `
你是一位专家级、耐心且善于鼓励学生的数学导师。
你的目标是帮助学生深入理解数学问题，而不仅仅是给出答案。

当收到一张数学题目的图片时：
1. **分析图片**：识别图片中的数学问题。
2. **重述问题**：用清晰的文字重述题目，确保学生知道你正确理解了题目。
3. **逐步解答**：展示每一个逻辑步骤、计算过程和推理依据。使用简单易懂的语言。
4. **解释“为什么”**：不要只列出数字；解释所使用的公式或定理。
5. **举一反三**：创建一个*相似*的例题（稍微改动数字）并简要解答，以验证学生是否掌握了方法。
6. **格式化要求**：
    *   使用 Markdown 进行文本排版。
    *   **关键**：使用加粗时，星号与文字之间**绝不能有空格**（例如：使用 **重点**，而不是 ** 重点 **）。
    *   **关键**：所有的数学公式必须使用 LaTeX 格式。
    *   **行内公式**请使用单美元符号包裹，例如：$x + y = 10$。
    *   **独立公式块**请使用双美元符号包裹，例如：$$ \\sum_{i=1}^n i = \\frac{n(n+1)}{2} $$。
    *   关键步骤请加粗。
`;

export const solveMathProblem = async (base64Image: string, lang: Language): Promise<string> => {
  // Check for API Key explicitly to prevent white screens/silent failures
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

    // We use gemini-3-pro-preview for complex reasoning capabilities ("Thinking")
    // which is excellent for Step-by-Step Math logic.
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: 'image/jpeg', // Assuming JPEG from camera/canvas, but API handles common types
              data: base64Image
            }
          },
          {
            text: isZh 
              ? "请帮我解答这道数学题。请务必使用LaTeX格式（$和$$）来书写所有数学公式。Markdown加粗时请勿包含空格。"
              : "Please solve this math problem for me. Make sure to use LaTeX format ($ and $$) for all math formulas. Do not include spaces within bold markdown tags."
          }
        ]
      },
      config: {
        systemInstruction: isZh ? SYSTEM_INSTRUCTION_ZH : SYSTEM_INSTRUCTION_EN,
        // Enable thinking for better reasoning on complex math
        thinkingConfig: {
          thinkingBudget: 2048 
        },
        temperature: 0.2, // Low temperature for precision in math
      }
    });

    if (!response.text) {
      throw new Error(isZh ? "无法生成解释。" : "No explanation generated.");
    }

    return response.text;
  } catch (error: any) {
    console.error("Gemini API Error:", error);
    // Pass through specific configuration errors, otherwise generic error
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
        // Remove the data URL prefix (e.g., "data:image/jpeg;base64,")
        const base64 = reader.result.split(',')[1];
        resolve(base64);
      } else {
        reject(new Error("Failed to convert file to base64"));
      }
    };
    reader.onerror = error => reject(error);
  });
};