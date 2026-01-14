// API base URL - using relative path since frontend and backend are on same server
const API_URL = '/api';
let authToken = localStorage.getItem('token');
let currentUser = localStorage.getItem('username');

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    if (authToken) {
        showApp();
        loadGroups();
        loadTasks();
    } else {
        showAuth();
    }

    // Form handlers
    document.getElementById('login-form').addEventListener('submit', handleLogin);
    document.getElementById('register-form').addEventListener('submit', handleRegister);
    document.getElementById('filter-group').addEventListener('change', filterTasks);
    document.getElementById('filter-completed').addEventListener('change', filterTasks);

    // Password validation on input
    const passwordInput = document.getElementById('register-password');
    const requirementsDiv = document.getElementById('password-requirements');
    
    passwordInput.addEventListener('focus', () => {
        requirementsDiv.style.display = 'block';
    });
    
    passwordInput.addEventListener('input', validatePasswordRequirements);
});

// Password validation function
function validatePasswordRequirements() {
    const password = document.getElementById('register-password').value;
    
    // Length check
    const lengthReq = document.getElementById('req-length');
    if (password.length >= 8) {
        lengthReq.classList.remove('invalid');
        lengthReq.classList.add('valid');
    } else {
        lengthReq.classList.remove('valid');
        lengthReq.classList.add('invalid');
    }
    
    // Uppercase check
    const uppercaseReq = document.getElementById('req-uppercase');
    if (/[A-Z]/.test(password)) {
        uppercaseReq.classList.remove('invalid');
        uppercaseReq.classList.add('valid');
    } else {
        uppercaseReq.classList.remove('valid');
        uppercaseReq.classList.add('invalid');
    }
    
    // Lowercase check
    const lowercaseReq = document.getElementById('req-lowercase');
    if (/[a-z]/.test(password)) {
        lowercaseReq.classList.remove('invalid');
        lowercaseReq.classList.add('valid');
    } else {
        lowercaseReq.classList.remove('valid');
        lowercaseReq.classList.add('invalid');
    }
    
    // Number check
    const numberReq = document.getElementById('req-number');
    if (/\d/.test(password)) {
        numberReq.classList.remove('invalid');
        numberReq.classList.add('valid');
    } else {
        numberReq.classList.remove('valid');
        numberReq.classList.add('invalid');
    }
    
    // Special character check
    const specialReq = document.getElementById('req-special');
    if (/[@$!%*?&]/.test(password)) {
        specialReq.classList.remove('invalid');
        specialReq.classList.add('valid');
    } else {
        specialReq.classList.remove('valid');
        specialReq.classList.add('invalid');
    }
}


// Auth Functions
function showLogin() {
    document.getElementById('login-form').style.display = 'block';
    document.getElementById('register-form').style.display = 'none';
    document.querySelectorAll('.tab-btn')[0].classList.add('active');
    document.querySelectorAll('.tab-btn')[1].classList.remove('active');
}

function showRegister() {
    document.getElementById('login-form').style.display = 'none';
    document.getElementById('register-form').style.display = 'block';
    document.querySelectorAll('.tab-btn')[0].classList.remove('active');
    document.querySelectorAll('.tab-btn')[1].classList.add('active');
}

async function handleLogin(e) {
    e.preventDefault();
    const username = document.getElementById('login-username').value;
    const password = document.getElementById('login-password').value;

    try {
        const response = await fetch(`${API_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password })
        });

        if (response.ok) {
            const data = await response.json();
            authToken = data.access_token;
            currentUser = username;
            localStorage.setItem('token', authToken);
            localStorage.setItem('username', username);
            showMessage('auth-message', 'Login successful!', 'success');
            setTimeout(() => {
                showApp();
                loadGroups();
                loadTasks();
            }, 1000);
        } else {
            const error = await response.json();
            showMessage('auth-message', error.detail || 'Login failed', 'error');
        }
    } catch (error) {
        showMessage('auth-message', 'Network error', 'error');
    }
}

async function handleRegister(e) {
    e.preventDefault();
    const username = document.getElementById('register-username').value;
    const email = document.getElementById('register-email').value;
    const password = document.getElementById('register-password').value;

    try {
        const response = await fetch(`${API_URL}/auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, email, password })
        });

        if (response.ok) {
            showMessage('auth-message', 'Registration successful! Please login.', 'success');
            setTimeout(showLogin, 1500);
        } else {
            const error = await response.json();
            // Handle validation errors from Pydantic
            if (error.detail && Array.isArray(error.detail)) {
                const errorMsg = error.detail.map(err => err.msg).join('. ');
                showMessage('auth-message', errorMsg, 'error');
            } else {
                showMessage('auth-message', error.detail || 'Registration failed', 'error');
            }
        }
    } catch (error) {
        showMessage('auth-message', 'Network error', 'error');
    }
}

function logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('username');
    authToken = null;
    currentUser = null;
    showAuth();
}

// UI Functions
function showAuth() {
    document.getElementById('auth-section').style.display = 'block';
    document.getElementById('app-section').style.display = 'none';
}

function showApp() {
    document.getElementById('auth-section').style.display = 'none';
    document.getElementById('app-section').style.display = 'block';
    document.getElementById('username-display').textContent = currentUser;
}

function showMessage(elementId, message, type) {
    const msgEl = document.getElementById(elementId);
    msgEl.textContent = message;
    msgEl.className = `message ${type}`;
    setTimeout(() => {
        msgEl.className = 'message';
    }, 3000);
}

// Groups Functions
async function loadGroups() {
    try {
        const response = await fetch(`${API_URL}/groups`, {
            headers: { 'Authorization': `Bearer ${authToken}` }
        });

        if (response.ok) {
            const groups = await response.json();
            displayGroups(groups);
            updateGroupSelects(groups);
        }
    } catch (error) {
        console.error('Error loading groups:', error);
    }
}

