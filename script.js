function playSound(src) {
    const audio = new Audio(src);
    audio.play();
}

const display = document.getElementById("display");
const preview = document.getElementById("preview");
const buttons = document.querySelectorAll("button");
const historyPanel = document.getElementById("history");
const historyToggle = document.getElementById("history-toggle");
const themeSelector = document.getElementById("theme");

let historyArr = [];

// -------------------- BUTTON CLICK SUPPORT --------------------
buttons.forEach(button => {
    button.addEventListener("click", () => handleButton(button));
});

document.addEventListener("keydown", (e) => {
    const key = e.key;

    if (!isNaN(key) || ["+", "-", "*", "/", "."].includes(key)) {
        playSound("sounds/click.mp3");
        appendValue(key);
        animateByValue(key);
        return;
    }

    if (key === "=" || key === "Enter") {
        playSound("sounds/equal.mp3");
        calculate();
        animateByAction("calculate");
        return;
    }

    if (key === "Delete" || key === "Backspace") {
        playSound("sounds/delete.mp3");
        deleteLast();
        animateByAction("delete");
        return;
    }

    if (key === "Escape" || key === "c" || key === "C") {
        playSound("sounds/clear.mp3");
        clearDisplay();
        animateByAction("clear");
    }
});

function handleButton(button) {
    const value = button.dataset.value;
    const action = button.dataset.action;

    if (action === "clear") {
        playSound("sounds/clear.mp3");
        clearDisplay();
    } else if (action === "delete") {
        playSound("sounds/delete.mp3");
        deleteLast();
    } else if (action === "calculate") {
        playSound("sounds/equal.mp3");
        calculate();
    } else if (value) {
        playSound("sounds/click.mp3");
        appendValue(value);
    }
}

// -------------------- CORE FUNCTIONS --------------------
function appendValue(value) {
    display.value += value;
    updatePreview();
}

function clearDisplay() {
    display.value = "";
    preview.textContent = "";
}

function deleteLast() {
    display.value = display.value.slice(0, -1);
    updatePreview();
}

function calculate() {
    try {
        const result = evaluate(display.value);
        display.value = result;
        preview.textContent = "";

        addToHistory(display.value, result);

        display.classList.add("shimmer");
        setTimeout(() => display.classList.remove("shimmer"), 200);

    } catch {
        display.value = "Error";
        preview.textContent = "";
    }
}

function updatePreview() {
    preview.classList.remove("glow", "pulse");

    try {
        if (display.value.trim() === "") {
            preview.textContent = "";
            return;
        }

        const result = evaluate(display.value);
        const current = parseFloat(preview.textContent.replace("= ", "")) || 0;

        animateNumber(current, result, 150);

        setTimeout(() => preview.classList.add("glow"), 10);
        setTimeout(() => preview.classList.add("pulse"), 50);
        setTimeout(() => preview.classList.remove("pulse"), 300);

    } catch {
        preview.textContent = "";
    }
}

function animateNumber(start, end, duration) {
    const steps = 15;
    let step = 0;
    const increment = (end - start) / steps;

    const interval = setInterval(() => {
        step++;
        preview.textContent = "= " + (start + increment * step).toFixed(2);
        if (step >= steps) {
            preview.textContent = "= " + end;
            clearInterval(interval);
        }
    }, duration / steps);
}

function evaluate(expression) {
    return Function("return " + expression)();
}

// -------------------- BUTTON ANIMATION --------------------
function animateByValue(value) {
    buttons.forEach(btn => {
        if (btn.dataset.value === value) press(btn);
    });
}

function animateByAction(action) {
    buttons.forEach(btn => {
        if (btn.dataset.action === action) press(btn);
    });
}

function press(button) {
    button.classList.add("active", "ripple");
    setTimeout(() => button.classList.remove("ripple"), 400);
    setTimeout(() => button.classList.remove("active"), 150);
}

// -------------------- HISTORY PANEL --------------------
function addToHistory(expression, result) {
    if (result === null) return;
    const item = `${expression} = ${result}`;
    historyArr.push(item);

    const lastItems = historyArr.slice(-20);
    historyPanel.innerHTML = lastItems
        .map(i => `<div>${i}</div>`)
        .join("");
}

historyToggle.addEventListener("click", () => {
    if (window.innerWidth <= 500) {
        // Just toggle visibility (no slide overlay)
        historyPanel.classList.toggle("show");
    } else {
        // Desktop behavior: slide from right
        historyPanel.classList.toggle("show");
    }
});

// Click history item to reuse
historyPanel.addEventListener("click", e => {
    if (e.target.tagName === "DIV") {
        display.value = e.target.textContent.split(" = ")[0];
        updatePreview();
    }
});

// Click history item to reuse
historyPanel.addEventListener("click", e => {
    if (e.target.tagName === "DIV") {
        display.value = e.target.textContent.split(" = ")[0];
        updatePreview();
    }
});

// -------------------- THEME SWITCHER --------------------
themeSelector.addEventListener("change", (e) => {
    switchTheme(e.target.value);
});

function switchTheme(theme) {
    if (theme === "blue") {
        setThemeVars(
            "linear-gradient(135deg, #00c6ff, #0072ff)",
            "rgba(255,255,255,0.2)",
            "rgba(255,255,255,0.4)",
            "rgba(0, 255, 150, 0.4)",
            "rgba(255,255,255,0.2)",
            "rgba(255,255,255,0.7)"
        );
    } else if (theme === "dark") {
        setThemeVars(
            "linear-gradient(135deg, #222, #444)",
            "rgba(255,255,255,0.1)",
            "rgba(255,255,255,0.2)",
            "rgba(0, 255, 150, 0.3)",
            "rgba(255,255,255,0.1)",
            "rgba(255,255,255,0.5)"
        );
    } else if (theme === "purple") {
        setThemeVars(
            "linear-gradient(135deg, #6a00f4, #c800ff)",
            "rgba(255,255,255,0.15)",
            "rgba(255,255,255,0.35)",
            "rgba(255, 0, 150, 0.5)",
            "rgba(255,255,255,0.15)",
            "rgba(255,255,255,0.7)"
        );
    } else if (theme === "sunset") {
        setThemeVars(
            "linear-gradient(135deg, #ff7e5f, #feb47b)",
            "rgba(255,255,255,0.2)",
            "rgba(255,255,255,0.4)",
            "rgba(255, 200, 0, 0.4)",
            "rgba(255,255,255,0.2)",
            "rgba(255,255,255,0.7)"
        );
    }
}

function setThemeVars(bg, btn, hover, equal, displayBg, previewColor) {
    document.documentElement.style.setProperty("--bg-gradient", bg);
    document.documentElement.style.setProperty("--button-bg", btn);
    document.documentElement.style.setProperty("--button-hover", hover);
    document.documentElement.style.setProperty("--equal-bg", equal);
    document.documentElement.style.setProperty("--display-bg", displayBg);
    document.documentElement.style.setProperty("--preview-color", previewColor);
}