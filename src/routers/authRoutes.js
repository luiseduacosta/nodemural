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

// Admin only routes
router.get('/users', verifyToken, checkRole(['admin']), authController.getAllUsers);
router.put('/users/:id', verifyToken, authController.updateUser);

export default router;