function displayGroups(groups) {
    const container = document.getElementById('groups-list');
    container.innerHTML = '';

    groups.forEach(group => {
        const groupEl = document.createElement('div');
        groupEl.className = 'group-item';
        groupEl.innerHTML = `
            <span>${group.name}</span>
            <div class="group-actions">
                <button class="icon-btn" onclick="deleteGroup(${group.id})"><img class="img2"  src="/static/css/delete.png"></button>
            </div>
        `;
        container.appendChild(groupEl);
    });
}

function updateGroupSelects(groups) {
    const selects = ['filter-group', 'new-task-group'];
    selects.forEach(selectId => {
        const select = document.getElementById(selectId);
        const currentValue = select.value;
        select.innerHTML = selectId === 'filter-group' 
            ? '<option value="">All Groups</option>' 
            : '<option value="">Select Group</option>';
        
        groups.forEach(group => {
            const option = document.createElement('option');
            option.value = group.id;
            option.textContent = group.name;
            select.appendChild(option);
        });
        
        if (currentValue) select.value = currentValue;
    });
}

async function createGroup() {
    const name = document.getElementById('new-group-name').value.trim();
    if (!name) return;

    try {
        const response = await fetch(`${API_URL}/groups`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${authToken}`
            },
            body: JSON.stringify({ name })
        });

        if (response.ok) {
            document.getElementById('new-group-name').value = '';
            showMessage('app-message', 'Group created!', 'success');
            loadGroups();
        }
    } catch (error) {
        showMessage('app-message', 'Error creating group', 'error');
    }
}

async function deleteGroup(groupId) {
    if (!confirm('Delete this group and all its tasks?')) return;

    try {
        const response = await fetch(`${API_URL}/groups/${groupId}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${authToken}` }
        });

        if (response.ok) {
            showMessage('app-message', 'Group deleted!', 'success');
            loadGroups();
            loadTasks();
        }
    } catch (error) {
        showMessage('app-message', 'Error deleting group', 'error');
    }
}

// Tasks Functions
async function loadTasks() {
    const groupFilter = document.getElementById('filter-group').value;
    const completedFilter = document.getElementById('filter-completed').value;
    
    let url = `${API_URL}/tasks?`;
    if (groupFilter) url += `group=${groupFilter}&`;
    if (completedFilter) url += `completed=${completedFilter}`;

    try {
        const response = await fetch(url, {
            headers: { 'Authorization': `Bearer ${authToken}` }
        });

        if (response.ok) {
            const tasks = await response.json();
            displayTasks(tasks);
        }
    } catch (error) {
        console.error('Error loading tasks:', error);
    }
}

function displayTasks(tasks) {
    const container = document.getElementById('tasks-list');
    container.innerHTML = '';

    if (tasks.length === 0) {
        container.innerHTML = '<p style="color: white; text-align: center;">No tasks found</p>';
        return;
    }

    tasks.forEach(task => {
        const taskEl = document.createElement('div');
        taskEl.className = `task-item ${task.is_completed ? 'completed' : ''}`;
        taskEl.innerHTML = `
            <div class="task-content">
                <div class="task-title">${task.title}</div>
                ${task.description ? `<div class="task-description">${task.description}</div>` : ''}
                <div class="task-meta">
                    <span class="task-badge"><img class="img3"  src="/static/css/check-list.png"> </span>
                    <span class="task-badge">${task.is_completed ? '<img class="img3"  src="/static/css/check.png"> Completed' : '<img class="img3"  src="/static/css/processing-time.png"> Pending'}</span>
                </div>
            </div>
            <div class="task-actions">
                <button class="icon-btn" onclick="toggleTask(${task.id}, ${!task.is_completed})">${task.is_completed ? '<img class="img2"  src="/static/css/back-button.png">' : '<img class="img2"  src="/static/css/check.png">'}</button>
                <button class="icon-btn" onclick="deleteTask(${task.id})"><img class="img2"  src="/static/css/delete.png"></button>
            </div>
        `;
        container.appendChild(taskEl);
    });
}

async function createTask() {
    const title = document.getElementById('new-task-title').value.trim();
    const description = document.getElementById('new-task-description').value.trim();
    const group_id = document.getElementById('new-task-group').value;

    if (!title || !group_id) {
        showMessage('app-message', 'Title and group are required', 'error');
        return;
    }

    try {
        const response = await fetch(`${API_URL}/tasks`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${authToken}`
            },
            body: JSON.stringify({ title, description, group_id: parseInt(group_id) })
        });

        if (response.ok) {
            document.getElementById('new-task-title').value = '';
            document.getElementById('new-task-description').value = '';
            showMessage('app-message', 'Task created!', 'success');
            loadTasks();
        }
    } catch (error) {
        showMessage('app-message', 'Error creating task', 'error');
    }
}

async function toggleTask(taskId, completed) {
    try {
        const response = await fetch(`${API_URL}/tasks/${taskId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${authToken}`
            },
            body: JSON.stringify({ is_completed: completed })
        });

        if (response.ok) {
            loadTasks();
        }
    } catch (error) {
        showMessage('app-message', 'Error updating task', 'error');
    }
}

async function deleteTask(taskId) {
    if (!confirm('Delete this task?')) return;

    try {
        const response = await fetch(`${API_URL}/tasks/${taskId}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${authToken}` }
        });

        if (response.ok) {
            showMessage('app-message', 'Task deleted!', 'success');
            loadTasks();
        }
    } catch (error) {
        showMessage('app-message', 'Error deleting task', 'error');
    }
}

function filterTasks() {
    loadTasks();
}