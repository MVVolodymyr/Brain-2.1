/**
 * BrainRing Game Logic
 * Main game functionality and UI interactions
 */

// Game logic functions
class GameLogic {
    constructor(gameState, notifications, errorHandler, audioManager, timerManager) {
        this.gameState = gameState;
        this.notifications = notifications;
        this.errorHandler = errorHandler;
        this.audioManager = audioManager;
        this.timerManager = timerManager;
        
        this.keyMap = {
            g: { team: "green", elementId: "element1" },
            п: { team: "green", elementId: "element1" },
            b: { team: "blue", elementId: "element3" },
            и: { team: "blue", elementId: "element3" },
            r: { team: "red", elementId: "element2" },
            к: { team: "red", elementId: "element2" },
            w: { team: "white", elementId: "element4" },
            ц: { team: "white", elementId: "element4" },
            y: { team: "yellow", elementId: "element5" },
            н: { team: "yellow", elementId: "element5" },
            p: { team: "pink", elementId: "element6" },
            з: { team: "pink", elementId: "element6" }
        };

        this.teamNames = {
            red: "Red Team",
            green: "Green Team", 
            blue: "Blue Team",
            white: "White Team",
            yellow: "Yellow Team",
            pink: "Pink Team"
        };

        this.setupEventListeners();
    }

    setupEventListeners() {
        // Keyboard event listener
        document.addEventListener('keydown', (event) => {
            this.handleTeamClick(event.key);
        });

        // Settings menu click outside handler
        document.addEventListener('click', (event) => {
            const menu = document.getElementById('settingsMenu');
            const settingsIcon = document.getElementById('settingsIcon');
            
            if (menu && !menu.contains(event.target) && event.target !== settingsIcon) {
                menu.style.display = 'none';
            }
        });
    }

    handleTeamClick(key) {
        try {
            const state = this.gameState.getState();
            if (!state.listening) return;

            const currentTime = new Date().getTime();
            const pressedKey = key.toLowerCase();
            const mapping = this.keyMap[pressedKey];
            
            if (!mapping || state.clickedTeams[mapping.team]) return;

            // Update clicked teams state
            const updatedClickedTeams = { ...state.clickedTeams };
            updatedClickedTeams[mapping.team] = true;
            this.gameState.updateState({ clickedTeams: updatedClickedTeams });

            // Play team sound
            this.audioManager.playSound(mapping.team);

            // Calculate timing
            let timeText = "First";
            const updatedClickTimes = [...state.clickTimes];
            
            if (state.lastClickTime !== 0) {
                const timeDifference = (currentTime - state.lastClickTime) / 1000;
                const formattedTime = timeDifference.toFixed(2).replace('.', ',');
                timeText = `+ <strong style='color:red;'>${formattedTime} s</strong>`;
                updatedClickTimes.push(timeDifference);
            }

            // Update state
            this.gameState.updateState({
                lastClickTime: currentTime,
                clickTimes: updatedClickTimes
            });

            // Create UI element
            this.createTeamClickElement(mapping, timeText);

        } catch (error) {
            this.errorHandler.handle(error, 'Team Click Handler');
        }
    }

    createTeamClickElement(mapping, timeText) {
        try {
            const element = document.getElementById(mapping.elementId);
            if (!element) return;

            const cloned = element.cloneNode(true);
            cloned.style.display = 'block';

            const title = document.createElement('div');
            title.innerHTML = `<strong style="color:${mapping.team};">${this.teamNames[mapping.team]} clicked</strong> | ${timeText}`;

            cloned.innerHTML = '';
            const inlineWrap = document.createElement('div');
            inlineWrap.style.cssText = `
                display: flex;
                align-items: center;
                justify-content: space-between;
                flex-wrap: wrap;
                gap: 10px;
            `;

            inlineWrap.appendChild(title);

            const buttonGroup = document.createElement('div');
            buttonGroup.className = 'button-group';

            ['+1', '+2', '+3'].forEach((label, index) => {
                const btn = document.createElement('button');
                btn.className = 'circle-button';
                btn.textContent = label;
                btn.setAttribute('aria-label', `Add ${index + 1} points to ${this.teamNames[mapping.team]}`);

                btn.addEventListener('click', () => {
                    this.addPointsToTeam(mapping.team, index + 1);
                });

                buttonGroup.appendChild(btn);
            });

            inlineWrap.appendChild(buttonGroup);
            cloned.appendChild(inlineWrap);
            cloned.classList.add('element');
            
            const output = document.getElementById('output');
            if (output) {
                output.appendChild(cloned);
            }

        } catch (error) {
            this.errorHandler.handle(error, 'Create Team Click Element');
        }
    }

