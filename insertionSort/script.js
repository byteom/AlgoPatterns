const codeDisplay = document.getElementById('code-display');
const arrayInput = document.getElementById('array-input');
const startStopBtn = document.getElementById('start-stop-btn');
const arrayContainer = document.getElementById('array-container');
const lineExplanation = document.getElementById('line-explanation');
const speedSlider = document.getElementById('speed-slider');
const speedValue = document.getElementById('speed-value');
const manualModeBtn = document.getElementById('manual-mode-btn');
const automaticModeBtn = document.getElementById('automatic-mode-btn');
const resetBtn = document.getElementById('reset-btn');
const manualControls = document.getElementById('manual-controls');
const automaticControls = document.getElementById('automatic-controls');
const nextStepBtn = document.getElementById('next-step-btn');
const previousStepBtn = document.getElementById('previous-step-btn');
const swapCountDisplay = document.getElementById('swap-count');
const timeElapsedDisplay = document.getElementById('time-elapsed');
const summaryDescription = document.getElementById('summary-description');
const downloadSummaryBtn = document.getElementById('download-summary-btn');
const summarySection = document.querySelector('.summary-section');

const codeLines = codeDisplay.innerHTML.split('\n');
const explanations = {
    3: "Entering the insertionSort function.",
    4: "Starting the loop to pick elements from unsorted part of the array.",
    5: "Setting the key to the current element and starting to compare with previous elements.",
    6: "Comparing and shifting elements greater than the key to the right.",
    7: "Inserting the key at the correct position.",
    12: "Ending the insertionSort function.",
    14: "Array initialized and passed to the insertionSort function.",
    15: "Calculating the number of elements in the array.",
    16: "Calling the insertionSort function.",
    17: "End of the main function."
};

let array = [];
let i = 1, j = 0;
let key;
let animationSpeed = parseInt(speedSlider.value);
let sortingInterval;
let isSorting = false;
let isManualMode = false;
let swapCount = 0;
let startTime;
let history = []; // To track the steps for manual navigation

function highlightCodeLine(lineNumber) {
    const highlighted = codeLines.map((line, index) => {
        return index === lineNumber ? `<span class="highlight">${line}</span>` : line;
    }).join('\n');
    codeDisplay.innerHTML = highlighted;
    updateExplanation(lineNumber);
}

function visualizeArray() {
    arrayContainer.innerHTML = '';
    array.forEach((num, idx) => {
        const div = document.createElement('div');
        div.classList.add('array-item');
        div.innerText = num;
        arrayContainer.appendChild(div);
    });
}

function updateExplanation(lineNumber) {
    lineExplanation.innerText = explanations[lineNumber] || '';
}

function updateSwapCount() {
    swapCountDisplay.innerText = `Swaps: ${swapCount}`;
}

function updateTimeElapsed() {
    const elapsed = (Date.now() - startTime) / 1000;
    timeElapsedDisplay.innerText = `Time Elapsed: ${elapsed.toFixed(2)}s`;
}

function saveState() {
    history.push({ array: [...array], i, j });
}

function restoreState(step) {
    if (step >= 0 && step < history.length) {
        const state = history[step];
        array = state.array;
        i = state.i;
        j = state.j;
        visualizeArray();
    }
}

function insertionSortStep(manualTrigger = false) {
    if (i < array.length) {
        highlightCodeLine(4);
        if (j === i - 1) {
            key = array[i];
            highlightCodeLine(5);
        }
        if (j >= 0 && array[j] > key) {
            highlightCodeLine(6);
            array[j + 1] = array[j];
            visualizeArray();
            j--;
            swapCount++;
            updateSwapCount();
            saveState(); // Save the state after each shift
        } else {
            highlightCodeLine(7);
            array[j + 1] = key;
            visualizeArray();
            i++;
            j = i - 1;
            saveState(); // Save the state after each insertion
            if (!manualTrigger) setTimeout(insertionSortStep, animationSpeed);
        }
    } else {
        highlightCodeLine(12);
        updateExplanation(12);
        stopSorting();
        showSummary();
    }
}

function startSorting() {
    if (!isSorting) {
        swapCount = 0;
        startTime = Date.now();
        highlightCodeLine(14); // Highlight when main starts
        setTimeout(() => {
            highlightCodeLine(15);
            setTimeout(() => {
                highlightCodeLine(16);
                sortingInterval = setInterval(() => {
                    insertionSortStep();
                    updateTimeElapsed();
                }, animationSpeed);
            }, animationSpeed);
        }, animationSpeed);
        startStopBtn.textContent = "Stop Sorting";
        isSorting = true;
    }
}

function stopSorting() {
    clearInterval(sortingInterval);
    startStopBtn.textContent = "Start Sorting";
    isSorting = false;
    updateTimeElapsed();
}

function resetSorting() {
    stopSorting();
    i = 1;
    j = 0;
    swapCount = 0;
    history = [];
    updateSwapCount();
    timeElapsedDisplay.innerText = "Time Elapsed: 0s";
    summarySection.classList.add('hidden');
    array = arrayInput.value.split(',').map(Number);
    visualizeArray();
    highlightCodeLine(null);
    updateExplanation(null);
}

function toggleMode(isManual) {
    isManualMode = isManual;
    if (isManualMode) {
        manualControls.classList.remove('hidden');
        automaticControls.classList.add('hidden');
        stopSorting(); // Stop any automatic sorting
    } else {
        manualControls.classList.add('hidden');
        automaticControls.classList.remove('hidden');
    }
    history = []; // Reset history on mode change
    swapCount = 0; // Reset swap count on mode change
    startTime = null; // Reset time on mode change
    updateSwapCount();
    timeElapsedDisplay.innerText = "Time Elapsed: 0s";
    summarySection.classList.add('hidden'); // Hide summary section on mode change
}

manualModeBtn.addEventListener('click', () => toggleMode(true));
automaticModeBtn.addEventListener('click', () => toggleMode(false));

startStopBtn.addEventListener('click', () => {
    if (isSorting) {
        stopSorting();
    } else {
        startSorting();
    }
});

resetBtn.addEventListener('click', resetSorting);

speedSlider.addEventListener('input', () => {
    animationSpeed = parseInt(speedSlider.value);
    speedValue.innerText = `${animationSpeed} ms`;
    if (isSorting) {
        stopSorting();
        startSorting();
    }
});

arrayInput.addEventListener('change', resetSorting);

nextStepBtn.addEventListener('click', () => {
    insertionSortStep(true);
});

previousStepBtn.addEventListener('click', () => {
    if (history.length > 1) {
        history.pop(); // Remove the current state
        restoreState(history.length - 1); // Restore the previous state
    }
});

function showSummary() {
    const elapsed = (Date.now() - startTime) / 1000;
    summaryDescription.innerText = `The sorting process completed in ${elapsed.toFixed(2)} seconds with a total of ${swapCount} shifts.`;
    summarySection.classList.remove('hidden');
}

function downloadSummary() {
    const text = summaryDescription.innerText;
    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'sorting-summary.txt';
    a.click();
    URL.revokeObjectURL(url);
}

downloadSummaryBtn.addEventListener('click', downloadSummary);

window.onload = () => {
    array = arrayInput.value.split(',').map(Number);
    visualizeArray();
};
