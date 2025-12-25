const API_URL = '/api/todos';
const todoForm = document.getElementById('todo-form');
const taskList = document.getElementById('task-list');

// Load Tasks (GET)
async function fetchTasks(category = '') {
    try {
        let url = API_URL;
        if (category) {
            url += `?Category=${category}`; 
        }
        const res = await fetch(url);
        if (!res.ok) throw new Error();
        const tasks = await res.json();
        renderTasks(tasks);
    } catch (err) {
        console.error("Could not fetch tasks. Is the JSON server running?");
    }
}

// Render Tasks to UI
function renderTasks(tasks) {
    taskList.innerHTML = '';
    tasks.forEach(task => {
        const div = document.createElement('div');
        // FIXED: Added backticks
        div.className = `task-card ${task.completed ? 'completed' : ''}`;
        div.innerHTML = `
            <h3>${task.title}</h3>
            <p>${task.Description || 'No description provided'}</p> 
            <small>Category: ${task.Category || 'General'} | Due: ${task.dueDate}</small>
            <div class="actions">
                <button onclick="toggleComplete('${task.id}', ${task.completed})">
                    ${task.completed ? 'Undo' : 'Complete'}
                </button>
                <button class="btn-edit" onclick="editTaskSetup('${task.id}', '${task.title}', '${task.Description.replace(/'/g, "\\'")}', '${task.Category}', '${task.dueDate}')">Edit</button>
                <button class="btn-del" onclick="deleteTask('${task.id}')">Delete</button>
            </div>
        `;
        taskList.appendChild(div);
    });
}

// Add or Update Task (POST/PATCH)
todoForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const id = document.getElementById('task-id').value;
    const isUpdating = !!id; // True if an ID exists
    
    // Confirmation
    if (!confirm(isUpdating ? "Update this task?" : "Add this task?")) return;

    const taskData = {
        title: document.getElementById('title').value,
        Description: document.getElementById('description').value,
        Category: document.getElementById('category').value,       
        dueDate: document.getElementById('dueDate').value
    };

    try {
        let response;
        if (id) {
            // UPDATING: Send PATCH to /api/todos/ID
            response = await fetch(`${API_URL}/${id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(taskData)
            });
        } else {
            // ADDING: Send POST to /api/todos
            response = await fetch(API_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ...taskData, completed: false })
            });
        }

        if (!response.ok) throw new Error('Server error');

        // SUCCESS: Refresh list and clean up modal
        fetchTasks();
        closeModal(); 

    } catch (error) {
        alert("Action failed. Check if your JSON server is running!");
        console.error(error);
    }
});

// Delete Task
async function deleteTask(id) {
    if (confirm('Delete this task?')) {
        await fetch(`${API_URL}/${id}`, { method: 'DELETE' });
        fetchTasks();
    }
}

// Toggle Complete
async function toggleComplete(id, isCompleted) {
    await fetch(`${API_URL}/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ completed: !isCompleted })
    });
    fetchTasks();
}

// Setup Edit Mode
function editTaskSetup(id, title, desc, cat, date) {
    const modal = document.getElementById('editModal');
    const form = document.getElementById('todo-form');
    const container = document.getElementById('modal-form-container');
    
    modal.style.display = 'block';
    container.appendChild(form);

    // Fill the inputs
    document.getElementById('task-id').value = id; // This stores "8729" or "adcc"
    document.getElementById('title').value = title;
    document.getElementById('description').value = desc;
    document.getElementById('category').value = cat;
    document.getElementById('dueDate').value = date;
    
    document.getElementById('submit-btn').innerText = 'Update Task';
}
function closeModal() {
    const modal = document.getElementById('editModal');
    const form = document.getElementById('todo-form');
    // Ensure this selector matches where your form originally sits in HTML
    const originalContainer = document.querySelector('.container') || document.querySelector('header');

    modal.style.display = 'none'; 
    
    if(originalContainer) {
        // Puts form back at the top of its original home
        originalContainer.insertBefore(form, originalContainer.firstChild); 
    }
    
    todoForm.reset();
    document.getElementById('task-id').value = '';
    document.getElementById('submit-btn').innerText = 'Add Task';
}

// Dark Theme
const themeToggle = document.getElementById('theme-toggle');
if(themeToggle) {
    themeToggle.addEventListener('click', () => {
        const currentTheme = document.documentElement.getAttribute('data-theme');
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        document.documentElement.setAttribute('data-theme', newTheme);
        themeToggle.innerText = newTheme === 'dark' ? '☀️ Toggle Light Mode' : '🌙 Toggle Dark Mode';
    });
}

fetchTasks();
