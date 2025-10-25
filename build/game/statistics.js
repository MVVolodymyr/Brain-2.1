/**
 * BrainRing Enhanced Statistics Manager
 * Provides comprehensive statistics for all game rounds
 */

class StatisticsManager {
    constructor(gameState, notifications, errorHandler) {
        this.gameState = gameState;
        this.notifications = notifications;
        this.errorHandler = errorHandler;
    }

    generateStatistics() {
        try {
            const tbody = document.querySelector("#statisticsTable tbody");
            if (!tbody) {
                this.errorHandler.handle('Statistics table not found', 'Generate Statistics');
                return;
            }
            
            tbody.innerHTML = "";

            // Generate statistics for each round type
            this.generateYesNoStatistics(tbody);
            this.generateSimpleStatistics(tbody);
            this.generateHardStatistics(tbody);
            this.generateCaptainStatistics(tbody);
            this.generateOverallStatistics(tbody);
            this.generateTeamStatistics(tbody);

        } catch (error) {
            this.errorHandler.handle(error, 'Generate Statistics');
        }
    }

    generateYesNoStatistics(tbody) {
        try {
            const tableYesNo = document.getElementById("tableYesNo");
            if (!tableYesNo) return;

            const rows = tableYesNo.querySelectorAll("tbody tr:not(.sumRow)");
            let totalQuestions = 0;
            let answeredQuestions = 0;

            rows.forEach(row => {
                totalQuestions++;
                const inputs = row.querySelectorAll("input");
                let hasAnswer = false;
                
                inputs.forEach(input => {
                    if (input.value.trim() !== "" && parseFloat(input.value) > 0) {
                        hasAnswer = true;
                    }
                });
                
                if (hasAnswer) answeredQuestions++;
            });

            const unansweredQuestions = totalQuestions - answeredQuestions;
            const participationRate = totalQuestions > 0 ? ((answeredQuestions / totalQuestions) * 100).toFixed(1) : "0.0";

            const tr = document.createElement("tr");
            tr.innerHTML = `
                <td><strong>Yes/No Round</strong></td>
                <td>${answeredQuestions}</td>
                <td>${unansweredQuestions}</td>
                <td>${participationRate}%</td>
            `;
            tr.style.backgroundColor = '#e8f4fd';
            tbody.appendChild(tr);

        } catch (error) {
            this.errorHandler.handle(error, 'Generate Yes/No Statistics');
        }
    }

    generateSimpleStatistics(tbody) {
        try {
            const tableSimple = document.getElementById("tableSimple");
            if (!tableSimple) return;

            const blocks = [
                { name: "Simple 1-10", start: 1, end: 10 },
                { name: "Simple 11-20", start: 11, end: 20 },
                { name: "Simple 21-30", start: 21, end: 30 },
                { name: "Simple 31-40", start: 31, end: 40 }
            ];

            let totalCorrectSimple = 0;
            let totalQuestionsSimple = 0;

            for (const block of blocks) {
                let correct = 0;
                let questions = 0;
                
                for (let i = block.start - 1; i < block.end; i++) {
                    const row = tableSimple.querySelectorAll("tbody tr")[i];
                    if (!row || row.classList.contains("sumRow")) continue;
                    
                    questions++;
                    const inputs = row.querySelectorAll("input");
                    let hasCorrectAnswer = false;
                    
                    inputs.forEach(input => {
                        const value = parseFloat(input.value);
                        if (!isNaN(value) && value > 0 && value <= 2) {
                            hasCorrectAnswer = true;
                        }
                    });
                    
                    if (hasCorrectAnswer) correct++;
                }
                
                totalCorrectSimple += correct;
                totalQuestionsSimple += questions;
                
                const incorrect = questions - correct;
                const percent = questions > 0 ? ((correct / questions) * 100).toFixed(1) : "0.0";

                const tr = document.createElement("tr");
                tr.innerHTML = `
                    <td>${block.name}</td>
                    <td>${correct}</td>
                    <td>${incorrect}</td>
                    <td>${percent}%</td>
                `;
                tbody.appendChild(tr);
            }

            // Total Simple
            const incorrectSimple = totalQuestionsSimple - totalCorrectSimple;
            const percentSimple = totalQuestionsSimple > 0 ? ((totalCorrectSimple / totalQuestionsSimple) * 100).toFixed(1) : "0.0";
            
            const trSimpleTotal = document.createElement("tr");
            trSimpleTotal.innerHTML = `
                <td><strong>Total Simple</strong></td>
                <td>${totalCorrectSimple}</td>
                <td>${incorrectSimple}</td>
                <td>${percentSimple}%</td>
            `;
            trSimpleTotal.style.backgroundColor = '#d4edda';
            tbody.appendChild(trSimpleTotal);

        } catch (error) {
            this.errorHandler.handle(error, 'Generate Simple Statistics');
        }
    }

