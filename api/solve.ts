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
    "correctIndex": 0,
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
    *   Example: Use \\\\frac{1}{2} instead of \\frac{1}{2}.
    *   Inline math: $ ... $. Block math: $$ ... $$.
3.  **Markdown**: Do NOT put spaces inside bold tags.
`;

const SYSTEM_INSTRUCTION_ZH = `
你是一位专家级、耐心且善于鼓励学生的全科辅导老师（涵盖数学、物理、化学、历史、地理、语文、英语等所有学科）。
你的目标是通过互动学习帮助学生深入理解知识点。

当收到一张题目或知识点的图片时：
1.  **分析图片**：识别学科和具体问题。
2.  **构建输出**：你需要提供三个明确的部分：
    *   **Answer（答案）**：简洁的最终结果或核心结论（例如："x = 5"、"巴黎"、"牛顿第二定律"）。
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
    "correctIndex": 0,
    "explanation": "解释测验答案的 Markdown 字符串..."
  }
}

**测验规则**：
*   生成的测验题目必须是**纯文字描述**，**绝不能依赖图片**。
*   切勿包含"如图所示"、"参考上图"等表述。
*   如果是几何题，必须用文字完整描述图形条件。

**关键格式规则**：
1.  **JSON**：必须输出合法的 JSON。
2.  **JSON 中的 LaTeX**：必须对 LaTeX 的反斜杠进行**双重转义**。
    *   例如：使用 \\\\frac{1}{2} 而不是 \\frac{1}{2}。
    *   行内公式：$ ... $。块级公式：$$ ... $$。
3.  **Markdown**：加粗标签内**绝不能有空格**。
`;

interface QuizData {
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

interface MathResponse {
  answer: string;
  explanation: string;
  quiz: QuizData;
}

function parseResponse(responseText: string, isZh: boolean): MathResponse {
  const cleanText = responseText.replace(/```json/g, '').replace(/```/g, '').trim();
  const jsonResponse = JSON.parse(cleanText) as MathResponse;

  if (!jsonResponse.explanation || !jsonResponse.quiz) {
    throw new Error("Invalid response structure");
  }
  if (!jsonResponse.answer) {
    jsonResponse.answer = isZh ? "见详细解析" : "See explanation below";
  }
  return jsonResponse;
}

async function callGoogleNative(
  apiKey: string,
  model: string,
  base64Image: string,
  systemInstruction: string,
  userPrompt: string,
  isZh: boolean
): Promise<string> {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      systemInstruction: { parts: [{ text: systemInstruction }] },
      contents: {
        parts: [
          { inlineData: { mimeType: 'image/jpeg', data: base64Image } },
          { text: userPrompt }
        ]
      },
      generationConfig: {
        responseMimeType: 'application/json',
        temperature: 0.2,
      },
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Google API responded with status ${response.status}: ${errorText.slice(0, 200)}`);
  }

  const data = await response.json();
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) throw new Error("Empty response from Google API");
  return text;
}

async function callOpenAICompatible(
  apiKey: string,
  baseUrl: string,
  model: string,
  base64Image: string,
  systemInstruction: string,
  userPrompt: string
): Promise<string> {
  let url = baseUrl.trim();
  if (url.endsWith('/')) url = url.slice(0, -1);
  if (!url.endsWith('/chat/completions')) {
    url = `${url}/chat/completions`;
  }

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      messages: [
        { role: 'system', content: systemInstruction },
        {
          role: 'user',
          content: [
            { type: 'text', text: userPrompt },
            { type: 'image_url', image_url: { url: `data:image/jpeg;base64,${base64Image}` } },
          ],
        },
      ],
      temperature: 0.2,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`OpenAI API responded with status ${response.status}: ${errorText.slice(0, 200)}`);
  }

  const data = await response.json();
  const content = data.choices?.[0]?.message?.content;
  if (!content) throw new Error("Empty response from OpenAI compatible API");
  return content;
}

export default async function handler(
  req: { method: string; body?: Record<string, unknown> },
  res: {
    status: (code: number) => { json: (data: Record<string, unknown>) => void };
    json: (data: Record<string, unknown>) => void;
  }
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { base64Image, language } = (req.body || {}) as {
    base64Image?: string;
    language?: string;
  };

  if (!base64Image || typeof base64Image !== 'string') {
    return res.status(400).json({
      error: 'Invalid request: base64Image is required.',
      code: 'INVALID_INPUT',
    });
  }

  const apiKey = (process.env.API_KEY || '').trim();
  const apiBaseUrl = (process.env.API_BASE_URL || '').trim();
  const isZh = language === 'zh';

  if (!apiKey) {
    return res.status(500).json({
      error: isZh ? '服务端配置错误：缺少 API Key。' : 'Server configuration error: missing API Key.',
      code: 'CONFIG_ERROR',
    });
  }

  const useOpenAI = !!apiBaseUrl;
  const systemInstruction = isZh ? SYSTEM_INSTRUCTION_ZH : SYSTEM_INSTRUCTION_EN;
  const userPrompt = isZh ? '请分析图片并输出 JSON 答案。' : 'Analyze image and output JSON.';

  const models = {
    primary: 'gemini-3-pro-preview',
    fallback: 'gemini-2.5-flash',
  };

  try {
    const text = useOpenAI
      ? await callOpenAICompatible(apiKey, apiBaseUrl, models.primary, base64Image, systemInstruction, userPrompt)
      : await callGoogleNative(apiKey, models.primary, base64Image, systemInstruction, userPrompt, isZh);

    const result = parseResponse(text, isZh);
    return res.status(200).json(result as unknown as Record<string, unknown>);
  } catch (error: any) {
    console.error(`Primary model (${models.primary}) failed:`, error.message);

    const msg = (error.message || '').toLowerCase();
    if (msg.includes('401') || msg.includes('unauthenticated') || msg.includes('invalid api key')) {
      return res.status(500).json({
        error: isZh ? 'API 密钥验证失败，请检查服务端配置。' : 'API authentication failed. Please check server configuration.',
        code: 'AUTH_ERROR',
      });
    }

    try {
      const text = useOpenAI
        ? await callOpenAICompatible(apiKey, apiBaseUrl, models.fallback, base64Image, systemInstruction, userPrompt)
        : await callGoogleNative(apiKey, models.fallback, base64Image, systemInstruction, userPrompt, isZh);

      const result = parseResponse(text, isZh);
      return res.status(200).json(result as unknown as Record<string, unknown>);
    } catch (fallbackError: any) {
      console.error(`Fallback model (${models.fallback}) failed:`, fallbackError.message);

      const fbMsg = (fallbackError.message || '').toLowerCase();
      if (fbMsg.includes('404') || fbMsg.includes('not found')) {
        return res.status(500).json({
          error: isZh ? '未找到 AI 模型，请检查服务端配置。' : 'AI model not found. Please check server configuration.',
          code: 'MODEL_NOT_FOUND',
        });
      }

      return res.status(500).json({
        error: isZh ? '处理请求时出错，请重试。' : 'An error occurred while processing your request. Please try again.',
        code: 'INTERNAL_ERROR',
      });
    }
  }
}
