// Audio Synthesizer using Web Audio API
const SoundEffects = {
  ctx: null,
  
  init() {
    try {
      if (!this.ctx) {
        const AudioContextClass = window.AudioContext || window.webkitAudioContext;
        if (AudioContextClass) {
          this.ctx = new AudioContextClass();
        }
      }
      if (this.ctx && this.ctx.state === 'suspended') {
        this.ctx.resume().catch(() => {});
      }
    } catch (e) {
      console.warn("SoundEffects init error:", e);
    }
  },

  playSubmit() {
    this.init();
    if (!this.ctx) return;
    
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    
    osc.type = 'sine';
    osc.frequency.setValueAtTime(440, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(880, this.ctx.currentTime + 0.08);
    
    gain.gain.setValueAtTime(0.08, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.12);
    
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    
    osc.start();
    osc.stop(this.ctx.currentTime + 0.12);
  },

  playComplete() {
    this.init();
    if (!this.ctx) return;

    const time = this.ctx.currentTime;
    
    [523.25, 659.25, 783.99].forEach((freq, index) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, time + index * 0.08);
      
      gain.gain.setValueAtTime(0, time + index * 0.08);
      gain.gain.linearRampToValueAtTime(0.08, time + index * 0.08 + 0.05);
      gain.gain.exponentialRampToValueAtTime(0.001, time + index * 0.08 + 0.8);
      
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      
      osc.start(time + index * 0.08);
      osc.stop(time + index * 0.08 + 0.85);
    });
  },

  playTick() {
    this.init();
    if (!this.ctx) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(1000, this.ctx.currentTime);

    gain.gain.setValueAtTime(0.02, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + 0.03);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start();
    osc.stop(this.ctx.currentTime + 0.04);
  }
};

