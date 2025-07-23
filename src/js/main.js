// Classe principale pour gérer l'application de liste de tâches
class TodoApp {
    constructor() {
        this.tasks = this.loadTasks();
        this.currentFilter = 'all';
        this.taskIdCounter = this.getNextId();
        
        this.initializeElements();
        this.bindEvents();
        this.render();
    }

    // Initialise les références aux éléments DOM
    initializeElements() {
        this.taskForm = document.getElementById('taskForm');
        this.taskInput = document.getElementById('taskInput');
        this.tasksList = document.getElementById('tasksList');
        this.emptyState = document.getElementById('emptyState');
        this.totalTasksEl = document.getElementById('totalTasks');
        this.completedTasksEl = document.getElementById('completedTasks');
        this.filterBtns = document.querySelectorAll('.filter-btn');
        this.clearCompletedBtn = document.getElementById('clearCompleted');
        this.clearAllBtn = document.getElementById('clearAll');
    }

    // Lie les événements aux éléments
    bindEvents() {
        this.taskForm.addEventListener('submit', (e) => this.handleAddTask(e));
        
        this.filterBtns.forEach(btn => {
            btn.addEventListener('click', (e) => this.handleFilterChange(e));
        });
        
        this.clearCompletedBtn.addEventListener('click', () => this.clearCompletedTasks());
        this.clearAllBtn.addEventListener('click', () => this.clearAllTasks());
        
        // Sauvegarde automatique lors de la fermeture de la page
        window.addEventListener('beforeunload', () => this.saveTasks());
    }

    // Gère l'ajout d'une nouvelle tâche
    handleAddTask(e) {
        e.preventDefault();
        
        const text = this.taskInput.value.trim();
        if (text === '') return;
        
        const task = {
            id: this.taskIdCounter++,
            text: text,
            completed: false,
            createdAt: new Date().toISOString(),
            colors: ["#e53e3e", "#3182ce", "#38a169", "#d69e2e", "#805ad5", "#d53f8c", "#a0522d"]
        };
        
        this.tasks.unshift(task);
        this.taskInput.value = '';
        this.saveTasks();
        this.render();
        
        // Animation d'ajout
        this.animateTaskAdd();
    }

    // Gère le changement de filtre
    handleFilterChange(e) {
        const filter = e.target.dataset.filter;
        if (!filter) return;
        
        this.currentFilter = filter;
        
        // Met à jour l'état actif des boutons de filtre
        this.filterBtns.forEach(btn => btn.classList.remove('active'));
        e.target.classList.add('active');
        
        this.render();
    }

    // Bascule l'état de completion d'une tâche
    toggleTask(id) {
        const task = this.tasks.find(t => t.id === id);
        if (task) {
            task.completed = !task.completed;
            task.completedAt = task.completed ? new Date().toISOString() : null;
            this.saveTasks();
            this.render();
        }
    }

    // Supprime une tâche avec animation
    deleteTask(id) {
        const taskElement = document.querySelector(`[data-task-id="${id}"]`);
        if (taskElement) {
            taskElement.classList.add('removing');
            setTimeout(() => {
                this.tasks = this.tasks.filter(t => t.id !== id);
                this.saveTasks();
                this.render();
            }, 300);
        }
    }

    // Édite une tâche
    editTask(id) {
        const task = this.tasks.find(t => t.id === id);
        if (!task) return;
        
        const newText = prompt('Modifier la tâche:', task.text);
        if (newText !== null && newText.trim() !== '') {
            task.text = newText.trim();
            task.updatedAt = new Date().toISOString();
            this.saveTasks();
            this.render();
        }
    }

    // Supprime toutes les tâches terminées
    clearCompletedTasks() {
        if (this.tasks.some(t => t.completed)) {
            if (confirm('Êtes-vous sûr de vouloir supprimer toutes les tâches terminées ?')) {
                this.tasks = this.tasks.filter(t => !t.completed);
                this.saveTasks();
                this.render();
            }
        }
    }

    // Supprime toutes les tâches
    clearAllTasks() {
        if (this.tasks.length > 0) {
            if (confirm('Êtes-vous sûr de vouloir supprimer toutes les tâches ?')) {
                this.tasks = [];
                this.saveTasks();
                this.render();
            }
        }
    }

    // Filtre les tâches selon le filtre actuel
    getFilteredTasks() {
        switch (this.currentFilter) {
            case 'active':
                return this.tasks.filter(t => !t.completed);
            case 'completed':
                return this.tasks.filter(t => t.completed);
            default:
                return this.tasks;
        }
    }

