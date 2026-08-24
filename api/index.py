import os
import requests
from dotenv import load_dotenv
from flask import Flask, request, jsonify
from flask_cors import CORS

load_dotenv()  # reads .env in the project root when running locally

try:
    from api.businesses import get_business, list_businesses
except ImportError:
    # Local dev fallback when run directly from the api/ folder
    from businesses import get_business, list_businesses

app = Flask(__name__)
CORS(app)

GROQ_API_KEY = os.environ.get("GROQ_API_KEY", "")
GROQ_URL = "https://api.groq.com/openai/v1/chat/completions"
GROQ_MODEL = os.environ.get("GROQ_MODEL", "openai/gpt-oss-120b")

MAX_HISTORY_MESSAGES = 12  # keep prompts small and fast


@app.route("/api/businesses", methods=["GET"])
def businesses():
    return jsonify(list_businesses())


@app.route("/api/chat", methods=["POST"])
def chat():
    data = request.get_json(silent=True) or {}
    business_id = data.get("business_id")
    message = (data.get("message") or "").strip()
    history = data.get("history") or []  # [{role, content}, ...]

    if not message:
        return jsonify({"error": "message is required"}), 400

    business = get_business(business_id)
    if not business:
        return jsonify({"error": "unknown business_id"}), 400

    if not GROQ_API_KEY:
        return jsonify({
            "error": "Server is missing GROQ_API_KEY. Add it as an environment variable."
        }), 500

    messages = [{"role": "system", "content": business["system_prompt"]}]
    messages.extend(history[-MAX_HISTORY_MESSAGES:])
    messages.append({"role": "user", "content": message})

    try:
        resp = requests.post(
            GROQ_URL,
            headers={
                "Authorization": f"Bearer {GROQ_API_KEY}",
                "Content-Type": "application/json",
            },
            json={
                "model": GROQ_MODEL,
                "messages": messages,
                "temperature": 0.6,
                "max_tokens": 400,
            },
            timeout=20,
        )
        resp.raise_for_status()
        reply = resp.json()["choices"][0]["message"]["content"]
    except requests.exceptions.RequestException as e:
        return jsonify({"error": f"Upstream AI request failed: {str(e)}"}), 502
    except (KeyError, IndexError):
        return jsonify({"error": "Unexpected response from AI provider"}), 502

    return jsonify({"reply": reply})


@app.route("/api/health", methods=["GET"])
def health():
    return jsonify({"status": "ok"})


# Local dev entrypoint: `python api/index.py`
if __name__ == "__main__":
    app.run(debug=True, port=5000)
