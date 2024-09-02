const codeDisplay = document.getElementById('code-display');
const arrayInput = document.getElementById('array-input');
const keyInput = document.getElementById('key-input');
const sizeInput = document.getElementById('size-input');
const generateArrayBtn = document.getElementById('generate-array-btn');
const startStopBtn = document.getElementById('start-stop-btn');
const arrayContainer = document.getElementById('array-container');
const pointerContainer = document.getElementById('pointer-container');
const leftPointer = document.getElementById('left-pointer');
const middlePointer = document.getElementById('middle-pointer');
const rightPointer = document.getElementById('right-pointer');
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
const searchStatus = document.getElementById('search-status');
const timeElapsedDisplay = document.getElementById('time-elapsed');
const summaryDescription = document.getElementById('summary-description');
const downloadSummaryBtn = document.getElementById('download-summary-btn');
const summarySection = document.querySelector('.summary-section');

const codeLines = codeDisplay.innerHTML.split('\n');
const explanations = {
    3: "Entering the binarySearch function.",
    4: "Calculating the middle element index.",
    7: "Checking if the middle element is the search key.",
    10: "If the search key is greater, ignore the left half.",
    13: "If the search key is smaller, ignore the right half.",
    17: "Element not found in the array.",
    21: "End of binarySearch function.",
    23: "Array initialized and search key assigned.",
    24: "Calling the binarySearch function.",
    25: "End of the main function."
};

let array = [];
let l = 0, r = 0, m = 0;
let x = 0;
let animationSpeed = parseInt(speedSlider.value);
let sortingInterval;
let isSorting = false;
let isManualMode = false;
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
        if (idx === m) {
            div.classList.add('middle');
        }
        div.innerText = num;
        arrayContainer.appendChild(div);
    });
}

function updateExplanation(lineNumber) {
    lineExplanation.innerText = explanations[lineNumber] || '';
}

function updateSearchStatus(status) {
    searchStatus.innerText = `Search Status: ${status}`;
}

function updateTimeElapsed() {
    const elapsed = (Date.now() - startTime) / 1000;
    timeElapsedDisplay.innerText = `Time Elapsed: ${elapsed.toFixed(2)}s`;
}

function saveState() {
    history.push({ array: [...array], l, r, m, x });
}

function restoreState(step) {
    if (step >= 0 && step < history.length) {
        const state = history[step];
        array = state.array;
        l = state.l;
        r = state.r;
        m = state.m;
        x = state.x;
        visualizeArray();
        updatePointers();
    }
}

function updatePointers() {
    const arrayItems = document.querySelectorAll('.array-item');
    arrayItems.forEach(item => item.classList.remove('middle', 'found'));

    arrayItems[l].classList.add('left');
    arrayItems[m].classList.add('middle');
    arrayItems[r].classList.add('right');

    leftPointer.style.left = `${arrayItems[l].offsetLeft}px`;
    middlePointer.style.left = `${arrayItems[m].offsetLeft}px`;
    rightPointer.style.left = `${arrayItems[r].offsetLeft}px`;

    leftPointer.style.display = 'inline';
    middlePointer.style.display = 'inline';
    rightPointer.style.display = 'inline';
}

function binarySearchStep(manualTrigger = false) {
    if (l <= r) {
        highlightCodeLine(4);
        m = Math.floor(l + (r - l) / 2);
        visualizeArray();
        updatePointers();

        setTimeout(() => {
            highlightCodeLine(7);
            if (array[m] == x) {
                highlightCodeLine(21);
                updateSearchStatus(`Element found at index ${m}`);
                document.querySelectorAll('.array-item')[m].classList.add('found');
                stopSorting();
                showSummary(true);
                return;
            } else if (array[m] < x) {
                highlightCodeLine(10);
                l = m + 1;
                saveState();
            } else {
                highlightCodeLine(13);
                r = m - 1;
                saveState();
            }
            if (!manualTrigger) setTimeout(binarySearchStep, animationSpeed);
        }, animationSpeed / 2);
    } else {
        highlightCodeLine(17);
        updateSearchStatus("Element not found");
        stopSorting();
        showSummary(false);
    }
}

function startSorting() {
    if (!isSorting) {
        startTime = Date.now();
        highlightCodeLine(23); // Highlight when main starts
        setTimeout(() => {
            highlightCodeLine(24);
            sortingInterval = setInterval(() => {
                binarySearchStep();
                updateTimeElapsed();
            }, animationSpeed);
        }, animationSpeed);
        startStopBtn.textContent = "Stop Search";
        isSorting = true;
    }
}

function stopSorting() {
    clearInterval(sortingInterval);
    startStopBtn.textContent = "Start Search";
    isSorting = false;
    updateTimeElapsed();
}

function resetSorting() {
    stopSorting();
    l = 0;
    r = array.length - 1;
    m = 0;
    x = parseInt(keyInput.value);
    history = [];
    updateSearchStatus("Not Started");
    timeElapsedDisplay.innerText = "Time Elapsed: 0s";
    summarySection.classList.add('hidden');
    array = arrayInput.value.split(',').map(Number);
    visualizeArray();
    updatePointers();
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
    startTime = null; // Reset time on mode change
    updateSearchStatus("Not Started");
    timeElapsedDisplay.innerText = "Time Elapsed: 0s";
    summarySection.classList.add('hidden'); // Hide summary section on mode change
}

function generateRandomArray() {
    const size = parseInt(sizeInput.value);
    array = Array.from({ length: size }, () => Math.floor(Math.random() * 100)).sort((a, b) => a - b);
    arrayInput.value = array.join(',');
    resetSorting();
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
generateArrayBtn.addEventListener('click', generateRandomArray);

speedSlider.addEventListener('input', () => {
    animationSpeed = parseInt(speedSlider.value);
    speedValue.innerText = `${animationSpeed} ms`;
    if (isSorting) {
        stopSorting();
        startSorting();
    }
});

arrayInput.addEventListener('change', resetSorting);
keyInput.addEventListener('change', resetSorting);

nextStepBtn.addEventListener('click', () => {
    binarySearchStep(true);
});

previousStepBtn.addEventListener('click', () => {
    if (history.length > 1) {
        history.pop(); // Remove the current state
        restoreState(history.length - 1); // Restore the previous state
    }
});

function showSummary(found) {
    const elapsed = (Date.now() - startTime) / 1000;
    if (found) {
        summaryDescription.innerText = `The search process completed in ${elapsed.toFixed(2)} seconds. The element was found at index ${m}.`;
    } else {
        summaryDescription.innerText = `The search process completed in ${elapsed.toFixed(2)} seconds. The element was not found in the array.`;
    }
    summarySection.classList.remove('hidden');
}

function downloadSummary() {
    const text = summaryDescription.innerText;
    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'search-summary.txt';
    a.click();
    URL.revokeObjectURL(url);
}

downloadSummaryBtn.addEventListener('click', downloadSummary);

window.onload = () => {
    array = arrayInput.value.split(',').map(Number);
    x = parseInt(keyInput.value);
    r = array.length - 1;
    visualizeArray();
    updatePointers();
};
