const API_URL = '/api/todos';

const todoForm = document.getElementById('todo-form');
const editForm = document.getElementById('edit-todo-form');
const taskList = document.getElementById('task-list');
const searchInput = document.getElementById('search-input');

let allTasks = [];

async function fetchTasks(category = '') {
    let url = API_URL;

    if (category) {
        url += `?category=${category}`;
    }

    const res = await fetch(url);
    allTasks = await res.json();
    renderTasks(allTasks);
}

function renderTasks(tasks) {
    taskList.innerHTML = '';

    tasks.forEach(task => {
        const div = document.createElement('div');
        div.className = `task-card ${task.completed ? 'completed' : ''}`;

        div.innerHTML = `
            <h3>${task.title}</h3>
            <p>${task.description || 'No description'}</p>
            <small>Category: ${task.category} | Due: ${task.dueDate}</small>
            <div class="actions">
                <button onclick="toggleComplete('${task.id}', ${task.completed})">
                    ${task.completed ? 'Undo' : 'Complete'}
                </button>
                <button class="btn-edit" onclick="editTaskSetup(
                    '${task.id}',
                    '${task.title.replace(/'/g, "\\'")}',
                    '${(task.description || '').replace(/'/g, "\\'")}',
                    '${task.category}',
                    '${task.dueDate}'
                )">Edit</button>
                <button class="btn-del" onclick="deleteTask('${task.id}')">Delete</button>
            </div>
        `;

        taskList.appendChild(div);
    });
}

todoForm.addEventListener('submit', async e => {
    e.preventDefault();

    const taskData = {
        title: document.getElementById('title').value,
        description: document.getElementById('description').value,
        category: document.getElementById('category').value,
        dueDate: document.getElementById('dueDate').value,
        completed: false
    };

    await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(taskData)
    });

    todoForm.reset();
    fetchTasks();
});

if (editForm) {
    editForm.addEventListener('submit', async e => {
        e.preventDefault();

        const id = document.getElementById('edit-task-id').value;

        const taskData = {
            title: document.getElementById('edit-title').value,
            description: document.getElementById('edit-description').value,
            category: document.getElementById('edit-category').value,
            dueDate: document.getElementById('edit-dueDate').value
        };

        await fetch(`${API_URL}/${id}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(taskData)
        });

        closeModal();
        fetchTasks();
    });
}

async function deleteTask(id) {
    if (!confirm('Delete this task permanently?')) return;

    await fetch(`${API_URL}/${id}`, { method: 'DELETE' });
    fetchTasks();
}

async function toggleComplete(id, completed) {
    await fetch(`${API_URL}/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ completed: !completed })
    });

    fetchTasks();
}

function editTaskSetup(id, title, desc, cat, date) {
    document.getElementById('editModal').style.display = 'block';
    document.getElementById('edit-task-id').value = id;
    document.getElementById('edit-title').value = title;
    document.getElementById('edit-description').value = desc;
    document.getElementById('edit-category').value = cat;
    document.getElementById('edit-dueDate').value = date;
}

function closeModal() {
    document.getElementById('editModal').style.display = 'none';
}

searchInput.addEventListener('input', () => {
    const query = searchInput.value.toLowerCase();
    const filtered = allTasks.filter(task =>
        task.title.toLowerCase().includes(query)
    );
    renderTasks(filtered);
});

const themeToggle = document.getElementById('theme-toggle');

if (themeToggle) {
    themeToggle.addEventListener('click', () => {
        const theme = document.documentElement.getAttribute('data-theme');
        const newTheme = theme === 'dark' ? 'light' : 'dark';
        document.documentElement.setAttribute('data-theme', newTheme);
        themeToggle.innerText =
            newTheme === 'dark'
                ? '☀️ Toggle Light Mode'
                : '🌙 Toggle Dark Mode';
    });
}

fetchTasks();
