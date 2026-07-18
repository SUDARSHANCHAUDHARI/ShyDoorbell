(function () {
  "use strict";

  const ATTEMPTS_KEY = "shyDoorbell.attempts";
  const SOUND_KEY = "shyDoorbell.sound";
  const RARE_THRESHOLD = 10;
  const REACTION_CLASSES = [
    "porch-is-lit",
    "door-is-open",
    "door-is-cracked",
    "door-is-wide",
    "door-is-slamming",
    "character-is-peeking",
    "character-noticed",
    "reaction-window",
    "reaction-eye",
    "reaction-sign",
    "reaction-lights-out",
    "reaction-ringback",
    "reaction-cardboard",
    "reaction-hand",
    "rare-reaction",
  ];
  const NORMAL_REACTIONS = [
    "window",
    "eye",
    "sign",
    "lights-out",
    "ring-back",
    "open-close",
    "cardboard",
    "hand",
  ];

  const stage = document.querySelector("#house-stage");
  const doorbellButton = document.querySelector("#doorbell-button");
  const soundToggle = document.querySelector("#sound-toggle");
  const soundLabel = document.querySelector("#sound-label");
  const resetButton = document.querySelector("#reset-button");
  const attemptCount = document.querySelector("#attempt-count");
  const rareStatus = document.querySelector("#rare-status");
  const sceneStatus = document.querySelector("#scene-status");
  const reactionBubble = document.querySelector("#reaction-bubble");

  if (
    !stage ||
    !doorbellButton ||
    !soundToggle ||
    !soundLabel ||
    !resetButton ||
    !attemptCount ||
    !rareStatus ||
    !sceneStatus ||
    !reactionBubble
  ) {
    return;
  }

  const reducedMotionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
  let audioContext = null;

  const state = {
    attempts: readStoredNumber(ATTEMPTS_KEY),
    soundEnabled: readStoredSoundPreference(),
    busy: false,
    sequenceToken: 0,
    lastReaction: "",
  };

  function readStoredNumber(key) {
    try {
      const value = Number.parseInt(window.localStorage.getItem(key) || "0", 10);
      return Number.isFinite(value) && value > 0 ? value : 0;
    } catch (_error) {
      return 0;
    }
  }

  function readStoredSoundPreference() {
    try {
      return window.localStorage.getItem(SOUND_KEY) !== "off";
    } catch (_error) {
      return true;
    }
  }

  function storeValue(key, value) {
    try {
      window.localStorage.setItem(key, String(value));
    } catch (_error) {
      // The experience still works when storage is unavailable or blocked.
    }
  }

  function removeStoredValue(key) {
    try {
      window.localStorage.removeItem(key);
    } catch (_error) {
      // Reset still updates the current page when storage is unavailable.
    }
  }

  function updateAttemptDisplay() {
    attemptCount.value = String(state.attempts);
    attemptCount.textContent = String(state.attempts);

    const isUnlocked = state.attempts >= RARE_THRESHOLD;
    rareStatus.textContent = isUnlocked ? "Mystery unlocked" : `${RARE_THRESHOLD - state.attempts} to mystery`;
    rareStatus.classList.toggle("is-unlocked", isUnlocked);
  }

  function updateSoundControl() {
    soundToggle.setAttribute("aria-pressed", String(state.soundEnabled));
    soundLabel.textContent = state.soundEnabled ? "Sound on" : "Sound off";
    soundToggle.querySelector(".control-button__icon").textContent = state.soundEnabled ? "♪" : "×";
    soundToggle.title = state.soundEnabled ? "Turn sound off" : "Turn sound on";
  }

  function setStatus(message) {
    sceneStatus.textContent = message;
  }

  function showBubble(message) {
    reactionBubble.textContent = message;
    reactionBubble.classList.add("is-visible");
  }

  function hideBubble() {
    reactionBubble.classList.remove("is-visible");
  }

  function clearScene() {
    stage.classList.remove(...REACTION_CLASSES);
    doorbellButton.classList.remove("is-pressed", "is-ringback");
    hideBubble();
  }

  function isCurrentSequence(token) {
    return token === state.sequenceToken;
  }

  function pause(milliseconds, token) {
    const motionFactor = reducedMotionQuery.matches ? 0.28 : 1;
    return new Promise((resolve) => {
      window.setTimeout(() => resolve(isCurrentSequence(token)), milliseconds * motionFactor);
    });
  }

  function chooseReaction() {
    if (state.attempts === RARE_THRESHOLD || (state.attempts > RARE_THRESHOLD && Math.random() < 0.08)) {
      return "rare";
    }

    const available = NORMAL_REACTIONS.filter((reaction) => reaction !== state.lastReaction);
    return available[Math.floor(Math.random() * available.length)];
  }

  function getAudioContext() {
    if (!state.soundEnabled) {
      return null;
    }

    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (!AudioContextClass) {
      return null;
    }

    if (!audioContext) {
      audioContext = new AudioContextClass();
    }

    if (audioContext.state === "suspended") {
      audioContext.resume().catch(() => {});
    }

    return audioContext;
  }

  function stopAllSound() {
    const currentContext = audioContext;
    audioContext = null;

    if (currentContext && currentContext.state !== "closed") {
      currentContext.close().catch(() => {});
    }
  }

  function createTone(context, frequency, startOffset, duration, type = "sine", volume = 0.08) {
    const start = context.currentTime + startOffset;
    const oscillator = context.createOscillator();
    const gain = context.createGain();

    oscillator.type = type;
    oscillator.frequency.setValueAtTime(frequency, start);
    gain.gain.setValueAtTime(0.0001, start);
    gain.gain.exponentialRampToValueAtTime(volume, start + 0.018);
    gain.gain.exponentialRampToValueAtTime(0.0001, start + duration);

    oscillator.connect(gain);
    gain.connect(context.destination);
    oscillator.start(start);
    oscillator.stop(start + duration + 0.03);
  }

  function playDoorbellSound(isRingBack = false) {
    const context = getAudioContext();
    if (!context) return;

    const pitchShift = isRingBack ? 1.16 : 1;
    createTone(context, 659.25 * pitchShift, 0, 0.44, "sine", 0.1);
    createTone(context, 987.77 * pitchShift, 0, 0.42, "sine", 0.055);
    createTone(context, 523.25 * pitchShift, 0.5, 0.55, "sine", 0.095);
    createTone(context, 783.99 * pitchShift, 0.5, 0.5, "triangle", 0.04);
  }

  function playGaspSound() {
    const context = getAudioContext();
    if (!context) return;

    createTone(context, 310, 0, 0.14, "sine", 0.035);
    createTone(context, 470, 0.1, 0.2, "sine", 0.045);
  }

  function playSwitchSound() {
    const context = getAudioContext();
    if (!context) return;

    createTone(context, 1250, 0, 0.045, "square", 0.025);
    createTone(context, 720, 0.055, 0.06, "square", 0.02);
  }

  function playSlamSound() {
    const context = getAudioContext();
    if (!context) return;

    const start = context.currentTime;
    const oscillator = context.createOscillator();
    const oscillatorGain = context.createGain();
    oscillator.type = "sine";
    oscillator.frequency.setValueAtTime(105, start);
    oscillator.frequency.exponentialRampToValueAtTime(54, start + 0.22);
    oscillatorGain.gain.setValueAtTime(0.12, start);
    oscillatorGain.gain.exponentialRampToValueAtTime(0.0001, start + 0.24);
    oscillator.connect(oscillatorGain);
    oscillatorGain.connect(context.destination);
    oscillator.start(start);
    oscillator.stop(start + 0.25);

    const buffer = context.createBuffer(1, Math.ceil(context.sampleRate * 0.12), context.sampleRate);
    const data = buffer.getChannelData(0);
    for (let index = 0; index < data.length; index += 1) {
      data[index] = (Math.random() * 2 - 1) * (1 - index / data.length);
    }

    const noise = context.createBufferSource();
    const noiseGain = context.createGain();
    noise.buffer = buffer;
    noiseGain.gain.setValueAtTime(0.055, start);
    noiseGain.gain.exponentialRampToValueAtTime(0.0001, start + 0.12);
    noise.connect(noiseGain);
    noiseGain.connect(context.destination);
    noise.start(start);
  }

  function playRareSound() {
    const context = getAudioContext();
    if (!context) return;

    [523.25, 659.25, 783.99, 1046.5].forEach((frequency, index) => {
      createTone(context, frequency, index * 0.1, 0.38, "triangle", 0.04);
    });
  }

  async function performReaction(reaction, token) {
    state.lastReaction = reaction;

    switch (reaction) {
      case "window":
        stage.classList.add("reaction-window");
        showBubble("Maybe the curtain makes me invisible.");
        setStatus("A familiar face appears behind the window.");
        if (!(await pause(1500, token))) return null;
        return "The curtain drops. Stealth has been restored.";

      case "eye":
        stage.classList.add("door-is-cracked", "reaction-eye");
        showBubble("One eye is basically not answering.");
        setStatus("One extremely cautious eye checks the porch.");
        if (!(await pause(1450, token))) return null;
        return "The eye has withdrawn its official statement.";

      case "sign":
        stage.classList.add("reaction-sign");
        showBubble("This sign is legally convincing.");
        setStatus("A hand-lettered “Not Home” sign appears on the door.");
        if (!(await pause(1650, token))) return null;
        return "The sign remains deeply unconvincing.";

      case "lights-out":
        stage.classList.add("reaction-lights-out");
        playSwitchSound();
        showBubble("No light. No house. Problem solved.");
        setStatus("Click. The porch light goes out with suspicious timing.");
        if (!(await pause(1450, token))) return null;
        return "It is dark now, but definitely not less obvious.";

      case "ring-back":
        stage.classList.add("door-is-cracked", "reaction-ringback");
        showBubble("Your turn.");
        setStatus("A tiny hand reaches out toward the bell.");
        if (!(await pause(480, token))) return null;
        doorbellButton.classList.add("is-ringback");
        playDoorbellSound(true);
        setStatus("The house rings its own doorbell back at you.");
        if (!(await pause(1250, token))) return null;
        doorbellButton.classList.remove("is-ringback");
        return "The score is now doorbell one, visitor one.";

      case "open-close":
        showBubble("Maybe it was the wind?");
        setStatus("The door suddenly opens wide—");
        stage.classList.add("door-is-wide");
        if (!(await pause(220, token))) return null;
        stage.classList.remove("door-is-wide");
        stage.classList.add("door-is-slamming");
        playSlamSound();
        setStatus("—and immediately changes its mind.");
        if (!(await pause(850, token))) return null;
        return "That was a complete visit by local standards.";

      case "cardboard":
        stage.classList.add("reaction-cardboard");
        showBubble("My assistant has people skills.");
        setStatus("A cardboard assistant slides onto the porch.");
        if (!(await pause(1850, token))) return null;
        return "The assistant has nothing further to add.";

      case "hand":
        stage.classList.add("door-is-cracked", "reaction-hand");
        showBubble("A wave counts as hospitality.");
        setStatus("Only a small, polite hand emerges from the doorway.");
        if (!(await pause(1550, token))) return null;
        return "The hand retreats. Social quota reached.";

      case "rare":
        stage.classList.add("rare-reaction");
        playRareSound();
        showBubble("Okay… hi. Please don't make this a thing.");
        setStatus("Mystery unlocked: the resident actually says hello!");
        if (!(await pause(2300, token))) return null;
        return "You met the resident. They will think about this all week.";

      default:
        return "The house has returned to being suspiciously quiet.";
    }
  }

  async function ringDoorbell() {
    if (state.busy) return;

    state.busy = true;
    const token = state.sequenceToken + 1;
    state.sequenceToken = token;
    clearScene();
    doorbellButton.disabled = true;
    doorbellButton.classList.add("is-pressed");

    state.attempts += 1;
    storeValue(ATTEMPTS_KEY, state.attempts);
    updateAttemptDisplay();

    stage.classList.add("porch-is-lit");
    setStatus("Ding-dong. The porch light clicks on.");
    playDoorbellSound();

    if (!(await pause(220, token))) return;
    doorbellButton.classList.remove("is-pressed");

    if (!(await pause(270, token))) return;
    stage.classList.add("door-is-open", "character-is-peeking");
    setStatus("The door opens exactly one courage-unit.");

    if (!(await pause(680, token))) return;
    stage.classList.add("character-noticed");
    showBubble("Oh no. Eye contact.");
    setStatus("The resident notices you noticing them.");
    playGaspSound();

    if (!(await pause(570, token))) return;
    hideBubble();
    stage.classList.remove("door-is-open", "character-is-peeking", "character-noticed");
    stage.classList.add("door-is-slamming");
    setStatus("Nope. The door closes at impressive speed.");
    playSlamSound();

    if (!(await pause(370, token))) return;
    stage.classList.remove("door-is-slamming");

    if (!(await pause(210, token))) return;
    const reaction = chooseReaction();
    const finalMessage = await performReaction(reaction, token);
    if (!finalMessage || !isCurrentSequence(token)) return;

    if (!(await pause(180, token))) return;
    clearScene();
    state.busy = false;
    doorbellButton.disabled = false;
    setStatus(finalMessage);
  }

  function toggleSound() {
    state.soundEnabled = !state.soundEnabled;
    storeValue(SOUND_KEY, state.soundEnabled ? "on" : "off");
    updateSoundControl();
    setStatus(state.soundEnabled ? "Sound is on. The next ring will ding." : "Sound is off. The resident approves.");

    if (state.soundEnabled) {
      playSwitchSound();
    } else {
      stopAllSound();
    }
  }

  function resetExperience() {
    state.sequenceToken += 1;
    state.busy = false;
    state.attempts = 0;
    state.lastReaction = "";
    removeStoredValue(ATTEMPTS_KEY);
    stopAllSound();
    clearScene();
    doorbellButton.disabled = false;
    updateAttemptDisplay();
    setStatus("Fresh start. The resident hopes you learned nothing.");
  }

  doorbellButton.addEventListener("click", ringDoorbell);
  soundToggle.addEventListener("click", toggleSound);
  resetButton.addEventListener("click", resetExperience);

  updateAttemptDisplay();
  updateSoundControl();
})();
