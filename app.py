"""
TranslaAI - AI-Powered Multilingual Language Translator
Flask backend
"""

from flask import Flask, render_template, request, jsonify
from deep_translator import MyMemoryTranslator

app = Flask(__name__)

MAX_CHARACTERS = 5000


# Convert website language codes to MyMemory language codes
LANGUAGE_CODES = {
    "en": "en-GB",
    "hi": "hi-IN",
    "mr": "mr-IN",
    "es": "es-ES",
    "fr": "fr-FR",
    "de": "de-DE",
    "it": "it-IT",
    "pt": "pt-PT",
    "ja": "ja-JP",
    "ko": "ko-KR",
    "zh": "zh-CN",
    "ar": "ar-SA"
}


@app.route("/")
def home():
    return render_template("index.html")


@app.route("/translate", methods=["POST"])
def translate():

    data = request.get_json(silent=True) or {}

    text = (data.get("text") or "").strip()

    source_lang = data.get("source_lang", "en")
    target_lang = data.get("target_lang", "hi")

    # Check empty text
    if not text:
        return jsonify({
            "error": "Please enter some text to translate."
        }), 400

    # Check character limit
    if len(text) > MAX_CHARACTERS:
        return jsonify({
            "error": f"Text is too long. Limit is {MAX_CHARACTERS} characters."
        }), 400

    # Same language
    if source_lang == target_lang:
        return jsonify({
            "translated_text": text,
            "source_lang": source_lang,
            "target_lang": target_lang
        })

    # Convert website codes to MyMemory codes
    source_code = LANGUAGE_CODES.get(source_lang)
    target_code = LANGUAGE_CODES.get(target_lang)

    # Check whether language is supported
    if not source_code or not target_code:
        return jsonify({
            "error": "Selected language is not supported."
        }), 400

    try:

        translated_text = MyMemoryTranslator(
            source=source_code,
            target=target_code
        ).translate(text)

        return jsonify({
            "translated_text": translated_text,
            "source_lang": source_lang,
            "target_lang": target_lang
        })

    except Exception as e:

        print("Translation error:", e)

        return jsonify({
            "error": "Translation failed. Please try again."
        }), 503


if __name__ == "__main__":
    app.run(debug=True)