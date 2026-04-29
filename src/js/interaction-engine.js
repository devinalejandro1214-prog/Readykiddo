import { animateChoiceChange } from "./motion.js";

export class InteractionEngine {
  constructor({ store, audio, toast }) {
    this.store = store;
    this.audio = audio;
    this.toast = toast;
    this.dragValue = null;
    this.voiceRecognition = null;
  }

  choiceButton({ category, choice, selected, onChoose, extraClass = "" }) {
    const button = document.createElement("button");
    button.type = "button";
    button.className = `choice-card ${extraClass}`.trim();
    button.dataset.value = choice.value;
    button.dataset.key = category.key;
    button.dataset.motionKey = `${category.key}-${choice.value}`;
    button.setAttribute("role", "radio");
    button.setAttribute("aria-checked", String(selected));
    button.draggable = this.store.get().navigationMethod === "drag";

    button.innerHTML = `
      <span class="glyph" aria-hidden="true">${escapeHtml(choice.glyph)}</span>
      <strong>${escapeHtml(choice.label)}</strong>
      <span class="description">${escapeHtml(choice.description)}</span>
    `;

    const select = () => {
      onChoose(choice.value);
      animateChoiceChange(button, this.store.get());
      this.audio.tone("choice");
    };

    button.addEventListener("click", select);
    button.addEventListener("dragstart", event => {
      this.dragValue = choice.value;
      event.dataTransfer.setData("text/plain", choice.value);
      event.dataTransfer.effectAllowed = "move";
    });

    return button;
  }

  renderChoices({ container, category, currentValue, onChoose }) {
    container.innerHTML = "";
    const state = this.store.get();

    if (state.navigationMethod === "pathfinder") {
      this.renderPathfinder({ container, category, currentValue, onChoose });
      return;
    }

    for (const choice of category.choices) {
      container.appendChild(this.choiceButton({
        category,
        choice,
        selected: choice.value === currentValue,
        onChoose
      }));
    }
  }

  renderPathfinder({ container, category, currentValue, onChoose }) {
    const state = this.store.get();
    const length = category.choices.length;
    const selectedIndex = Math.max(0, category.choices.findIndex(choice => choice.value === currentValue));
    const activeIndex = Number.isInteger(state.pathfinderIndex) ? state.pathfinderIndex % length : selectedIndex;
    const activeChoice = category.choices[activeIndex];

    const wrap = document.createElement("div");
    wrap.className = "journey-panel";
    wrap.innerHTML = `
      <div class="helper-card" role="status">
        Pathfinder is showing one large choice. Use More choices to move through all five without crowding the screen.
      </div>
      <div class="choice-grid pathfinder-grid"></div>
      <div class="path-controls">
        <button class="secondary-cta" type="button" data-path="prev">Previous choice</button>
        <button class="secondary-cta" type="button" data-path="next">More choices</button>
        <button class="primary-cta" data-size="compact" type="button" data-path="choose">Choose this</button>
      </div>
    `;

    const grid = wrap.querySelector(".choice-grid");
    grid.appendChild(this.choiceButton({
      category,
      choice: activeChoice,
      selected: activeChoice.value === currentValue,
      onChoose,
      extraClass: "is-path-active"
    }));

    wrap.querySelector("[data-path='prev']").addEventListener("click", () => {
      const nextIndex = (activeIndex - 1 + length) % length;
      this.store.set({ pathfinderIndex: nextIndex });
      this.audio.tone("choice");
    });

    wrap.querySelector("[data-path='next']").addEventListener("click", () => {
      const nextIndex = (activeIndex + 1) % length;
      this.store.set({ pathfinderIndex: nextIndex });
      this.audio.tone("choice");
    });

    wrap.querySelector("[data-path='choose']").addEventListener("click", () => {
      onChoose(activeChoice.value);
      this.audio.tone("confirm");
    });

    container.appendChild(wrap);
  }

  attachDropZone(zone, category, onChoose) {
    zone.addEventListener("dragover", event => {
      event.preventDefault();
      event.dataTransfer.dropEffect = "move";
      zone.classList.add("is-over");
    });

    zone.addEventListener("dragleave", () => zone.classList.remove("is-over"));

    zone.addEventListener("drop", event => {
      event.preventDefault();
      zone.classList.remove("is-over");
      const value = event.dataTransfer.getData("text/plain") || this.dragValue;
      if (category.choices.some(choice => choice.value === value)) {
        onChoose(value);
        this.toast("Choice placed.");
        this.audio.tone("confirm");
      }
      this.dragValue = null;
    });
  }

  startVoice(category, onChoose) {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      this.toast("Voice is not available here. Tapping still works.");
      return;
    }

    if (this.voiceRecognition) {
      try {
        this.voiceRecognition.stop();
      } catch {}
    }

    this.voiceRecognition = new SpeechRecognition();
    this.voiceRecognition.lang = "en-US";
    this.voiceRecognition.interimResults = false;
    this.voiceRecognition.maxAlternatives = 3;

    this.voiceRecognition.onstart = () => this.toast("Listening for a choice.");
    this.voiceRecognition.onresult = event => {
      const transcript = Array.from(event.results)
        .flatMap(result => Array.from(result))
        .map(result => result.transcript.toLowerCase())
        .join(" ");

      const match = category.choices.find(choice =>
        transcript.includes(choice.label.toLowerCase()) ||
        transcript.includes(choice.value.replace("-", " ").toLowerCase())
      );

      if (match) {
        onChoose(match.value);
        this.toast(`${match.label} selected.`);
        this.audio.tone("confirm");
      } else {
        this.toast("I did not catch that choice. Tapping still works.");
      }
    };

    this.voiceRecognition.onerror = () => this.toast("Voice paused. Tapping still works.");
    this.voiceRecognition.onend = () => {
      this.voiceRecognition = null;
    };

    try {
      this.voiceRecognition.start();
    } catch {
      this.toast("Voice is already listening. Tapping still works.");
    }
  }

  attachTilt(category, currentValue, onChoose, cleanupBag) {
    const handler = event => {
      const state = this.store.get();
      if (state.navigationMethod !== "tilt") return;

      const index = Math.max(0, category.choices.findIndex(choice => choice.value === this.store.get()[category.key]));

      if (event.key === "ArrowRight" || event.key === "ArrowDown") {
        event.preventDefault();
        onChoose(category.choices[(index + 1) % category.choices.length].value);
      }

      if (event.key === "ArrowLeft" || event.key === "ArrowUp") {
        event.preventDefault();
        onChoose(category.choices[(index - 1 + category.choices.length) % category.choices.length].value);
      }
    };

    window.addEventListener("keydown", handler);
    cleanupBag.push(() => window.removeEventListener("keydown", handler));
  }
}

export function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}
