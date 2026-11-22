import { Router } from 'express';
import { monitoringController } from '../controllers/monitoring.controller.js';

export const monitoringRoutes = Router();

// Public webhook endpoint for MikroTik Netwatch fetch scripts (GET or POST)
monitoringRoutes.get('/webhook', (req, res, next) => monitoringController.handleWebhook(req, res, next));
monitoringRoutes.post('/webhook', (req, res, next) => monitoringController.handleWebhook(req, res, next));

// Realtime SSE events stream for browser push notifications
monitoringRoutes.get('/events', (req, res) => monitoringController.subscribeEvents(req, res));

// Monitoring targets CRUD & actions
monitoringRoutes.get('/targets', (req, res, next) => monitoringController.getAllTargets(req, res, next));
monitoringRoutes.post('/targets', (req, res, next) => monitoringController.createTarget(req, res, next));
monitoringRoutes.delete('/targets/:id', (req, res, next) => monitoringController.deleteTarget(req, res, next));
monitoringRoutes.post('/targets/:id/sync', (req, res, next) => monitoringController.syncNetwatch(req, res, next));
monitoringRoutes.get('/targets/:id/incidents', (req, res, next) => monitoringController.getTargetIncidents(req, res, next));
monitoringRoutes.post('/sync-pppoe', (req, res, next) => monitoringController.syncPppoe(req, res, next));

// Telegram channels CRUD & test
monitoringRoutes.get('/telegram-channels', (req, res, next) => monitoringController.getTelegramChannels(req, res, next));
monitoringRoutes.post('/telegram-channels', (req, res, next) => monitoringController.createTelegramChannel(req, res, next));
monitoringRoutes.put('/telegram-channels/:id', (req, res, next) => monitoringController.updateTelegramChannel(req, res, next));
monitoringRoutes.delete('/telegram-channels/:id', (req, res, next) => monitoringController.deleteTelegramChannel(req, res, next));
monitoringRoutes.post('/telegram-channels/:id/test', (req, res, next) => monitoringController.testTelegramChannel(req, res, next));

// Web notifications
monitoringRoutes.get('/notifications', (req, res, next) => monitoringController.getWebNotifications(req, res, next));
monitoringRoutes.patch('/notifications/:id/read', (req, res, next) => monitoringController.markWebNotificationRead(req, res, next));
monitoringRoutes.post('/notifications/read-all', (req, res, next) => monitoringController.markAllWebNotificationsRead(req, res, next));
