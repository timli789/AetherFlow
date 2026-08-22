import SwiftUI

// 1. Curated Noun Vocabulary Database
struct NounDatabase {
    static let nouns = [
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
    ]
}

// 2. Main App View Routing Structure
enum AppView {
    case setup
    case practice
    case results
}

struct AetherFlowLiteView: View {
    // Styling constants matching website dark mode
    let bgGradient = RadialGradient(
        colors: [Color(red: 22/255, green: 25/255, blue: 50/255), Color(red: 8/255, green: 9/255, blue: 19/255)],
        center: .center, startRadius: 10, endRadius: 500
    )
    let violetAccent = Color(red: 139/255, green: 92/255, blue: 246/255)
    let cyanAccent = Color(red: 6/255, green: 182/255, blue: 212/255)
    
    // Core State variables
    @State private var currentView: AppView = .setup
    @State private var selectedDuration: Int = 15
    @State private var promptsPracticed: [String] = []
    @State private var currentPrompt: String = ""
    @State private var timeLeft: Int = 15
    
    // Timer subscription
    @State private var timerSubscription: Timer.TimerPublisher = Timer.publish(every: 1.0, on: .main, in: .common)
    @State private var activeTimer: Any? = nil
    
    var body: some View {
        ZStack {
            // Dark Background
            bgGradient
                .ignoresSafeArea()
            
            // Background Ambient lights
            VStack {
                HStack {
                    Circle().fill(violetAccent).opacity(0.12).frame(width: 250, height: 250).blur(radius: 60).offset(x: -80, y: -80)
                    Spacer()
                }
                Spacer()
                HStack {
                    Spacer()
                    Circle().fill(cyanAccent).opacity(0.12).frame(width: 300, height: 300).blur(radius: 80).offset(x: 100, y: 100)
                }
            }
            .ignoresSafeArea()
            
            // View Selection
            switch currentView {
            case .setup:
                setupView
                    .transition(.asymmetric(insertion: .move(edge: .leading), removal: .move(edge: .trailing)))
            case .practice:
                practiceView
                    .transition(.scale(scale: 0.95).combined(with: .opacity))
            case .results:
                resultsView
                    .transition(.asymmetric(insertion: .move(edge: .trailing), removal: .move(edge: .leading)))
            }
        }
        .animation(.spring(response: 0.4, dampingFraction: 0.82), value: currentView)
        .preferredColorScheme(.dark)
    }
    
