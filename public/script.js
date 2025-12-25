const API_URL = '/api/todos';
const todoForm = document.getElementById('todo-form');
const taskList = document.getElementById('task-list');
const originalFormContainer = document.querySelector('.form-container') || document.querySelector('header');

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
        div.className = `task-card ${task.completed ? 'completed' : ''}`;
        // Fix: Use template literals and escape properly for Description
        const description = task.Description ? task.Description.replace(/'/g, "\\'").replace(/"/g, '&quot;') : '';
        div.innerHTML = `
            <h3>${task.title}</h3>
            <p>${task.Description || 'No description provided'}</p> 
            <small>Category: ${task.Category || 'General'} | Due: ${task.dueDate}</small>
            <div class="actions">
                <button onclick="toggleComplete('${task.id}', ${task.completed})">
                    ${task.completed ? 'Undo' : 'Complete'}
                </button>
                <button class="btn-edit" onclick="editTaskSetup('${task.id}', '${task.title.replace(/'/g, "\\'")}', '${description}', '${task.Category || ''}', '${task.dueDate}')">Edit</button>
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
    const isUpdating = !!id;
    
    // 1. Confirmation Popup
    const confirmMessage = isUpdating 
        ? "Are you sure you want to update this task?" 
        : "Are you sure you want to add this task?";

    if (!confirm(confirmMessage)) return;

    const taskData = {
        title: document.getElementById('title').value,
        Description: document.getElementById('description').value,
        Category: document.getElementById('category').value,       
        dueDate: document.getElementById('dueDate').value
    };

    try {
        let response;
        if (id) {
            response = await fetch(`${API_URL}/${id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(taskData)
            });
        } else {
            response = await fetch(API_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ...taskData, completed: false })
            });
        }

        if (!response.ok) throw new Error('Network response was not ok');

        // Success: Reset UI
        todoForm.reset();
        document.getElementById('task-id').value = '';
        document.getElementById('submit-btn').innerText = 'Add Task';
        
        // Close modal if it's open
        closeModal();
        
        fetchTasks();

    } catch (error) {
        // 2. Error Popup
        alert("Action failed. Make sure your JSON server is working!");
        console.error("Error details:", error);
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

// Setup Edit Mode - FIXED VERSION
function editTaskSetup(id, title, desc, cat, date) {
    const modal = document.getElementById('editModal');
    
    // Show modal
    modal.style.display = 'block';
    
    // Move form to modal if it's not already there
    const formContainer = document.getElementById('modal-form-container');
    if (todoForm.parentNode !== formContainer) {
        formContainer.appendChild(todoForm);
    }
    
    // Populate form fields
    document.getElementById('task-id').value = id;
    document.getElementById('title').value = title;
    document.getElementById('description').value = decodeHtmlEntities(desc);
    document.getElementById('category').value = cat || 'General';
    document.getElementById('dueDate').value = date;
    document.getElementById('submit-btn').innerText = 'Update Task';
}

// Helper function to decode HTML entities
function decodeHtmlEntities(text) {
    const textArea = document.createElement('textarea');
    textArea.innerHTML = text;
    return textArea.value;
}

// Close Modal - FIXED VERSION
function closeModal() {
    const modal = document.getElementById('editModal');
    modal.style.display = 'none';
    
    // Move form back to original container if needed
    if (originalFormContainer && todoForm.parentNode !== originalFormContainer) {
        originalFormContainer.appendChild(todoForm);
    }
    
    // Reset form only if we're not in the middle of editing
    if (!document.getElementById('task-id').value) {
        todoForm.reset();
        document.getElementById('submit-btn').innerText = 'Add Task';
    }
}

// Add click event to close modal when clicking outside
document.addEventListener('DOMContentLoaded', function() {
    const modal = document.getElementById('editModal');
    
    // Close modal when clicking outside of it
    window.addEventListener('click', function(event) {
        if (event.target === modal) {
            closeModal();
        }
    });
    
    // Add cancel button functionality if you have one
    const cancelBtn = document.getElementById('cancel-edit-btn');
    if (cancelBtn) {
        cancelBtn.addEventListener('click', function() {
            todoForm.reset();
            document.getElementById('task-id').value = '';
            document.getElementById('submit-btn').innerText = 'Add Task';
            closeModal();
        });
    }
});

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