// 2. Main App Core State
const App = {
  state: {
    currentView: "dashboard-view",
    config: {
      duration: 15, // Default 15s
      mode: "association", // Default mode
      rounds: 1
    },
    session: {
      active: false,
      isPaused: false,
      promptWord: null, // The single prompt word for the session
      history: [],
      currentRound: 1,
      startTime: null,
      timeLeft: 15,
      totalDuration: 15
    }
  },

  nounsPool: [],
  isSyncing: false,
  startSessionOnSync: false,

  renderIcons() {
    if (window.lucide && typeof window.lucide.createIcons === 'function') {
      try {
        window.lucide.createIcons();
      } catch (e) {
        console.warn("Lucide icons render skipped:", e);
      }
    }
  },

  init() {
    this.bindEvents();
    
    // 1. STALE: Immediately load cached nouns from localStorage (0ms instant startup)
    const STORAGE_KEY = "aetherflow_nouns_cache";
    try {
      const cached = localStorage.getItem(STORAGE_KEY) || sessionStorage.getItem("aetherflow_session_nouns");
      if (cached) {
        const parsed = JSON.parse(cached);
        if (Array.isArray(parsed) && parsed.length > 0) {
          this.nounsPool = parsed;
          console.log(`[SWR Stale] Instantly loaded ${parsed.length} nouns from local storage (0ms).`);
        }
      }
    } catch (e) {
      console.warn("Failed to read local cache:", e);
    }

    // Set up network status tracking
    window.addEventListener('online', () => this.updateOnlineStatus());
    window.addEventListener('offline', () => this.updateOnlineStatus());
    this.updateOnlineStatus();

    this.renderIcons();

    // 2. REVALIDATE: Trigger background synchronization silently to capture new database additions
    this.syncOnlineNouns();
  },

  async syncOnlineNouns(forceStartAfterSync = false) {
    // If offline and we have cached nouns, keep using them without network error
    if (navigator.onLine === false && this.nounsPool.length > 0) {
      return;
    }

    // Generous 10-second timeout so slow cellular data connections can complete
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);
    
    this.isSyncing = true;
    
    // Only show loading state if the user has NO cached words or clicked "Begin Session" while waiting
    const hasCachedNouns = this.nounsPool.length > 0;
    if (forceStartAfterSync || !hasCachedNouns) {
      this.setLoadingState(true);
    }
    
    try {
      const response = await fetch('/api/nouns', {
        signal: controller.signal
      });
      clearTimeout(timeoutId);
      
      if (!response.ok) throw new Error(`HTTP error ${response.status}`);
      
      const data = await response.json();
      if (Array.isArray(data)) {
        const words = data
          .map(row => row.word ? row.word.trim() : "")
          .filter(w => w.length > 2 && /^[a-zA-Z]+$/.test(w)) // keep alphabetic single words
          .map(w => w.charAt(0).toUpperCase() + w.slice(1));
        
        const uniqueWords = [...new Set(words)];
          
        if (uniqueWords.length > 0) {
          this.nounsPool = uniqueWords;
          console.log(`[SWR Revalidated] Successfully refreshed ${uniqueWords.length} nouns from database!`);
          
          // Persist to localStorage for instant offline access and sessionStorage for backup
          try {
            localStorage.setItem("aetherflow_nouns_cache", JSON.stringify(uniqueWords));
            sessionStorage.setItem("aetherflow_session_nouns", JSON.stringify(uniqueWords));
          } catch (e) {
            console.warn("Failed to save to localStorage:", e);
          }

          // Automatically begin practice session if user was waiting on first cold boot
          if (this.startSessionOnSync || forceStartAfterSync) {
            const durationVal = parseInt(document.getElementById("duration-input").value, 10);
            this.state.config.duration = durationVal;
            this.startPracticeSession();
          }
        }
      }
    } catch (err) {
      clearTimeout(timeoutId);
      console.warn("Background nouns synchronization failed/skipped:", err.message);
    } finally {
      this.isSyncing = false;
      this.startSessionOnSync = false;
      this.setLoadingState(false);
      
      // Update UI status based on whether we actually have words available
      this.updateOnlineStatus();
    }
  },

  setLoadingState(isLoading) {
    this.isSyncing = isLoading;
    const startBtn = document.querySelector(".start-btn");
    if (!startBtn) return;
    
    const span = startBtn.querySelector("span");
    const currentIcon = startBtn.querySelector("i, svg");
    
    if (isLoading) {
      startBtn.setAttribute("disabled", "true");
      startBtn.style.opacity = "0.7";
      startBtn.style.pointerEvents = "none";
      if (span) span.innerText = "Syncing Nouns...";
      if (currentIcon) {
        const loaderIcon = document.createElement("i");
        loaderIcon.setAttribute("data-lucide", "loader");
        loaderIcon.className = "spin-animation";
        currentIcon.replaceWith(loaderIcon);
      }
    } else {
      // Re-enable if we have words in pool or we are online
      if (this.nounsPool.length > 0 || navigator.onLine) {
        startBtn.removeAttribute("disabled");
        startBtn.style.opacity = "1";
        startBtn.style.pointerEvents = "auto";
        if (span) span.innerText = "Begin Session";
        if (currentIcon) {
          const playIcon = document.createElement("i");
          playIcon.setAttribute("data-lucide", "play");
          currentIcon.replaceWith(playIcon);
        }
      }
    }
    this.renderIcons();
  },

  updateOnlineStatus(forceOffline = false) {
    const hasNouns = this.nounsPool && this.nounsPool.length > 0;
    const isOnline = forceOffline ? false : navigator.onLine;
    const offlineMsg = document.getElementById("offline-message");
    const startBtn = document.querySelector(".start-btn");
    
    // If the user already has cached nouns in memory, the app is 100% playable!
    if (hasNouns) {
      if (offlineMsg) offlineMsg.classList.add("hidden");
      
      if (!this.isSyncing && startBtn) {
        startBtn.removeAttribute("disabled");
        startBtn.style.opacity = "1";
        startBtn.style.pointerEvents = "auto";
      }
      return;
    }

    // Only if we have NO nouns at all do we block on connection status
    if (isOnline) {
      if (offlineMsg) offlineMsg.classList.add("hidden");
      if (!this.isSyncing && startBtn) {
        startBtn.removeAttribute("disabled");
        startBtn.style.opacity = "1";
        startBtn.style.pointerEvents = "auto";
      }
      if (this.nounsPool.length === 0 && !this.isSyncing) {
        this.syncOnlineNouns();
      }
    } else {
      if (offlineMsg) offlineMsg.classList.remove("hidden");
      if (startBtn) {
        startBtn.setAttribute("disabled", "true");
        startBtn.style.opacity = "0.5";
        startBtn.style.pointerEvents = "none";
      }
    }
  },

  // View Routing
  showView(viewId) {
    const activeView = document.querySelector(".app-view.active");
    if (activeView) {
      activeView.classList.remove("active");
    }
    
    const targetView = document.getElementById(viewId);
    if (targetView) {
      targetView.classList.add("active");
      this.state.currentView = viewId;
    }
  },

  // Event Bindings
  bindEvents() {
    // Duration buttons select
    const durationBtns = document.querySelectorAll(".duration-btn");
    durationBtns.forEach(btn => {
      btn.addEventListener("click", (e) => {
        const targetBtn = e.target.closest(".duration-btn");
        durationBtns.forEach(b => b.classList.remove("active"));
        targetBtn.classList.add("active");
        
        const val = parseInt(targetBtn.getAttribute("data-value"), 10);
        document.getElementById("duration-input").value = val;
        this.state.config.duration = val;
      });
    });

    // Rounds select
    const roundBtns = document.querySelectorAll(".round-btn");
    roundBtns.forEach(btn => {
      btn.addEventListener("click", (e) => {
        const targetBtn = e.target.closest(".round-btn");
        roundBtns.forEach(b => b.classList.remove("active"));
        targetBtn.classList.add("active");
        
        const val = parseInt(targetBtn.getAttribute("data-value"), 10);
        document.getElementById("rounds-input").value = val;
        this.state.config.rounds = val;
      });
    });

    // Start Session Form
    const configForm = document.getElementById("config-form");
    configForm.addEventListener("submit", (e) => {
      e.preventDefault();
      
      if (this.nounsPool.length === 0) {
        if (this.isSyncing) {
          this.setLoadingState(true);
          this.startSessionOnSync = true;
        } else {
          this.syncOnlineNouns(true);
        }
        return;
      }

      const durationVal = parseInt(document.getElementById("duration-input").value, 10);
      this.state.config.duration = durationVal;
      
      // Reset multi-round state
      this.state.session.history = [];
      this.state.session.currentRound = 1;
      
      this.startPracticeSession();
    });

    // Abort Practice
    document.getElementById("abort-practice-btn").addEventListener("click", () => {
      this.endPracticeSession(true);
    });

    // Pause / Resume Timer
    const timerDisplayBtn = document.getElementById("timer-display-wrapper");
    if (timerDisplayBtn) {
      timerDisplayBtn.addEventListener("click", () => {
        this.toggleTimerPause();
      });
    }

    // Next Practice (Restart immediately)
    document.getElementById("next-practice-btn").addEventListener("click", () => {
      if (this.state.session.currentRound >= this.state.config.rounds) {
        this.endPracticeSession(false);
      } else {
        this.state.session.currentRound++;
        this.startPracticeSession();
      }
    });

    // Results Actions
    document.getElementById("retry-btn").addEventListener("click", () => {
      // Retain the user-selected duration and number of sessions
      const durationVal = parseInt(document.getElementById("duration-input").value, 10);
      const roundsVal = parseInt(document.getElementById("rounds-input").value, 10);
      if (!isNaN(durationVal)) this.state.config.duration = durationVal;
      if (!isNaN(roundsVal)) this.state.config.rounds = roundsVal;

      // Reset multi-round session series state to start fresh from Round 1
      this.state.session.history = [];
      this.state.session.currentRound = 1;
      this.state.session.isPaused = false;

      this.startPracticeSession();
    });

    document.getElementById("dashboard-btn").addEventListener("click", () => {
      this.showView("dashboard-view");
    });

    // Mode tabs select
    const modeTabs = document.querySelectorAll(".mode-tab");
    modeTabs.forEach(tab => {
      tab.addEventListener("click", (e) => {
        const targetTab = e.target.closest(".mode-tab");
        modeTabs.forEach(t => t.classList.remove("active"));
        targetTab.classList.add("active");
        
        const mode = targetTab.getAttribute("data-mode");
        this.state.config.mode = mode;
      });
    });
  },

  // Practice Flow Management
  startPracticeSession() {
    if (this.nounsPool.length === 0) {
      if (this.state.config.mode === "association" || this.state.config.mode === "story" || this.state.config.mode === "story3") {
        console.warn("Cannot start session: noun database is empty.");
        this.updateOnlineStatus(true);
        return;
      }
    }
    SoundEffects.init();
    
    let chosenWord = "";
    const promptWordEl = document.getElementById("prompt-word");
    const instructionEl = document.getElementById("prompt-instruction");

    if (this.state.config.mode === "acronym3" || this.state.config.mode === "acronym4") {
      // Pick random letters using weighted English frequencies
      const length = this.state.config.mode === "acronym4" ? 4 : 3;
      
      const vowels = "AAAAAEEEEEEEEIIIIIOOOOOUUUY";
      const consonants = "BBCCCNDDDDDFFFFGGGHHHHHJKLLLLLMMMMNNNNNNPPPPQRRRRRRSSSSSSTTTTTTTTVWWXYYYZ";
      const allLetters = vowels + consonants;
      
      let acronym = "";
      let hasVowel = false;
      
      for (let i = 0; i < length; i++) {
        const char = allLetters.charAt(Math.floor(Math.random() * allLetters.length));
        acronym += char;
        if (vowels.includes(char)) hasVowel = true;
      }
      
      // Enforce at least one vowel to ensure pronounceability
      if (!hasVowel) {
        const replaceIdx = Math.floor(Math.random() * length);
        const forcedVowel = vowels.charAt(Math.floor(Math.random() * vowels.length));
        acronym = acronym.substring(0, replaceIdx) + forcedVowel + acronym.substring(replaceIdx + 1);
      }
      
      // Format as A. B. C.
      chosenWord = acronym.split('').join('. ') + '.';
      
      // Update practice instruction label
      if (instructionEl) {
        instructionEl.innerText = "Create a definition for the acronym";
      }

      promptWordEl.innerHTML = `
        <div class="word-box fade-in-up">
          <span class="word-box-text" style="--word-len: ${chosenWord.length}; letter-spacing: 0.05em; white-space: nowrap;">${chosenWord}</span>
        </div>
      `;
    } else if (this.state.config.mode === "story" || this.state.config.mode === "story3") {
      const is3Word = this.state.config.mode === "story3";
      
      // Pick random nouns
      const randomIndex1 = Math.floor(Math.random() * this.nounsPool.length);
      
      let randomIndex2 = Math.floor(Math.random() * this.nounsPool.length);
      while (randomIndex2 === randomIndex1 && this.nounsPool.length > 1) {
        randomIndex2 = Math.floor(Math.random() * this.nounsPool.length);
      }

      let randomIndex3 = 0;
      if (is3Word) {
        randomIndex3 = Math.floor(Math.random() * this.nounsPool.length);
        while ((randomIndex3 === randomIndex1 || randomIndex3 === randomIndex2) && this.nounsPool.length > 2) {
          randomIndex3 = Math.floor(Math.random() * this.nounsPool.length);
        }
      }
      
      const word1 = this.nounsPool[randomIndex1];
      const word2 = this.nounsPool[randomIndex2];
      const word3 = is3Word ? this.nounsPool[randomIndex3] : null;
      
      chosenWord = is3Word ? `${word1} & ${word2} & ${word3}` : `${word1} & ${word2}`;
      
      // Update practice instruction label
      if (instructionEl) {
        instructionEl.innerText = "Create a story connecting";
      }

      // Render boxed words in column using the maximum length of all words to standardize font size
      let maxWordLen = Math.max(word1.length, word2.length);
      if (is3Word) maxWordLen = Math.max(maxWordLen, word3.length);

      let html = `
        <div class="prompt-double-container">
          <div class="word-box fade-in-up">
            <span class="word-box-text" style="--word-len: ${maxWordLen}">${word1}</span>
          </div>
          <div class="word-box fade-in-up" style="animation-delay: 0.12s;">
            <span class="word-box-text" style="--word-len: ${maxWordLen}">${word2}</span>
          </div>
      `;
      
      if (is3Word) {
        html += `
          <div class="word-box fade-in-up" style="animation-delay: 0.24s;">
            <span class="word-box-text" style="--word-len: ${maxWordLen}">${word3}</span>
          </div>
        `;
      }
      
      html += `</div>`;
      promptWordEl.innerHTML = html;
    } else {
      // Single word free association
      const randomIndex = Math.floor(Math.random() * this.nounsPool.length);
      chosenWord = this.nounsPool[randomIndex];
      
      // Update practice instruction label
      if (instructionEl) {
        instructionEl.innerText = "Associate in your mind from";
      }

      // Render single word encased in box
      promptWordEl.innerHTML = `
        <div class="word-box">
          <span class="word-box-text" style="--word-len: ${chosenWord.length}">${chosenWord}</span>
        </div>
      `;
    }

    // Preserve history and round from the outer scope if we are starting/advancing
    const currentHistory = this.state.session.history || [];
    const currentRound = this.state.session.currentRound || 1;
    
    // Add this word to history
    currentHistory.push(chosenWord);

    // Reset Practice State
    this.state.session = {
      active: true,
      promptWord: chosenWord,
      history: currentHistory,
      currentRound: currentRound,
      startTime: Date.now(),
      timeLeft: this.state.config.duration,
      totalDuration: this.state.config.duration
    };

    // Update Round Indicator and Next Button UI
    document.getElementById("round-indicator").innerText = `Session ${currentRound} of ${this.state.config.rounds}`;
    const nextBtn = document.getElementById("next-practice-btn");
    if (currentRound >= this.state.config.rounds) {
      nextBtn.innerHTML = `<span>Finish</span><i data-lucide="check" style="width: 16px; height: 16px;"></i>`;
    } else {
      nextBtn.innerHTML = `<span>Next</span><i data-lucide="arrow-right" style="width: 16px; height: 16px;"></i>`;
    }

    // Show Practice View
    this.showView("practice-view");
    this.renderIcons();

    // Reset Timer & Pause state
    this.state.session.isPaused = false;
    const timerWrapper = document.getElementById("timer-display-wrapper");
    if (timerWrapper) {
      timerWrapper.classList.remove("paused", "pulse");
      timerWrapper.setAttribute("title", "Click to pause countdown");
      timerWrapper.setAttribute("aria-label", "Pause countdown");
    }
    const pauseBadge = document.getElementById("timer-pause-badge");
    if (pauseBadge) pauseBadge.classList.add("hidden");

    this.updateTimerDisplay();
    this.startTimerInterval();
  },

  toggleTimerPause() {
    if (!this.state.session.active) return;
    
    this.state.session.isPaused = !this.state.session.isPaused;
    SoundEffects.playTick();
    
    const timerWrapper = document.getElementById("timer-display-wrapper");
    const pauseBadge = document.getElementById("timer-pause-badge");
    
    if (this.state.session.isPaused) {
      clearInterval(this.timerInterval);
      if (timerWrapper) {
        timerWrapper.classList.add("paused");
        timerWrapper.classList.remove("pulse");
        timerWrapper.setAttribute("title", "Click to resume countdown");
        timerWrapper.setAttribute("aria-label", "Resume countdown");
      }
      if (pauseBadge) {
        pauseBadge.classList.remove("hidden");
      }
    } else {
      if (timerWrapper) {
        timerWrapper.classList.remove("paused");
        timerWrapper.setAttribute("title", "Click to pause countdown");
        timerWrapper.setAttribute("aria-label", "Pause countdown");
      }
      if (pauseBadge) {
        pauseBadge.classList.add("hidden");
      }
      this.startTimerInterval();
    }
  },

  startTimerInterval() {
    clearInterval(this.timerInterval);
    
    this.timerInterval = setInterval(() => {
      if (this.state.session.isPaused) return;

      this.state.session.timeLeft--;
      this.updateTimerDisplay();
      
      const timerWrapper = document.getElementById("timer-display-wrapper");
      if (this.state.session.timeLeft <= 5 && this.state.session.timeLeft > 0) {
        SoundEffects.playTick();
        if (timerWrapper) timerWrapper.classList.add("pulse");
      }
      
      if (this.state.session.timeLeft <= 0) {
        clearInterval(this.timerInterval);
        if (this.state.session.currentRound >= this.state.config.rounds) {
          this.endPracticeSession(false);
        } else {
          this.state.session.currentRound++;
          this.startPracticeSession();
        }
      }
    }, 1000);
  },

  updateTimerDisplay() {
    const textEl = document.getElementById("timer-text");
    const progressRing = document.getElementById("timer-ring-progress");
    
    textEl.innerText = this.state.session.timeLeft;

    // Calculate stroke offset
    const circumference = 226; // 2 * pi * r
    const percentLeft = this.state.session.timeLeft / this.state.session.totalDuration;
    const offset = circumference - (percentLeft * circumference);
    progressRing.style.strokeDashoffset = offset;
  },

  endPracticeSession(isAborted = false) {
    this.state.session.active = false;
    this.state.session.isPaused = false;
    clearInterval(this.timerInterval);

    const timerWrapper = document.getElementById("timer-display-wrapper");
    if (timerWrapper) {
      timerWrapper.classList.remove("paused", "pulse");
    }
    const pauseBadge = document.getElementById("timer-pause-badge");
    if (pauseBadge) pauseBadge.classList.add("hidden");

    if (isAborted) {
      this.showView("dashboard-view");
      return;
    }

    SoundEffects.playComplete();

    const durationUsed = this.state.session.totalDuration;

    const sessionRecord = {
      history: this.state.session.history,
      duration: durationUsed
    };

    this.displaySessionResults(sessionRecord);
  },

  displaySessionResults(session) {
    // Update summary card text
    document.getElementById("results-duration").innerText = session.duration + "s";
    
    // Inject boxed layouts for results prompts
    const promptWordEl = document.getElementById("results-prompt-word");
    let allHtml = '<div style="display: flex; flex-direction: column; gap: 32px; max-height: 50vh; overflow-y: auto; padding-right: 8px;">';
    
    session.history.forEach((historyWord, idx) => {
      allHtml += `<div><div style="font-size: 0.8rem; color: var(--text-secondary); text-align: center; margin-bottom: 8px; text-transform: uppercase; letter-spacing: 0.05em; font-weight: 600;">Session ${idx + 1}</div>`;
      
      if (this.state.config.mode === "acronym3" || this.state.config.mode === "acronym4") {
        allHtml += `
          <div class="word-box">
            <span class="word-box-text" style="--word-len: ${historyWord.length}; letter-spacing: 0.05em; white-space: nowrap;">${historyWord}</span>
          </div>
        `;
      } else if (this.state.config.mode === "story" || this.state.config.mode === "story3") {
        const words = historyWord.split(" & ");
        const maxWordLen = Math.max(...words.map(w => w.length));
        
        let html = '<div class="prompt-double-container">';
        words.forEach((word) => {
          html += `
            <div class="word-box">
              <span class="word-box-text" style="--word-len: ${maxWordLen}">${word}</span>
            </div>
          `;
        });
        html += '</div>';
        allHtml += html;
      } else {
        allHtml += `
          <div class="word-box">
            <span class="word-box-text" style="--word-len: ${historyWord.length}">${historyWord}</span>
          </div>
        `;
      }
      
      allHtml += `</div>`;
    });
    
    allHtml += '</div>';
    promptWordEl.innerHTML = allHtml;

    // Update prompt label depending on mode
    const promptLabelEl = document.getElementById("results-prompt-label");
    if (promptLabelEl) {
      if (this.state.config.mode === "acronym3" || this.state.config.mode === "acronym4") {
        promptLabelEl.innerText = "Acronyms";
      } else {
        promptLabelEl.innerText = "Prompt Nouns";
      }
    }

    // Set heading text
    const titleEl = document.querySelector(".results-title");
    titleEl.innerText = "Deep Focus!";

    this.renderIcons();
    this.showView("results-view");
  }
};

document.addEventListener("DOMContentLoaded", () => {
  App.init();
});
