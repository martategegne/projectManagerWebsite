const API_URL = '/api/todos';
const todoForm = document.getElementById('todo-form');
const editForm = document.getElementById('edit-todo-form');
const taskList = document.getElementById('task-list');

// 1. Load Tasks (GET) - Categorization Fix
async function fetchTasks(category = '') {
    try {
        let url = API_URL;
        // JSON Server uses Case-Sensitive keys: ?Category=Work
        if (category) {
            url += `?Category=${category}`; 
        }
        const res = await fetch(url);
        if (!res.ok) throw new Error();
        const tasks = await res.json();
        renderTasks(tasks);
    } catch (err) {
        console.error("Fetch error. Check if json-server is running on port 3000.");
    }
}

// 2. Render Tasks to UI
function renderTasks(tasks) {
    taskList.innerHTML = '';
    tasks.forEach(task => {
        const div = document.createElement('div');
        div.className = `task-card ${task.completed ? 'completed' : ''}`;
        div.innerHTML = `
            <h3>${task.title}</h3>
            <p>${task.Description || 'No description'}</p> 
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

// 3. Add Task Listener (Main Form)
todoForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    // Ensure the key is "Category" with a capital C to match your JSON
    const taskData = {
        title: document.getElementById('title').value,
        Description: document.getElementById('description').value,
        Category: document.getElementById('category').value,       
        dueDate: document.getElementById('dueDate').value,
        completed: false
    };

    try {
        const res = await fetch(API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(taskData)
        });
        if (!res.ok) throw new Error();
        
        todoForm.reset();
        fetchTasks(); // Refresh list
    } catch (err) {
        alert("Could not add task.");
    }
});

// 4. Update Task Listener (Modal Form)
if (editForm) {
    editForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const id = document.getElementById('edit-task-id').value;
        
        const taskData = {
            title: document.getElementById('edit-title').value,
            Description: document.getElementById('edit-description').value,
            Category: document.getElementById('edit-category').value,       
            dueDate: document.getElementById('edit-dueDate').value
        };

        try {
            // Sends PATCH to /api/todos/ID
            const res = await fetch(`${API_URL}/${id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(taskData)
            });
            
            if (!res.ok) throw new Error();
            
            closeModal(); // Hide modal
            fetchTasks(); // Refresh list
        } catch (err) {
            alert("Update failed! check server connection.");
        }
    });
}

// 5. Delete Task
async function deleteTask(id) {
    if (confirm('Delete this task permanently?')) {
        await fetch(`${API_URL}/${id}`, { method: 'DELETE' });
        fetchTasks();
    }
}

// 6. Toggle Complete
async function toggleComplete(id, isCompleted) {
    await fetch(`${API_URL}/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ completed: !isCompleted })
    });
    fetchTasks();
}

// 7. Modal Controls
function editTaskSetup(id, title, desc, cat, date) {
    const modal = document.getElementById('editModal');
    modal.style.display = 'block';

    // Map existing data to the modal input fields
    document.getElementById('edit-task-id').value = id;
    document.getElementById('edit-title').value = title;
    document.getElementById('edit-description').value = desc;
    document.getElementById('edit-category').value = cat;
    document.getElementById('edit-dueDate').value = date;
}

function closeModal() {
    document.getElementById('editModal').style.display = 'none';
}

// 8. Theme Toggle
const themeToggle = document.getElementById('theme-toggle');
if(themeToggle) {
    themeToggle.addEventListener('click', () => {
        const currentTheme = document.documentElement.getAttribute('data-theme');
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        document.documentElement.setAttribute('data-theme', newTheme);
        themeToggle.innerText = newTheme === 'dark' ? '☀️ Toggle Light Mode' : '🌙 Toggle Dark Mode';
    });
}

// Load tasks on startup
fetchTasks();
