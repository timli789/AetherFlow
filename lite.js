// AetherFlow Lite - Free Association Logic (No Tracking, Only Nouns)

// 1. Evocative Nouns List (~150 words)
const NOUNS_DATABASE = [
  "Telescope", "Lighthouse", "Mirror", "Anchor", "Compass", "Violin", "Lantern", "Hourglass", 
  "Key", "Bridge", "Feather", "Clock", "Bicycle", "Camera", "Backpack", "Fossil", 
  "Sculpture", "Needle", "Microscope", "Bell", "Candelabra", "Map", "Helmet", "Sundial", 
  "Puppet", "Window", "Coin", "Castle", "Sailboat", "Hammer", "Mask", "Chessboard", 
  "Cradle", "Tombstone", "Sword", "Loom", "Teacup", "Bookcase", "Flask", "Saddle", 
  "Chime", "Cage", "Ladder", "Globe", "Envelope", "Goggles", "Spoon", "Thread",
  "Infinity", "Paradox", "Silence", "Chaos", "Justice", "Destiny", "Memory", "Illusion", 
  "Gravity", "Harmony", "Echo", "Dream", "Shadow", "Identity", "Truth", "Time", 
  "Freedom", "Mystery", "Symphony", "Entropy", "Solitude", "Sovereignty", "Decay", "Rhythm", 
  "Absence", "Presence", "Origin", "Metaphor", "Legacy", "Void", "Wisdom", "Ignorance", 
  "Guilt", "Honesty", "Mercy", "Power", "Belief", "Doubt", "Grief", "Rumor", 
  "Clarity", "Distortion", "Velocity", "Decorum", "Alliance", "Friction", "Balance", "Force", 
  "Miracle", "Volcano", "Glacier", "Oasis", "Thunder", "Nebula", "Comet", "Ocean", 
  "Forest", "Desert", "River", "Meadow", "Eclipse", "Sequoia", "Orchid", "Breeze", 
  "Canyon", "Avalanche", "Coral", "Waterfall", "Meteor", "Tornado", "Island", "Cave", 
  "Wave", "Cloud", "Crystal", "Hurricane", "Mountain", "Geyser", "Swamp", "Tundra", 
  "Dune", "Pebble", "Ivy", "Moss", "Cactus", "Galaxy", "Seed", "Root", 
  "Flame", "Frost", "Dew", "Mist", "Whirlpool", "Ridge", "Star", "Petal", 
  "Shell", "Sprout"
];

// Audio Synthesizer using Web Audio API
const SoundEffects = {
  ctx: null,
  
  init() {
    if (!this.ctx) {
      this.ctx = new (window.AudioContext || window.webkitAudioContext)();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
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
      duration: 15 // Default 15s
    },
    session: {
      active: false,
      promptWord: null, // The single prompt word for the session
      startTime: null,
      timeLeft: 15,
      totalDuration: 15
    }
  },

  nounsPool: NOUNS_DATABASE,

  init() {
    this.bindEvents();
    
    // Load custom nouns cache if present
    try {
      const cached = localStorage.getItem("aetherflow_custom_nouns");
      if (cached) {
        const parsed = JSON.parse(cached);
        if (Array.isArray(parsed) && parsed.length > 50) {
          this.nounsPool = parsed;
          console.log(`Loaded ${parsed.length} custom nouns from local cache.`);
        }
      }
    } catch (e) {
      console.warn("Failed to load cached custom nouns:", e);
    }

    this.syncOnlineNouns();
    lucide.createIcons();
  },

  async syncOnlineNouns() {
    if (navigator.onLine === false) return;
    
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 4000); // 4-second timeout
    
    try {
      const response = await fetch('https://gist.githubusercontent.com/creikey/42d23d1eec6d764e8a1d9fe7e56915c6/raw/top-1000-nouns.txt', {
        signal: controller.signal
      });
      clearTimeout(timeoutId);
      
      if (!response.ok) throw new Error("Network response not ok");
      
      const text = await response.text();
      const words = text.split('\n')
        .map(w => w.trim())
        .filter(w => w.length > 2 && /^[a-zA-Z]+$/.test(w)) // keep alphabetic single words
        .map(w => w.charAt(0).toUpperCase() + w.slice(1));
        
      if (words.length > 100) {
        localStorage.setItem("aetherflow_custom_nouns", JSON.stringify(words));
        this.nounsPool = words;
        console.log(`Successfully synchronized ${words.length} nouns from raw repository!`);
      }
    } catch (err) {
      clearTimeout(timeoutId);
      console.warn("Background nouns synchronization skipped/failed:", err.message);
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
  },

  // Practice Flow Management
  startPracticeSession() {
    SoundEffects.init();
    
    // Choose starting random noun from active pool (resolved cache or default database)
    const randomIndex = Math.floor(Math.random() * this.nounsPool.length);
    const chosenWord = this.nounsPool[randomIndex];

    // Reset Practice State
    this.state.session = {
      active: true,
      promptWord: chosenWord,
      startTime: Date.now(),
      timeLeft: this.state.config.duration,
      totalDuration: this.state.config.duration
    };

    // Update Practice View elements
    document.getElementById("prompt-word").innerText = chosenWord;

    // Show Practice View
    this.showView("practice-view");
    lucide.createIcons();

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
    document.getElementById("results-prompt-word").innerText = session.promptWord;

    // Set heading text
    const titleEl = document.querySelector(".results-title");
    titleEl.innerText = "Deep Focus!";

    lucide.createIcons();
    this.showView("results-view");
  }
};

document.addEventListener("DOMContentLoaded", () => {
  App.init();
});
