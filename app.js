// AetherFlow - Free Association Logic

// 1. Curated Nouns Database (~200 evocative words)
const NOUNS_DATABASE = [
  // Concrete Nouns
  { word: "Telescope", category: "concrete" },
  { word: "Lighthouse", category: "concrete" },
  { word: "Mirror", category: "concrete" },
  { word: "Anchor", category: "concrete" },
  { word: "Compass", category: "concrete" },
  { word: "Violin", category: "concrete" },
  { word: "Lantern", category: "concrete" },
  { word: "Hourglass", category: "concrete" },
  { word: "Key", category: "concrete" },
  { word: "Bridge", category: "concrete" },
  { word: "Feather", category: "concrete" },
  { word: "Clock", category: "concrete" },
  { word: "Bicycle", category: "concrete" },
  { word: "Camera", category: "concrete" },
  { word: "Backpack", category: "concrete" },
  { word: "Fossil", category: "concrete" },
  { word: "Sculpture", category: "concrete" },
  { word: "Needle", category: "concrete" },
  { word: "Microscope", category: "concrete" },
  { word: "Bell", category: "concrete" },
  { word: "Candelabra", category: "concrete" },
  { word: "Map", category: "concrete" },
  { word: "Helmet", category: "concrete" },
  { word: "Sundial", category: "concrete" },
  { word: "Puppet", category: "concrete" },
  { word: "Window", category: "concrete" },
  { word: "Coin", category: "concrete" },
  { word: "Castle", category: "concrete" },
  { word: "Sailboat", category: "concrete" },
  { word: "Hammer", category: "concrete" },
  { word: "Mask", category: "concrete" },
  { word: "Chessboard", category: "concrete" },
  { word: "Cradle", category: "concrete" },
  { word: "Tombstone", category: "concrete" },
  { word: "Sword", category: "concrete" },
  { word: "Loom", category: "concrete" },
  { word: "Teacup", category: "concrete" },
  { word: "Bookcase", category: "concrete" },
  { word: "Flask", category: "concrete" },
  { word: "Saddle", category: "concrete" },
  { word: "Chime", category: "concrete" },
  { word: "Anchor", category: "concrete" },
  { word: "Compass", category: "concrete" },
  { word: "Cage", category: "concrete" },
  { word: "Ladder", category: "concrete" },
  { word: "Globe", category: "concrete" },
  { word: "Envelope", category: "concrete" },
  { word: "Goggles", category: "concrete" },
  { word: "Spoon", category: "concrete" },
  { word: "Thread", category: "concrete" },

  // Abstract Nouns
  { word: "Infinity", category: "abstract" },
  { word: "Paradox", category: "abstract" },
  { word: "Silence", category: "abstract" },
  { word: "Chaos", category: "abstract" },
  { word: "Justice", category: "abstract" },
  { word: "Destiny", category: "abstract" },
  { word: "Memory", category: "abstract" },
  { word: "Illusion", category: "abstract" },
  { word: "Gravity", category: "abstract" },
  { word: "Harmony", category: "abstract" },
  { word: "Echo", category: "abstract" },
  { word: "Dream", category: "abstract" },
  { word: "Shadow", category: "abstract" },
  { word: "Identity", category: "abstract" },
  { word: "Truth", category: "abstract" },
  { word: "Time", category: "abstract" },
  { word: "Freedom", category: "abstract" },
  { word: "Mystery", category: "abstract" },
  { word: "Symphony", category: "abstract" },
  { word: "Entropy", category: "abstract" },
  { word: "Solitude", category: "abstract" },
  { word: "Sovereignty", category: "abstract" },
  { word: "Decay", category: "abstract" },
  { word: "Rhythm", category: "abstract" },
  { word: "Absence", category: "abstract" },
  { word: "Presence", category: "abstract" },
  { word: "Origin", category: "abstract" },
  { word: "Metaphor", category: "abstract" },
  { word: "Legacy", category: "abstract" },
  { word: "Void", category: "abstract" },
  { word: "Wisdom", category: "abstract" },
  { word: "Ignorance", category: "abstract" },
  { word: "Guilt", category: "abstract" },
  { word: "Honesty", category: "abstract" },
  { word: "Mercy", category: "abstract" },
  { word: "Power", category: "abstract" },
  { word: "Belief", category: "abstract" },
  { word: "Doubt", category: "abstract" },
  { word: "Grief", category: "abstract" },
  { word: "Rumor", category: "abstract" },
  { word: "Destiny", category: "abstract" },
  { word: "Clarity", category: "abstract" },
  { word: "Distortion", category: "abstract" },
  { word: "Velocity", category: "abstract" },
  { word: "Decorum", category: "abstract" },
  { word: "Alliance", category: "abstract" },
  { word: "Friction", category: "abstract" },
  { word: "Balance", category: "abstract" },
  { word: "Force", category: "abstract" },
  { word: "Miracle", category: "abstract" },

  // Nature Nouns
  { word: "Volcano", category: "nature" },
  { word: "Glacier", category: "nature" },
  { word: "Oasis", category: "nature" },
  { word: "Thunder", category: "nature" },
  { word: "Nebula", category: "nature" },
  { word: "Comet", category: "nature" },
  { word: "Ocean", category: "nature" },
  { word: "Forest", category: "nature" },
  { word: "Desert", category: "nature" },
  { word: "River", category: "nature" },
  { word: "Meadow", category: "nature" },
  { word: "Eclipse", category: "nature" },
  { word: "Sequoia", category: "nature" },
  { word: "Orchid", category: "nature" },
  { word: "Breeze", category: "nature" },
  { word: "Canyon", category: "nature" },
  { word: "Avalanche", category: "nature" },
  { word: "Coral", category: "nature" },
  { word: "Waterfall", category: "nature" },
  { word: "Meteor", category: "nature" },
  { word: "Tornado", category: "nature" },
  { word: "Island", category: "nature" },
  { word: "Cave", category: "nature" },
  { word: "Wave", category: "nature" },
  { word: "Cloud", category: "nature" },
  { word: "Crystal", category: "nature" },
  { word: "Hurricane", category: "nature" },
  { word: "Mountain", category: "nature" },
  { word: "Geyser", category: "nature" },
  { word: "Swamp", category: "nature" },
  { word: "Tundra", category: "nature" },
  { word: "Dune", category: "nature" },
  { word: "Pebble", category: "nature" },
  { word: "Ivy", category: "nature" },
  { word: "Moss", category: "nature" },
  { word: "Cactus", category: "nature" },
  { word: "Galaxy", category: "nature" },
  { word: "Eclipse", category: "nature" },
  { word: "Seed", category: "nature" },
  { word: "Root", category: "nature" },
  { word: "Flame", category: "nature" },
  { word: "Frost", category: "nature" },
  { word: "Dew", category: "nature" },
  { word: "Mist", category: "nature" },
  { word: "Whirlpool", category: "nature" },
  { word: "Ridge", category: "nature" },
  { word: "Star", category: "nature" },
  { word: "Petal", category: "nature" },
  { word: "Shell", category: "nature" },
  { word: "Sprout", category: "nature" }
];

