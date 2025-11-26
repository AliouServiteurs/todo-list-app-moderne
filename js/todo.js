const inp = document.getElementById("inp");
const toDoList = document.getElementById("toDoList");
const taskCount = document.getElementById("taskCount");
const filterBtns = document.querySelectorAll(".filter-btn");
const clearCompletedBtn = document.getElementById("clearCompleted");
const clearAllBtn = document.getElementById("clearAll");

let currentFilter = "all";
let tasks = JSON.parse(localStorage.getItem('tasks')) || [];

// Initialisation
document.addEventListener('DOMContentLoaded', () => {
    loadTasks();
    updateTaskCount();
});

// Ajouter une tâche avec Enter
inp.addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
        const taskText = inp.value.trim();
        
        // Validation
        if (taskText === "") {
            showAlert("Veuillez saisir une tâche", "error");
            return;
        }
        
        addTask(taskText);
        inp.value = "";
    }
});

// Fonction pour ajouter une tâche
function addTask(text) {
    const task = {
        id: Date.now(),
        text: text,
        completed: false,
        createdAt: new Date().toISOString()
    };
    
    tasks.push(task);
    saveTasks();
    renderTasks();
    showAlert("Tâche ajoutée avec succès !", "success");
}

// Fonction pour rendre les tâches
function renderTasks() {
    toDoList.innerHTML = '';
    
    const filteredTasks = tasks.filter(task => {
        if (currentFilter === 'active') return !task.completed;
        if (currentFilter === 'completed') return task.completed;
        return true;
    });
    
    if (filteredTasks.length === 0) {
        const emptyMessage = document.createElement('div');
        emptyMessage.className = 'empty-message';
        emptyMessage.textContent = getEmptyMessage();
        emptyMessage.style.textAlign = 'center';
        emptyMessage.style.color = '#7f8c8d';
        emptyMessage.style.padding = '40px 20px';
        emptyMessage.style.fontStyle = 'italic';
        toDoList.appendChild(emptyMessage);
        return;
    }
    
    filteredTasks.forEach(task => {
        const toDoItem = document.createElement("div");
        toDoItem.classList.add("toDoItems");
        toDoItem.setAttribute('data-id', task.id);
        
        if (task.completed) {
            toDoItem.classList.add("done");
        }
        
        toDoItem.innerHTML = `
            <p>${escapeHtml(task.text)}</p>
            <i class="fa-solid fa-circle-xmark delete-btn"></i>
        `;

        // Événement pour marquer comme terminé
        toDoItem.addEventListener("click", (e) => {
            if (!e.target.classList.contains('delete-btn')) {
                toggleTaskCompletion(task.id);
            }
        });

        // Événement pour supprimer
        toDoItem.querySelector(".delete-btn").addEventListener("click", (e) => {
            e.stopPropagation();
            deleteTask(task.id);
        });

        toDoList.appendChild(toDoItem);
    });
    
    updateTaskCount();
}

// Basculer l'état de complétion d'une tâche
function toggleTaskCompletion(taskId) {
    tasks = tasks.map(task => {
        if (task.id === taskId) {
            return { ...task, completed: !task.completed };
        }
        return task;
    });
    saveTasks();
    renderTasks();
}

// Supprimer une tâche
function deleteTask(taskId) {
    if (confirm("Êtes-vous sûr de vouloir supprimer cette tâche ?")) {
        tasks = tasks.filter(task => task.id !== taskId);
        saveTasks();
        renderTasks();
        showAlert("Tâche supprimée", "info");
    }
}

// Filtrer les tâches
filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        filterBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        currentFilter = btn.dataset.filter;
        renderTasks();
    });
});

// Supprimer les tâches terminées
clearCompletedBtn.addEventListener('click', () => {
    const completedCount = tasks.filter(task => task.completed).length;
    if (completedCount === 0) {
        showAlert("Aucune tâche terminée à supprimer", "info");
        return;
    }
    
    if (confirm(`Supprimer ${completedCount} tâche(s) terminée(s) ?`)) {
        tasks = tasks.filter(task => !task.completed);
        saveTasks();
        renderTasks();
        showAlert("Tâches terminées supprimées", "success");
    }
});

// Tout supprimer
clearAllBtn.addEventListener('click', () => {
    if (tasks.length === 0) {
        showAlert("La liste est déjà vide", "info");
        return;
    }
    
    if (confirm("Êtes-vous sûr de vouloir supprimer TOUTES les tâches ?")) {
        tasks = [];
        saveTasks();
        renderTasks();
        showAlert("Toutes les tâches ont été supprimées", "success");
    }
});

// Sauvegarder dans le localStorage
function saveTasks() {
    localStorage.setItem('tasks', JSON.stringify(tasks));
}

// Charger depuis le localStorage
function loadTasks() {
    renderTasks();
}

// Mettre à jour le compteur
function updateTaskCount() {
    const totalTasks = tasks.length;
    const completedTasks = tasks.filter(task => task.completed).length;
    const activeTasks = totalTasks - completedTasks;
    
    let countText = '';
    if (currentFilter === 'all') {
        countText = `${totalTasks} tâche(s) - ${completedTasks} terminée(s)`;
    } else if (currentFilter === 'active') {
        countText = `${activeTasks} tâche(s) active(s)`;
    } else {
        countText = `${completedTasks} tâche(s) terminée(s)`;
    }
    
    taskCount.textContent = countText;
}

// Message pour liste vide
function getEmptyMessage() {
    const messages = {
        all: "Aucune tâche pour le moment. Ajoutez votre première tâche !",
        active: "Aucune tâche active. Bravo !",
        completed: "Aucune tâche terminée pour le moment."
    };
    return messages[currentFilter] || messages.all;
}

// Sécurité : échapper le HTML
function escapeHtml(unsafe) {
    return unsafe
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

// Système d'alertes
function showAlert(message, type) {
    // Supprimer toute alerte existante
    const existingAlert = document.querySelector('.alert');
    if (existingAlert) {
        existingAlert.remove();
    }
    
    const alert = document.createElement('div');
    alert.className = `alert alert-${type}`;
    alert.textContent = message;
    
    // Styles pour l'alerte
    alert.style.position = 'fixed';
    alert.style.top = '20px';
    alert.style.right = '20px';
    alert.style.padding = '12px 20px';
    alert.style.borderRadius = '5px';
    alert.style.color = 'white';
    alert.style.fontWeight = '500';
    alert.style.zIndex = '1000';
    alert.style.opacity = '0';
    alert.style.transform = 'translateX(100px)';
    alert.style.transition = 'all 0.3s ease';
    
    // Couleurs selon le type
    const colors = {
        success: '#27ae60',
        error: '#e74c3c',
        info: '#3498db',
        warning: '#f39c12'
    };
    
    alert.style.background = colors[type] || colors.info;
    
    document.body.appendChild(alert);
    
    // Animation d'entrée
    setTimeout(() => {
        alert.style.opacity = '1';
        alert.style.transform = 'translateX(0)';
    }, 100);
    
    // Disparaître après 3 secondes
    setTimeout(() => {
        alert.style.opacity = '0';
        alert.style.transform = 'translateX(100px)';
        setTimeout(() => {
            if (alert.parentNode) {
                alert.remove();
            }
        }, 300);
    }, 3000);
}