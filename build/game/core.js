/**
 * BrainRing Game State Management
 * Centralized state management for the quiz game
 */
class GameState {
    constructor() {
        // Generate session ID based on current timestamp
        const now = new Date();
        const sessionId = `session_${now.getFullYear()}_${String(now.getMonth() + 1).padStart(2, '0')}_${String(now.getDate()).padStart(2, '0')}_${String(now.getHours()).padStart(2, '0')}_${String(now.getMinutes()).padStart(2, '0')}_${String(now.getSeconds()).padStart(2, '0')}`;
        
        this.state = {
            sessionId: sessionId,
            timestamp: now.toISOString(),
            metadata: {
                gameDate: now.toISOString().split('T')[0],
                lastModified: now.toISOString()
            },
            teams: {
                red: {
                    name: "Red Team",
                    visible: true,
                    yesNo: [0],
                    simple: new Array(40).fill(0),
                    hard: new Array(20).fill(0),
                    cap: new Array(10).fill(0)
                },
                green: {
                    name: "Green Team",
                    visible: true,
                    yesNo: [0],
                    simple: new Array(40).fill(0),
                    hard: new Array(20).fill(0),
                    cap: new Array(10).fill(0)
                },
                blue: {
                    name: "Blue Team",
                    visible: true,
                    yesNo: [0],
                    simple: new Array(40).fill(0),
                    hard: new Array(20).fill(0),
                    cap: new Array(10).fill(0)
                },
                white: {
                    name: "White Team",
                    visible: true,
                    yesNo: [0],
                    simple: new Array(40).fill(0),
                    hard: new Array(20).fill(0),
                    cap: new Array(10).fill(0)
                },
                yellow: {
                    name: "Yellow Team",
                    visible: true,
                    yesNo: [0],
                    simple: new Array(40).fill(0),
                    hard: new Array(20).fill(0),
                    cap: new Array(10).fill(0)
                },
                pink: {
                    name: "Pink Team",
                    visible: true,
                    yesNo: [0],
                    simple: new Array(40).fill(0),
                    hard: new Array(20).fill(0),
                    cap: new Array(10).fill(0)
                }
            },
            // Legacy fields for backward compatibility
            currentRound: 2,
            currentQuestion: 1,
            timer: { active: false, duration: 0, remaining: 0 },
            questions: [],
            currentQuestionIndex: 0,
            clickedTeams: {
                green: false,
                blue: false,
                red: false,
                white: false,
                yellow: false,
                pink: false
            },
            lastClickTime: 0,
            clickTimes: [],
            listening: true,
            isMuted: false,
            isAnswerVisible: false,
            mqttClient: null,
            mqttConnected: false
        };
        
        this.listeners = [];
        this.loadFromStorage();
    }

    // Subscribe to state changes
    subscribe(callback) {
        this.listeners.push(callback);
        return () => {
            this.listeners = this.listeners.filter(listener => listener !== callback);
        };
    }

    // Notify all listeners of state changes
    notify() {
        this.listeners.forEach(callback => callback(this.state));
    }

    // Update state and notify listeners
    updateState(updates) {
        this.state = { ...this.state, ...updates };
        this.saveToStorage();
        this.notify();
    }

    // Get current state
    getState() {
        return { ...this.state };
    }

    // Load state from localStorage
    loadFromStorage() {
        try {
            const savedState = localStorage.getItem('brainRingState');
            if (savedState) {
                const parsed = JSON.parse(savedState);
                this.state = { ...this.state, ...parsed };
            }
        } catch (error) {
            console.error('Error loading state from storage:', error);
        }
    }

    // Save state to localStorage
    saveToStorage() {
        try {
            // Update metadata before saving
            this.state.metadata.lastModified = new Date().toISOString();
            localStorage.setItem('brainRingState', JSON.stringify(this.state));
        } catch (error) {
            console.error('Error saving state to storage:', error);
        }
    }

