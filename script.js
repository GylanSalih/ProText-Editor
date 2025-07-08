   // Globale Variablen
        let originalText = "";
        let textHistory = [];
        let currentHistoryIndex = -1;

        // DOM Elemente
        const inputText = document.getElementById('inputText');
        const outputText = document.getElementById('outputText');
        const maxLengthInput = document.getElementById('maxLength');
        const maxWordsInput = document.getElementById('maxWords');
        const modeRadios = document.querySelectorAll('input[name="modus"]');
        const removeExtraSpaces = document.getElementById('removeExtraSpaces');
        const removeEmptyLines = document.getElementById('removeEmptyLines');
        const trimLines = document.getElementById('trimLines');
        const textCase = document.getElementById('textCase');
        const reverseText = document.getElementById('reverseText');
        const searchText = document.getElementById('searchText');
        const replaceText = document.getElementById('replaceText');
        const caseSensitive = document.getElementById('caseSensitive');
        const addLineNumbers = document.getElementById('addLineNumbers');
        const lineNumberStart = document.getElementById('lineNumberStart');
        const sortOrder = document.getElementById('sortOrder');
        const removeDuplicates = document.getElementById('removeDuplicates');

        // Buttons
        const btnProcess = document.getElementById('btnProcess');
        const btnClear = document.getElementById('btnClear');
        const btnCopy = document.getElementById('btnCopy');
        const btnUndo = document.getElementById('btnUndo');
        const btnReset = document.getElementById('btnReset');
        const copyInputBtn = document.getElementById('copyInputBtn');
        const copyOutputBtn = document.getElementById('copyOutputBtn');

        // Statistik Elemente
        const charCount = document.getElementById('charCount');
        const wordCount = document.getElementById('wordCount');
        const lineCount = document.getElementById('lineCount');
        const paragraphCount = document.getElementById('paragraphCount');
        const sentenceCount = document.getElementById('sentenceCount');
        const bookmarkCount = document.getElementById('bookmarkCount');
        const readingTime = document.getElementById('readingTime');
        const inputCharCount = document.getElementById('inputCharCount');
        const outputCharCount = document.getElementById('outputCharCount');
        const charProgress = document.getElementById('charProgress');
        const wordProgress = document.getElementById('wordProgress');

        // Event Listeners
        window.addEventListener('load', function() {
            originalText = inputText.value;
            updateStatistics();
            processText();
        });

        inputText.addEventListener('input', function() {
            updateStatistics();
            processText();
        });

        // Alle Eingabefelder überwachen
        const allInputs = [
            maxLengthInput, maxWordsInput, removeExtraSpaces, removeEmptyLines,
            trimLines, textCase, reverseText, searchText, replaceText,
            caseSensitive, addLineNumbers, lineNumberStart, sortOrder, removeDuplicates
        ];

        allInputs.forEach(function(input) {
            input.addEventListener('input', processText);
            input.addEventListener('change', processText);
        });

        modeRadios.forEach(function(radio) {
            radio.addEventListener('change', processText);
        });

        // Button Event Listeners
        btnProcess.addEventListener('click', processText);
        btnClear.addEventListener('click', clearText);
        btnCopy.addEventListener('click', copyToClipboard);
        btnUndo.addEventListener('click', undoAction);
        btnReset.addEventListener('click', resetToOriginal);

        // Copy button event listeners
        copyInputBtn.addEventListener('click', function() {
            copyTextToClipboard(inputText.value, 'Eingabe kopiert!');
        });

        copyOutputBtn.addEventListener('click', function() {
            const outputContent = outputText.textContent;
            if (outputContent && outputContent !== 'Bearbeiteter Text wird hier angezeigt...') {
                copyTextToClipboard(outputContent, 'Ausgabe kopiert!');
            } else {
                showNotification('Keine Ausgabe zum Kopieren', 'error');
            }
        });

        // Funktionen
        function updateStatistics() {
            const text = inputText.value;
            const chars = text.length;
            const words = text.trim() ? text.trim().split(/\s+/).length : 0;
            const lines = text.split('\n').length;
            const paragraphs = text.trim() ? text.trim().split(/\n\s*\n/).length : 0;
            const sentences = text.trim() ? text.trim().split(/[.!?]+/).filter(s => s.trim().length > 0).length : 0;
            const bookmarks = (text.match(/#\w+/g) || []).length; // Zählt Wörter mit #
            const readingTimeMinutes = Math.ceil(words / 200);

            charCount.textContent = chars;
            wordCount.textContent = words;
            lineCount.textContent = lines;
            paragraphCount.textContent = paragraphs;
            sentenceCount.textContent = sentences;
            bookmarkCount.textContent = bookmarks;
            readingTime.textContent = readingTimeMinutes;
            inputCharCount.textContent = chars + ' Zeichen';

            // Progress Bars
            const maxChars = parseInt(maxLengthInput.value) || 200;
            const maxWords = parseInt(maxWordsInput.value) || 20;
            const charPercent = Math.min((chars / maxChars) * 100, 100);
            const wordPercent = Math.min((words / maxWords) * 100, 100);
            
            charProgress.style.width = charPercent + '%';
            wordProgress.style.width = wordPercent + '%';
        }

        function processText() {
            let text = inputText.value;
            
            if (!text.trim()) {
                outputText.textContent = "Bearbeiteter Text wird hier angezeigt...";
                outputCharCount.textContent = '0 Zeichen';
                return;
            }

            // Text Formatierung
            if (removeExtraSpaces.checked) {
                text = text.replace(/\s+/g, ' ');
            }

            if (removeEmptyLines.checked) {
                text = text.replace(/\n\s*\n/g, '\n');
            }

            if (trimLines.checked) {
                text = text.split('\n').map(line => line.trim()).join('\n');
            }

            // Suchen und Ersetzen
            if (searchText.value) {
                const flags = caseSensitive.checked ? 'g' : 'gi';
                const regex = new RegExp(searchText.value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), flags);
                text = text.replace(regex, replaceText.value);
            }

            // Text Transformation
            if (textCase.value !== 'none') {
                switch (textCase.value) {
                    case 'upper':
                        text = text.toUpperCase();
                        break;
                    case 'lower':
                        text = text.toLowerCase();
                        break;
                    case 'title':
                        text = text.replace(/\w\S*/g, (txt) => 
                            txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase()
                        );
                        break;
                    case 'sentence':
                        text = text.toLowerCase().replace(/(^\s*\w|[\.\!\?]\s*\w)/g, (c) => c.toUpperCase());
                        break;
                }
            }

            if (reverseText.checked) {
                text = text.split('').reverse().join('');
            }

            // Sortierung
            if (sortOrder.value !== 'none') {
            let lines = text.split('\n').map(line => line.trim()); // <- immer trimmen
            switch (sortOrder.value) {
                case 'asc': lines.sort(); break;
                case 'desc': lines.sort().reverse(); break;
                case 'length': lines.sort((a, b) => a.length - b.length); break;
            }
            text = lines.join('\n');
            }

            // Duplikate entfernen
            if (removeDuplicates.checked) {
            let lines = text.split('\n').map(line => line.trim()); // <- immer trimmen
            let uniqueLines = [...new Set(lines)];
            text = uniqueLines.join('\n');
            }


            // Zeilennummern hinzufügen
            if (addLineNumbers.checked) {
                const lines = text.split('\n');
                const startNum = parseInt(lineNumberStart.value) || 1;
                const numberedLines = lines.map((line, index) => {
                    const lineNum = (startNum + index).toString().padStart(3, '0');
                    return lineNum + ': ' + line;
                });
                text = numberedLines.join('\n');
            }

            // Text kürzen
            const mode = document.querySelector('input[name="modus"]:checked').value;
            const maxLen = parseInt(maxLengthInput.value) || 200;
            const maxWords = parseInt(maxWordsInput.value) || 20;

            if (mode === 'chars' || mode === 'combo') {
                if (text.length > maxLen) {
                    text = text.slice(0, maxLen);
                    const lastSpace = text.lastIndexOf(' ');
                    if (lastSpace > 0) {
                        text = text.slice(0, lastSpace);
                    }
                    text += '...';
                }
            }

            if (mode === 'words' || mode === 'combo') {
                const words = text.split(/\s+/);
                if (words.length > maxWords) {
                    text = words.slice(0, maxWords).join(' ') + '...';
                }
            }

            outputText.textContent = text;
            outputCharCount.textContent = text.length + ' Zeichen';
        }

        function clearText() {
            saveToHistory();
            inputText.value = '';
            outputText.textContent = 'Bearbeiteter Text wird hier angezeigt...';
            updateStatistics();
            outputCharCount.textContent = '0 Zeichen';
            showNotification('Text geleert', 'success');
        }

        function copyToClipboard() {
            const textToCopy = outputText.textContent;
            if (textToCopy && textToCopy !== 'Bearbeiteter Text wird hier angezeigt...') {
                copyTextToClipboard(textToCopy, 'Text kopiert!');
            } else {
                showNotification('Kein Text zum Kopieren', 'error');
            }
        }

        function copyTextToClipboard(text, successMessage) {
            navigator.clipboard.writeText(text).then(() => {
                showNotification(successMessage, 'success');
            }).catch(err => {
                // Fallback für ältere Browser
                const textArea = document.createElement('textarea');
                textArea.value = text;
                document.body.appendChild(textArea);
                textArea.select();
                try {
                    document.execCommand('copy');
                    showNotification(successMessage, 'success');
                } catch (err) {
                    showNotification('Fehler beim Kopieren', 'error');
                }
                document.body.removeChild(textArea);
            });
        }

        function showNotification(message, type) {
            const notification = document.getElementById('notification');
            notification.textContent = message;
            notification.className = `notification ${type}`;
            notification.classList.add('show');
            
            setTimeout(() => {
                notification.classList.remove('show');
            }, 3000);
        }

        function saveToHistory() {
            const currentText = inputText.value;
            if (currentText !== textHistory[currentHistoryIndex]) {
                textHistory = textHistory.slice(0, currentHistoryIndex + 1);
                textHistory.push(currentText);
                currentHistoryIndex = textHistory.length - 1;
                
                // Maximal 50 Einträge im Verlauf behalten
                if (textHistory.length > 50) {
                    textHistory.shift();
                    currentHistoryIndex--;
                }
            }
        }

        function undoAction() {
            if (currentHistoryIndex > 0) {
                currentHistoryIndex--;
                inputText.value = textHistory[currentHistoryIndex];
                updateStatistics();
                processText();
                showNotification('Rückgängig gemacht', 'success');
            } else {
                showNotification('Keine Aktion zum Rückgängigmachen', 'error');
            }
        }

        function resetToOriginal() {
            saveToHistory();
            inputText.value = originalText;
            updateStatistics();
            processText();
            showNotification('Zu Originaltext zurückgesetzt', 'success');
        }

        // Keyboard Shortcuts
        document.addEventListener('keydown', function(e) {
            // Strg+Z für Rückgängig
            if (e.ctrlKey && e.key === 'z') {
                e.preventDefault();
                undoAction();
            }
            
            // Strg+Enter für Text bearbeiten
            if (e.ctrlKey && e.key === 'Enter') {
                e.preventDefault();
                processText();
            }
            
            // Strg+Shift+C für Kopieren der Ausgabe
            if (e.ctrlKey && e.shiftKey && e.key === 'C') {
                e.preventDefault();
                copyToClipboard();
            }
            
            // Strg+Shift+L für Leeren
            if (e.ctrlKey && e.shiftKey && e.key === 'L') {
                e.preventDefault();
                clearText();
            }
            
            // Strg+R für Reset
            if (e.ctrlKey && e.key === 'r') {
                e.preventDefault();
                resetToOriginal();
            }
        });

        // Auto-save Funktion (optional)
        function autoSave() {
            try {
                const data = {
                    text: inputText.value,
                    settings: {
                        maxLength: maxLengthInput.value,
                        maxWords: maxWordsInput.value,
                        mode: document.querySelector('input[name="modus"]:checked').value,
                        removeExtraSpaces: removeExtraSpaces.checked,
                        removeEmptyLines: removeEmptyLines.checked,
                        trimLines: trimLines.checked,
                        textCase: textCase.value,
                        reverseText: reverseText.checked,
                        searchText: searchText.value,
                        replaceText: replaceText.value,
                        caseSensitive: caseSensitive.checked,
                        addLineNumbers: addLineNumbers.checked,
                        lineNumberStart: lineNumberStart.value,
                        sortOrder: sortOrder.value,
                        removeDuplicates: removeDuplicates.checked
                    }
                };
                
                // Hier könnten Sie localStorage verwenden, wenn gewünscht
                // localStorage.setItem('textEditorData', JSON.stringify(data));
                
            } catch (error) {
                console.warn('Auto-save fehlgeschlagen:', error);
            }
        }

        // Auto-save alle 10 Sekunden
        setInterval(autoSave, 10000);

        // Export/Import Funktionen
        function exportSettings() {
            const settings = {
                maxLength: maxLengthInput.value,
                maxWords: maxWordsInput.value,
                mode: document.querySelector('input[name="modus"]:checked').value,
                removeExtraSpaces: removeExtraSpaces.checked,
                removeEmptyLines: removeEmptyLines.checked,
                trimLines: trimLines.checked,
                textCase: textCase.value,
                reverseText: reverseText.checked,
                searchText: searchText.value,
                replaceText: replaceText.value,
                caseSensitive: caseSensitive.checked,
                addLineNumbers: addLineNumbers.checked,
                lineNumberStart: lineNumberStart.value,
                sortOrder: sortOrder.value,
                removeDuplicates: removeDuplicates.checked
            };
            
            const dataStr = JSON.stringify(settings, null, 2);
            const dataBlob = new Blob([dataStr], {type: 'application/json'});
            const url = URL.createObjectURL(dataBlob);
            const link = document.createElement('a');
            link.href = url;
            link.download = 'text-editor-settings.json';
            link.click();
            URL.revokeObjectURL(url);
            showNotification('Einstellungen exportiert', 'success');
        }

        function importSettings(file) {
            const reader = new FileReader();
            reader.onload = function(e) {
                try {
                    const settings = JSON.parse(e.target.result);
                    
                    // Einstellungen anwenden
                    maxLengthInput.value = settings.maxLength || 200;
                    maxWordsInput.value = settings.maxWords || 20;
                    document.querySelector(`input[name="modus"][value="${settings.mode}"]`).checked = true;
                    removeExtraSpaces.checked = settings.removeExtraSpaces || false;
                    removeEmptyLines.checked = settings.removeEmptyLines || false;
                    trimLines.checked = settings.trimLines || false;
                    textCase.value = settings.textCase || 'none';
                    reverseText.checked = settings.reverseText || false;
                    searchText.value = settings.searchText || '';
                    replaceText.value = settings.replaceText || '';
                    caseSensitive.checked = settings.caseSensitive || false;
                    addLineNumbers.checked = settings.addLineNumbers || false;
                    lineNumberStart.value = settings.lineNumberStart || 1;
                    sortOrder.value = settings.sortOrder || 'none';
                    removeDuplicates.checked = settings.removeDuplicates || false;
                    
                    processText();
                    showNotification('Einstellungen importiert', 'success');
                } catch (error) {
                    showNotification('Fehler beim Importieren der Einstellungen', 'error');
                }
            };
            reader.readAsText(file);
        }

        // Drag & Drop für Textfiles
        const dropZone = document.getElementById('inputText');
        
        dropZone.addEventListener('dragover', function(e) {
            e.preventDefault();
            dropZone.style.background = '#f0f0f0';
        });
        
        dropZone.addEventListener('dragleave', function(e) {
            e.preventDefault();
            dropZone.style.background = '';
        });
        
        dropZone.addEventListener('drop', function(e) {
            e.preventDefault();
            dropZone.style.background = '';
            
            const files = e.dataTransfer.files;
            if (files.length > 0) {
                const file = files[0];
                if (file.type === 'text/plain' || file.name.endsWith('.txt')) {
                    const reader = new FileReader();
                    reader.onload = function(e) {
                        saveToHistory();
                        inputText.value = e.target.result;
                        updateStatistics();
                        processText();
                        showNotification('Datei geladen', 'success');
                    };
                    reader.readAsText(file);
                } else {
                    showNotification('Nur Textdateien (.txt) werden unterstützt', 'error');
                }
            }
        });

        // Initialisierung beim Laden der Seite
        window.addEventListener('load', function() {
            // Erste Speicherung in Historie
            textHistory.push(inputText.value);
            currentHistoryIndex = 0;
            
            // Fokus auf Eingabefeld setzen
            inputText.focus();
            
            // Tooltips hinzufügen (optional)
            addTooltips();
        });

        // Tooltips hinzufügen
        function addTooltips() {
            const tooltips = {
                'maxLength': 'Maximale Anzahl Zeichen im Text',
                'maxWords': 'Maximale Anzahl Wörter im Text',
                'removeExtraSpaces': 'Entfernt mehrfache Leerzeichen',
                'removeEmptyLines': 'Entfernt leere Zeilen aus dem Text',
                'trimLines': 'Entfernt Leerzeichen am Anfang und Ende jeder Zeile',
                'textCase': 'Ändert die Groß-/Kleinschreibung',
                'reverseText': 'Kehrt den gesamten Text um',
                'searchText': 'Text der gesucht werden soll',
                'replaceText': 'Text als Ersatz',
                'caseSensitive': 'Groß-/Kleinschreibung beim Suchen beachten',
                'addLineNumbers': 'Fügt Zeilennummern hinzu',
                'lineNumberStart': 'Startnummer für Zeilennummerierung',
                'sortOrder': 'Sortiert die Zeilen',
                'removeDuplicates': 'Entfernt doppelte Zeilen'
            };
            
            Object.keys(tooltips).forEach(id => {
                const element = document.getElementById(id);
                if (element) {
                    element.title = tooltips[id];
                }
            });
        }

        // Performance-Optimierung: Debounce für häufige Updates
        function debounce(func, wait) {
            let timeout;
            return function executedFunction(...args) {
                const later = () => {
                    clearTimeout(timeout);
                    func(...args);
                };
                clearTimeout(timeout);
                timeout = setTimeout(later, wait);
            };
        }

        // Debounced Version der processText Funktion
        const debouncedProcessText = debounce(processText, 300);

        // Event Listener für Input mit Debounce
        inputText.addEventListener('input', function() {
            updateStatistics();
            debouncedProcessText();
        });