    addPointsToTeam(team, points) {
        try {
            const state = this.gameState.getState();
            const roundValue = state.currentRound;
            const questionValue = state.currentQuestion;

            let tableId = '';
            if (roundValue === 2) tableId = 'tableSimple';
            else if (roundValue === 3) tableId = 'tableHard';
            else if (roundValue === 4) tableId = 'tableCap';
            else return;

            const table = document.getElementById(tableId);
            if (!table) return;

            const rowIndex = questionValue - 1;
            const teamOrder = ['red', 'green', 'blue', 'white', 'yellow', 'pink'];
            const colIndex = teamOrder.indexOf(team);
            if (colIndex === -1) return;

            const tbody = table.querySelector('tbody');
            const rows = tbody.querySelectorAll('tr');
            const sumRowIndex = rows.length - 1;
            if (rowIndex >= sumRowIndex) return;

            const targetRow = rows[rowIndex];
            const input = targetRow.querySelectorAll('input')[colIndex];
            if (!input) return;

            const current = parseFloat(input.value) || 0;
            input.value = current + points;
            input.dispatchEvent(new Event('input'));

            this.notifications.success(`Added ${points} points to ${this.teamNames[team]}`);

        } catch (error) {
            this.errorHandler.handle(error, 'Add Points to Team');
        }
    }

    resetOutput() {
        try {
            const output = document.getElementById('output');
            if (output) {
                output.innerHTML = "<p>Let the battle begin!</p>";
            }

            this.gameState.updateState({
                lastClickTime: 0,
                clickTimes: [],
                listening: true,
                clickedTeams: {
                    green: false,
                    blue: false,
                    red: false,
                    white: false,
                    yellow: false,
                    pink: false
                }
            });

            this.timerManager.resetTimer();
            this.audioManager.stopAllSounds();

            // Re-enable timer buttons
            const timerButtons = ['timer1Btn', 'timer2Btn', 'timer3Btn'];
            timerButtons.forEach(id => {
                const btn = document.getElementById(id);
                if (btn) btn.disabled = false;
            });

            this.notifications.info('Game reset. Ready for new round!');

        } catch (error) {
            this.errorHandler.handle(error, 'Reset Output');
        }
    }

    retrySession() {
        try {
            const confirmClear = confirm("Are you sure you want to clear all table data and start a new session?");
            if (!confirmClear) return;

            const tableIds = ["tableYesNo", "tableSimple", "tableHard", "tableCap"];
            
            tableIds.forEach(tableId => {
                localStorage.removeItem(`tableData-${tableId}`);
                
                const table = document.getElementById(tableId);
                if (!table) return;

                const inputs = table.querySelectorAll("input[data-col]");
                inputs.forEach(input => {
                    input.value = "";
                });

                this.updateColumnSums(tableId);
            });

            this.gameState.updateState({
                currentRound: 2,
                currentQuestion: 1
            });

            this.updateRoundDisplay();
            this.updateQuestionDisplay();
            this.timerManager.clearTimers();
            this.audioManager.stopAllSounds();

            this.notifications.success("All table data cleared. You can start a new session.");

        } catch (error) {
            this.errorHandler.handle(error, 'Retry Session');
        }
    }

    changeRound(delta) {
        try {
            const state = this.gameState.getState();
            const newRound = Math.min(4, Math.max(2, state.currentRound + delta));
            
            this.gameState.updateState({
                currentRound: newRound,
                currentQuestion: 1
            });

            this.updateRoundDisplay();
            this.updateQuestionDisplay();
            this.resetOutput();

        } catch (error) {
            this.errorHandler.handle(error, 'Change Round');
        }
    }

