const API_URL = '/api/todos';
// Stores the backend endpoint where all tasks are saved and retrieved
const todoForm = document.getElementById('todo-form');
const editForm = document.getElementById('edit-todo-form');
const taskList = document.getElementById('task-list');
const searchInput = document.getElementById('search-input');
// Gets the search bar input
let allTasks = [];
// Stores all tasks fetched from the server
async function fetchTasks() {    // Fetches all tasks and enables client-side search and category filtering
    // Defines an asynchronous function to load tasks from the backend
    const res = await fetch(API_URL);   //Sends a GET request to /api/todos
    allTasks = await res.json();     //Converts the response to JavaScript objects and saves them in allTasks
    renderTasks(allTasks);     //Displays all tasks on the screen.
}
// Filters tasks by selected category on the client side
function filterByCategory(category) {          //Called when a category button is clicked
    if (!category) {      //Checks if the user clicked All
        renderTasks(allTasks);
        return;            //Shows all tasks and exits the function
    }

    const filtered = allTasks.filter(
        task => task.category === category
    );    //Creates a new array containing only tasks that match the selected category

    renderTasks(filtered);        //Displays only the filtered tasks
}
// Renders task cards to the UI
function renderTasks(tasks) {   //Receives an array of tasks and displays them
    taskList.innerHTML = '';     //Clears the UI before re-rendering to avoid duplicates

    tasks.forEach(task => {     //Loops through every task
        const div = document.createElement('div');   //Creates a new <div> for a task card
        div.className = `task-card ${task.completed ? 'completed' : ''}`;  //Adds completed class if the task is done

        div.innerHTML = `  //Inserts task content dynamically
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

        taskList.appendChild(div);   //Adds the task card to the page
    });
}
// Handles adding a new task
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
// Handles updating an existing task
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
// Deletes a task by ID
async function deleteTask(id) {
    if (!confirm('Delete this task permanently?')) return;

    await fetch(`${API_URL}/${id}`, { method: 'DELETE' });
    fetchTasks();
}
// Toggles a task's completed status
async function toggleComplete(id, completed) {
    await fetch(`${API_URL}/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ completed: !completed })
    });

    fetchTasks();
}
// Opens the edit modal and fills it with task data
function editTaskSetup(id, title, desc, cat, date) {
    document.getElementById('editModal').style.display = 'block';
    document.getElementById('edit-task-id').value = id;
    document.getElementById('edit-title').value = title;
    document.getElementById('edit-description').value = desc;
    document.getElementById('edit-category').value = cat;
    document.getElementById('edit-dueDate').value = date;
}
// Closes the edit modal
function closeModal() {
    document.getElementById('editModal').style.display = 'none';
}
// Filters tasks based on search input
searchInput.addEventListener('input', () => {
    const query = searchInput.value.toLowerCase();
    const filtered = allTasks.filter(task =>
        task.title.toLowerCase().includes(query)
    );
    renderTasks(filtered);
});
// Toggles between light and dark mode
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
// Loads tasks when the page first loads
fetchTasks();
