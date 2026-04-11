const taskList = document.getElementById("taskList");
const actionBtn = document.getElementById("actionBtn");
const windowSlider = document.getElementById("windowSlider");
const toggleBtn = document.getElementById("toggleView");
const noteCountEl = document.getElementById("noteCount");

let editId = null;
let isListView = false;

window.onload = () => {
    refreshUI();
    initCalendarAutoOpen(); // Initialize the calendar trigger
};

// --- CALENDAR & TIME TRIGGER ---
function initCalendarAutoOpen() {
    const dateInput = document.getElementById("reminderDate");
    const timeInput = document.getElementById("reminderTime");

    [dateInput, timeInput].forEach(input => {
        input.addEventListener('click', () => {
            // This forces the calendar/time picker to open on click
            if ('showPicker' in HTMLInputElement.prototype) {
                input.showPicker();
            }
        });
    });
}

// --- UI LOGIC ---
function refreshUI() {
    taskList.innerHTML = "";
    const tasks = JSON.parse(localStorage.getItem("dileepEditableNotes")) || [];
    tasks.forEach(task => renderTask(task));
    noteCountEl.innerText = `${tasks.length} ACTIVE`;
}

function toggleWindow() {
    isListView = !isListView;
    if (isListView) {
        windowSlider.classList.add('slide-active');
        toggleBtn.innerHTML = '<i class="fa-solid fa-plus"></i>';
    } else {
        windowSlider.classList.remove('slide-active');
        toggleBtn.innerHTML = '<i class="fa-solid fa-wand-magic-sparkles"></i>';
    }
}

function format12h(time) {
    if (!time) return "Anytime";
    // Check if time is already formatted (for edits)
    if (time.includes("AM") || time.includes("PM")) return time;
    
    let [h, m] = time.split(':');
    let ampm = h >= 12 ? 'PM' : 'AM';
    h = h % 12 || 12;
    return `${h}:${m} ${ampm}`;
}

// --- TASK ACTIONS ---
function handleTaskAction() {
    const title = document.getElementById("taskTitle").value;
    const desc = document.getElementById("taskDesc").value;
    const date = document.getElementById("reminderDate").value;
    const time = document.getElementById("reminderTime").value;

    if (!title.trim()) return alert("Authorization Failed: Title Required");

    if (editId) {
        updateTask(editId, title, desc, date, time);
    } else {
        const newTask = {
            id: Date.now(),
            title,
            description: desc,
            date: date || "Today",
            time: format12h(time)
        };
        saveTask(newTask);
    }
    
    resetForm();
    refreshUI();

    // Auto-swipe to archives list after saving
    setTimeout(() => { 
        if (!isListView) toggleWindow(); 
    }, 400);
}

function saveTask(task) {
    const tasks = JSON.parse(localStorage.getItem("dileepEditableNotes")) || [];
    tasks.push(task);
    localStorage.setItem("dileepEditableNotes", JSON.stringify(tasks));
}

function renderTask(task) {
    const li = document.createElement("li");
    li.className = "task-card";
    li.innerHTML = `
        <div class="controls">
            <i class="fa-solid fa-highlighter edit-icon" onclick="prepareEdit(${task.id})"></i>
            <i class="fa-solid fa-atom delete-icon" onclick="deleteTask(${task.id})"></i>
        </div>
        <h3>${task.title}</h3>
        <p>${task.description || "No description provided."}</p>
        <div class="meta">
            <span><i class="fa-regular fa-calendar"></i> ${task.date}</span>
            <span><i class="fa-regular fa-clock"></i> ${task.time}</span>
        </div>
    `;
    taskList.prepend(li);
}

function prepareEdit(id) {
    const tasks = JSON.parse(localStorage.getItem("dileepEditableNotes"));
    const task = tasks.find(t => t.id === id);

    document.getElementById("taskTitle").value = task.title;
    document.getElementById("taskDesc").value = task.description;
    
    // Note: Chrome requires YYYY-MM-DD for date input values
    document.getElementById("reminderDate").value = (task.date === "Today") ? "" : task.date;
    
    editId = id;
    actionBtn.querySelector('.btn-text').innerText = "SYNCHRONIZE";
    
    // Switch to input view to edit
    if (isListView) toggleWindow();
}

function updateTask(id, title, desc, date, time) {
    let tasks = JSON.parse(localStorage.getItem("dileepEditableNotes"));
    const index = tasks.findIndex(t => t.id === id);
    tasks[index] = { 
        id, 
        title, 
        description: desc, 
        date: date || "Today", 
        time: format12h(time) 
    };
    localStorage.setItem("dileepEditableNotes", JSON.stringify(tasks));
}

function resetForm() {
    document.getElementById("taskTitle").value = "";
    document.getElementById("taskDesc").value = "";
    document.getElementById("reminderDate").value = "";
    document.getElementById("reminderTime").value = "";
    editId = null;
    actionBtn.querySelector('.btn-text').innerText = "DEPLOY DATA";
}

function deleteTask(id) {
    let tasks = JSON.parse(localStorage.getItem("dileepEditableNotes"));
    tasks = tasks.filter(t => t.id !== id);
    localStorage.setItem("dileepEditableNotes", JSON.stringify(tasks));
    refreshUI();
}