    changeQuestion(delta) {
        try {
            const state = this.gameState.getState();
            const newQuestion = Math.min(40, Math.max(1, state.currentQuestion + delta));
            
            this.gameState.updateState({
                currentQuestion: newQuestion
            });

            this.updateQuestionDisplay();
            
            if (delta === 1) {
                this.nextQuestion();
            } else if (delta === -1) {
                this.prevQuestion();
            }
            
            this.resetOutput();

        } catch (error) {
            this.errorHandler.handle(error, 'Change Question');
        }
    }

    updateRoundDisplay() {
        const state = this.gameState.getState();
        const roundElement = document.getElementById('roundValue');
        if (roundElement) {
            roundElement.textContent = state.currentRound;
        }
    }

    updateQuestionDisplay() {
        const state = this.gameState.getState();
        const questionElement = document.getElementById('questionValue');
        if (questionElement) {
            questionElement.textContent = state.currentQuestion;
        }
    }

    startTimer(duration) {
        try {
            this.timerManager.startTimer(duration);
            
            // Disable timer buttons
            const timerButtons = ['timer1Btn', 'timer2Btn', 'timer3Btn'];
            timerButtons.forEach(id => {
                const btn = document.getElementById(id);
                if (btn) btn.disabled = true;
            });

            this.notifications.info(`Timer started for ${duration / 60} minutes!`);

        } catch (error) {
            this.errorHandler.handle(error, 'Start Timer');
        }
    }

    toggleMute() {
        try {
            const state = this.gameState.getState();
            const newMutedState = !state.isMuted;
            
            this.gameState.updateState({ isMuted: newMutedState });
            this.audioManager.setMuted(newMutedState);

            const muteIcon = document.getElementById('muteIcon');
            if (muteIcon) {
                muteIcon.src = newMutedState ? "icon/muted_3541927.png" : "icon/mute_17879746.png";
            }

            this.notifications.info(newMutedState ? 'Audio muted' : 'Audio unmuted');

        } catch (error) {
            this.errorHandler.handle(error, 'Toggle Mute');
        }
    }

    toggleSettingsMenu() {
        try {
            const menu = document.getElementById('settingsMenu');
            if (menu) {
                menu.style.display = menu.style.display === 'none' ? 'block' : 'none';
            }
        } catch (error) {
            this.errorHandler.handle(error, 'Toggle Settings Menu');
        }
    }

    editTeamName(team) {
        try {
            const state = this.gameState.getState();
            const currentLabel = document.querySelector(`.team-setting[data-team="${team}"] .team-label`);
            const currentName = state.teams[team].name;
            
            const newName = prompt(`Enter new name for ${team} team:`, currentName);
            if (newName && newName.trim()) {
                const updatedTeams = { ...state.teams };
                updatedTeams[team].name = newName.trim();
                
                this.gameState.updateState({ teams: updatedTeams });
                this.updateDisplayedTeamNames();
                
                this.notifications.success(`Team name updated to: ${newName.trim()}`);
            }
        } catch (error) {
            this.errorHandler.handle(error, 'Edit Team Name');
        }
    }

    updateDisplayedTeamNames() {
        try {
            const state = this.gameState.getState();
            const teamOrder = ["red", "green", "blue", "white", "yellow", "pink"];
            const tables = ["tableYesNo", "tableSimple", "tableHard", "tableCap"];

            teamOrder.forEach(team => {
                const teamData = state.teams[team];
                
                // Update settings menu
                const labelSpan = document.querySelector(`.team-setting[data-team="${team}"] .team-label`);
                if (labelSpan) labelSpan.textContent = teamData.name;

                // Update team total display
                const block = document.querySelector(`#points-${team}`)?.parentElement;
                if (block) {
                    const nameEl = block.querySelector('.team-name');
                    if (nameEl) nameEl.textContent = teamData.name;
                }
            });

            // Update table headers
            tables.forEach(tableId => {
                const table = document.getElementById(tableId);
                if (!table) return;

                const headerCells = table.querySelectorAll("thead tr th");
                teamOrder.forEach((team, index) => {
                    const th = headerCells[index + 1]; // Skip the '#' column
                    if (th) {
                        th.textContent = state.teams[team].name;
                        th.className = ""; // Clear previous classes
                        th.classList.add(`team-${team}`); // Add color class
                    }
                });
            });

        } catch (error) {
            this.errorHandler.handle(error, 'Update Displayed Team Names');
        }
    }

