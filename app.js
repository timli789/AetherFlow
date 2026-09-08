// Fallback Noun List for instant offline / slow network cold boot
const DEFAULT_FALLBACK_NOUNS = [
  "Accordion", "Anchor", "Apron", "Badminton", "Beach", "Blender", "Blizzard", 
  "Cactus", "Carousel", "Chrysalis", "Coral Reef", "Daydream", "Dendrite", "Dentist", 
  "Dinosaur", "Eclipse", "Egg", "Embers", "Eruption", "Feather", "Fingerprint", 
  "Fire Escape", "Flashlight", "Garden Gnome", "Glacier", "Gorge", "Guitar", "Hammock", 
  "Hibernation", "Hinge", "Houseplant", "Iceberg", "Igloo", "Iris", "Irrigation", 
  "Javelin", "Jellyfish", "Judo", "Jukebox", "Kaleidoscope", "Kiln", "Knapsack", 
  "Knuckle", "Lattice", "Lava", "Lighthouse", "Loom", "Magnolia", "Meadow", 
  "Mermaid", "Meteor", "Nebula", "Necklace", "Nestling", "Nightclub", "Oasis", 
  "Obelisk", "Olive", "Orchid", "Parachute", "Pendulum", "Platypus", "Puppet", 
  "Quarry", "Quartz", "Quicksand", "Rafting", "Rainbow", "Riverbed", "Roulette", 
  "Sandcastle", "Silt", "Spaceship", "Staircase", "Telescope", "Thimble", "Tornado", 
  "Trampoline", "Umbrella", "Unicorn", "Updraft", "Urchin", "Velvet", "Viewport", 
  "Volcano", "Vortex", "Waffle", "Wharf", "Wheat field", "Windmill", "Xeric", 
  "Xrays", "Xylophone", "Yacht", "Yawn", "Yearbook", "Zeppelin", "Zipper", "Zither"
];

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
      mode: "association" // Default mode
    },
    session: {
      active: false,
      promptWord: null, // The single prompt word for the session
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
    
    // Always initialize with instant fallback nouns (0ms)
    this.nounsPool = [...DEFAULT_FALLBACK_NOUNS];

    // Check if nouns were cached in sessionStorage
    try {
      const sessionData = sessionStorage.getItem("aetherflow_session_nouns");
      if (sessionData) {
        const parsed = JSON.parse(sessionData);
        if (Array.isArray(parsed) && parsed.length > 0) {
          this.nounsPool = parsed;
          console.log(`Loaded ${parsed.length} nouns from sessionStorage.`);
        }
      }
    } catch (e) {
      console.warn("Failed to read sessionStorage:", e);
    }

    // Set up network status tracking
    window.addEventListener('online', () => this.updateOnlineStatus());
    window.addEventListener('offline', () => this.updateOnlineStatus());
    this.updateOnlineStatus();

    this.renderIcons();

    // Trigger online sync non-blocking completely in background
    this.syncOnlineNouns();
  },

  async syncOnlineNouns(forceStartAfterSync = false) {
    if (navigator.onLine === false) return;
    
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 1500); // Fast 1.5-second timeout
    
    this.isSyncing = true;
    if (forceStartAfterSync) {
      this.setLoadingState(true);
    }
    
    try {
      // Fetch from local edge proxy to bypass cold boot database latency
      const response = await fetch('/api/nouns', {
        signal: controller.signal
      });
      clearTimeout(timeoutId);
      
      if (!response.ok) throw new Error("Network response not ok");
      
      const data = await response.json();
      if (Array.isArray(data)) {
        const words = data
          .map(row => row.word ? row.word.trim() : "")
          .filter(w => w.length > 2 && /^[a-zA-Z]+$/.test(w)) // keep alphabetic strings
          .map(w => w.charAt(0).toUpperCase() + w.slice(1));
          
        if (words.length > 0) {
          this.nounsPool = words;
          console.log(`Successfully synchronized ${words.length} nouns from local Edge API!`);
          
          // Cache in sessionStorage to speed up subsequent reloads
          try {
            sessionStorage.setItem("aetherflow_session_nouns", JSON.stringify(words));
          } catch (e) {
            console.warn("Failed to save to sessionStorage:", e);
          }

          // Automatically begin practice session if user was waiting
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
      if (this.nounsPool.length === 0) {
        this.nounsPool = [...DEFAULT_FALLBACK_NOUNS];
      }
    } finally {
      this.isSyncing = false;
      this.startSessionOnSync = false;
      this.setLoadingState(false);
    }
  },

  setLoadingState(isLoading) {
    this.isSyncing = isLoading;
    const startBtn = document.querySelector(".start-btn");
    if (!startBtn) return;
    
    const span = startBtn.querySelector("span");
    const icon = startBtn.querySelector("i");
    
    if (isLoading) {
      startBtn.setAttribute("disabled", "true");
      startBtn.style.opacity = "0.7";
      startBtn.style.pointerEvents = "none";
      if (span) span.innerText = "Syncing Nouns...";
      if (icon) {
        icon.setAttribute("data-lucide", "loader");
        icon.classList.add("spin-animation");
      }
    } else {
      if (navigator.onLine) {
        startBtn.removeAttribute("disabled");
        startBtn.style.opacity = "1";
        startBtn.style.pointerEvents = "auto";
        if (span) span.innerText = "Begin Session";
        if (icon) {
          icon.setAttribute("data-lucide", "play");
          icon.classList.remove("spin-animation");
        }
      }
    }
    this.renderIcons();
  },

  updateOnlineStatus() {
    const isOnline = navigator.onLine;
    const offlineMsg = document.getElementById("offline-message");
    const startBtn = document.querySelector(".start-btn");
    
    if (isOnline) {
      if (offlineMsg) offlineMsg.classList.add("hidden");
      
      // If we are currently syncing, let the sync status manage the button.
      // Otherwise, restore the active button.
      if (!this.isSyncing) {
        if (startBtn) {
          startBtn.removeAttribute("disabled");
          startBtn.style.opacity = "1";
          startBtn.style.pointerEvents = "auto";
        }
      }
      
      // Re-fetch nouns if they aren't loaded yet
      if (this.nounsPool.length === 0) {
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
      this.startPracticeSession();
    });

    // Abort Practice
    document.getElementById("abort-practice-btn").addEventListener("click", () => {
      this.endPracticeSession(true);
    });

    // Results Actions
    document.getElementById("retry-btn").addEventListener("click", () => {
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
      this.nounsPool = [...DEFAULT_FALLBACK_NOUNS];
    }
    SoundEffects.init();
    
    let chosenWord = "";
    const promptWordEl = document.getElementById("prompt-word");
    const instructionEl = document.getElementById("prompt-instruction");

    if (this.state.config.mode === "story") {
      // Pick two distinct random nouns
      const randomIndex1 = Math.floor(Math.random() * this.nounsPool.length);
      let randomIndex2 = Math.floor(Math.random() * this.nounsPool.length);
      while (randomIndex2 === randomIndex1 && this.nounsPool.length > 1) {
        randomIndex2 = Math.floor(Math.random() * this.nounsPool.length);
      }
      const word1 = this.nounsPool[randomIndex1];
      const word2 = this.nounsPool[randomIndex2];
      chosenWord = `${word1} & ${word2}`;
      
      // Update practice instruction label
      if (instructionEl) {
        instructionEl.innerText = "Create a story connecting";
      }

      // Render two boxed words in column using the maximum length of both words to standardize font size
      const maxWordLen = Math.max(word1.length, word2.length);
      promptWordEl.innerHTML = `
        <div class="prompt-double-container">
          <div class="word-box">
            <span class="word-box-text" style="--word-len: ${maxWordLen}">${word1}</span>
          </div>
          <div class="word-box" style="animation-delay: 0.12s;">
            <span class="word-box-text" style="--word-len: ${maxWordLen}">${word2}</span>
          </div>
        </div>
      `;
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

    // Reset Practice State
    this.state.session = {
      active: true,
      promptWord: chosenWord,
      startTime: Date.now(),
      timeLeft: this.state.config.duration,
      totalDuration: this.state.config.duration
    };

    // Show Practice View
    this.showView("practice-view");
    this.renderIcons();

    // Setup Timer
    this.updateTimerDisplay();
    clearInterval(this.timerInterval);
    
    document.getElementById("timer-display-wrapper").classList.remove("pulse");
    
    this.timerInterval = setInterval(() => {
      this.state.session.timeLeft--;
      this.updateTimerDisplay();
      
      if (this.state.session.timeLeft <= 5 && this.state.session.timeLeft > 0) {
        SoundEffects.playTick();
        document.getElementById("timer-display-wrapper").classList.add("pulse");
      }
      
      if (this.state.session.timeLeft <= 0) {
        clearInterval(this.timerInterval);
        this.endPracticeSession(false);
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
    clearInterval(this.timerInterval);

    if (isAborted) {
      this.showView("dashboard-view");
      return;
    }

    SoundEffects.playComplete();

    const durationUsed = this.state.session.totalDuration;

    const sessionRecord = {
      promptWord: this.state.session.promptWord,
      duration: durationUsed
    };

    this.displaySessionResults(sessionRecord);
  },

  displaySessionResults(session) {
    // Update summary card text
    document.getElementById("results-duration").innerText = session.duration + "s";
    
    // Inject boxed layouts for results prompts
    const promptWordEl = document.getElementById("results-prompt-word");
    if (this.state.config.mode === "story") {
      const words = session.promptWord.split(" & ");
      const word1 = words[0];
      const word2 = words[1];
      const maxWordLen = Math.max(word1.length, word2.length);
      
      promptWordEl.innerHTML = `
        <div class="prompt-double-container">
          <div class="word-box">
            <span class="word-box-text" style="--word-len: ${maxWordLen}">${word1}</span>
          </div>
          <div class="word-box">
            <span class="word-box-text" style="--word-len: ${maxWordLen}">${word2}</span>
          </div>
        </div>
      `;
    } else {
      const word = session.promptWord;
      promptWordEl.innerHTML = `
        <div class="word-box">
          <span class="word-box-text" style="--word-len: ${word.length}">${word}</span>
        </div>
      `;
    }

    // Update prompt label depending on mode
    const promptLabelEl = document.getElementById("results-prompt-label");
    if (promptLabelEl) {
      promptLabelEl.innerText = this.state.config.mode === "story" ? "Prompt Nouns" : "Prompt Noun";
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
