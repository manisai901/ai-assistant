# Deploying NVIDIA AI Assistant

This guide covers how to deploy this application to **GitHub**, **Render.com**, and mentions how it relates to **Streamlit**.

## 1. Move to GitHub
1. Create a new repository on GitHub.
2. Follow the instructions to push your local code:
   ```bash
   git init
   git add .
   git commit -m "Initial commit: NVIDIA Assistant"
   git branch -M main
   git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git
   git push -u origin main
   ```

## 2. Deploy to Render.com
Render is an excellent platform for Node.js applications like this one.

1. **Sign in** to Render and connect your GitHub account.
2. Click **New +** > **Web Service**.
3. Select your repository.
4. **Settings**:
   - **Environment**: `Node`
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm start`
5. **Environment Variables**:
   In the Render dashboard, go to the **Environment** tab and add:
   - `NVIDIA_API_KEY`: Your real API key from NVIDIA Build.
   - `NODE_ENV`: `production`
6. Click **Deploy Web Service**.

## 3. Note for Streamlit Users
If you specifically wanted to use **Streamlit (Python)**, you can find many Python-based NVIDIA NIM boilerplate templates. However, this application is built with **React and Express**, which provides:
- A more custom, high-end "NVIDIA-branded" UI.
- Faster client-side interactions using motion and glassmorphism styling.
- Secure backend proxying to protect your API keys.

To host a Streamlit app on Render, you would choose the "Python" environment and use `pip install -r requirements.txt` as the build command and `streamlit run app.py` as the start command.

---

### Getting your NVIDIA API Key
1. Go to [NVIDIA Build](https://build.nvidia.com/).
2. Find the **Nemotron-3-super-120b-a12b** model (or latest variant).
3. Generate an API Key.
4. Configure it in your environment.