    toggleAnswerVisibility() {
        try {
            const state = this.gameState.getState();
            const newVisibility = !state.isAnswerVisible;
            
            this.gameState.updateState({ isAnswerVisible: newVisibility });

            const answerEl = document.getElementById('qAnswer');
            const btn = document.getElementById('toggleAnswerBtn');

            if (answerEl && btn) {
                if (newVisibility) {
                    answerEl.classList.remove('masked');
                    btn.textContent = '🙈';
                    btn.setAttribute('aria-label', 'Hide answer');
                } else {
                    answerEl.classList.add('masked');
                    btn.textContent = '👁️';
                    btn.setAttribute('aria-label', 'Show answer');
                }
            }

        } catch (error) {
            this.errorHandler.handle(error, 'Toggle Answer Visibility');
        }
    }

    // Question management methods
    loadCSV() {
        try {
            const fileInput = document.getElementById('csvUpload');
            const file = fileInput.files[0];
            
            if (!file) {
                this.notifications.warning("Please select a CSV file first.");
                return;
            }

            const reader = new FileReader();
            reader.onload = (e) => {
                try {
                    const csvContent = e.target.result.trim();
                    localStorage.setItem('uploadedCSV', csvContent);

                    const questionsData = csvContent.split("\n").map(row => row.split(";"));
                    this.gameState.updateState({
                        questions: questionsData,
                        currentQuestionIndex: 0
                    });
                    
                    this.showQuestion();
                    this.notifications.success("CSV file uploaded and questions loaded successfully!");
                } catch (error) {
                    this.errorHandler.handle(error, 'CSV Processing');
                }
            };
            
            reader.onerror = () => {
                this.errorHandler.handle('Failed to read file', 'CSV Upload');
            };
            
            reader.readAsText(file);

        } catch (error) {
            this.errorHandler.handle(error, 'Load CSV');
        }
    }

    showQuestion() {
        try {
            const state = this.gameState.getState();
            if (!state.questions.length) return;

            const row = state.questions[state.currentQuestionIndex];
            const qNumber = row[0]?.trim() || "N/A";
            const qText = row[1]?.trim() || "No question";
            const qAnswer = row[2]?.trim() || "No answer";

            const qNumberEl = document.getElementById('qNumber');
            const qTextEl = document.getElementById('qText');
            const qAnswerEl = document.getElementById('qAnswer');

            if (qNumberEl) qNumberEl.textContent = qNumber;
            if (qTextEl) qTextEl.textContent = qText;
            if (qAnswerEl) {
                qAnswerEl.textContent = qAnswer;
                qAnswerEl.classList.add('masked');
            }

        } catch (error) {
            this.errorHandler.handle(error, 'Show Question');
        }
    }

    nextQuestion() {
        try {
            const state = this.gameState.getState();
            if (state.currentQuestionIndex < state.questions.length - 1) {
                this.gameState.updateState({
                    currentQuestionIndex: state.currentQuestionIndex + 1
                });
                this.showQuestion();
            }
        } catch (error) {
            this.errorHandler.handle(error, 'Next Question');
        }
    }

    prevQuestion() {
        try {
            const state = this.gameState.getState();
            if (state.currentQuestionIndex > 0) {
                this.gameState.updateState({
                    currentQuestionIndex: state.currentQuestionIndex - 1
                });
                this.showQuestion();
            }
        } catch (error) {
            this.errorHandler.handle(error, 'Previous Question');
        }
    }

    clearCSV() {
        try {
            const confirmReset = confirm("Click OK if you want to remove all loaded questions.");
            if (!confirmReset) return;

            localStorage.removeItem('uploadedCSV');
            this.gameState.updateState({
                questions: [],
                currentQuestionIndex: 0
            });

            // Clear question display
            const qNumberEl = document.getElementById('qNumber');
            const qTextEl = document.getElementById('qText');
            const qAnswerEl = document.getElementById('qAnswer');

            if (qNumberEl) qNumberEl.textContent = "-";
            if (qTextEl) qTextEl.textContent = "No question loaded";
            if (qAnswerEl) qAnswerEl.textContent = "";

            this.notifications.info("Questions cleared. You can load a new CSV file.");

        } catch (error) {
            this.errorHandler.handle(error, 'Clear CSV');
        }
    }

