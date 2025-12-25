const API_URL = '/api/todos';
const todoForm = document.getElementById('todo-form');
const taskList = document.getElementById('task-list');

// Load Tasks (GET) - Supports Filtering  (All work personal education)
async function fetchTasks(category = '') {
    let url = API_URL;
    if (category) {
        url += `?Category=${category}`; 
    }
    
    const res = await fetch(url);
    const tasks = await res.json();
    renderTasks(tasks);
}

// Render Tasks to UI
function renderTasks(tasks) {
    taskList.innerHTML = '';
    tasks.forEach(task => {
        const div = document.createElement('div');
        div.className = `task-card ${task.completed ? 'completed' : ''}`;
        div.innerHTML = `
            <h3>${task.title}</h3>
            <p>${task.Description || 'No description provided'}</p> 
            <small>Category: ${task.Category || 'General'} | Due: ${task.dueDate}</small>
            <div class="actions">
                <button onclick="toggleComplete('${task.id}', ${task.completed})">
                    ${task.completed ? 'Undo' : 'Complete'}
                </button>
                <button class="btn-edit" onclick="editTaskSetup('${task.id}', '${task.title}', '${task.Description}', '${task.Category}', '${task.dueDate}')">Edit</button>
                <button class="btn-del" onclick="deleteTask('${task.id}')">Delete</button>
            </div>
        `;
        taskList.appendChild(div);
    });
}


// Add or Update Task (POST/PATCH)
todoForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    //  Confirmation
    const isUpdating = !!document.getElementById('task-id').value;
    const confirmMessage = isUpdating 
        ? "Are you sure you want to update this task?" 
        : "Are you sure you want to add this task?";

    if (!confirm(confirmMessage)) {
        return; // Exit if the user clicks 'Cancel'
    }

    const id = document.getElementById('task-id').value;
    const taskData = {
        title: document.getElementById('title').value,
        Description: document.getElementById('description').value,
        Category: document.getElementById('category').value,       
        dueDate: document.getElementById('dueDate').value
    };

    try {
        let response;
        if (id) {
            // Update existing
            response = await fetch(`${API_URL}/${id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(taskData)
            });
        } else {
            // Create new
            response = await fetch(API_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ...taskData, completed: false })
            });
        }

        // Check if the server response is okay
        if (!response.ok) {
            throw new Error('Server error');
        }

        // Success: Reset form and refresh list
        todoForm.reset();
        document.getElementById('task-id').value = '';
        document.getElementById('submit-btn').innerText = 'Add Task';
        fetchTasks();

    } catch (error) {
        // Error handling: Alert user if JSON/Server is not working
        console.error("Fetch Error:", error);
        alert("Action failed. Please make sure your JSON server is working and try again.");
    }
});

    todoForm.reset();
    document.getElementById('task-id').value = '';
    document.getElementById('submit-btn').innerText = 'Add Task';
    fetchTasks();
});

//  Delete Task (DELETE)
async function deleteTask(id) {
    if (confirm('Delete this task?')) {
        await fetch(`${API_URL}/${id}`, { method: 'DELETE' });
        fetchTasks();
    }
}

//  Mark Completed (PATCH)
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
    document.getElementById('task-id').value = id;
    document.getElementById('title').value = title;
    document.getElementById('description').value = desc;
    document.getElementById('category').value = cat;
    document.getElementById('dueDate').value = date;
    document.getElementById('submit-btn').innerText = 'Update Task';
    window.scrollTo(0, 0);
}
// toggle dark theme
const themeToggle = document.getElementById('theme-toggle');

themeToggle.addEventListener('click', () => {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    
    if (currentTheme === 'dark') {
        document.documentElement.setAttribute('data-theme', 'light');
        themeToggle.innerText = '🌙 Toggle Dark Mode';
    } else {
        document.documentElement.setAttribute('data-theme', 'dark');
        themeToggle.innerText = '☀️ Toggle Light Mode';
    }
});
// Initial Load
fetchTasks();
