// file: ui-notifier.js

/**
 * SKYLINE AA-1 - WEEK 34
 * The UI Notifier: Handles beautiful Toast Notifications and User Feedback.
 * Replaces ugly browser alerts with professional UX.
 */

class UINotifier {
    constructor() {
        this.container = null;
        this.init();
    }

    init() {
        // Create container if it doesn't exist
        if (!document.getElementById('toast-container')) {
            const container = document.createElement('div');
            container.id = 'toast-container';
            container.className = 'toast-container';
            document.body.appendChild(container);
            this.container = container;
        } else {
            this.container = document.getElementById('toast-container');
        }
    }

    show(message, type = 'info', duration = 5000) {
        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;
        
        let icon = 'ℹ️';
        if (type === 'success') icon = '✅';
        if (type === 'error') icon = '❌';
        if (type === 'warning') icon = '⚠️';

        toast.innerHTML = `
            <div class="toast-icon">${icon}</div>
            <div class="toast-content">
                <strong>${this.capitalize(type)}</strong>
                <p>${message}</p>
            </div>
            <button class="toast-close" onclick="this.parentElement.remove()">×</button>
        `;

        this.container.appendChild(toast);

        // Auto remove
        setTimeout(() => {
            toast.style.opacity = '0';            toast.style.transform = 'translateX(100%)';
            setTimeout(() => toast.remove(), 300);
        }, duration);
    }

    success(msg) { this.show(msg, 'success'); }
    error(msg) { this.show(msg, 'error'); }
    warning(msg) { this.show(msg, 'warning'); }
    info(msg) { this.show(msg, 'info'); }

    capitalize(str) {
        return str.charAt(0).toUpperCase() + str.slice(1);
    }

    // 🆕 WEEK 34: Smart Error Handler
    handleApiError(error) {
        console.error(error);
        if (error.message.includes('Failed to fetch') || error.message.includes('NetworkError')) {
            this.error('Skyline Engine is Offline. Please ensure `node server.js` is running.');
            updateServerStatus(false); // Update header indicator
        } else if (error.message.includes('400')) {
            this.warning('Invalid Input. Please check your request format.');
        } else {
            this.error(`Generation Failed: ${error.message}`);
        }
    }
}

// Global Instance
const Notifier = new UINotifier();

// 🆕 WEEK 34: Server Status Indicator Logic
function updateServerStatus(isOnline) {
    const indicator = document.getElementById('server-status-dot');
    const text = document.getElementById('server-status-text');
    if (!indicator || !text) return;

    if (isOnline) {
        indicator.style.backgroundColor = 'var(--success)';
        text.textContent = 'Engine Online';
        text.style.color = 'var(--success)';
    } else {
        indicator.style.backgroundColor = 'var(--error)';
        text.textContent = 'Engine Offline';
        text.style.color = 'var(--error)';
    }
}

// Check server status on load
fetch('http://localhost:5001/api/memory', { method: 'GET' })    .then(() => updateServerStatus(true))
    .catch(() => updateServerStatus(false));