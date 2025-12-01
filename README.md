
[🇨🇳 中文说明 (Chinese Version)](README_ZH.md)

# StudySnap - AI General Tutor

**StudySnap** is an intelligent, all-subject AI tutor powered by **Google Gemini 3 Pro**. Whether it's a math problem, a history event, or a physics concept, simply take a photo, and the AI will provide a detailed explanation and generate a custom **interactive quiz**.

## Features

*   **All Subjects Supported**: Math, Physics, Chemistry, History, Literature, and more.
*   **Dual API Mode**: Automatically switches between Google Native SDK and OpenAI-compatible API based on configuration.
*   **Smart Image Analysis**: Instantly parses text, formulas, diagrams, and objects from images.
*   **Deep Explanations**: Step-by-step solutions and comprehensive analysis.
*   **Interactive Quizzes**: AI generates text-based multiple-choice questions to test understanding.
*   **PWA Support**: Installable on iOS and Android for a native app-like experience.

## API Configuration Strategies (Important)

This app supports two modes of operation based on your environment variables:

### Mode A: Google Native (Default)
Uses the official Google GenAI SDK. Best for users with direct access to Google API.
*   **Required**: `API_KEY` (Your Google Studio API Key)
*   **Leave Empty**: `API_BASE_URL`

### Mode B: OpenAI Compatible (Proxy/NewAPI)
Uses the OpenAI Chat Completion format (`/v1/chat/completions`). Best for users using **NewAPI**, **OneAPI**, or other proxies that do not support the native Google SDK format.
*   **Required**: `API_KEY` (Your Proxy Key, usually starts with `sk-`)
*   **Required**: `API_BASE_URL` (e.g., `https://api.your-proxy.com/v1`)
    *   *Note: When this is set, the app switches to standard `fetch` calls using the OpenAI JSON schema.*

## Deployment (Vercel)

1.  **Fork** this repository.
2.  **Import** into Vercel.
3.  **Environment Variables**:
    *   `API_KEY`: Your API Key.
    *   `API_BASE_URL` (Optional): Set this **ONLY** if you are using an OpenAI-compatible proxy.
    *   `ACCESS_CODE` (Optional): Password to lock the app.
4.  **Deploy**.

### ⚠️ Updating Variables
If you change `API_BASE_URL` or `API_KEY` after deployment, you **MUST Redeploy** the project in Vercel for changes to take effect.

## Mobile Installation (PWA)

*   **iOS**: Safari -> Share -> Add to Home Screen.
*   **Android**: Chrome -> Menu -> Install App.

---
Powered by Gemini Models