    // Crée l'élément HTML pour une tâche
    createTaskElement(task) {
        const li = document.createElement('li');
        li.className = `task-item ${task.completed ? 'completed' : ''}`;
        li.dataset.taskId = task.id;
        
        li.innerHTML = `
            <div class="task-checkbox ${task.completed ? 'checked' : ''}" onclick="app.toggleTask(${task.id})">
                ${task.completed ? '<i class="fas fa-check"></i>' : ''}
            </div>
            <span class="task-text">${this.escapeHtml(task.text)}</span>
            <div class="task-actions">
                <button class="task-btn edit" onclick="app.editTask(${task.id})" title="Modifier">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="task-btn delete" onclick="app.deleteTask(${task.id})" title="Supprimer">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        `;
        
        return li;
    }

    // Échappe les caractères HTML pour éviter les injections
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    // Met à jour les statistiques
    updateStats() {
        const total = this.tasks.length;
        const completed = this.tasks.filter(t => t.completed).length;
        
        this.totalTasksEl.textContent = total;
        this.completedTasksEl.textContent = completed;
        
        // Met à jour l'état des boutons d'action
        this.clearCompletedBtn.disabled = completed === 0;
        this.clearAllBtn.disabled = total === 0;
    }

    // Animation lors de l'ajout d'une tâche
    animateTaskAdd() {
        const firstTask = this.tasksList.querySelector('.task-item');
        if (firstTask) {
            firstTask.style.animation = 'none';
            firstTask.offsetHeight; // Force reflow
            firstTask.style.animation = 'slideIn 0.3s ease-out';
        }
    }

    // Rend l'interface utilisateur
    render() {
        const filteredTasks = this.getFilteredTasks();
        
        // Vide la liste
        this.tasksList.innerHTML = '';
        
        // Affiche les tâches filtrées
        filteredTasks.forEach(task => {
            const taskElement = this.createTaskElement(task);
            this.tasksList.appendChild(taskElement);
        });
        
        // Gère l'état vide
        if (filteredTasks.length === 0) {
            this.emptyState.classList.remove('hidden');
            this.updateEmptyStateMessage();
        } else {
            this.emptyState.classList.add('hidden');
        }
        
        // Met à jour les statistiques
        this.updateStats();
    }

    // Met à jour le message de l'état vide selon le filtre
    updateEmptyStateMessage() {
        const messages = {
            all: {
                icon: 'fas fa-clipboard-list',
                title: 'Aucune tâche pour le moment',
                text: 'Ajoutez votre première tâche ci-dessus pour commencer !'
            },
            active: {
                icon: 'fas fa-check-circle',
                title: 'Toutes les tâches sont terminées !',
                text: 'Félicitations ! Vous avez terminé toutes vos tâches.'
            },
            completed: {
                icon: 'fas fa-clock',
                title: 'Aucune tâche terminée',
                text: 'Les tâches que vous terminez apparaîtront ici.'
            }
        };
        
        const message = messages[this.currentFilter];
        this.emptyState.innerHTML = `
            <i class="${message.icon}"></i>
            <h3>${message.title}</h3>
            <p>${message.text}</p>
        `;
    }

    // Sauvegarde les tâches dans le localStorage
    saveTasks() {
        try {
            localStorage.setItem('todoApp_tasks', JSON.stringify(this.tasks));
            localStorage.setItem('todoApp_counter', this.taskIdCounter.toString());
        } catch (error) {
            console.error('Erreur lors de la sauvegarde:', error);
        }
    }

    // Charge les tâches depuis le localStorage
    loadTasks() {
        try {
            const saved = localStorage.getItem('todoApp_tasks');
            return saved ? JSON.parse(saved) : [];
        } catch (error) {
            console.error('Erreur lors du chargement:', error);
            return [];
        }
    }

    // Obtient le prochain ID disponible
    getNextId() {
        try {
            const saved = localStorage.getItem('todoApp_counter');
            return saved ? parseInt(saved) : 1;
        } catch (error) {
            return Math.max(...this.tasks.map(t => t.id), 0) + 1;
        }
    }
}

// Initialise l'application quand le DOM est chargé
document.addEventListener('DOMContentLoaded', () => {
    window.app = new TodoApp();
});

// Fonctions utilitaires pour les raccourcis clavier
document.addEventListener('keydown', (e) => {
    // Ctrl/Cmd + Enter pour ajouter rapidement une tâche
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        document.getElementById('taskInput').focus();
    }
    
    // Échap pour vider le champ de saisie
    if (e.key === 'Escape' && document.activeElement === document.getElementById('taskInput')) {
        document.getElementById('taskInput').value = '';
    }
});