    // ----------------------------------------------------
    // MARK: - Setup (Dashboard) Screen
    // ----------------------------------------------------
    private var setupView: some View {
        VStack(spacing: 32) {
            // Header Logo
            VStack(spacing: 8) {
                Image(systemName: "brain.headlight.fill")
                    .font(.system(size: 60))
                    .foregroundStyle(LinearGradient(colors: [violetAccent, cyanAccent], startPoint: .topLeading, endPoint: .bottomTrailing))
                    .padding()
                
                Text("AetherFlow")
                    .font(.system(.largeTitle, design: .rounded))
                    .fontWeight(.bold)
                    .foregroundStyle(.white)
                
                Text("Mental Free Association Studio")
                    .font(.subheadline)
                    .foregroundStyle(.secondary)
                    .tracking(0.5)
            }
            .padding(.top, 40)
            
            Spacer()
            
            // Configuration Card
            VStack(spacing: 24) {
                Text("SELECT PRACTICE TIME")
                    .font(.caption)
                    .fontWeight(.bold)
                    .foregroundStyle(.secondary)
                    .tracking(1.5)
                
                // Duration Selection Grid
                HStack(spacing: 10) {
                    ForEach([10, 15, 20, 25, 30], id: \.self) { duration in
                        Button(action: {
                            triggerHaptic(style: .light)
                            selectedDuration = duration
                        }) {
                            Text("\(duration)s")
                                .font(.system(.body, design: .rounded))
                                .fontWeight(.semibold)
                                .foregroundStyle(selectedDuration == duration ? cyanAccent : .secondary)
                                .frame(maxWidth: .infinity)
                                .padding(.vertical, 12)
                                .background(selectedDuration == duration ? Color.white.opacity(0.06) : Color.clear)
                                .cornerRadius(8)
                                .overlay(
                                    RoundedRectangle(cornerRadius: 8)
                                        .stroke(selectedDuration == duration ? cyanAccent.opacity(0.3) : Color.white.opacity(0.06), lineWidth: 1)
                                )
                        }
                    }
                }
                .padding(6)
                .background(Color.white.opacity(0.03))
                .cornerRadius(12)
                .overlay(
                    RoundedRectangle(cornerRadius: 12)
                        .stroke(Color.white.opacity(0.04), lineWidth: 1)
                )
            }
            .padding(28)
            .background(Color.white.opacity(0.02))
            .cornerRadius(24)
            .overlay(
                RoundedRectangle(cornerRadius: 24)
                    .stroke(Color.white.opacity(0.06), lineWidth: 1)
            )
            .padding(.horizontal, 24)
            
            Spacer()
            
            // Begin Button
            Button(action: startPractice) {
                HStack {
                    Text("Begin Session")
                    Image(systemName: "play.circle.fill")
                }
                .font(.system(.title3, design: .rounded))
                .fontWeight(.bold)
                .foregroundStyle(.white)
                .frame(maxWidth: .infinity)
                .padding(.vertical, 16)
                .background(LinearGradient(colors: [violetAccent, violetAccent.opacity(0.8)], startPoint: .topLeading, endPoint: .bottomTrailing))
                .cornerRadius(16)
                .shadow(color: violetAccent.opacity(0.3), radius: 10, y: 4)
            }
            .padding(.horizontal, 24)
            .padding(.bottom, 40)
        }
    }
    
    // ----------------------------------------------------
    // MARK: - Practice Screen
    // ----------------------------------------------------
    private var practiceView: some View {
        VStack(spacing: 0) {
            // Header stats & close
            HStack {
                Button(action: abortPractice) {
                    Image(systemName: "xmark")
                        .font(.title2)
                        .foregroundStyle(.secondary)
                        .frame(width: 44, height: 44)
                        .background(Color.white.opacity(0.04))
                        .clipShape(Circle())
                }
                
                Spacer()
                
                // Prompts Count badge
                HStack(spacing: 6) {
                    Image(systemName: "shuffle")
                    Text("\(promptsPracticed.count)")
                }
                .font(.system(.headline, design: .rounded))
                .foregroundStyle(.white)
                .padding(.vertical, 8)
                .padding(.horizontal, 14)
                .background(Color.white.opacity(0.04))
                .cornerRadius(20)
                .overlay(
                    RoundedRectangle(cornerRadius: 20)
                        .stroke(Color.white.opacity(0.06), lineWidth: 1)
                )
            }
            .padding(.horizontal, 24)
            .padding(.top, 16)
            
            Spacer()
            
            // Centered Timer & Word Panel
            VStack(spacing: 48) {
                // Countdown ring
                ZStack {
                    Circle()
                        .stroke(Color.white.opacity(0.04), lineWidth: 6)
                        .frame(width: 100, height: 100)
                    
                    Circle()
                        .trim(from: 0.0, to: CGFloat(timeLeft) / CGFloat(selectedDuration))
                        .stroke(violetAccent, style: StrokeStyle(lineWidth: 6, lineCap: .round))
                        .frame(width: 100, height: 100)
                        .rotationEffect(.degrees(-90))
                        .animation(.linear(duration: 1.0), value: timeLeft)
                    
                    Text("\(timeLeft)")
                        .font(.system(size: 28, weight: .bold, design: .rounded))
                        .foregroundStyle(.white)
                }
                
                // Prompt Text
                VStack(spacing: 12) {
                    Text("ASSOCIATE IN YOUR MIND FROM")
                        .font(.caption2)
                        .fontWeight(.bold)
                        .foregroundStyle(.secondary)
                        .tracking(1.5)
                    
                    Text(currentPrompt)
                        .font(.system(size: 46, weight: .black, design: .rounded))
                        .foregroundStyle(.white)
                        .multilineTextAlignment(.center)
                        .padding(.horizontal)
                        .id(currentPrompt) // force transition animation on text change!
                        .transition(.scale(scale: 0.9).combined(with: .opacity))
                }
                .frame(minHeight: 120)
            }
            
            Spacer()
            
            // Next Word Action Button
            Button(action: nextPrompt) {
                HStack {
                    Text("New Noun")
                    Image(systemName: "chevron.right")
                }
                .font(.system(.title3, design: .rounded))
                .fontWeight(.bold)
                .foregroundStyle(.white)
                .frame(maxWidth: .infinity)
                .padding(.vertical, 18)
                .background(Color.white.opacity(0.05))
                .cornerRadius(20)
                .overlay(
                    RoundedRectangle(cornerRadius: 20)
                        .stroke(Color.white.opacity(0.08), lineWidth: 1)
                )
            }
            .padding(.horizontal, 24)
            .padding(.bottom, 48)
        }
        .onReceive(timerSubscription) { _ in
            if timeLeft > 1 {
                timeLeft -= 1
                if timeLeft <= 3 {
                    // Play short alert tick haptic
                    triggerHaptic(style: .light)
                }
            } else {
                finishPractice()
            }
        }
    }
    
