/* =========================================================
   TranslaAI — script.js

   Handles:
   - Language dropdowns
   - Swap languages
   - Character count
   - Flask translation
   - Copy translation
   - Listen / Text-to-Speech
   - Speech speed control
   - Voice input
   - Toast notifications
   - Navbar / scroll interactions
   ========================================================= */


// =========================================================
// LANGUAGES
// =========================================================

const LANGUAGES = [
  { code: "en", name: "English" },
  { code: "hi", name: "Hindi" },
  { code: "mr", name: "Marathi" },
  { code: "es", name: "Spanish" },
  { code: "fr", name: "French" },
  { code: "de", name: "German" },
  { code: "it", name: "Italian" },
  { code: "pt", name: "Portuguese" },
  { code: "ja", name: "Japanese" },
  { code: "ko", name: "Korean" },
  { code: "zh", name: "Chinese" },
  { code: "ar", name: "Arabic" }
];


// =========================================================
// GET HTML ELEMENTS
// =========================================================

const sourceLangEl = document.getElementById("sourceLang");
const targetLangEl = document.getElementById("targetLang");

const sourceLangLabel =
  document.getElementById("sourceLangLabel");

const targetLangLabel =
  document.getElementById("targetLangLabel");

const swapBtn =
  document.getElementById("swapBtn");

const sourceText =
  document.getElementById("sourceText");

const charCount =
  document.getElementById("charCount");

const resultArea =
  document.getElementById("resultArea");

const translateBtn =
  document.getElementById("translateBtn");

const translateBtnText =
  document.getElementById("translateBtnText");

const loader =
  document.getElementById("loader");

const clearBtn =
  document.getElementById("clearBtn");

const copyBtn =
  document.getElementById("copyBtn");

const listenBtn =
  document.getElementById("listenBtn");

const voiceBtn =
  document.getElementById("voiceBtn");

const navbar =
  document.getElementById("navbar");

const navToggle =
  document.getElementById("navToggle");

const toast =
  document.getElementById("toast");


// =========================================================
// POPULATE LANGUAGE DROPDOWNS
// =========================================================

function fillLanguageSelect(selectEl, defaultCode) {

  LANGUAGES.forEach(lang => {

    const option =
      document.createElement("option");

    option.value = lang.code;
    option.textContent = lang.name;

    if (lang.code === defaultCode) {
      option.selected = true;
    }

    selectEl.appendChild(option);

  });
}


fillLanguageSelect(sourceLangEl, "en");
fillLanguageSelect(targetLangEl, "hi");


// =========================================================
// UPDATE LANGUAGE PANEL LABELS
// =========================================================

function updatePanelLabels() {

  const sourceName =
    LANGUAGES.find(
      l => l.code === sourceLangEl.value
    )?.name || "";

  const targetName =
    LANGUAGES.find(
      l => l.code === targetLangEl.value
    )?.name || "";

  sourceLangLabel.textContent =
    sourceName;

  targetLangLabel.textContent =
    targetName;
}


updatePanelLabels();

sourceLangEl.addEventListener(
  "change",
  updatePanelLabels
);

targetLangEl.addEventListener(
  "change",
  updatePanelLabels
);


// =========================================================
// SWAP LANGUAGES
// =========================================================

swapBtn.addEventListener("click", () => {

  const temp =
    sourceLangEl.value;

  sourceLangEl.value =
    targetLangEl.value;

  targetLangEl.value =
    temp;

  updatePanelLabels();
});


// =========================================================
// CHARACTER COUNTER
// =========================================================

sourceText.addEventListener("input", () => {

  charCount.textContent =
    sourceText.value.length;

});


// =========================================================
// CLEAR BUTTON
// =========================================================

clearBtn.addEventListener("click", () => {

  sourceText.value = "";

  charCount.textContent = "0";

  resultArea.innerHTML =
    '<span class="placeholder-text">Your translation will appear here...</span>';

  // Stop any speech currently playing
  if ("speechSynthesis" in window) {
    window.speechSynthesis.cancel();
  }

  sourceText.focus();
});


// =========================================================
// TRANSLATE BUTTON
// =========================================================

translateBtn.addEventListener(
  "click",
  async () => {

    const text =
      sourceText.value.trim();

    if (!text) {

      showToast(
        "Please enter some text first."
      );

      sourceText.focus();

      return;
    }

    // Stop speech if currently playing
    if ("speechSynthesis" in window) {
      window.speechSynthesis.cancel();
    }

    setLoading(true);

    try {

      const response =
        await fetch("/translate", {

          method: "POST",

          headers: {
            "Content-Type":
              "application/json"
          },

          body: JSON.stringify({

            text: text,

            source_lang:
              sourceLangEl.value,

            target_lang:
              targetLangEl.value

          })

        });


      const data =
        await response.json();


      if (!response.ok) {

        showToast(
          data.error ||
          "Something went wrong. Please try again."
        );

        return;
      }


      // Display translated text
      resultArea.textContent =
        data.translated_text;

    }

    catch (err) {

      showToast(
        "Could not reach the server. Is Flask running?"
      );

    }

    finally {

      setLoading(false);

    }

  }
);


// =========================================================
// LOADING STATE
// =========================================================

