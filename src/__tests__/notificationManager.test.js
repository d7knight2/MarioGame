import { jest } from '@jest/globals';
import NotificationManager from '../utils/NotificationManager.js';

describe('NotificationManager', () => {
    test('returns false when permission is denied', () => {
        global.Notification = { permission: 'denied' };
        const manager = new NotificationManager({});
        expect(manager.notify('test')).toBe(false);
    });

    test('creates notification when permission is granted', () => {
        const mockNotification = jest.fn();
        mockNotification.permission = 'granted';
        global.Notification = mockNotification;

        const manager = new NotificationManager({});
        const result = manager.notify('Friend Online', { body: 'Luigi is online' });

        expect(result).toBe(true);
        expect(mockNotification).toHaveBeenCalledWith('Friend Online', expect.objectContaining({ body: 'Luigi is online' }));
    });
});