    // Reset state
    reset() {
        const now = new Date();
        const sessionId = `session_${now.getFullYear()}_${String(now.getMonth() + 1).padStart(2, '0')}_${String(now.getDate()).padStart(2, '0')}_${String(now.getHours()).padStart(2, '0')}_${String(now.getMinutes()).padStart(2, '0')}_${String(now.getSeconds()).padStart(2, '0')}`;
        
        this.state = {
            sessionId: sessionId,
            timestamp: now.toISOString(),
            metadata: {
                gameDate: now.toISOString().split('T')[0],
                lastModified: now.toISOString()
            },
            teams: {
                red: {
                    name: "Red Team",
                    visible: true,
                    yesNo: [0],
                    simple: new Array(40).fill(0),
                    hard: new Array(20).fill(0),
                    cap: new Array(10).fill(0)
                },
                green: {
                    name: "Green Team",
                    visible: true,
                    yesNo: [0],
                    simple: new Array(40).fill(0),
                    hard: new Array(20).fill(0),
                    cap: new Array(10).fill(0)
                },
                blue: {
                    name: "Blue Team",
                    visible: true,
                    yesNo: [0],
                    simple: new Array(40).fill(0),
                    hard: new Array(20).fill(0),
                    cap: new Array(10).fill(0)
                },
                white: {
                    name: "White Team",
                    visible: true,
                    yesNo: [0],
                    simple: new Array(40).fill(0),
                    hard: new Array(20).fill(0),
                    cap: new Array(10).fill(0)
                },
                yellow: {
                    name: "Yellow Team",
                    visible: true,
                    yesNo: [0],
                    simple: new Array(40).fill(0),
                    hard: new Array(20).fill(0),
                    cap: new Array(10).fill(0)
                },
                pink: {
                    name: "Pink Team",
                    visible: true,
                    yesNo: [0],
                    simple: new Array(40).fill(0),
                    hard: new Array(20).fill(0),
                    cap: new Array(10).fill(0)
                }
            },
            // Legacy fields for backward compatibility
            currentRound: 2,
            currentQuestion: 1,
            timer: { active: false, duration: 0, remaining: 0 },
            questions: [],
            currentQuestionIndex: 0,
            clickedTeams: {
                green: false,
                blue: false,
                red: false,
                white: false,
                yellow: false,
                pink: false
            },
            lastClickTime: 0,
            clickTimes: [],
            listening: true,
            isMuted: false,
            isAnswerVisible: false,
            mqttClient: null,
            mqttConnected: false
        };
        this.saveToStorage();
        this.notify();
    }
}

/**
 * Notification System
 * Better UI feedback system to replace alerts
 */
class NotificationSystem {
    constructor() {
        this.container = this.createContainer();
    }