    generateHardStatistics(tbody) {
        try {
            const tableHard = document.getElementById("tableHard");
            if (!tableHard) return;

            const rows = tableHard.querySelectorAll("tbody tr:not(.sumRow)");
            let correctHard = 0;
            let totalQuestionsHard = 0;

            rows.forEach(row => {
                totalQuestionsHard++;
                const inputs = row.querySelectorAll("input");
                let hasCorrectAnswer = false;
                
                inputs.forEach(input => {
                    const value = parseFloat(input.value);
                    if (!isNaN(value) && value > 0 && value <= 3) {
                        hasCorrectAnswer = true;
                    }
                });
                
                if (hasCorrectAnswer) correctHard++;
            });

            const incorrectHard = totalQuestionsHard - correctHard;
            const percentHard = totalQuestionsHard > 0 ? ((correctHard / totalQuestionsHard) * 100).toFixed(1) : "0.0";

            const trHardTotal = document.createElement("tr");
            trHardTotal.innerHTML = `
                <td><strong>Hard Questions</strong></td>
                <td>${correctHard}</td>
                <td>${incorrectHard}</td>
                <td>${percentHard}%</td>
            `;
            trHardTotal.style.backgroundColor = '#fff3cd';
            tbody.appendChild(trHardTotal);

        } catch (error) {
            this.errorHandler.handle(error, 'Generate Hard Statistics');
        }
    }

    generateCaptainStatistics(tbody) {
        try {
            const tableCap = document.getElementById("tableCap");
            if (!tableCap) return;

            const rows = tableCap.querySelectorAll("tbody tr:not(.sumRow)");
            let correctCap = 0;
            let totalQuestionsCap = 0;

            rows.forEach(row => {
                const rowNumberCell = row.querySelector('td');
                const rowNumber = parseInt(rowNumberCell?.textContent);
                
                // Skip first logical row (#1) as it's special
                if (rowNumber === 1) return;
                
                totalQuestionsCap++;
                const inputs = row.querySelectorAll("input");
                let hasCorrectAnswer = false;
                
                inputs.forEach(input => {
                    const value = parseFloat(input.value);
                    if (!isNaN(value) && value === 1) {
                        hasCorrectAnswer = true;
                    }
                });
                
                if (hasCorrectAnswer) correctCap++;
            });

            const incorrectCap = totalQuestionsCap - correctCap;
            const percentCap = totalQuestionsCap > 0 ? ((correctCap / totalQuestionsCap) * 100).toFixed(1) : "0.0";

            const trCapTotal = document.createElement("tr");
            trCapTotal.innerHTML = `
                <td><strong>Captain's Round</strong></td>
                <td>${correctCap}</td>
                <td>${incorrectCap}</td>
                <td>${percentCap}%</td>
            `;
            trCapTotal.style.backgroundColor = '#f8d7da';
            tbody.appendChild(trCapTotal);

        } catch (error) {
            this.errorHandler.handle(error, 'Generate Captain Statistics');
        }
    }

    generateOverallStatistics(tbody) {
        try {
            const tableIds = ["tableYesNo", "tableSimple", "tableHard", "tableCap"];
            let totalCorrect = 0;
            let totalQuestions = 0;

            tableIds.forEach(tableId => {
                const table = document.getElementById(tableId);
                if (!table) return;

                const rows = table.querySelectorAll("tbody tr:not(.sumRow)");
                rows.forEach(row => {
                    const rowNumberCell = row.querySelector('td');
                    const rowNumber = parseInt(rowNumberCell?.textContent);
                    
                    // Skip first logical row in Captain's round
                    if (tableId === "tableCap" && rowNumber === 1) return;
                    
                    totalQuestions++;
                    const inputs = row.querySelectorAll("input");
                    let hasAnswer = false;
                    
                    inputs.forEach(input => {
                        const value = parseFloat(input.value);
                        if (!isNaN(value) && value > 0) {
                            hasAnswer = true;
                        }
                    });
                    
                    if (hasAnswer) totalCorrect++;
                });
            });

            const totalIncorrect = totalQuestions - totalCorrect;
            const overallPercent = totalQuestions > 0 ? ((totalCorrect / totalQuestions) * 100).toFixed(1) : "0.0";

            const trOverall = document.createElement("tr");
            trOverall.innerHTML = `
                <td><strong>OVERALL TOTAL</strong></td>
                <td><strong>${totalCorrect}</strong></td>
                <td><strong>${totalIncorrect}</strong></td>
                <td><strong>${overallPercent}%</strong></td>
            `;
            trOverall.style.backgroundColor = '#cce5ff';
            trOverall.style.fontWeight = 'bold';
            trOverall.style.border = '2px solid #007bff';
            tbody.appendChild(trOverall);

        } catch (error) {
            this.errorHandler.handle(error, 'Generate Overall Statistics');
        }
    }

