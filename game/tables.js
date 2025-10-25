/**
 * BrainRing Table Management
 * Handles table creation, data management, and statistics
 */

class TableManager {
    constructor(gameState, notifications, errorHandler) {
        this.gameState = gameState;
        this.notifications = notifications;
        this.errorHandler = errorHandler;
        
        this.setupEventListeners();
    }

    setupEventListeners() {
        // Tab switching
        const tabs = document.querySelectorAll('.tab');
        tabs.forEach(tab => {
            tab.addEventListener('click', () => {
                this.switchTab(tab);
            });
        });

        // Team visibility checkboxes
        const checkboxes = document.querySelectorAll('#settingsMenu input[type="checkbox"]');
        checkboxes.forEach(cb => {
            cb.addEventListener('change', () => {
                this.handleTeamVisibilityChange(cb);
            });
        });
    }

    switchTab(tab) {
        try {
            // Remove active class from all tabs and contents
            document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
            document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));

            // Add active class to clicked tab and corresponding content
            tab.classList.add('active');
            const targetContent = document.getElementById(tab.dataset.tab);
            if (targetContent) {
                targetContent.classList.add('active');
            }

            // Apply conditional formatting based on tab
            const tabId = tab.dataset.tab;
            if (tabId === "tab1") {
                this.applyConditionalFormattingYesNo();
            } else if (tabId === "tab2") {
                this.applyConditionalFormattingSimple();
            } else if (tabId === "tab3") {
                this.applyConditionalFormattingHard();
            } else if (tabId === "tab4") {
                this.applyConditionalFormattingCap();
            } else if (tabId === "tab5") {
                if (window.statisticsManager) {
                    window.statisticsManager.generateStatistics();
                } else {
                    console.warn('Statistics manager not initialized');
                }
            }

        } catch (error) {
            this.errorHandler.handle(error, 'Switch Tab');
        }
    }

    handleTeamVisibilityChange(checkbox) {
        try {
            const team = checkbox.dataset.team;
            const isVisible = checkbox.checked;
            
            document.body.classList.toggle('hide-' + team, !isVisible);

            // Save visibility state
            const savedState = JSON.parse(localStorage.getItem('teamVisibility')) || {};
            savedState[team] = isVisible;
            localStorage.setItem('teamVisibility', JSON.stringify(savedState));

        } catch (error) {
            this.errorHandler.handle(error, 'Team Visibility Change');
        }
    }

    buildInputTable(tableId, rowCount, allowedValues) {
        try {
            const table = document.getElementById(tableId);
            if (!table) return;

            const headerRow = table.querySelector("thead tr");
            const teamCount = headerRow.children.length - 1; // exclude '#'

            const tbody = document.createElement("tbody");

            // Create main rows
            for (let i = 1; i <= rowCount; i++) {
                const row = document.createElement("tr");
                row.innerHTML = `<td>${i}</td>`;
                
                for (let j = 0; j < teamCount; j++) {
                    const input = document.createElement("input");
                    input.type = "number";
                    input.step = "0.5";
                    input.min = Math.min(...allowedValues);
                    input.max = Math.max(...allowedValues);
                    input.setAttribute("data-col", j);
                    input.setAttribute("aria-label", `Points for question ${i}, team ${j + 1}`);
                    
                    input.addEventListener("input", () => {
                        this.updateColumnSums(tableId);
                        this.saveTableState(tableId);
                        this.applyConditionalFormatting(tableId);
                    });
                    
                    const cell = document.createElement("td");
                    cell.appendChild(input);
                    row.appendChild(cell);
                }
                tbody.appendChild(row);
            }

            // Add sum row
            const sumRow = document.createElement("tr");
            sumRow.className = "sumRow";
            sumRow.innerHTML = "<td><strong>Sum</strong></td>";
            
            for (let i = 0; i < teamCount; i++) {
                const cell = document.createElement("td");
                cell.className = "sumCell";
                cell.innerText = "0";
                cell.setAttribute("aria-label", `Total points for team ${i + 1}`);
                sumRow.appendChild(cell);
            }

            tbody.appendChild(sumRow);
            table.appendChild(tbody);

        } catch (error) {
            this.errorHandler.handle(error, 'Build Input Table');
        }
    }

    // Save table data to new JSON format
    saveTableDataToNewFormat(tableId, teamData) {
        try {
            const gameState = window.gameState || null;
            if (!gameState) {
                console.warn('GameState not available, falling back to localStorage');
                this.saveTableState(tableId);
                return;
            }

            const state = gameState.getState();
            const teamColor = this.getTeamColorFromTableId(tableId);
            
            if (state.teams[teamColor]) {
                // Update the specific table data for the team
                switch(tableId) {
                    case 'tableYesNo':
                        state.teams[teamColor].yesNo = teamData;
                        break;
                    case 'tableSimple':
                        state.teams[teamColor].simple = teamData;
                        break;
                    case 'tableHard':
                        state.teams[teamColor].hard = teamData;
                        break;
                    case 'tableCap':
                        state.teams[teamColor].cap = teamData;
                        break;
                }
                
                // Update the game state
                gameState.updateState({ teams: state.teams });
            }
        } catch (error) {
            this.errorHandler.handle(error, 'Save Table Data to New Format');
        }
    }

    // Get team color from table ID - improved version
    getTeamColorFromTableId(tableId) {
        // For now, we'll process all teams' data from the JSON
        // This method will be called for each team when processing JSON data
        return 'all'; // Indicates we should process all teams
    }

    // Process JSON data for all teams
    processAllTeamsData(jsonData) {
        try {
            if (!jsonData.teams) {
                console.warn('No teams data in JSON');
                return;
            }

            const gameState = window.gameState || null;
            if (!gameState) {
                console.warn('GameState not available');
                return;
            }

            const currentState = gameState.getState();
            
            // Update each team's data
            Object.keys(jsonData.teams).forEach(teamColor => {
                if (currentState.teams[teamColor] && jsonData.teams[teamColor]) {
                    currentState.teams[teamColor] = {
                        ...currentState.teams[teamColor],
                        ...jsonData.teams[teamColor]
                    };
                }
            });
            
            // Update the game state
            gameState.updateState({ teams: currentState.teams });
            
            // Apply data to all tables
            this.applyAllTeamsDataToTables(currentState.teams);
            
        } catch (error) {
            this.errorHandler.handle(error, 'Process All Teams Data');
        }
    }

    // Apply all teams data to tables
    applyAllTeamsDataToTables(teamsData) {
        try {
            // For each team, apply their data to the corresponding table columns
            const teamColors = ['red', 'green', 'blue', 'white', 'yellow', 'pink'];
            
            teamColors.forEach(teamColor => {
                if (teamsData[teamColor]) {
                    const teamData = teamsData[teamColor];
                    
                    // Apply yesNo data
                    this.applyTeamDataToTableColumn('tableYesNo', teamColor, teamData.yesNo);
                    
                    // Apply simple data
                    this.applyTeamDataToTableColumn('tableSimple', teamColor, teamData.simple);
                    
                    // Apply hard data
                    this.applyTeamDataToTableColumn('tableHard', teamColor, teamData.hard);
                    
                    // Apply cap data
                    this.applyTeamDataToTableColumn('tableCap', teamColor, teamData.cap);
                }
            });
            
        } catch (error) {
            this.errorHandler.handle(error, 'Apply All Teams Data to Tables');
        }
    }

    // Apply team data to specific table column
    applyTeamDataToTableColumn(tableId, teamColor, data) {
        try {
            const table = document.getElementById(tableId);
            if (!table || !data) return;

            // Find the column for this team color
            const teamColumnIndex = this.getTeamColumnIndex(tableId, teamColor);
            if (teamColumnIndex === -1) return;

            // Apply data to the column
            const rows = table.querySelectorAll('tbody tr');
            rows.forEach((row, rowIndex) => {
                const cells = row.querySelectorAll('td');
                if (cells[teamColumnIndex]) {
                    const input = cells[teamColumnIndex].querySelector('input');
                    if (input && data[rowIndex] !== undefined) {
                        input.value = data[rowIndex];
                    }
                }
            });

            this.updateColumnSums(tableId);
            
        } catch (error) {
            this.errorHandler.handle(error, 'Apply Team Data to Table Column');
        }
    }

    // Get team column index in table
    getTeamColumnIndex(tableId, teamColor) {
        try {
            const table = document.getElementById(tableId);
            if (!table) return -1;

            const headerRow = table.querySelector('thead tr');
            if (!headerRow) return -1;

            const headers = headerRow.querySelectorAll('th');
            for (let i = 0; i < headers.length; i++) {
                const headerText = headers[i].textContent.toLowerCase();
                if (headerText.includes(teamColor)) {
                    return i;
                }
            }

            // Fallback: try to find by team name
            const teamNames = {
                red: 'red',
                green: 'green', 
                blue: 'blue',
                white: 'white',
                yellow: 'yellow',
                pink: 'pink'
            };

            for (let i = 0; i < headers.length; i++) {
                const headerText = headers[i].textContent.toLowerCase();
                if (headerText.includes(teamNames[teamColor])) {
                    return i;
                }
            }

            return -1;
        } catch (error) {
            this.errorHandler.handle(error, 'Get Team Column Index');
            return -1;
        }
    }

    // Load table data from new JSON format
    loadTableDataFromNewFormat(tableId) {
        try {
            const gameState = window.gameState || null;
            if (!gameState) {
                console.warn('GameState not available, falling back to localStorage');
                this.loadTableState(tableId);
                return;
            }

            const state = gameState.getState();
            const teamColor = this.getTeamColorFromTableId(tableId);
            
            if (state.teams[teamColor]) {
                let teamData = [];
                switch(tableId) {
                    case 'tableYesNo':
                        teamData = state.teams[teamColor].yesNo || [0];
                        break;
                    case 'tableSimple':
                        teamData = state.teams[teamColor].simple || new Array(40).fill(0);
                        break;
                    case 'tableHard':
                        teamData = state.teams[teamColor].hard || new Array(20).fill(0);
                        break;
                    case 'tableCap':
                        teamData = state.teams[teamColor].cap || new Array(10).fill(0);
                        break;
                }
                
                // Apply the data to the table
                this.applyDataToTable(tableId, teamData);
            }
        } catch (error) {
            this.errorHandler.handle(error, 'Load Table Data from New Format');
        }
    }

    // Apply data array to table inputs
    applyDataToTable(tableId, data) {
        try {
            const table = document.getElementById(tableId);
            if (!table) return;

            const inputs = table.querySelectorAll("input[data-col]");
            inputs.forEach((input, index) => {
                if (data[index] !== undefined) {
                    input.value = data[index];
                }
            });

            this.updateColumnSums(tableId);
        } catch (error) {
            this.errorHandler.handle(error, 'Apply Data to Table');
        }
    }

    loadTableState(tableId) {
        try {
            const table = document.getElementById(tableId);
            if (!table) return;

            const data = JSON.parse(localStorage.getItem(`tableData-${tableId}`));
            if (!data) return;

            const inputs = table.querySelectorAll("input[data-col]");
            inputs.forEach((input, index) => {
                input.value = data[index] || "";
            });

            this.updateColumnSums(tableId);

        } catch (error) {
            this.errorHandler.handle(error, 'Load Table State');
        }
    }

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

    applyConditionalFormatting(tableId) {
        try {
            if (tableId === "tableSimple") {
                this.applyConditionalFormattingSimple();
            } else if (tableId === "tableHard") {
                this.applyConditionalFormattingHard();
            } else if (tableId === "tableCap") {
                this.applyConditionalFormattingCap();
            }
        } catch (error) {
            this.errorHandler.handle(error, 'Apply Conditional Formatting');
        }
    }

    applyConditionalFormattingSimple() {
        try {
            const table = document.getElementById('tableSimple');
            if (!table) return;

            const rows = table.querySelectorAll('tbody tr:not(.sumRow)');

            rows.forEach(row => {
                const inputs = row.querySelectorAll('input');
                let filledValues = 0;
                let hasTooLarge = false;

                inputs.forEach(input => {
                    const val = parseFloat(input.value);
                    if (!isNaN(val)) {
                        filledValues++;
                        if (val > 2) hasTooLarge = true;
                    }
                });

                // Apply conditional coloring
                if (filledValues === 1 && !hasTooLarge) {
                    row.style.backgroundColor = '#d4edda'; // light green
                } else if (filledValues > 1 || hasTooLarge) {
                    row.style.backgroundColor = '#f8d7da'; // light red
                } else {
                    row.style.backgroundColor = ''; // reset
                }
            });

        } catch (error) {
            this.errorHandler.handle(error, 'Apply Conditional Formatting Simple');
        }
    }

    applyConditionalFormattingHard() {
        try {
            const table = document.getElementById('tableHard');
            if (!table) return;

            const rows = table.querySelectorAll('tbody tr:not(.sumRow)');

            rows.forEach(row => {
                const inputs = row.querySelectorAll('input');
                let filledValues = 0;
                let hasTooLarge = false;

                inputs.forEach(input => {
                    const val = parseFloat(input.value);
                    if (!isNaN(val)) {
                        filledValues++;
                        if (val > 3) hasTooLarge = true;
                    }
                });

                if (filledValues === 1 && !hasTooLarge) {
                    row.style.backgroundColor = '#d4edda'; // light green
                } else if (filledValues > 1 || hasTooLarge) {
                    row.style.backgroundColor = '#f8d7da'; // light red
                } else {
                    row.style.backgroundColor = ''; // reset
                }
            });

        } catch (error) {
            this.errorHandler.handle(error, 'Apply Conditional Formatting Hard');
        }
    }

    applyConditionalFormattingCap() {
        try {
            const table = document.getElementById('tableCap');
            if (!table) return;

            const rows = table.querySelectorAll('tbody tr:not(.sumRow)');

            rows.forEach(row => {
                const rowNumberCell = row.querySelector('td');
                const rowNumber = parseInt(rowNumberCell?.textContent);

                // Skip first logical row (#1)
                if (rowNumber === 1) {
                    row.style.backgroundColor = '';
                    return;
                }

                const inputs = row.querySelectorAll('input');
                let filledCount = 0;
                let hasNotOne = false;

                inputs.forEach(input => {
                    const val = parseFloat(input.value);
                    if (!isNaN(val)) {
                        filledCount++;
                        if (val !== 1) {
                            hasNotOne = true;
                        }
                    }
                });

                if (filledCount === 1 && !hasNotOne) {
                    row.style.backgroundColor = '#d4edda'; // ✅ green
                } else if (filledCount > 1 || hasNotOne) {
                    row.style.backgroundColor = '#f8d7da'; // ❌ red
                } else {
                    row.style.backgroundColor = ''; // 🔄 reset
                }
            });

        } catch (error) {
            this.errorHandler.handle(error, 'Apply Conditional Formatting Cap');
        }
    }

    applyConditionalFormattingYesNo() {
        try {
            // Yes/No round doesn't need conditional formatting
            // This method exists for consistency
        } catch (error) {
            this.errorHandler.handle(error, 'Apply Conditional Formatting Yes No');
        }
    }

    // Statistics generation is now handled by StatisticsManager

    initializeTables() {
        try {
            // Build all tables
            this.buildInputTable("tableYesNo", 1, Array.from({length: 101}, (_, i) => i));
            this.loadTableState("tableYesNo");
            
            this.buildInputTable("tableSimple", 40, [1, 2]);
            this.loadTableState("tableSimple");
            
            this.buildInputTable("tableHard", 20, [1, 2, 3]);
            this.loadTableState("tableHard");
            
            this.buildInputTable("tableCap", 15, Array.from({length: 11}, (_, i) => i - 5));
            this.loadTableState("tableCap");

            // Load team visibility settings
            this.loadTeamVisibilitySettings();

            // Update totals
            this.updateTotalTeamPoints();

        } catch (error) {
            this.errorHandler.handle(error, 'Initialize Tables');
        }
    }

    loadTeamVisibilitySettings() {
        try {
            const checkboxes = document.querySelectorAll('#settingsMenu input[type="checkbox"]');
            const savedState = JSON.parse(localStorage.getItem('teamVisibility')) || {};
            
            checkboxes.forEach(cb => {
                const team = cb.dataset.team;
                const isVisible = savedState[team] !== false; // default true
                cb.checked = isVisible;
                document.body.classList.toggle('hide-' + team, !isVisible);
            });

        } catch (error) {
            this.errorHandler.handle(error, 'Load Team Visibility Settings');
        }
    }

    // Export game data in new JSON format
    exportGameDataAsJSON() {
        try {
            const gameState = window.gameState || null;
            if (!gameState) {
                console.warn('GameState not available for export');
                return null;
            }

            const state = gameState.getState();
            
            // Create export data in the new format
            const exportData = {
                sessionId: state.sessionId,
                timestamp: state.timestamp,
                metadata: {
                    gameDate: state.metadata.gameDate,
                    lastModified: new Date().toISOString()
                },
                teams: {}
            };

            // Copy team data
            Object.keys(state.teams).forEach(teamColor => {
                exportData.teams[teamColor] = {
                    name: state.teams[teamColor].name,
                    visible: state.teams[teamColor].visible,
                    yesNo: [...state.teams[teamColor].yesNo],
                    simple: [...state.teams[teamColor].simple],
                    hard: [...state.teams[teamColor].hard],
                    cap: [...state.teams[teamColor].cap]
                };
            });

            return exportData;
        } catch (error) {
            this.errorHandler.handle(error, 'Export Game Data as JSON');
            return null;
        }
    }

    // Download game data as JSON file
    downloadGameDataAsJSON() {
        try {
            const gameData = this.exportGameDataAsJSON();
            if (!gameData) {
                alert('No game data available to export');
                return;
            }

            const dataStr = JSON.stringify(gameData, null, 2);
            const dataBlob = new Blob([dataStr], { type: 'application/json' });
            
            const url = URL.createObjectURL(dataBlob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `brain_ring_game_${gameData.sessionId}.json`;
            
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            
            URL.revokeObjectURL(url);
            
            console.log('Game data exported successfully');
        } catch (error) {
            this.errorHandler.handle(error, 'Download Game Data as JSON');
        }
    }
}

// Initialize table manager when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    try {
        // Wait for core systems to be initialized
        if (window.BrainRing && window.BrainRing.gameState) {
            const { gameState, notifications, errorHandler } = window.BrainRing;
            window.tableManager = new TableManager(gameState, notifications, errorHandler);
            
            // Initialize tables
            window.tableManager.initializeTables();
            
            console.log('✅ Table manager initialized successfully');
        } else {
            console.error('❌ Core systems not initialized. Please ensure core.js is loaded first.');
        }
    } catch (error) {
        console.error('❌ Failed to initialize table manager:', error);
    }
});