    createContainer() {
        const container = document.createElement('div');
        container.id = 'notification-container';
        container.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            z-index: 10000;
            pointer-events: none;
        `;
        document.body.appendChild(container);
        return container;
    }

    show(message, type = 'info', duration = 3000) {
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.textContent = message;
        notification.style.pointerEvents = 'auto';
        
        this.container.appendChild(notification);

        // Auto remove after duration
        setTimeout(() => {
            if (notification.parentNode) {
                notification.style.animation = 'slideOut 0.3s ease-in';
                setTimeout(() => {
                    if (notification.parentNode) {
                        notification.parentNode.removeChild(notification);
                    }
                }, 300);
            }
        }, duration);

        return notification;
    }

    success(message, duration = 3000) {
        return this.show(message, 'success', duration);
    }

    error(message, duration = 5000) {
        return this.show(message, 'error', duration);
    }

    warning(message, duration = 4000) {
        return this.show(message, 'warning', duration);
    }

    info(message, duration = 3000) {
        return this.show(message, 'info', duration);
    }
}

/**
 * Error Handler
 * Centralized error handling system
 */
class ErrorHandler {
    constructor(notificationSystem) {
        this.notifications = notificationSystem;
    }

    handle(error, context = '') {
        console.error(`Error in ${context}:`, error);
        
        let message = 'An unexpected error occurred';
        
        if (error instanceof Error) {
            message = error.message;
        } else if (typeof error === 'string') {
            message = error;
        }

        this.notifications.error(`${context ? context + ': ' : ''}${message}`);
    }

    async safeExecute(fn, context = '', fallback = null) {
        try {
            return await fn();
        } catch (error) {
            this.handle(error, context);
            return fallback;
        }
    }
}

/**
 * MQTT Client Manager
 * Secure MQTT connection management
 */
class MQTTManager {
    constructor(gameState, errorHandler) {
        this.gameState = gameState;
        this.errorHandler = errorHandler;
        this.client = null;
        this.config = {
            server: 'wss://io.adafruit.com/mqtt',
            username: '', // Will be loaded from environment or config
            password: '', // Will be loaded from environment or config
            topic: 'vmishchenko/feeds/esp32-button'
        };
    }

    async initialize() {
        try {
            // In a real application, these would come from environment variables
            // For now, we'll use a placeholder that requires manual configuration
            if (!this.config.username || !this.config.password) {
                console.warn('MQTT credentials not configured. Please set them in the configuration.');
                return false;
            }

            this.client = mqtt.connect(this.config.server, {
                username: this.config.username,
                password: this.config.password
            });

            this.setupEventHandlers();
            return true;
        } catch (error) {
            this.errorHandler.handle(error, 'MQTT Initialization');
            return false;
        }
    }

    setupEventHandlers() {
        this.client.on('connect', () => {
            console.log('✅ Connected to MQTT');
            this.gameState.updateState({ mqttConnected: true });
            
            this.client.subscribe(this.config.topic, (err) => {
                if (err) {
                    this.errorHandler.handle(err, 'MQTT Subscribe');
                } else {
                    console.log(`📡 Subscribed to ${this.config.topic}`);
                }
            });
        });

        this.client.on('message', (topic, message) => {
            this.handleMessage(topic, message);
        });

        this.client.on('error', (err) => {
            this.errorHandler.handle(err, 'MQTT Error');
            this.gameState.updateState({ mqttConnected: false });
        });

        this.client.on('close', () => {
            console.log('🔌 MQTT connection closed');
            this.gameState.updateState({ mqttConnected: false });
        });

        this.client.on('offline', () => {
            console.log('📴 MQTT offline');
            this.gameState.updateState({ mqttConnected: false });
        });

        this.client.on('reconnect', () => {
            console.log('🔁 Reconnecting...');
        });
    }

    handleMessage(topic, message) {
        try {
            const msg = message.toString().trim().toLowerCase();
            const keyMap = {
                blue: "b",
                red: "r", 
                green: "g",
                pink: "p",
                yellow: "y",
                white: "w"
            };
            
            const key = keyMap[msg];
            if (key) {
                console.log(`👉 Received: ${msg}, triggering key: ${key}`);
                // Trigger the team click handler
                window.handleTeamClick?.(key);
            } else {
                console.warn(`⚠️ Unknown message: ${msg}`);
            }
        } catch (error) {
            this.errorHandler.handle(error, 'MQTT Message Handling');
        }
    }

    publish(topic, message) {
        if (this.client && this.client.connected) {
            this.client.publish(topic, message, { qos: 0, retain: false }, (err) => {
                if (err) {
                    this.errorHandler.handle(err, 'MQTT Publish');
                } else {
                    console.log(`Published to ${topic}: ${message}`);
                }
            });
        } else {
            console.warn("MQTT client not connected. Message not published.");
        }
    }

    disconnect() {
        if (this.client) {
            this.client.end();
            this.gameState.updateState({ mqttConnected: false });
        }
    }
}

/**
 * Audio Manager
 * Centralized audio management
 */
class AudioManager {
    constructor(gameState) {
        this.gameState = gameState;
        this.sounds = {
            green: document.getElementById('soundG'),
            red: document.getElementById('soundR'),
            blue: document.getElementById('soundB'),
            white: document.getElementById('soundW'),
            yellow: document.getElementById('soundY'),
            pink: document.getElementById('soundP'),
            off: document.getElementById('soundOff'),
            background: document.getElementById('soundBackground1')
        };
    }

    playSound(team) {
        if (this.gameState.getState().isMuted) return;
        
        const sound = this.sounds[team];
        if (sound) {
            sound.currentTime = 0;
            sound.play().catch(error => {
                console.warn('Could not play sound:', error);
            });
        }
    }

    playBackgroundSound() {
        if (this.gameState.getState().isMuted) return;
        
        const sound = this.sounds.background;
        if (sound) {
            sound.currentTime = 0;
            sound.play().catch(error => {
                console.warn('Could not play background sound:', error);
            });
        }
    }

    stopAllSounds() {
        Object.values(this.sounds).forEach(sound => {
            if (sound) {
                sound.pause();
                sound.currentTime = 0;
            }
        });
    }

    setMuted(muted) {
        Object.values(this.sounds).forEach(sound => {
            if (sound) {
                sound.muted = muted;
            }
        });
    }
}

/**
 * Timer Manager
 * Centralized timer management
 */
class TimerManager {
    constructor(gameState, audioManager, errorHandler) {
        this.gameState = gameState;
        this.audioManager = audioManager;
        this.errorHandler = errorHandler;
        this.timer = null;
        this.countdown = null;
        this.warningTimeout = null;
    }

    startTimer(duration) {
        try {
            this.clearTimers();
            
            const state = this.gameState.getState();
            this.gameState.updateState({
                timer: { active: true, duration, remaining: duration },
                listening: true
            });

            this.audioManager.stopAllSounds();

            // Set warning timeout
            if (duration === 60) {
                this.warningTimeout = setTimeout(() => {
                    this.audioManager.playBackgroundSound();
                }, 50000);
            } else if (duration === 120) {
                this.warningTimeout = setTimeout(() => {
                    this.audioManager.playBackgroundSound();
                }, 110000);
            } else if (duration === 180) {
                this.warningTimeout = setTimeout(() => {
                    this.audioManager.playBackgroundSound();
                }, 170000);
            }

            // Start countdown
            this.countdown = setInterval(() => {
                const currentState = this.gameState.getState();
                const remaining = currentState.timer.remaining - 1;
                
                if (remaining <= 0) {
                    this.stopTimer();
                } else {
                    this.gameState.updateState({
                        timer: { ...currentState.timer, remaining }
                    });
                }
            }, 1000);

            // Set main timer
            this.timer = setTimeout(() => {
                this.stopTimer();
            }, duration * 1000);

        } catch (error) {
            this.errorHandler.handle(error, 'Timer Start');
        }
    }

    stopTimer() {
        try {
            this.clearTimers();
            
            this.gameState.updateState({
                timer: { active: false, duration: 0, remaining: 0 },
                listening: false
            });

            this.audioManager.playSound('off');
            
        } catch (error) {
            this.errorHandler.handle(error, 'Timer Stop');
        }
    }

    clearTimers() {
        if (this.timer) {
            clearTimeout(this.timer);
            this.timer = null;
        }
        if (this.countdown) {
            clearInterval(this.countdown);
            this.countdown = null;
        }
        if (this.warningTimeout) {
            clearTimeout(this.warningTimeout);
            this.warningTimeout = null;
        }
    }

    resetTimer() {
        this.clearTimers();
        this.gameState.updateState({
            timer: { active: false, duration: 0, remaining: 0 },
            listening: true
        });
        this.audioManager.stopAllSounds();
    }
}

// Global instances
let gameState, notifications, errorHandler, mqttManager, audioManager, timerManager;

// Initialize the application
function initializeApp() {
    try {
        // Initialize core systems
        gameState = new GameState();
        notifications = new NotificationSystem();
        errorHandler = new ErrorHandler(notifications);
        audioManager = new AudioManager(gameState);
        timerManager = new TimerManager(gameState, audioManager, errorHandler);
        
        // Initialize MQTT (will show warning if credentials not configured)
        mqttManager = new MQTTManager(gameState, errorHandler);
        mqttManager.initialize();

        // Set up global error handling
        window.addEventListener('error', (event) => {
            errorHandler.handle(event.error, 'Global Error');
        });

        window.addEventListener('unhandledrejection', (event) => {
            errorHandler.handle(event.reason, 'Unhandled Promise Rejection');
        });

        console.log('✅ BrainRing application initialized successfully');
        
    } catch (error) {
        console.error('❌ Failed to initialize application:', error);
        notifications.error('Failed to initialize application. Please refresh the page.');
    }
}

// Export for global access
window.BrainRing = {
    gameState,
    notifications,
    errorHandler,
    mqttManager,
    audioManager,
    timerManager,
    initializeApp
};
