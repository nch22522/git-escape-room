"use strict";

(() => {
  const ACCESS_CODE = "742";
  const PROBE_INTERVAL = 2500;
  const code = [];
  const slots = [...document.querySelectorAll(".code-slot")];
  const keypad = document.getElementById("keypad");
  const message = document.getElementById("keypadMessage");
  const signal3 = document.getElementById("signal3");
  const vaultPanel = document.getElementById("vaultPanel");
  const hintToggle = document.getElementById("hintToggle");
  const hintDrawer = document.getElementById("hintDrawer");
  const audioToggle = document.getElementById("audioToggle");
  const audioLabel = document.getElementById("audioLabel");
  const certificateModal = document.getElementById("certificateModal");
  const confetti = document.getElementById("confetti");
  let finalClueAvailable = false;
  let unlocked = false;
  let soundEnabled = true;
  let audioContext;
  let probeTimer;

  function setMessage(text, kind = "") {
    message.textContent = text;
    message.classList.toggle("is-error", kind === "error");
    message.classList.toggle("is-success", kind === "success");
  }

  function renderCode() {
    slots.forEach((slot, index) => {
      const digit = code[index];
      slot.textContent = digit ?? "—";
      slot.classList.toggle("is-filled", digit !== undefined);
      slot.setAttribute("aria-label", `Digit ${index + 1}${digit === undefined ? ", empty" : `, ${digit}`}`);
    });
  }

  function playTone(frequency, duration = 0.09, type = "sine", delay = 0) {
    if (!soundEnabled) return;
    const AudioContextType = window.AudioContext || window.webkitAudioContext;
    if (!AudioContextType) return;
    audioContext ??= new AudioContextType();
    if (audioContext.state === "suspended") void audioContext.resume();
    const oscillator = audioContext.createOscillator();
    const gain = audioContext.createGain();
    const start = audioContext.currentTime + delay;
    oscillator.type = type;
    oscillator.frequency.setValueAtTime(frequency, start);
    gain.gain.setValueAtTime(0.0001, start);
    gain.gain.exponentialRampToValueAtTime(0.055, start + 0.012);
    gain.gain.exponentialRampToValueAtTime(0.0001, start + duration);
    oscillator.connect(gain);
    gain.connect(audioContext.destination);
    oscillator.start(start);
    oscillator.stop(start + duration + 0.015);
  }

  function playUnlockSequence() {
    [523.25, 659.25, 783.99, 1046.5].forEach((frequency, index) => {
      playTone(frequency, 0.26, "sine", index * 0.12);
    });
  }

  function setFinalClueOnline() {
    if (window.VAULT_DIGIT_3 !== "2") return false;
    finalClueAvailable = true;
    signal3.classList.remove("is-pending");
    signal3.classList.add("is-online");
    signal3.setAttribute("aria-label", "Clue three is available; final branch merged");
    signal3.querySelector(".signal-state").textContent = "SIGNAL FOUND";
    if (probeTimer) window.clearInterval(probeTimer);
    if (code.join("") === ACCESS_CODE && !unlocked) unlockVault();
    return true;
  }

  function probeForFinalClue() {
    if (finalClueAvailable || unlocked) return;
    const probe = document.createElement("script");
    probe.src = `clue3.js?probe=${Date.now()}`;
    probe.onload = () => {
      setFinalClueOnline();
      probe.remove();
    };
    probe.onerror = () => {
      window.VAULT_CLUE3_MISSING = true;
      probe.remove();
    };
    document.head.append(probe);
  }

  function setKeypadDisabled(disabled) {
    keypad.querySelectorAll("button").forEach((button) => {
      button.disabled = disabled;
    });
  }

  function celebrate() {
    const colors = ["#62efff", "#81ffc2", "#b7a0ff", "#ffcf70", "#ff6b87"];
    const pieces = document.createDocumentFragment();
    for (let index = 0; index < 85; index += 1) {
      const piece = document.createElement("span");
      piece.className = "confetti-piece";
      piece.style.setProperty("--x", `${Math.random() * 100}%`);
      piece.style.setProperty("--w", `${5 + Math.random() * 6}px`);
      piece.style.setProperty("--h", `${8 + Math.random() * 8}px`);
      piece.style.setProperty("--color", colors[index % colors.length]);
      piece.style.setProperty("--delay", `${Math.random() * 0.7}s`);
      piece.style.setProperty("--duration", `${2.4 + Math.random() * 1.8}s`);
      piece.style.setProperty("--drift", `${Math.random() * 200 - 100}px`);
      piece.style.setProperty("--spin", `${Math.random() * 900 - 450}deg`);
      pieces.append(piece);
    }
    confetti.replaceChildren(pieces);
    window.setTimeout(() => confetti.replaceChildren(), 4800);
  }

  function unlockVault() {
    if (unlocked || !finalClueAvailable) return;
    unlocked = true;
    vaultPanel.classList.add("is-unlocked");
    setKeypadDisabled(true);
    setMessage("Code accepted. Vault unlocked. Git Master status: earned.", "success");
    playUnlockSequence();
    celebrate();
    document.getElementById("certificateDate").textContent = new Intl.DateTimeFormat(undefined, {
      year: "numeric",
      month: "long",
      day: "numeric",
    }).format(new Date());
    if (typeof certificateModal.showModal === "function") certificateModal.showModal();
  }

  function submitCode() {
    if (unlocked) return;
    if (code.length !== 3) {
      setMessage("Enter all three digits before submitting.", "error");
      playTone(190, 0.12, "triangle");
      return;
    }
    if (code.join("") !== ACCESS_CODE) {
      vaultPanel.classList.remove("is-shaking");
      void vaultPanel.offsetWidth;
      vaultPanel.classList.add("is-shaking");
      setMessage("Access denied. Revisit the clues and try again.", "error");
      playTone(155, 0.22, "sawtooth");
      return;
    }
    if (!finalClueAvailable) {
      setMessage("Code sequence recognized. Merge final-clue into main to complete the circuit.", "error");
      playTone(310, 0.1, "triangle");
      return;
    }
    unlockVault();
  }

  function pressDigit(digit) {
    if (unlocked || code.length >= 3) return;
    code.push(digit);
    renderCode();
    setMessage("Digit captured. Keep following the clues.");
    playTone(420 + Number(digit) * 28, 0.055, "sine");
  }

  function clearCode() {
    if (unlocked) return;
    code.length = 0;
    renderCode();
    setMessage("Code cleared. Find the clues and try again.");
    playTone(260, 0.06, "triangle");
  }

  keypad.addEventListener("click", (event) => {
    const button = event.target.closest("button");
    if (!button || button.disabled) return;
    if (button.dataset.key !== undefined) {
      pressDigit(button.dataset.key);
      return;
    }
    if (button.dataset.action === "submit") {
      submitCode();
    } else if (button.dataset.action === "backspace") {
      if (code.length) code.pop();
      renderCode();
      setMessage("Last digit removed.");
      playTone(300, 0.05, "triangle");
    } else if (button.dataset.action === "clear") {
      clearCode();
    }
  });

  document.addEventListener("keydown", (event) => {
    if (event.altKey || event.ctrlKey || event.metaKey || event.repeat) return;
    if (/^[0-9]$/.test(event.key)) pressDigit(event.key);
    else if (event.key === "Backspace") {
      if (code.length && !unlocked) code.pop();
      renderCode();
      setMessage("Last digit removed.");
    } else if (event.key === "Enter") {
      submitCode();
    } else if (event.key === "Escape") {
      if (certificateModal.open) certificateModal.close();
      else clearCode();
    }
  });

  hintToggle.addEventListener("click", () => {
    const isExpanded = hintToggle.getAttribute("aria-expanded") === "true";
    hintToggle.setAttribute("aria-expanded", String(!isExpanded));
    hintDrawer.hidden = isExpanded;
  });

  audioToggle.addEventListener("click", () => {
    soundEnabled = !soundEnabled;
    audioToggle.setAttribute("aria-pressed", String(soundEnabled));
    audioToggle.setAttribute("aria-label", `Turn sound effects ${soundEnabled ? "off" : "on"}`);
    audioLabel.textContent = `AUDIO ${soundEnabled ? "ON" : "OFF"}`;
    if (soundEnabled) playTone(660, 0.08);
  });

  document.getElementById("printCertificate").addEventListener("click", () => window.print());
  document.getElementById("closeCertificate").addEventListener("click", () => certificateModal.close());

  renderCode();
  if (!setFinalClueOnline()) probeTimer = window.setInterval(probeForFinalClue, PROBE_INTERVAL);
})();