    // Table management methods
    updateColumnSums(tableId) {
        try {
            const table = document.getElementById(tableId);
            if (!table) return;

            const inputs = table.querySelectorAll("input[data-col]");
            const sumCells = table.querySelectorAll(".sumRow .sumCell");

            const colSums = Array.from(sumCells).map(() => 0);
            inputs.forEach(input => {
                const col = parseInt(input.getAttribute("data-col"));
                const val = parseFloat(input.value);
                if (!isNaN(val)) {
                    colSums[col] += val;
                }
            });

            sumCells.forEach((cell, i) => cell.textContent = colSums[i]);
            this.updateTeamTotalsFromTable(tableId);
            this.updateTotalTeamPoints();

        } catch (error) {
            this.errorHandler.handle(error, 'Update Column Sums');
        }
    }

    updateTeamTotalsFromTable(tableId) {
        try {
            const table = document.getElementById(tableId);
            if (!table) return;

            const sumCells = table.querySelectorAll(".sumRow .sumCell");
            const teamIds = ["red", "green", "blue", "white", "yellow", "pink"];

            sumCells.forEach((cell, index) => {
                const value = cell.textContent.trim();
                const pointsElement = document.getElementById(`points-${teamIds[index]}`);
                if (pointsElement) {
                    pointsElement.textContent = value;
                }
            });

        } catch (error) {
            this.errorHandler.handle(error, 'Update Team Totals From Table');
        }
    }

    updateTotalTeamPoints() {
        try {
            const tableIds = ["tableYesNo", "tableSimple", "tableHard", "tableCap"];
            const teamIds = ["red", "green", "blue", "white", "yellow", "pink"];
            const totals = Array(teamIds.length).fill(0);

            tableIds.forEach(tableId => {
                const table = document.getElementById(tableId);
                if (!table) return;

                const sumCells = table.querySelectorAll(".sumRow .sumCell");
                sumCells.forEach((cell, i) => {
                    const value = parseFloat(cell.textContent);
                    if (!isNaN(value)) {
                        totals[i] += value;
                    }
                });
            });

            // Update team total displays
            teamIds.forEach((team, i) => {
                const el = document.getElementById(`points-${team}`);
                if (el) el.textContent = totals[i].toFixed(1);
            });

        } catch (error) {
            this.errorHandler.handle(error, 'Update Total Team Points');
        }
    }
}

// Initialize game logic when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    try {
        // Wait for core systems to be initialized
        if (window.BrainRing && window.BrainRing.gameState) {
            const { gameState, notifications, errorHandler, audioManager, timerManager } = window.BrainRing;
            window.gameLogic = new GameLogic(gameState, notifications, errorHandler, audioManager, timerManager);
            
            // Set up global functions for HTML onclick handlers
            window.handleTeamClick = (key) => window.gameLogic.handleTeamClick(key);
            window.resetOutput = () => window.gameLogic.resetOutput();
            window.retrySession = () => window.gameLogic.retrySession();
            window.changeRound = (delta) => window.gameLogic.changeRound(delta);
            window.changeQuestion = (delta) => window.gameLogic.changeQuestion(delta);
            window.startTimer = (duration) => window.gameLogic.startTimer(duration);
            window.toggleMute = () => window.gameLogic.toggleMute();
            window.toggleSettingsMenu = () => window.gameLogic.toggleSettingsMenu();
            window.editTeamName = (team) => window.gameLogic.editTeamName(team);
            window.toggleAnswerVisibility = () => window.gameLogic.toggleAnswerVisibility();
            window.loadCSV = () => window.gameLogic.loadCSV();
            window.nextQuestion = () => window.gameLogic.nextQuestion();
            window.prevQuestion = () => window.gameLogic.prevQuestion();
            window.clearCSV = () => window.gameLogic.clearCSV();
            
            console.log('✅ Game logic initialized successfully');
        } else {
            console.error('❌ Core systems not initialized. Please ensure core.js is loaded first.');
        }
    } catch (error) {
        console.error('❌ Failed to initialize game logic:', error);
    }
});