    generateTeamStatistics(tbody) {
        try {
            // Add separator
            const separator = document.createElement("tr");
            separator.innerHTML = '<td colspan="4" style="text-align: center; font-weight: bold; background-color: #f8f9fa; padding: 10px;">TEAM PERFORMANCE</td>';
            tbody.appendChild(separator);

            const teamIds = ["red", "green", "blue", "white", "yellow", "pink"];
            const teamNames = {
                red: "Red Team",
                green: "Green Team", 
                blue: "Blue Team",
                white: "White Team",
                yellow: "Yellow Team",
                pink: "Pink Team"
            };

            teamIds.forEach(team => {
                const teamStats = this.calculateTeamStats(team);
                const tr = document.createElement("tr");
                tr.innerHTML = `
                    <td>${teamNames[team]}</td>
                    <td>${teamStats.correct}</td>
                    <td>${teamStats.incorrect}</td>
                    <td>${teamStats.percentage}%</td>
                `;
                tr.style.backgroundColor = this.getTeamColor(team);
                tbody.appendChild(tr);
            });

        } catch (error) {
            this.errorHandler.handle(error, 'Generate Team Statistics');
        }
    }

    calculateTeamStats(teamId) {
        try {
            const teamIndex = ["red", "green", "blue", "white", "yellow", "pink"].indexOf(teamId);
            if (teamIndex === -1) return { correct: 0, incorrect: 0, percentage: "0.0" };

            const tableIds = ["tableYesNo", "tableSimple", "tableHard", "tableCap"];
            let correct = 0;
            let total = 0;

            tableIds.forEach(tableId => {
                const table = document.getElementById(tableId);
                if (!table) return;

                const rows = table.querySelectorAll("tbody tr:not(.sumRow)");
                rows.forEach(row => {
                    const rowNumberCell = row.querySelector('td');
                    const rowNumber = parseInt(rowNumberCell?.textContent);
                    
                    // Skip first logical row in Captain's round
                    if (tableId === "tableCap" && rowNumber === 1) return;
                    
                    total++;
                    const inputs = row.querySelectorAll("input");
                    const teamInput = inputs[teamIndex];
                    
                    if (teamInput) {
                        const value = parseFloat(teamInput.value);
                        if (!isNaN(value) && value > 0) {
                            correct++;
                        }
                    }
                });
            });

            const incorrect = total - correct;
            const percentage = total > 0 ? ((correct / total) * 100).toFixed(1) : "0.0";

            return { correct, incorrect, percentage };

        } catch (error) {
            this.errorHandler.handle(error, 'Calculate Team Stats');
            return { correct: 0, incorrect: 0, percentage: "0.0" };
        }
    }

    getTeamColor(teamId) {
        const colors = {
            red: '#ffebee',
            green: '#e8f5e8',
            blue: '#e3f2fd',
            white: '#fafafa',
            yellow: '#fffde7',
            pink: '#fce4ec'
        };
        return colors[teamId] || '#ffffff';
    }

    exportStatistics() {
        try {
            const tbody = document.querySelector("#statisticsTable tbody");
            if (!tbody) {
                this.notifications.warning("No statistics data to export");
                return;
            }

            const rows = tbody.querySelectorAll("tr");
            let csvContent = "Round Name,Correct Answers,Incorrect Answers,Correct Percentage\n";
            
            rows.forEach(row => {
                const cells = row.querySelectorAll("td");
                if (cells.length === 4) {
                    const roundName = cells[0].textContent.trim();
                    const correct = cells[1].textContent.trim();
                    const incorrect = cells[2].textContent.trim();
                    const percentage = cells[3].textContent.trim();
                    
                    csvContent += `"${roundName}","${correct}","${incorrect}","${percentage}"\n`;
                }
            });

            // Create and download file
            const blob = new Blob([csvContent], { type: 'text/csv' });
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `brainring-statistics-${new Date().toISOString().split('T')[0]}.csv`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            window.URL.revokeObjectURL(url);

            this.notifications.success("Statistics exported successfully!");

        } catch (error) {
            this.errorHandler.handle(error, 'Export Statistics');
        }
    }

    resetStatistics() {
        try {
            const tbody = document.querySelector("#statisticsTable tbody");
            if (tbody) {
                tbody.innerHTML = "";
            }
            this.notifications.info("Statistics cleared");
        } catch (error) {
            this.errorHandler.handle(error, 'Reset Statistics');
        }
    }
}

// Initialize statistics manager when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    try {
        // Wait for core systems to be initialized
        if (window.BrainRing && window.BrainRing.gameState) {
            const { gameState, notifications, errorHandler } = window.BrainRing;
            window.statisticsManager = new StatisticsManager(gameState, notifications, errorHandler);
            
            // Add export and reset functions to global scope
            window.exportStatistics = () => window.statisticsManager.exportStatistics();
            window.resetStatistics = () => window.statisticsManager.resetStatistics();
            
            console.log('✅ Statistics manager initialized successfully');
        } else {
            console.error('❌ Core systems not initialized. Please ensure core.js is loaded first.');
        }
    } catch (error) {
        console.error('❌ Failed to initialize statistics manager:', error);
    }
});