    // ----------------------------------------------------
    // MARK: - Results Screen
    // ----------------------------------------------------
    private var resultsView: some View {
        VStack(spacing: 24) {
            // Header summary card
            VStack(spacing: 16) {
                HStack(spacing: 6) {
                    Image(systemName: "brain")
                    Text("Session Complete")
                }
                .font(.caption)
                .fontWeight(.bold)
                .foregroundStyle(cyanAccent)
                .padding(.vertical, 6)
                .padding(.horizontal, 12)
                .background(cyanAccent.opacity(0.12))
                .cornerRadius(20)
                
                Text(promptsPracticed.count <= 1 ? "Deep Focus!" : "Flow Complete!")
                    .font(.system(.title, design: .rounded))
                    .fontWeight(.bold)
                    .foregroundStyle(.white)
                
                // Mini Score grid
                HStack(spacing: 40) {
                    VStack(spacing: 4) {
                        Text("\(selectedDuration)s")
                            .font(.system(.title3, design: .rounded))
                            .fontWeight(.bold)
                            .foregroundStyle(.white)
                        Text("Practice Time")
                            .font(.caption)
                            .foregroundStyle(.secondary)
                    }
                    
                    VStack(spacing: 4) {
                        Text("\(promptsPracticed.count)")
                            .font(.system(.title3, design: .rounded))
                            .fontWeight(.bold)
                            .foregroundStyle(.white)
                        Text("Nouns Explored")
                            .font(.caption)
                            .foregroundStyle(.secondary)
                    }
                }
                .padding(.top, 8)
            }
            .padding(28)
            .frame(maxWidth: .infinity)
            .background(Color.white.opacity(0.02))
            .cornerRadius(24)
            .overlay(
                RoundedRectangle(cornerRadius: 24)
                    .stroke(Color.white.opacity(0.06), lineWidth: 1)
            )
            .padding(.horizontal, 24)
            .padding(.top, 40)
            
            // List breakdown
            VStack(alignment: .leading, spacing: 16) {
                Text("PROMPTS EXPLORED")
                    .font(.caption)
                    .fontWeight(.bold)
                    .foregroundStyle(.secondary)
                    .tracking(1.5)
                    .padding(.horizontal, 8)
                
                // Scrollable node pathway
                ScrollView(.vertical, showsIndicators: true) {
                    VStack(alignment: .leading, spacing: 12) {
                        ForEach(Array(promptsPracticed.enumerated()), id: \.offset) { index, word in
                            HStack(spacing: 12) {
                                Circle()
                                    .fill(index == 0 ? violetAccent : cyanAccent)
                                    .frame(width: 8, height: 8)
                                
                                Text(word)
                                    .font(.system(.body, design: .rounded))
                                    .fontWeight(.medium)
                                    .foregroundStyle(index == 0 ? .white : .secondary)
                                
                                Spacer()
                                
                                if index == 0 {
                                    Text("START")
                                        .font(.system(size: 9, weight: .bold))
                                        .foregroundStyle(violetAccent)
                                        .padding(.horizontal, 6)
                                        .padding(.vertical, 2)
                                        .background(violetAccent.opacity(0.12))
                                        .cornerRadius(4)
                                }
                            }
                            .padding(.vertical, 10)
                            .padding(.horizontal, 16)
                            .background(Color.white.opacity(0.02))
                            .cornerRadius(10)
                        }
                    }
                }
            }
            .padding(24)
            .frame(maxWidth: .infinity)
            .background(Color.white.opacity(0.02))
            .cornerRadius(24)
            .overlay(
                RoundedRectangle(cornerRadius: 24)
                    .stroke(Color.white.opacity(0.06), lineWidth: 1)
            )
            .padding(.horizontal, 24)
            
            Spacer()
            
            // Actions
            VStack(spacing: 12) {
                Button(action: startPractice) {
                    HStack {
                        Image(systemName: "arrow.clockwise")
                        Text("Practice Again")
                    }
                    .font(.system(.body, design: .rounded))
                    .fontWeight(.bold)
                    .foregroundStyle(.white)
                    .frame(maxWidth: .infinity)
                    .padding(.vertical, 16)
                    .background(LinearGradient(colors: [violetAccent, violetAccent.opacity(0.85)], startPoint: .topLeading, endPoint: .bottomTrailing))
                    .cornerRadius(16)
                }
                
                Button(action: {
                    triggerHaptic(style: .light)
                    currentView = .setup
                }) {
                    HStack {
                        Image(systemName: "house")
                        Text("Back to Setup")
                    }
                    .font(.system(.body, design: .rounded))
                    .fontWeight(.bold)
                    .foregroundStyle(.white)
                    .frame(maxWidth: .infinity)
                    .padding(.vertical, 16)
                    .background(Color.white.opacity(0.04))
                    .cornerRadius(16)
                    .overlay(
                        RoundedRectangle(cornerRadius: 16)
                            .stroke(Color.white.opacity(0.08), lineWidth: 1)
                    )
                }
            }
            .padding(.horizontal, 24)
            .padding(.bottom, 40)
        }
    }
    
