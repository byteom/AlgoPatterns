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
    3: "Entering the bubbleSort function.",
    4: "Starting the outer loop. It will run for n-1 iterations.",
    5: "Starting the inner loop to compare and swap adjacent elements.",
    6: "Checking if the current element is greater than the next one.",
    7: "Swapping the elements if the current element is greater.",
    10: "Ending the bubbleSort function.",
    14: "Array initialized and passed to the bubbleSort function.",
    15: "Calculating the number of elements in the array.",
    16: "Calling the bubbleSort function.",
    17: "End of the main function."
};

let array = [];
let i = 0, j = 0;
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

function bubbleSortStep(manualTrigger = false) {
    if (i < array.length - 1) {
        if (j < array.length - i - 1) {
            highlightCodeLine(5);
            const items = document.querySelectorAll('.array-item');
            items[j].classList.add('compare');
            items[j + 1].classList.add('compare');
            
            setTimeout(() => {
                highlightCodeLine(6);
                if (array[j] > array[j + 1]) {
                    highlightCodeLine(7);
                    items[j].classList.add('swap');
                    items[j + 1].classList.add('swap');
                    let temp = array[j];
                    array[j] = array[j + 1];
                    array[j + 1] = temp;
                    visualizeArray();
                    swapCount++;
                    updateSwapCount();
                }
                items[j].classList.remove('compare', 'swap');
                items[j + 1].classList.remove('compare', 'swap');
                j++;
                saveState(); // Save the state after each step
                if (!manualTrigger) setTimeout(bubbleSortStep, animationSpeed);
            }, animationSpeed / 2);
        } else {
            j = 0;
            i++;
            saveState(); // Save the state after completing a pass
            if (!manualTrigger) setTimeout(bubbleSortStep, animationSpeed);
        }
    } else {
        highlightCodeLine(10);
        updateExplanation(10);
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
                    bubbleSortStep();
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
    i = 0;
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
    bubbleSortStep(true);
});

previousStepBtn.addEventListener('click', () => {
    if (history.length > 1) {
        history.pop(); // Remove the current state
        restoreState(history.length - 1); // Restore the previous state
    }
});

function showSummary() {
    const elapsed = (Date.now() - startTime) / 1000;
    summaryDescription.innerText = `The sorting process completed in ${elapsed.toFixed(2)} seconds with a total of ${swapCount} swaps.`;
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
