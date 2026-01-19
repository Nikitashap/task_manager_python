const API_BASE = 'http://localhost:8000';
let token = localStorage.getItem('token');

document.addEventListener('DOMContentLoaded', function() {
    if (!token) {
        window.location.href = '/';
        return;
    }
    
    
    fetchTasks();
    
  
    const newTaskForm = document.getElementById("newTaskForm");
    if (newTaskForm) {
        newTaskForm.onsubmit = async function(e) {
            e.preventDefault();
            
            const formData = new FormData(this);
            const data = {
                title: formData.get('title'),
                description: formData.get('description') || null,
                deadline: formData.get('deadline') ? 
                    new Date(formData.get('deadline')).toISOString() : null
            };
            
            console.log('Отправка задачи:', data);
            
            try {
                const res = await fetch(`${API_BASE}/api/tasks/`, {
                    method: "POST",
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify(data)
                });
                
                if (res.ok) {
                    this.reset();
                    fetchTasks();
                    alert('Задача создана!');
                } else {
                    const error = await res.json();
                    throw new Error(error.detail || 'Ошибка создания задачи');
                }
            } catch (error) {
                console.error('Ошибка создания задачи:', error);
                alert('Ошибка: ' + error.message);
            }
        };
    }
});

async function fetchTasks() {
    try {
        const res = await fetch(`${API_BASE}/api/tasks/`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        if (!res.ok) {
            if (res.status === 401) {
        
                localStorage.removeItem('token');
                window.location.href = '/';
                return;
            }
            throw new Error('Ошибка загрузки задач: ' + res.status);
        }
        
        const tasks = await res.json();
        console.log('Получены задачи:', tasks);
        displayTasks(tasks);
    } catch (error) {
        console.error('Ошибка загрузки задач:', error);
        alert('Ошибка загрузки задач');
    }
}

function displayTasks(tasks) {
    const list = document.getElementById("taskList");
    if (!list) return;
    
    list.innerHTML = "";

    if (tasks.length === 0) {
        list.innerHTML = '<li style="text-align: center; color: #666;">Нет задач. Создайте первую!</li>';
        return;
    }

    tasks.forEach(t => {
        const li = document.createElement("li");
        
        const deadline = t.deadline ? new Date(t.deadline).toLocaleString() : 'Не установлен';
        
        li.innerHTML = `
            <div>
                <strong style="font-size: 18px;">${escapeHtml(t.title)}</strong>
                <span style="margin-left: 10px; padding: 4px 8px; background: #e0e0e0; border-radius: 12px; font-size: 12px;">
                    ${statusToText(t.status)}
                </span>
            </div>
            <div style="margin: 8px 0; color: #555;">
                ${escapeHtml(t.description || 'Нет описания')}
            </div>
            <div style="font-size: 14px; color: #666;">
                <strong>Срок:</strong> ${deadline}
            </div>
            <div class="task-buttons" style="margin-top: 12px;">
                <button onclick="showEditForm(${t.id}, '${escapeQuotes(t.title)}', '${escapeQuotes(t.description || '')}', '${t.status}', '${t.deadline || ''}')">
                    Изменить
                </button>
                <button onclick="deleteTask(${t.id})">
                    Удалить
                </button>
            </div>
        `;

        list.appendChild(li);
    });
}


function statusToText(status) {
    const statusMap = {
        'NOT_STARTED': 'не начата',
        'IN_PROGRESS': 'в работе',
        'COMPLETED': 'завершена'
    };
    return statusMap[status] || status;
}

function textToStatus(text) {
    const statusMap = {
        'не начата': 'NOT_STARTED',
        'в работе': 'IN_PROGRESS',
        'завершена': 'COMPLETED'
    };
    return statusMap[text] || text;
}

function escapeQuotes(str) {
    if (!str) return "";
    return str.replace(/'/g, "\\'").replace(/"/g, '\\"');
}


async function deleteTask(id) {
    if (!confirm('Удалить задачу?')) return;
    
    try {
        const res = await fetch(`${API_BASE}/api/tasks/${id}`, {
            method: "DELETE",
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        if (res.ok) {
            fetchTasks();
        } else {
            throw new Error('Ошибка удаления');
        }
    } catch (error) {
        console.error('Ошибка удаления задачи:', error);
        alert('Ошибка удаления задачи');
    }
}

async function logout() {
    try {
        localStorage.removeItem('token');
        window.location.href = "/";
    } catch (error) {
        console.error('Ошибка при выходе:', error);
        window.location.href = "/";
    }
}


function showEditForm(id, title, description, status, deadline) {
    const list = document.getElementById("taskList");
    
    
    document.querySelectorAll('.editForm').forEach(form => form.remove());
    
    const form = document.createElement("div");
    form.className = "editForm";
    
    
    const deadlineFormatted = deadline ? 
        new Date(deadline).toISOString().slice(0, 16) : "";
    
    form.innerHTML = `
        <h3>Редактировать задачу</h3>
        <form id="editForm_${id}">
            <div style="margin-bottom: 10px;">
                <label>Название:</label><br>
                <input type="text" name="title" value="${escapeHtml(title)}" required style="width: 100%; padding: 8px;">
            </div>
            <div style="margin-bottom: 10px;">
                <label>Описание:</label><br>
                <textarea name="description" style="width: 100%; padding: 8px; height: 80px;">${escapeHtml(description)}</textarea>
            </div>
            <div style="margin-bottom: 10px;">
                <label>Статус:</label><br>
                <select name="status" style="width: 100%; padding: 8px;">
                    <option value="NOT_STARTED" ${status === "NOT_STARTED" ? "selected" : ""}>не начата</option>
                    <option value="IN_PROGRESS" ${status === "IN_PROGRESS" ? "selected" : ""}>в работе</option>
                    <option value="COMPLETED" ${status === "COMPLETED" ? "selected" : ""}>завершена</option>
                </select>
            </div>
            <div style="margin-bottom: 15px;">
                <label>Дедлайн:</label><br>
                <input type="datetime-local" name="deadline" value="${deadlineFormatted}" style="width: 100%; padding: 8px;">
            </div>
            <div>
                <button type="submit" style="background: #4CAF50; color: white; padding: 10px 20px; border: none; border-radius: 4px; cursor: pointer;">
                    💾 Сохранить
                </button>
                <button type="button" onclick="cancelEdit(this)" style="margin-left: 10px; padding: 10px 20px; background: #ccc; border: none; border-radius: 4px; cursor: pointer;">
                    Отмена
                </button>
            </div>
        </form>
        <hr>
    `;
    
    list.prepend(form);

    const editForm = form.querySelector(`#editForm_${id}`);
    editForm.onsubmit = async function(e) {
        e.preventDefault();
        const formData = new FormData(this);
        
       
        const updateData = {
            description: formData.get('description') || null,
            status: formData.get('status')
        };

        try {
            const res = await fetch(`${API_BASE}/api/tasks/${id}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(updateData)
            });
            
            if (res.ok) {
                fetchTasks();
                alert('Задача обновлена!');
            } else {
                const error = await res.json();
                throw new Error(error.detail || 'Ошибка при обновлении задачи');
            }
        } catch (error) {
            console.error('Ошибка обновления задачи:', error);
            alert('Ошибка: ' + error.message);
        }
    };
}

function cancelEdit(btn) {
    btn.closest(".editForm").remove();
}

function escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}