// Audio Synthesizer using Web Audio API
const SoundEffects = {
  ctx: null,
  
  init() {
    if (!this.ctx) {
      this.ctx = new (window.AudioContext || window.webkitAudioContext)();
    }
    // resume context if suspended (browser security policy)
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
    osc.frequency.setValueAtTime(440, this.ctx.currentTime); // A4
    osc.frequency.exponentialRampToValueAtTime(880, this.ctx.currentTime + 0.08); // slide up
    
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
    
    // Play a gentle major chord triad (C5 - E5 - G5)
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
      duration: 30, // in seconds, or "infinite"
      category: "all"
    },
    session: {
      active: false,
      promptWord: null,
      promptCategory: null,
      associations: [], // array of { word, latencySec }
      startTime: null,
      wordStartTime: null,
      timeLeft: 30,
      totalDuration: 30
    },
    history: []
  },

  init() {
    this.loadHistory();
    this.bindEvents();
    this.updateDashboardStats();
    this.renderHistoryList();
    
    // Set theme based on system/saved preference
    const savedTheme = localStorage.getItem("theme") || "dark";
    if (savedTheme === "light") {
      document.body.classList.add("light-mode");
      const sunIcon = document.querySelector("#theme-toggle-btn i");
      if (sunIcon) sunIcon.setAttribute("data-lucide", "moon");
    }
    
    // Initialize Lucide icons
    lucide.createIcons();
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
    // Theme Toggle
    document.getElementById("theme-toggle-btn").addEventListener("click", () => {
      document.body.classList.toggle("light-mode");
      const isLight = document.body.classList.contains("light-mode");
      localStorage.setItem("theme", isLight ? "light" : "dark");
      
      const themeBtn = document.getElementById("theme-toggle-btn");
      themeBtn.innerHTML = isLight ? '<i data-lucide="moon"></i>' : '<i data-lucide="sun"></i>';
      lucide.createIcons();
    });

    // Duration buttons select
    const durationBtns = document.querySelectorAll(".duration-btn");
    durationBtns.forEach(btn => {
      btn.addEventListener("click", (e) => {
        // Handle click on button or icon inside button
        const targetBtn = e.target.closest(".duration-btn");
        durationBtns.forEach(b => b.classList.remove("active"));
        targetBtn.classList.add("active");
        
        const val = targetBtn.getAttribute("data-value");
        document.getElementById("duration-input").value = val;
        this.state.config.duration = val === "infinite" ? "infinite" : parseInt(val, 10);
      });
    });

    // Category Selector
    const configForm = document.getElementById("config-form");
    configForm.addEventListener("submit", (e) => {
      e.preventDefault();
      
      const category = document.querySelector('input[name="category"]:checked').value;
      const durationVal = document.getElementById("duration-input").value;
      
      this.state.config.category = category;
      this.state.config.duration = durationVal === "infinite" ? "infinite" : parseInt(durationVal, 10);
      
      this.startPracticeSession();
    });

    // Association Input Submissions
    const input = document.getElementById("association-input");
    const submitBtn = document.getElementById("submit-word-btn");

    const handleWordSubmit = () => {
      const val = input.value.trim();
      if (val) {
        this.submitAssociation(val);
        input.value = "";
      }
      input.focus();
    };

    input.addEventListener("keydown", (e) => {
      // Space or Enter key submits the word
      if (e.key === " " || e.key === "Enter") {
        e.preventDefault();
        handleWordSubmit();
      }
    });

    submitBtn.addEventListener("click", handleWordSubmit);

    // Abort Practice
    document.getElementById("abort-practice-btn").addEventListener("click", () => {
      this.endPracticeSession(true); // end session prematurely without saving
    });

    // Results Actions
    document.getElementById("retry-btn").addEventListener("click", () => {
      this.startPracticeSession();
    });

    document.getElementById("dashboard-btn").addEventListener("click", () => {
      this.showView("dashboard-view");
      this.updateDashboardStats();
      this.renderHistoryList();
    });

    // Clear history
    document.getElementById("clear-history-btn").addEventListener("click", () => {
      if (confirm("Are you sure you want to clear your entire practice history?")) {
        this.state.history = [];
        this.saveHistory();
        this.updateDashboardStats();
        this.renderHistoryList();
      }
    });

    // Canvas Auto Resize
    window.addEventListener("resize", () => {
      if (this.state.currentView === "results-view") {
        this.drawAssociationCloud();
      }
    });
  },

  // Local Storage & Stats calculation
  loadHistory() {
    try {
      const stored = localStorage.getItem("aetherflow_history");
      this.state.history = stored ? JSON.parse(stored) : [];
    } catch (e) {
      console.error("Could not load history from localStorage:", e);
      this.state.history = [];
    }
  },

  saveHistory() {
    try {
      localStorage.setItem("aetherflow_history", JSON.stringify(this.state.history));
    } catch (e) {
      console.error("Could not save history to localStorage:", e);
    }
  },

  updateDashboardStats() {
    const history = this.state.history;
    const totalSessions = history.length;
    
    let totalWords = 0;
    let wpmSum = 0;
    
    history.forEach(session => {
      totalWords += session.wordCount;
      wpmSum += session.wpm;
    });

    const avgWpm = totalSessions > 0 ? Math.round(wpmSum / totalSessions) : 0;
    const streak = this.calculateStreak();

    document.getElementById("stat-total-sessions").innerText = totalSessions;
    document.getElementById("stat-total-words").innerText = totalWords;
    document.getElementById("stat-avg-wpm").innerText = avgWpm;
    document.getElementById("stat-streak").innerText = streak;

    // Show/hide Clear History button
    const clearBtn = document.getElementById("clear-history-btn");
    if (totalSessions > 0) {
      clearBtn.classList.remove("hidden");
    } else {
      clearBtn.classList.add("hidden");
    }
  },

  calculateStreak() {
    if (this.state.history.length === 0) return 0;
    
    // Gather all unique date strings (YYYY-MM-DD) in local timezone
    const dates = this.state.history.map(s => {
      const date = new Date(s.timestamp);
      return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
    });
    
    const uniqueDates = [...new Set(dates)].sort().reverse();
    
    if (uniqueDates.length === 0) return 0;

    const todayStr = this.getLocalDateString(new Date());
    const yesterdayStr = this.getLocalDateString(new Date(Date.now() - 86400000));
    
    // If the latest practice is not today or yesterday, streak is broken
    if (uniqueDates[0] !== todayStr && uniqueDates[0] !== yesterdayStr) {
      return 0;
    }

    let streak = 1;
    for (let i = 0; i < uniqueDates.length - 1; i++) {
      const current = new Date(uniqueDates[i]);
      const next = new Date(uniqueDates[i+1]);
      const diffTime = Math.abs(current - next);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      if (diffDays === 1) {
        streak++;
      } else if (diffDays > 1) {
        break; // gap found, break streak
      }
    }
    return streak;
  },

  getLocalDateString(date) {
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
  },

  renderHistoryList() {
    const list = document.getElementById("history-list");
    const emptyState = document.getElementById("history-empty");
    list.innerHTML = "";
    
    if (this.state.history.length === 0) {
      emptyState.classList.remove("hidden");
      return;
    } else {
      emptyState.classList.add("hidden");
    }

    // Show recent 10 sessions
    const recent = this.state.history.slice(-10).reverse();
    
    recent.forEach((session, index) => {
      const li = document.createElement("li");
      li.className = "history-item";
      
      const date = new Date(session.timestamp);
      const formattedDate = date.toLocaleDateString(undefined, { 
        month: 'short', 
        day: 'numeric', 
        hour: '2-digit', 
        minute: '2-digit' 
      });

      li.innerHTML = `
        <div class="history-main-info">
          <span class="history-prompt">“${session.promptWord}”</span>
          <span class="history-date">${formattedDate}</span>
        </div>
        <div class="history-stats">
          <span class="history-stat-badge">${session.wordCount} words</span>
          <span class="history-stat-badge" style="color:var(--color-primary);">${session.wpm} WPM</span>
          <i data-lucide="chevron-right" style="width:16px; height:16px; color:var(--text-muted);"></i>
        </div>
      `;

      // Allow clicking a history item to review results!
      li.addEventListener("click", () => {
        this.displaySessionResults(session, false); // display session, don't save again
      });

      list.appendChild(li);
    });

    lucide.createIcons();
  },

  // Practice Flow Management
  startPracticeSession() {
    SoundEffects.init();
    
    // Choose starting noun word
    let wordList = NOUNS_DATABASE;
    if (this.state.config.category !== "all") {
      wordList = NOUNS_DATABASE.filter(n => n.category === this.state.config.category);
    }
    
    const randomIndex = Math.floor(Math.random() * wordList.length);
    const chosen = wordList[randomIndex];

    // Reset Practice State
    this.state.session = {
      active: true,
      promptWord: chosen.word,
      promptCategory: chosen.category,
      associations: [],
      startTime: Date.now(),
      wordStartTime: Date.now(),
      timeLeft: this.state.config.duration === "infinite" ? 9999 : this.state.config.duration,
      totalDuration: this.state.config.duration
    };

    // Update Practice View elements
    document.getElementById("prompt-word").innerText = chosen.word;
    document.getElementById("prompt-category-name").innerText = chosen.category.charAt(0).toUpperCase() + chosen.category.slice(1);
    
    // Update SVG icon for category
    const categoryIcons = {
      concrete: "box",
      abstract: "feather",
      nature: "compass"
    };
    const badgeIcon = document.querySelector("#prompt-category-badge i") || document.querySelector("#prompt-category-badge svg");
    if (badgeIcon) {
      badgeIcon.setAttribute("data-lucide", categoryIcons[chosen.category] || "tag");
    }
    
    document.getElementById("live-word-count").innerText = "0";
    
    // Clean feed
    const feed = document.getElementById("association-feed");
    feed.innerHTML = '<div class="feed-placeholder">Type your first association below and press Enter...</div>';

    // Show Practice View
    this.showView("practice-view");
    lucide.createIcons();

    // Focus input
    const input = document.getElementById("association-input");
    input.value = "";
    setTimeout(() => input.focus(), 250);

    // Setup Timer
    this.updateTimerDisplay();
    clearInterval(this.timerInterval);
    
    if (this.state.config.duration !== "infinite") {
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
    } else {
      // Infinite Mode
      document.getElementById("timer-text").innerHTML = `<i data-lucide="infinity" style="width:20px; height:20px;"></i>`;
      lucide.createIcons();
    }
  },

  updateTimerDisplay() {
    const textEl = document.getElementById("timer-text");
    const progressRing = document.getElementById("timer-ring-progress");
    
    if (this.state.session.totalDuration === "infinite") {
      return;
    }
    
    textEl.innerText = this.state.session.timeLeft;

    // Calculate stroke offset
    const circumference = 226; // 2 * pi * r
    const percentLeft = this.state.session.timeLeft / this.state.session.totalDuration;
    const offset = circumference - (percentLeft * circumference);
    progressRing.style.strokeDashoffset = offset;
  },

  submitAssociation(word) {
    if (!this.state.session.active) return;

    // Sanitization: clean spacing and check uniqueness for this session
    const cleanedWord = word.trim();
    if (!cleanedWord) return;

    // Play tactile sound
    SoundEffects.playSubmit();

    const now = Date.now();
    const latencyMs = now - this.state.session.wordStartTime;
    const latencySec = (latencyMs / 1000).toFixed(2);
    
    // Save to state
    this.state.session.associations.push({
      word: cleanedWord,
      latencySec: parseFloat(latencySec)
    });

    // Reset current word start timestamp for next word
    this.state.session.wordStartTime = now;

    // Clear feed placeholder if it exists
    const feed = document.getElementById("association-feed");
    const placeholder = feed.querySelector(".feed-placeholder");
    if (placeholder) {
      feed.removeChild(placeholder);
    }

    // Add to Feed UI
    const wordBubble = document.createElement("div");
    wordBubble.className = "feed-word";
    wordBubble.innerHTML = `
      <span>${cleanedWord}</span>
      <span class="feed-word-speed">${latencySec}s</span>
    `;
    feed.appendChild(wordBubble);

    // Auto-scroll feed to bottom
    const container = document.getElementById("association-feed-container");
    container.scrollTop = container.scrollHeight;

    // Update live word count badge
    document.getElementById("live-word-count").innerText = this.state.session.associations.length;

    // Spawn floating word particle effect
    this.spawnWordParticle(cleanedWord);
  },

  spawnWordParticle(word) {
    const inputField = document.getElementById("association-input");
    const rect = inputField.getBoundingClientRect();
    
    const particle = document.createElement("div");
    particle.className = "floating-word-particle";
    particle.innerText = word;
    
    // Place particle centered above the input bar
    particle.style.left = `${rect.left + rect.width / 2}px`;
    particle.style.top = `${rect.top - 10 + window.scrollY}px`;
    
    document.body.appendChild(particle);

    // Clean up particle after animation finishes
    setTimeout(() => {
      if (particle.parentNode) {
        particle.parentNode.removeChild(particle);
      }
    }, 1200);
  },

  endPracticeSession(isAborted = false) {
    this.state.session.active = false;
    clearInterval(this.timerInterval);

    if (isAborted) {
      this.showView("dashboard-view");
      this.updateDashboardStats();
      this.renderHistoryList();
      return;
    }

    // Sound alert
    SoundEffects.playComplete();

    // Calculate final metrics
    const associationsCount = this.state.session.associations.length;
    const durationUsed = this.state.session.totalDuration === "infinite" 
      ? Math.round((Date.now() - this.state.session.startTime) / 1000)
      : this.state.session.totalDuration;
      
    const wpm = durationUsed > 0 ? Math.round((associationsCount / durationUsed) * 60) : 0;
    
    let totalLatency = 0;
    this.state.session.associations.forEach(a => totalLatency += a.latencySec);
    const avgLatency = associationsCount > 0 ? (totalLatency / associationsCount).toFixed(2) : "0.0";

    const sessionRecord = {
      id: "session_" + Date.now(),
      promptWord: this.state.session.promptWord,
      promptCategory: this.state.session.promptCategory,
      associations: this.state.session.associations,
      wordCount: associationsCount,
      duration: durationUsed,
      wpm: wpm,
      avgLatency: avgLatency,
      timestamp: Date.now()
    };

    // Save to history
    this.state.history.push(sessionRecord);
    this.saveHistory();

    // Display Results screen
    this.displaySessionResults(sessionRecord, true);
  },

  displaySessionResults(session, isNew = false) {
    // Update summary card text
    document.getElementById("results-word-count").innerText = session.wordCount;
    document.getElementById("results-prompt-word").innerText = session.promptWord;
    document.getElementById("results-wpm").innerText = session.wpm;
    document.getElementById("results-avg-speed").innerText = session.avgLatency + "s";
    document.getElementById("results-duration").innerText = session.duration + "s";

    // Set heading text based on performance WPM
    const titleEl = document.querySelector(".results-title");
    if (session.wordCount === 0) {
      titleEl.innerText = "Quiet Mind";
    } else if (session.wpm > 45) {
      titleEl.innerText = "Superfluid Flow!";
    } else if (session.wpm > 30) {
      titleEl.innerText = "Excellent Ryhthm!";
    } else {
      titleEl.innerText = "Steady Connection!";
    }

    // Render chronological pathways
    const pathway = document.getElementById("pathway-flow");
    pathway.innerHTML = "";

    // Start node represents the prompt word
    const startNode = document.createElement("div");
    startNode.className = "pathway-node start-node";
    startNode.innerText = session.promptWord;
    pathway.appendChild(startNode);

    session.associations.forEach(item => {
      // Draw pointing arrow
      const arrow = document.createElement("span");
      arrow.className = "node-arrow";
      arrow.innerHTML = `<i data-lucide="arrow-right"></i>`;
      pathway.appendChild(arrow);

      // Draw word node
      const node = document.createElement("div");
      node.className = "pathway-node";
      node.innerHTML = `
        <span>${item.word}</span>
        <span class="node-speed">${item.latencySec}s</span>
      `;
      pathway.appendChild(node);
    });

    lucide.createIcons();

    // Save temporary session ref on App global to redraw on screen size adjustment
    this.currentCanvasSession = session;

    this.showView("results-view");

    // Draw visual connections cloud
    setTimeout(() => {
      this.drawAssociationCloud();
    }, 100);
  },

  drawAssociationCloud() {
    const session = this.currentCanvasSession;
    if (!session) return;

    const canvas = document.getElementById("association-canvas");
    const container = canvas.parentElement;
    
    // Fit canvas to parent container sizing
    canvas.width = container.clientWidth;
    canvas.height = container.clientHeight;

    const ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const isLightMode = document.body.classList.contains("light-mode");

    // Pre-calculate positions using spiral positioning model
    // Faster responses sit closer to the center, slower associations sit further out
    const nodes = [];
    const count = session.associations.length;

    // Draw center starting prompt
    ctx.font = "bold 16px Outfit, sans-serif";
    const promptWidth = ctx.measureText(session.promptWord).width + 24;
    const promptHeight = 32;

    nodes.push({
      x: centerX,
      y: centerY,
      text: session.promptWord,
      width: promptWidth,
      height: promptHeight,
      isPrompt: true,
      color: isLightMode ? "#7c3aed" : "#a78bfa",
      textColor: "#ffffff",
      bgColor: isLightMode ? "#7c3aed" : "rgba(139, 92, 246, 0.25)",
      borderColor: isLightMode ? "#7c3aed" : "#c084fc"
    });

    // Arrange associations in a spiral outwards
    session.associations.forEach((assoc, i) => {
      // Golden ratio spiral angle distribution
      const theta = i * 2.39996 + 0.5; 
      
      // Node distance is based on response latency
      // Base radius + additional distance scaled by latency (bounded)
      const speedFactor = Math.min(Math.max(assoc.latencySec, 0.5), 5); // caps latency scale factor
      const r = 55 + (speedFactor * 32) + (i * (120 / (count || 1)));

      const x = centerX + r * Math.cos(theta);
      const y = centerY + r * Math.sin(theta);

      ctx.font = "500 13px Inter, sans-serif";
      const wordWidth = ctx.measureText(assoc.word).width + 20;
      const wordHeight = 24;

      nodes.push({
        x: x,
        y: y,
        text: assoc.word,
        width: wordWidth,
        height: wordHeight,
        isPrompt: false,
        latency: assoc.latencySec,
        color: isLightMode ? "#0f172a" : "#cbd5e1",
        textColor: isLightMode ? "#0f172a" : "#f1f3f9",
        bgColor: isLightMode ? "rgba(255,255,255,0.9)" : "rgba(22, 25, 50, 0.75)",
        borderColor: isLightMode ? "rgba(0,0,0,0.12)" : "rgba(255, 255, 255, 0.08)"
      });
    });

    // 1. Draw connection link lines
    ctx.lineWidth = 1.5;
    for (let i = 1; i < nodes.length; i++) {
      const node = nodes[i];
      const prevNode = nodes[i - 1]; // connects chronologically in order of flow!
      
      // Gradient line from previous node to this node
      const grad = ctx.createLinearGradient(prevNode.x, prevNode.y, node.x, node.y);
      if (isLightMode) {
        grad.addColorStop(0, i === 1 ? "rgba(124, 58, 237, 0.45)" : "rgba(0,0,0,0.15)");
        grad.addColorStop(1, "rgba(6, 182, 212, 0.45)");
      } else {
        grad.addColorStop(0, i === 1 ? "rgba(167, 139, 250, 0.45)" : "rgba(255,255,255,0.06)");
        grad.addColorStop(1, "rgba(6, 182, 212, 0.4)");
      }
      
      ctx.strokeStyle = grad;
      ctx.beginPath();
      ctx.moveTo(prevNode.x, prevNode.y);
      ctx.lineTo(node.x, node.y);
      ctx.stroke();

      // Connect back to prompt word subtly too
      ctx.lineWidth = 0.5;
      ctx.strokeStyle = isLightMode ? "rgba(124,58,237,0.08)" : "rgba(255,255,255,0.03)";
      ctx.beginPath();
      ctx.moveTo(centerX, centerY);
      ctx.lineTo(node.x, node.y);
      ctx.stroke();
      ctx.lineWidth = 1.5;
    }

    // 2. Draw nodes on top
    nodes.forEach(node => {
      // Draw node capsule
      ctx.fillStyle = node.bgColor;
      ctx.strokeStyle = node.borderColor;
      ctx.beginPath();
      
      const rx = node.x - node.width / 2;
      const ry = node.y - node.height / 2;
      const radius = node.height / 2;

      // Draw rounded rectangle capsule
      ctx.roundRect ? ctx.roundRect(rx, ry, node.width, node.height, radius) : ctx.rect(rx, ry, node.width, node.height);
      ctx.fill();
      ctx.stroke();

      // Draw label text
      ctx.fillStyle = node.textColor;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      
      if (node.isPrompt) {
        ctx.font = "bold 13px Outfit, sans-serif";
        ctx.fillText(node.text.toUpperCase(), node.x, node.y + 1);
      } else {
        ctx.font = "500 12px Inter, sans-serif";
        ctx.fillText(node.text, node.x, node.y);
      }
    });
  }
};

// Initialize App when DOM Content Loaded
document.addEventListener("DOMContentLoaded", () => {
  App.init();
});
