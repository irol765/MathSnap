# MathSnap Tutor (数学拍 - AI 导师)

这是一个基于 Google Gemini 3 Pro 模型的智能数学辅导 Web 应用。用户只需上传数学题目的图片，AI 就会识别题目并提供详细的逐步解答、原理解析以及举一反三的练习。

## 功能特点

*   **双语支持**：支持中文和英文界面及回答。
*   **智能图像识别**：直接解析图片中的数学公式和文本。
*   **详细步骤**：Gemini 3 Pro 提供深度推理，展示完整的解题逻辑。
*   **公式渲染**：支持 LaTeX 格式的专业数学公式显示。
*   **PWA 支持**：支持安装到手机桌面（iOS/Android），体验接近原生应用。

## 部署方式 (Vercel)

本项目非常适合部署在 Vercel 上。

### 1. 准备工作
*   拥有一个 GitHub 账号。
*   拥有一个 [Google AI Studio](https://aistudio.google.com/) 账号并获取 API Key。
*   注册 [Vercel](https://vercel.com/)。

### 2. 部署步骤

1.  **Fork** 本仓库到你的 GitHub。
2.  登录 Vercel，点击 **"Add New..."** -> **"Project"**。
3.  选择刚才 Fork 的 GitHub 仓库并点击 **Import**。
4.  在 **Configure Project** 页面，找到 **Environment Variables** (环境变量) 部分。
5.  添加以下环境变量：
    *   **Key**: `API_KEY`
    *   **Value**: (粘贴你在 Google AI Studio 获取的 API Key)
6.  点击 **Deploy**。

### 3. 防止白屏 (Troubleshooting)

如果部署后出现白屏，通常是因为：
*   **API Key 未设置**：请确保在 Vercel 的 Environment Variables 中正确添加了 `API_KEY`。
*   **构建配置**：本项目设计为标准 React 应用。Vercel 通常会自动检测 (Create React App / Vite)。如果使用 Vite，请确保构建命令为 `vite build`，输出目录为 `dist`。

## 本地开发

1.  克隆仓库：
    ```bash
    git clone [your-repo-url]
    cd mathsnap
    ```

2.  安装依赖：
    ```bash
    npm install
    ```

3.  设置环境变量：
    在根目录创建 `.env` 文件，并添加：
    ```
    API_KEY=your_google_gemini_api_key_here
    ```
    *(注意：如果使用 Vite，可能需要根据配置前缀变量名，但在本项目代码中我们使用了兼容处理或插件来注入 `process.env.API_KEY`)*

4.  启动开发服务器：
    ```bash
    npm run dev
    ```

## 手机安装 (PWA)

### iOS (iPhone/iPad)
1. 在 Safari 浏览器中打开部署好的网址。
2. 点击底部的 **分享** 按钮 (方框带箭头)。
3. 向下滚动并点击 **"添加到主屏幕" (Add to Home Screen)**。

### Android
1. 在 Chrome 浏览器中打开网址。
2. 点击右上角菜单，选择 **"安装应用"** 或 **"添加到主屏幕"**。

---
Powered by Google Gemini API