function setLoading(isLoading) {

  translateBtn.disabled =
    isLoading;

  loader.hidden =
    !isLoading;

  translateBtnText.textContent =
    isLoading
      ? "✦ AI is translating..."
      : "✦ Translate with AI";
}


// =========================================================
// COPY TRANSLATION
// =========================================================

copyBtn.addEventListener(
  "click",
  () => {

    const text =
      resultArea.textContent.trim();

    if (
      !text ||
      text ===
      "Your translation will appear here..."
    ) {

      showToast(
        "Nothing to copy yet."
      );

      return;
    }


    navigator.clipboard
      .writeText(text)

      .then(() => {

        showToast(
          "Copied to clipboard!"
        );

      })

      .catch(() => {

        showToast(
          "Could not copy text."
        );

      });

  }
);


// =========================================================
// SPEECH SPEED CONTROL
// =========================================================

// Default speed = 0.8x
let speechRate = 0.8;


// Create the speed-control box
const speechControls =
  document.createElement("div");

speechControls.className =
  "speech-controls";


speechControls.innerHTML = `

  <div class="speech-speed-header">

    <span>🔊 Speech Speed</span>

    <span id="speechSpeedValue">
      0.8x
    </span>

  </div>


  <input
    type="range"
    id="speechSpeed"
    min="0.5"
    max="1.5"
    step="0.1"
    value="0.8"
  >


  <div class="speech-speed-labels">

    <span>0.5x</span>

    <span>0.8x</span>

    <span>1.0x</span>

    <span>1.5x</span>

  </div>

`;


// Put the speed controller
// below the Listen button

if (listenBtn && listenBtn.parentElement) {

  listenBtn.parentElement.appendChild(
    speechControls
  );

}


// Get speed slider
const speechSpeed =
  document.getElementById(
    "speechSpeed"
  );


// Get speed display
const speechSpeedValue =
  document.getElementById(
    "speechSpeedValue"
  );


// =========================================================
// CHANGE SPEECH SPEED
// =========================================================

speechSpeed.addEventListener(
  "input",
  () => {

    speechRate =
      parseFloat(
        speechSpeed.value
      );


    speechSpeedValue.textContent =
      speechRate.toFixed(1) + "x";


    // Stop current speech
    // when speed is changed

    if (
      "speechSynthesis" in window &&
      window.speechSynthesis.speaking
    ) {

      window.speechSynthesis.cancel();

    }

  }
);


// =========================================================
// LISTEN TO TRANSLATION
// =========================================================

listenBtn.addEventListener(
  "click",
  () => {

    const text =
      resultArea.textContent.trim();


    // Check if translation exists
    if (
      !text ||
      text ===
      "Your translation will appear here..."
    ) {

      showToast(
        "Nothing to read yet."
      );

      return;
    }


    // Check browser support
    if (
      !("speechSynthesis" in window)
    ) {

      showToast(
        "Voice playback isn't supported in this browser."
      );

      return;
    }


    // Stop previous speech
    window.speechSynthesis.cancel();


    // Create speech
    const utterance =
      new SpeechSynthesisUtterance(
        text
      );


    // Use selected target language
    utterance.lang =
      targetLangEl.value;


    // Apply selected speed
    utterance.rate =
      speechRate;


    // Normal pitch
    utterance.pitch = 1;


    // Full volume
    utterance.volume = 1;


    // Speak
    window.speechSynthesis.speak(
      utterance
    );

  }
);


// =========================================================
// VOICE INPUT
// =========================================================

voiceBtn.addEventListener(
  "click",
  () => {

    const SpeechRecognition =
      window.SpeechRecognition ||
      window.webkitSpeechRecognition;


    if (!SpeechRecognition) {

      showToast(
        "Voice input isn't supported in this browser."
      );

      return;
    }


    const recognition =
      new SpeechRecognition();


    recognition.lang =
      sourceLangEl.value;


    recognition.interimResults =
      false;


    voiceBtn.textContent =
      "🎤 Listening...";


    recognition.onresult =
      (event) => {

        const transcript =
          event.results[0][0]
            .transcript;


        sourceText.value +=
          transcript;


        charCount.textContent =
          sourceText.value.length;

      };


    recognition.onerror =
      () => {

        showToast(
          "Couldn't hear you clearly. Try again."
        );

      };


    recognition.onend =
      () => {

        voiceBtn.textContent =
          "🎤 Voice";

      };


    recognition.start();

  }
);


// =========================================================
// TOAST NOTIFICATIONS
// =========================================================

let toastTimer;


function showToast(message) {

  toast.textContent =
    message;

  toast.classList.add(
    "show"
  );


  clearTimeout(
    toastTimer
  );


  toastTimer =
    setTimeout(
      () => {

        toast.classList.remove(
          "show"
        );

      },
      2600
    );

}


// =========================================================
// NAVBAR SCROLL EFFECT
// =========================================================

window.addEventListener(
  "scroll",
  () => {

    navbar.classList.toggle(
      "scrolled",
      window.scrollY > 10
    );

  }
);


// =========================================================
// MOBILE NAVIGATION
// =========================================================

navToggle.addEventListener(
  "click",
  () => {

    navbar.classList.toggle(
      "open"
    );

  }
);


document
  .querySelectorAll(".nav-links a")
  .forEach(link => {

    link.addEventListener(
      "click",
      () => {

        navbar.classList.remove(
          "open"
        );

      }
    );

  });