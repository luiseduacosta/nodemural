// src/models/impersonation.js
import pool from '../database/db.js';

const Impersonation = {
    // Create a new impersonation session
    async create(adminId, impersonatedUserId) {
        try {
            // First, end any active impersonations for this admin
            await pool.query(
                'UPDATE impersonations SET ended_at = NOW(), is_active = FALSE WHERE admin_id = ? AND is_active = TRUE',
                [adminId]
            );

            // Create new impersonation record
            const result = await pool.query(
                'INSERT INTO impersonations (admin_id, impersonated_user_id) VALUES (?, ?)',
                [adminId, impersonatedUserId]
            );

            return {
                id: Number(result.insertId),
                admin_id: adminId,
                impersonated_user_id: impersonatedUserId,
                started_at: new Date()
            };
        } catch (error) {
            throw error;
        }
    },

    // Get active impersonation by admin ID
    async findActiveByAdminId(adminId) {
        try {
            const rows = await pool.query(
                `SELECT i.*, u.email as admin_email, u.nome as admin_name
                 FROM impersonations i
                 JOIN auth_users u ON i.admin_id = u.id
                 WHERE i.admin_id = ? AND i.is_active = TRUE
                 ORDER BY i.started_at DESC
                 LIMIT 1`,
                [adminId]
            );
            return rows[0] || null;
        } catch (error) {
            throw error;
        }
    },

    // Get active impersonation by impersonated user ID
    async findActiveByImpersonatedUserId(impersonatedUserId) {
        try {
            const rows = await pool.query(
                `SELECT i.*, u.email as impersonated_email, u.nome as impersonated_name, u.role as impersonated_role
                 FROM impersonations i
                 JOIN auth_users u ON i.impersonated_user_id = u.id
                 WHERE i.impersonated_user_id = ? AND i.is_active = TRUE
                 ORDER BY i.started_at DESC
                 LIMIT 1`,
                [impersonatedUserId]
            );
            return rows[0] || null;
        } catch (error) {
            throw error;
        }
    },

    // End impersonation session
    async end(adminId) {
        try {
            const result = await pool.query(
                'UPDATE impersonations SET ended_at = NOW(), is_active = FALSE WHERE admin_id = ? AND is_active = TRUE',
                [adminId]
            );
            return result.affectedRows > 0;
        } catch (error) {
            throw error;
        }
    },

    // Get impersonation history for an admin
    async getHistory(adminId, limit = 50) {
        try {
            const rows = await pool.query(
                `SELECT i.*, 
                        admin_user.email as admin_email, admin_user.nome as admin_name,
                        imp_user.email as impersonated_email, imp_user.nome as impersonated_name, imp_user.role as impersonated_role,
                        TIMESTAMPDIFF(MINUTE, i.started_at, COALESCE(i.ended_at, NOW())) as duration_minutes
                 FROM impersonations i
                 JOIN auth_users admin_user ON i.admin_id = admin_user.id
                 JOIN auth_users imp_user ON i.impersonated_user_id = imp_user.id
                 WHERE i.admin_id = ?
                 ORDER BY i.started_at DESC
                 LIMIT ?`,
                [adminId, limit]
            );
            return rows;
        } catch (error) {
            throw error;
        }
    },

    // Get all active impersonations (admin overview)
    async getAllActive() {
        try {
            const rows = await pool.query(
                `SELECT i.*, 
                        admin_user.email as admin_email, admin_user.nome as admin_name,
                        imp_user.email as impersonated_email, imp_user.nome as impersonated_name, imp_user.role as impersonated_role,
                        TIMESTAMPDIFF(MINUTE, i.started_at, NOW()) as duration_minutes
                 FROM impersonations i
                 JOIN auth_users admin_user ON i.admin_id = admin_user.id
                 JOIN auth_users imp_user ON i.impersonated_user_id = imp_user.id
                 WHERE i.is_active = TRUE
                 ORDER BY i.started_at DESC`
            );
            return rows;
        } catch (error) {
            throw error;
        }
    }
};

export default Impersonation;
