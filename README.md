
[🇨🇳 中文说明 (Chinese Version)](README_ZH.md)

# StudySnap - AI General Tutor

**StudySnap** is an intelligent, all-subject AI tutor powered by **Google Gemini 3 Pro**. Whether it's a math problem, a history event, or a physics concept, simply take a photo, and the AI will provide a detailed explanation and generate a custom **interactive quiz**.

## Features

*   **All Subjects Supported**: Not just Math! Supports Physics, Chemistry, Biology, History, Geography, Literature, English, and more.
*   **Bilingual Interface**: Seamlessly switch between English and Chinese.
*   **Smart Image Analysis**: Instantly parses text, formulas, diagrams, and objects from images.
*   **Deep Explanations**:
    *   **STEM**: Step-by-step solutions, formula derivations, and logic.
    *   **Humanities**: Historical context, translations, literary analysis, and summaries.
*   **Text-Only Interactive Quizzes**: The AI generates a multiple-choice question to test your understanding. 
    *   **Feature**: The quiz is strictly **text-based** and designed to be answerable without seeing the original image or a new image. This ensures a smooth practice experience even for geometry or map-based questions (which are described in detail textually).
*   **LaTeX Rendering**: Professional rendering for math and scientific formulas.
*   **PWA Support**: Installable on iOS and Android for a native app-like experience.
*   **Access Control**: Optional security code to prevent unauthorized usage.
*   **Custom API Provider**: Support for custom Gemini API endpoints (proxies) for users in restricted regions.

## Deployment (Vercel)

This project is optimized for Vercel.

### 1. Prerequisites
*   A GitHub account.
*   A [Google AI Studio](https://aistudio.google.com/) account (to get an API Key).
*   A [Vercel](https://vercel.com/) account.

### 2. Steps

1.  **Fork** this repository.
2.  Log in to Vercel and **Import** your forked repository.
3.  In **Environment Variables**, add:
    *   `API_KEY`: Your Google Gemini API Key.
    *   `ACCESS_CODE` (Optional): A password (e.g., `123456`) to restrict access.
    *   `API_BASE_URL` (Optional): Custom API endpoint. **Required if you are using a third-party proxy** (e.g., `https://api.your-proxy.com`).
4.  **Deploy**.

### ⚠️ IMPORTANT: Updating Variables
If you add or change `API_BASE_URL` or `API_KEY` after the initial deployment, you **MUST Redeploy** for the changes to take effect in the app.
*   Go to Vercel Dashboard -> Deployments -> Click the 3 dots on the latest deployment -> **Redeploy**.

## Mobile Installation (PWA)

### iOS
1. Open the site in Safari.
2. Tap the **Share** button.
3. Tap **Add to Home Screen**.

### Android
1. Open the site in Chrome.
2. Tap the menu (three dots) and select **Install App** or **Add to Home Screen**.

## Local Development

1.  Clone the repo:
    ```bash
    git clone [your-repo-url]
    cd studysnap
    ```

2.  Install dependencies:
    ```bash
    npm install
    ```

3.  Create a `.env` file:
    ```env
    API_KEY=your_key_here
    ACCESS_CODE=optional_code
    API_BASE_URL=https://your-proxy.com # Optional
    ```

4.  Run:
    ```bash
    npm run dev
    ```

---
Powered by Google Gemini API
