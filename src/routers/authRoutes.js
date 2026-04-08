// src/routers/authRoutes.js
import express from 'express';
import * as authController from '../controllers/authController.js';
import { verifyToken, checkRole, getCurrentUser } from '../middleware/auth.js';

const router = express.Router();

// Public routes
router.post('/register', authController.register);
router.post('/login', authController.login);
router.get('/me', getCurrentUser);

// Protected routes - require authentication
router.get('/profile', verifyToken, authController.getProfile);
router.put('/users/:id', verifyToken, authController.updateUser);
router.put('/users/entity/:entidade_id', verifyToken, authController.updateUserByEntityId);

// Admin only routes
router.get('/users', verifyToken, checkRole(['admin']), authController.getAllUsers);

// Impersonation routes (admin only)
router.post('/admin/impersonate/:userId', verifyToken, checkRole(['admin']), authController.startImpersonation);
router.post('/admin/stop-impersonate', verifyToken, authController.stopImpersonation);
router.get('/admin/impersonations/history', verifyToken, checkRole(['admin']), authController.getImpersonationHistory);
router.get('/admin/impersonations/active', verifyToken, checkRole(['admin']), authController.getActiveImpersonations);

export default router;
