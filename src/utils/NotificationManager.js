export default class NotificationManager {
    constructor(scene) {
        this.scene = scene;
    }

    static isSupported() {
        return typeof window !== 'undefined' && 'Notification' in window;
    }

    async requestPermissionIfNeeded() {
        if (!NotificationManager.isSupported()) {
            return 'unsupported';
        }

        if (Notification.permission === 'default') {
            return Notification.requestPermission();
        }

        return Notification.permission;
    }

    notify(title, options = {}) {
        if (!NotificationManager.isSupported() || Notification.permission !== 'granted') {
            return false;
        }

        new Notification(title, {
            icon: '/vite.svg',
            ...options
        });
        return true;
    }
}
