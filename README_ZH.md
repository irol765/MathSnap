
[🇺🇸 English Readme](README.md)

# StudySnap (学习拍 - AI 全科导师)

**StudySnap** 是一个基于 **Google Gemini 3 Pro** 模型的全科智能辅导 Web 应用。无论是数学公式、物理定律、历史事件还是英语阅读，用户只需上传题目或知识点的图片，AI 就会识别内容并提供详细的讲解，并自动生成一道考察核心概念的**互动测验**。

## 功能特点

*   **全科支持**：不仅仅是数学！支持物理、化学、生物、历史、地理、语文、英语等所有学科的答疑与辅导。
*   **双语支持**：支持中文和英文界面及回答，适合不同语言环境的学习者。
*   **智能图像识别**：直接解析图片中的文字、公式、图表或物体。
*   **深度解析**：
    *   **理科**：提供逐步解题步骤、公式推导和逻辑分析。
    *   **文科**：提供背景知识、翻译、赏析或详细的知识点梳理。
*   **无图依赖互动测验**：AI 会根据原题生成一道变式选择题。
    *   **特色功能**：系统强制要求 AI 生成的测验题必须是**纯文字描述**，确保学生在没有新图片的情况下也能流畅作答。针对几何题或地图题，AI 会用文字完整描述图形特征，不再依赖视觉输入。
*   **公式渲染**：支持 LaTeX 格式的专业数学/物理公式显示。
*   **PWA 支持**：支持安装到手机桌面（iOS/Android），体验接近原生应用。
*   **访问控制**：支持设置安全码（Access Code），防止公开部署后被滥用。
*   **自定义 API 节点**：支持配置第三方 API 代理地址，解决网络连接问题。

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
    *   **API_KEY** (必填): 粘贴你的 Google Gemini API Key。如果是使用中转服务，请填入中转 Key (通常以 `sk-` 开头)。
    *   **ACCESS_CODE** (选填): 设置一个安全访问码（如 `123456`）。
    *   **API_BASE_URL** (选填): **如果你在中国大陆或使用第三方中转 (NewAPI/OneAPI)，此项必填**。填入你的代理地址，例如 `https://api.your-proxy.com`。
6.  点击 **Deploy**。

### ⚠️ 重要提示：修改环境变量后必须重新部署
如果你在初次部署后才添加或修改了 `API_BASE_URL` 或 `API_KEY`，你必须手动触发重新部署，否则新变量**不会生效**。
*   操作方法：Vercel 控制台 -> Deployments -> 点击最新部署右侧的三个点 -> **Redeploy**。

## 常见问题 (Troubleshooting)

### 报错: "API key not valid" 或 "Load failed"
*   **API Key 格式问题**：如果你使用的是中转 Key (sk-...) 但应用报错 "API key not valid"，说明请求直接发往了 Google 官方而非你的代理地址。
*   **解决方法**：请检查 Vercel 环境变量中是否正确设置了 `API_BASE_URL`，并且**一定要执行 Redeploy (重新部署)**。

## 手机安装 (PWA)

### iOS (iPhone/iPad)
1. 在 Safari 浏览器中打开部署好的网址。
2. 点击底部的 **分享** 按钮 (方框带箭头)。
3. 向下滚动并点击 **"添加到主屏幕" (Add to Home Screen)**。

### Android
1. 在 Chrome 浏览器中打开网址。
2. 点击右上角菜单，选择 **"安装应用"** 或 **"添加到主屏幕"**。

## 本地开发

1.  克隆仓库：
    ```bash
    git clone [your-repo-url]
    cd studysnap
    ```

2.  安装依赖：
    ```bash
    npm install
    ```

3.  设置环境变量：
    在根目录创建 `.env` 文件，并添加：
    ```env
    API_KEY=your_key_here
    ACCESS_CODE=optional_code
    API_BASE_URL=https://your-custom-proxy.com # 可选
    ```

4.  启动开发服务器：
    ```bash
    npm run dev
    ```

---
Powered by Google Gemini API