    // ----------------------------------------------------
    // MARK: - Logic Helper Methods
    // ----------------------------------------------------
    private func startPractice() {
        triggerHaptic(style: .medium)
        
        // Pick first prompt noun
        currentPrompt = NounDatabase.nouns.randomElement() ?? "Silence"
        promptsPracticed = [currentPrompt]
        timeLeft = selectedDuration
        
        currentView = .practice
        
        // Start timers
        self.timerSubscription = Timer.publish(every: 1.0, on: .main, in: .common)
        self.activeTimer = self.timerSubscription.connect()
    }
    
    private func nextPrompt() {
        triggerHaptic(style: .medium)
        
        var nextWord = ""
        repeat {
            nextWord = NounDatabase.nouns.randomElement() ?? "Silence"
        } while nextWord == currentPrompt && NounDatabase.nouns.count > 1
        
        currentPrompt = nextWord
        promptsPracticed.append(nextWord)
    }
    
    private func abortPractice() {
        triggerHaptic(style: .heavy)
        stopTimer()
        currentView = .setup
    }
    
    private func finishPractice() {
        triggerHaptic(style: .success)
        stopTimer()
        currentView = .results
    }
    
    private func stopTimer() {
        if let timer = activeTimer as? Cancellable {
            timer.cancel()
        }
        activeTimer = nil
    }
    
    private func triggerHaptic(style: UINotificationFeedbackGenerator.FeedbackType) {
        let generator = UINotificationFeedbackGenerator()
        generator.notificationOccurred(style)
    }
    
    private func triggerHaptic(style: UIImpactFeedbackGenerator.FeedbackStyle) {
        let generator = UIImpactFeedbackGenerator(style: style)
        generator.prepare()
        generator.impactOccurred()
    }
}

// SwiftUI Preview provider
#Preview {
    AetherFlowLiteView()
}
