/**
 * BISAYAHUB - Free, Open Source Bisaya Learning Platform
 * Features: Conversational AI, Gamification, Progress Tracking
 * License: MIT
 */

const BisayaHub = {
    // App State
    state: {
        currentMode: 'chat',
        user: {
            name: 'Learner',
            level: 1,
            xp: 0,
            streak: 0,
            wordsLearned: 0,
            lastActive: null
        },
        conversation: {
            history: [],
            context: null,
            lastTopic: null
        },
        settings: {
            theme: 'light',
            voiceEnabled: true,
            notifications: true
        }
    },

    // Vocabulary Database (starts with defaults, expands with user input)
    vocabulary: [
        { bisaya: 'maayong buntag', english: 'good morning', tagalog: 'magandang umaga', category: 'greetings', difficulty: 1, xp: 10 },
        { bisaya: 'salamat', english: 'thank you', tagalog: 'salamat', category: 'greetings', difficulty: 1, xp: 10 },
        { bisaya: 'lami', english: 'delicious', tagalog: 'masarap', category: 'food', difficulty: 1, xp: 10 },
        { bisaya: 'gihigugma', english: 'love', tagalog: 'pagmamahal', category: 'emotions', difficulty: 2, xp: 20 },
        { bisaya: 'kumusta', english: 'how are you', tagalog: 'kumusta', category: 'greetings', difficulty: 1, xp: 10 },
        { bisaya: 'kaon', english: 'eat', tagalog: 'kain', category: 'food', difficulty: 1, xp: 10 },
        { bisaya: 'tulog', english: 'sleep', tagalog: 'tulog', category: 'daily', difficulty: 1, xp: 10 },
        { bisaya: 'lakaw', english: 'walk/go', tagalog: 'lakad', category: 'daily', difficulty: 1, xp: 10 },
        { bisaya: 'gwapo', english: 'handsome', tagalog: 'pogi', category: 'descriptions', difficulty: 1, xp: 10 },
        { bisaya: 'gwapa', english: 'beautiful', tagalog: 'maganda', category: 'descriptions', difficulty: 1, xp: 10 }
    ],

    // Conversational Patterns
    patterns: {
        greetings: {
            triggers: ['hello', 'hi', 'hey', 'hoy', 'oy', 'maayong', 'good morning', 'good afternoon', 'good evening'],
            responses: [
                "Hoy! Welcome sa BisayaHub! 👋 Kumusta ka? Ready ka na bang matuto?",
                "Maayong buntag! 🌅 Excited na ko na matuto ka ng Bisaya!",
                "Hey there! Ready to explore Bisaya language and culture? 🏝️"
            ]
        },
        howAreYou: {
            triggers: ['how are you', 'kumusta', 'musta', 'kamusta', 'how are you doing'],
            responses: [
                "Maayo man ko! 😊 Ikaw, kumusta? Gusto mo bang matuto ng bagong words today?",
                "Doing great! Mas excited pa ko kase may bagong learner ako! 🎉",
                "Okay raman! Ready to help you learn Bisaya! 💪"
            ]
        },
        thanks: {
            triggers: ['thank', 'salamat', 'thanks', 'salamuch'],
            responses: [
                "Walay sapayan! 😊 Sige lang, ask me anything!",
                "You're welcome! Gusto mo pa bang matuto ng iba?",
                "No problem! Tandaan mo: 'Salamat' = Thank you! 📝"
            ]
        },
        teach: {
            triggers: ['teach me', 'turuan', 'gusto ko matuto', 'i want to learn'],
            responses: [
                "Sige! Anong category ang gusto mo? 🎯\n• Greetings (hello, thank you)\n• Food (delicious, eat)\n• Emotions (love, happy)\n• Daily (sleep, walk)",
                "Game! Pwede mo rin akong turuan. Type: teach:bisaya=english\nExample: teach:lami=delicious"
            ]
        },
        food: {
            triggers: ['food', 'kaon', 'eat', 'hungry', 'gutom', 'restaurant', 'order'],
            responses: [
                "Ah, about food! 🍜 Mga common words:\n• Lami = Delicious\n• Kaon = Eat\n• Gutom = Hungry\n• Busog = Full\n\nGusto mo ng phrases for ordering?"
            ]
        },
        love: {
            triggers: ['love', 'gihigugma', 'gusto', 'like', 'crush', 'relationship'],
            responses: [
                "Ah, about love! 💕 'Gihigugma' means love in Bisaya.\n\nRomantic phrases:\n• 'Gihigugma tika' = I love you\n• 'Gwapa ka' = You're beautiful\n• 'Gwapo ka' = You're handsome\n\nCareful with these! 😄"
            ]
        },
        help: {
            triggers: ['help', 'tulong', 'what can you do', 'how to use', 'guide'],
            responses: [
                "Here's how I can help you! 📚\n\n1. **Chat mode** - Ask me anything in English or Bisaya\n2. **Learn mode** - Structured lessons by category\n3. **Practice mode** - Quizzes, flashcards, games\n4. **Culture mode** - Learn about Bisaya culture\n\nI can also:\n• Teach you new words\n• Check your pronunciation\n• Track your progress\n• Give you daily challenges!"
            ]
        }
    },

    // Initialize App
    init() {
        this.loadUserData();
        this.checkStreak();
        this.setupEventListeners();
        
        // Simulate loading
        setTimeout(() => {
            document.getElementById('loading').classList.add('hidden');
            document.getElementById('main-interface').classList.remove('hidden');
            this.showWelcome();
        }, 2000);
    },

    // Load/Save User Data
    loadUserData() {
        const saved = localStorage.getItem('bisayahub_user');
        if (saved) {
            this.state.user = JSON.parse(saved);
        }
        
        const savedVocab = localStorage.getItem('bisayahub_vocabulary');
        if (savedVocab) {
            this.vocabulary = JSON.parse(savedVocab);
        }
        
        this.updateUI();
    },

    saveUserData() {
        localStorage.setItem('bisayahub_user', JSON.stringify(this.state.user));
        localStorage.setItem('bisayahub_vocabulary', JSON.stringify(this.vocabulary));
    },

    // Check Daily Streak
    checkStreak() {
        const today = new Date().toDateString();
        const lastActive = this.state.user.lastActive;
        
        if (lastActive) {
            const lastDate = new Date(lastActive);
            const todayDate = new Date();
            const diffDays = Math.floor((todayDate - lastDate) / (1000 * 60 * 60 * 24));
            
            if (diffDays === 1) {
                // Consecutive day
                this.state.user.streak++;
                this.showNotification(`🔥 Streak: ${this.state.user.streak} days! Keep it up!`);
            } else if (diffDays > 1) {
                // Streak broken
                this.state.user.streak = 1;
                this.showNotification("Streak reset! Let's start again! 💪");
            }
        }
        
        this.state.user.lastActive = today;
        this.saveUserData();
    },

    // Conversational AI Engine
    processMessage(input) {
        const lower = input.toLowerCase().trim();
        
        // Check for teaching command
        if (lower.startsWith('teach:')) {
            return this.handleTeachCommand(input);
        }
        
        // Check for name setting
        const nameMatch = input.match(/my name is (\w+)/i) || input.match(/ako si (\w+)/i);
        if (nameMatch && !this.state.user.name !== 'Learner') {
            this.state.user.name = nameMatch[1];
            this.saveUserData();
            this.updateUI();
            return {
                type: 'success',
                message: `Nice to meet you, ${nameMatch[1]}! 👋 Tandaan ko yang pangalan mo. From now on, personalized na ang lessons mo!`
            };
        }
        
        // Match conversational patterns
        for (const [key, pattern] of Object.entries(this.patterns)) {
            if (pattern.triggers.some(t => lower.includes(t))) {
                const response = pattern.responses[Math.floor(Math.random() * pattern.responses.length)];
                return {
                    type: key,
                    message: response
                };
            }
        }
        
        // Search vocabulary
        const wordResult = this.searchVocabulary(input);
        if (wordResult.found) {
            return this.buildWordResponse(wordResult.word);
        }
        
        // Sentence analysis (multiple words)
        if (input.split(/\s+/).length > 1) {
            return this.analyzeSentence(input);
        }
        
        // Unknown - encourage teaching
        return {
            type: 'unknown',
            message: `🤔 Hindi ko pa alam ang "${input}"\n\nPwede mo akong turuan:\n**teach:${input}=english meaning**\n\nOr try asking about:\n• Greetings (hello, thank you)\n• Food words\n• Common phrases`
        };
    },

    searchVocabulary(query) {
        const lower = query.toLowerCase();
        
        for (const word of this.vocabulary) {
            if (word.bisaya.toLowerCase() === lower || 
                word.english.toLowerCase() === lower ||
                word.tagalog.toLowerCase() === lower) {
                return { found: true, word };
            }
            
            // Partial match
            if (word.bisaya.toLowerCase().includes(lower) ||
                word.english.toLowerCase().includes(lower)) {
                return { found: true, word, partial: true };
            }
        }
        
        return { found: false };
    },

    buildWordResponse(word) {
        let message = `✅ **${word.bisaya}**\n\n`;
        message += `🇬🇧 English: ${word.english}\n`;
        message += `🇵🇭 Tagalog: ${word.tagalog}\n`;
        message += `\n📂 Category: ${word.category}\n`;
        message += `⭐ Difficulty: ${'⭐'.repeat(word.difficulty)}`;
        
        // Add XP
        this.addXP(word.xp);
        
        return {
            type: 'vocabulary',
            message: message,
            word: word
        };
    },

    analyzeSentence(sentence) {
        const words = sentence.toLowerCase().split(/\s+/);
        const known = [];
        const unknown = [];
        
        for (const w of words) {
            const clean = w.replace(/[.,!?;:"()]/g, '');
            const result = this.searchVocabulary(clean);
            
            if (result.found) {
                known.push({ word: clean, match: result.word });
            } else if (clean.length > 2) {
                unknown.push(clean);
            }
        }
        
        if (known.length === 0) {
            return {
                type: 'unknown_sentence',
                message: `🤔 Hindi ko masyadong naintindihan ang sentence na yan.\n\nPwede mo akong turuan ang mga words, or try simpler phrases muna!`
            };
        }
        
        let message = `📝 **Sentence Analysis**\n\n"${sentence}"\n\n`;
        message += `✅ **Words I know:**\n`;
        known.forEach(k => {
            message += `• ${k.word} = ${k.match.english}\n`;
        });
        
        if (unknown.length > 0) {
            message += `\n❓ **Unknown:** ${unknown.join(', ')}\n`;
            message += `\nType: teach:word=meaning para matuto ako!`;
        }
        
        message += `\n\n💡 **Tip:** Practice makes perfect! Try using these words in a sentence.`;
        
        // Bonus XP for sentence analysis
        this.addXP(known.length * 5);
        
        return {
            type: 'sentence_analysis',
            message: message
        };
    },

    handleTeachCommand(input) {
        const content = input.substring(6).trim();
        const parts = content.split('=');
        
        if (parts.length < 2) {
            return {
                type: 'error',
                message: '❌ Format: teach:bisayaWord=englishMeaning\n\nExample: teach:lami=delicious\nExample: teach:gihigugma=love=pagmamahal'
            };
        }
        
        const bisaya = parts[0].trim();
        const english = parts[1].trim();
        const tagalog = parts[2] ? parts[2].trim() : '';
        
        // Check if exists
        const exists = this.vocabulary.find(w => w.bisaya.toLowerCase() === bisaya.toLowerCase());
        
        if (exists) {
            // Update
            exists.english = english;
            exists.tagalog = tagalog || exists.tagalog;
            this.saveUserData();
            
            return {
                type: 'update',
                message: `✅ Updated!\n\n**${bisaya}** = ${english}\n\nSalamat sa pag-improve! 🎉`
            };
        }
        
        // Add new
        const newWord = {
            bisaya,
            english,
            tagalog,
            category: 'user-added',
            difficulty: 1,
            xp: 15,
            addedBy: this.state.user.name,
            addedAt: new Date().toISOString()
        };
        
        this.vocabulary.push(newWord);
        this.state.user.wordsLearned++;
        this.addXP(20); // Bonus for teaching
        
        this.saveUserData();
        this.updateUI();
        
        return {
            type: 'new_word',
            message: `🎉 **New word added!**\n\n**${bisaya}**\n🇬🇧 ${english}\n${tagalog ? '🇵🇭 ' + tagalog + '\n' : ''}\n\n⭐ You earned 20 XP for teaching!\n\nTotal words in database: ${this.vocabulary.length}`
        };
    },

    // Gamification
    addXP(amount) {
        this.state.user.xp += amount;
        
        // Level up check
        const newLevel = Math.floor(this.state.user.xp / 100) + 1;
        if (newLevel > this.state.user.level) {
            this.state.user.level = newLevel;
            this.showNotification(`🎉 Level Up! You're now Level ${newLevel}!`);
        }
        
        this.saveUserData();
        this.updateUI();
    },

    // UI Updates
    updateUI() {
        document.getElementById('userName').textContent = this.state.user.name;
        document.getElementById('userLevel').textContent = `Level ${this.state.user.level} • ${this.getLevelTitle()}`;
        document.getElementById('xpValue').textContent = this.state.user.xp;
        document.getElementById('streakValue').textContent = '🔥' + this.state.user.streak;
        document.getElementById('wordsValue').textContent = this.state.user.wordsLearned;
    },

    getLevelTitle() {
        const titles = ['Beginner', 'Explorer', 'Learner', 'Speaker', 'Conversational', 'Fluent', 'Master', 'Bisaya Expert'];
        return titles[Math.min(this.state.user.level - 1, titles.length - 1)] || 'Legend';
    },

    // Chat Interface
    showWelcome() {
        const hour = new Date().getHours();
        let greeting = 'Hoy';
        if (hour < 12) greeting = 'Maayong buntag';
        else if (hour < 18) greeting = 'Maayong hapon';
        else greeting = 'Maayong gabii';
        
        const name = this.state.user.name !== 'Learner' ? `, ${this.state.user.name}` : '';
        
        this.addMessage({
            sender: 'bot',
            text: `${greeting}${name}! 👋\n\nWelcome sa **BisayaHub** - your free Bisaya learning companion!\n\n🎯 **What I can do:**\n• Teach you Bisaya words & phrases\n• Check your sentences\n• Track your progress (XP & levels)\n• Quiz you with challenges\n\n💡 **Quick start:**\n• Ask "How do I say hello?"\n• Type "teach:word=meaning" to add words\n• Try "Start a quiz" for practice\n\nAno ang gusto mong matutunan today? 🏝️`,
            type: 'welcome'
        });
    },

    addMessage(msg) {
        const container = document.getElementById('chatMessages');
        const div = document.createElement('div');
        div.className = `message ${msg.sender}`;
        
        if (msg.type === 'welcome' || msg.type === 'new_word') {
            div.classList.add('learning');
        }
        
        const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        
        div.innerHTML = `
            <div class="message-header">${msg.sender === 'bot' ? '🤖 BisayaBot' : '👤 You'} • ${time}</div>
            <div class="message-text">${msg.text.replace(/\n/g, '<br>')}</div>
        `;
        
        container.appendChild(div);
        container.scrollTop = container.scrollHeight;
    },

    sendMessage() {
        const input = document.getElementById('chatInput');
        const text = input.value.trim();
        if (!text) return;
        
        this.addMessage({ sender: 'user', text: text });
        input.value = '';
        input.disabled = true;
        
        // Show typing
        const typingDiv = document.createElement('div');
        typingDiv.className = 'message bot typing-indicator';
        typingDiv.innerHTML = '<div class="typing"><div class="typing-dot"></div><div class="typing-dot"></div><div class="typing-dot"></div></div>';
        document.getElementById('chatMessages').appendChild(typingDiv);
        
        // Process with delay (feels natural)
        setTimeout(() => {
            typingDiv.remove();
            const response = this.processMessage(text);
            this.addMessage({ sender: 'bot', text: response.message, type: response.type });
            input.disabled = false;
            input.focus();
        }, 800 + Math.random() * 600);
    },

    // Mode Switching
    setMode(mode) {
        this.state.currentMode = mode;
        
        // Update buttons
        document.querySelectorAll('.mode-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.mode === mode);
        });
        
        // Update content
        document.querySelectorAll('.mode-content').forEach(content => {
            content.classList.add('hidden');
        });
        document.getElementById(`${mode}-mode`).classList.remove('hidden');
        
        // Initialize mode
        if (mode === 'learn') this.initLearnMode();
        if (mode === 'practice') this.initPracticeMode();
    },

    initLearnMode() {
        const modules = [
            { icon: '👋', title: 'Greetings', desc: 'Hello, thank you, goodbye', progress: 0, color: '#667eea' },
            { icon: '🍜', title: 'Food & Dining', desc: 'Order food, describe taste', progress: 0, color: '#f093fb' },
            { icon: '💕', title: 'Emotions', desc: 'Express feelings', progress: 0, color: '#ff6b6b' },
            { icon: '🏠', title: 'Daily Life', desc: 'Common activities', progress: 0, color: '#48dbfb' },
            { icon: '🗺️', title: 'Travel', desc: 'Directions, transport', progress: 0, color: '#feca57' },
            { icon: '💼', title: 'Business', desc: 'Professional terms', progress: 0, color: '#5f27cd' }
        ];
        
        const grid = document.getElementById('moduleGrid');
        grid.innerHTML = modules.map(m => `
            <div class="module-card" onclick="BisayaHub.startModule('${m.title}')">
                <div class="module-icon">${m.icon}</div>
                <h3>${m.title}</h3>
                <p>${m.desc}</p>
                <div class="module-progress">
                    <div class="module-progress-bar" style="width: ${m.progress}%; background: ${m.color}"></div>
                </div>
            </div>
        `).join('');
    },

    // Quick Actions
    sendQuick(text) {
        document.getElementById('chatInput').value = text;
        this.sendMessage();
    },

    // Utilities
    showNotification(text) {
        // Simple notification - can be enhanced
        console.log('Notification:', text);
    },

    toggleTheme() {
        const current = document.documentElement.getAttribute('data-theme');
        const next = current === 'dark' ? 'light' : 'dark';
        document.documentElement.setAttribute('data-theme', next);
        this.state.settings.theme = next;
        localStorage.setItem('bisayahub_theme', next);
    },

    showStats() {
        document.getElementById('statsModal').classList.remove('hidden');
        
        const statsHTML = `
            <div class="stat-card">
                <h3>📊 Learning Statistics</h3>
                <p><strong>Level:</strong> ${this.state.user.level} (${this.getLevelTitle()})</p>
                <p><strong>Total XP:</strong> ${this.state.user.xp}</p>
                <p><strong>Words Learned:</strong> ${this.state.user.wordsLearned}</p>
                <p><strong>Current Streak:</strong> ${this.state.user.streak} days 🔥</p>
                <p><strong>Vocabulary Size:</strong> ${this.vocabulary.length} words</p>
                <p><strong>Next Level:</strong> ${100 - (this.state.user.xp % 100)} XP needed</p>
            </div>
        `;
        
        document.getElementById('statsGrid').innerHTML = statsHTML;
    },

    closeModal(id) {
        document.getElementById(id).classList.add('hidden');
    },

    setupEventListeners() {
        // Theme
        const savedTheme = localStorage.getItem('bisayahub_theme');
        if (savedTheme) {
            document.documentElement.setAttribute('data-theme', savedTheme);
        }
    }
};

// Initialize when DOM ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => BisayaHub.init());
} else {
    BisayaHub.init();
}

// Expose to window for HTML onclick handlers
window.BisayaHub = BisayaHub;
window.sendMessage = () => BisayaHub.sendMessage();
window.sendQuick = (text) => BisayaHub.sendQuick(text);
window.setMode = (mode) => BisayaHub.setMode(mode);
window.toggleTheme = () => BisayaHub.toggleTheme();
window.showStats = () => BisayaHub.showStats();
window.closeModal = (id) => BisayaHub.closeModal(id);
window.toggleVoice = function() {
    const btn = document.getElementById('voiceBtn');
    btn.classList.toggle('recording');
    if (btn.classList.toggle('recording')) {
        BisayaHub.addMessage({ sender: 'bot', text: '🎤 Voice input coming soon! For now, please type your message.' });
    }
};
