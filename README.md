# Front Desk AI — Multi-Business Chatbot Service

An AI-powered chatbot that switches persona/config per business (hospital, hotel,
restaurant, car rental). Flask API + React (Vite) frontend, powered by open-source
models via the free Groq API. Deploys as a single project on Vercel.

```
chatbot-project/
├── api/
│   ├── index.py        # Flask app (serverless function on Vercel)
│   └── businesses.py   # Per-business personas / system prompts
├── frontend/            # React (Vite) app
│   └── src/
├── requirements.txt
├── vercel.json
└── .env.example
```

## 1. Get a free Groq API key

Go to https://console.groq.com/keys, sign up, and create a key. Groq's free tier
is generous and fast — this is what powers the "open-source model, no cost" chatbot.

## 2. Run it locally (Windows / PowerShell)

**Backend (Flask):**

```powershell
cd chatbot-project
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt

# create your local env file
copy .env.example .env
# then open .env and paste your real GROQ_API_KEY

# run the API on port 5000
python api\index.py
```

**Frontend (React), in a second PowerShell window:**

```powershell
cd chatbot-project\frontend
npm install
npm run dev
```

Open the URL Vite prints (usually http://localhost:5173). The Vite dev server
proxies `/api/*` calls to your Flask server on port 5000 automatically.

## 3. Push to GitHub

```powershell
cd chatbot-project
git init
git add .
git commit -m "Initial commit: multi-business AI chatbot"
git branch -M main
git remote add origin https://github.com/muneebsajjadgondal/YOUR-REPO-NAME.git
git push -u origin main
```

(Create the empty repo on GitHub first — no README/license, so it doesn't
conflict with what you're pushing.)

## 4. Deploy to Vercel

1. Go to https://vercel.com → **New Project** → import your GitHub repo.
2. Vercel will detect `vercel.json` and build both the frontend and the API
   automatically — leave the framework preset as "Other".
3. Under **Environment Variables**, add:
   - `GROQ_API_KEY` = your key from step 1
4. Click **Deploy**. Once it finishes, your chatbot is live at the Vercel URL.

Any future `git push` to `main` auto-redeploys.

## Adding a new business

Everything about a business's persona lives in one place:
`api/businesses.py` → add a new entry to the `BUSINESSES` dict with a
`label`, `tagline`, `accent` color, `greeting`, and `system_prompt`.
Optionally add a matching glyph in `frontend/src/data/businessMeta.js`.
No other code changes needed.
