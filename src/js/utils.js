// Utilitaires pour l'application de liste de tâches

// Formatage des dates
export const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) {
        return 'Aujourd\'hui';
    } else if (diffDays === 2) {
        return 'Hier';
    } else if (diffDays <= 7) {
        return `Il y a ${diffDays - 1} jours`;
    } else {
        return date.toLocaleDateString('fr-FR');
    }
};

// Génération de couleurs aléatoires
export const getRandomColor = () => {
    const colors = [
        '#e53e3e', '#3182ce', '#38a169', '#d69e2e', 
        '#805ad5', '#d53f8c', '#a0522d', '#2d3748'
    ];
    return colors[Math.floor(Math.random() * colors.length)];
};

// Validation du texte de tâche
export const validateTaskText = (text) => {
    if (!text || text.trim().length === 0) {
        return { valid: false, message: 'Le texte de la tâche ne peut pas être vide' };
    }
    
    if (text.trim().length > 100) {
        return { valid: false, message: 'Le texte de la tâche ne peut pas dépasser 100 caractères' };
    }
    
    return { valid: true };
};

// Debounce pour optimiser les performances
export const debounce = (func, wait) => {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
};

// Animation fluide pour le scroll
export const smoothScrollTo = (element) => {
    element.scrollIntoView({
        behavior: 'smooth',
        block: 'center'
    });
};

// Notification toast simple
export const showToast = (message, type = 'info') => {
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.textContent = message;
    
    toast.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 12px 20px;
        background: ${type === 'success' ? '#48bb78' : type === 'error' ? '#f56565' : '#4299e1'};
        color: white;
        border-radius: 8px;
        box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        z-index: 1000;
        animation: slideInRight 0.3s ease-out;
    `;
    
    document.body.appendChild(toast);
    
    setTimeout(() => {
        toast.style.animation = 'slideOutRight 0.3s ease-in';
        setTimeout(() => {
            document.body.removeChild(toast);
        }, 300);
    }, 3000);
};

// Export/Import des données
export const exportTasks = (tasks) => {
    const dataStr = JSON.stringify(tasks, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    
    const link = document.createElement('a');
    link.href = URL.createObjectURL(dataBlob);
    link.download = `mes-taches-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
};

export const importTasks = (file) => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const tasks = JSON.parse(e.target.result);
                resolve(tasks);
            } catch (error) {
                reject(new Error('Fichier invalide'));
            }
        };
        reader.onerror = () => reject(new Error('Erreur de lecture du fichier'));
        reader.readAsText(file);
    });
};