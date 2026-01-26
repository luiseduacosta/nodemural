// src/controllers/atividadesController.js
import Atividades from '../models/atividades.js';

// Get all atividades
export const getAllAtividades = async (req, res) => {
    try {
        const atividades = await Atividades.findAll(req);
        res.status(200).json(atividades);
    } catch (error) {
        console.error('Error fetching atividades:', error);
        res.status(500).json({ error: error.message });
    }
};

// Get a single atividade by ID
export const getAtividadeById = async (req, res) => {
    try {
        const { id } = req.params;
        const atividade = await Atividades.findById(id);
        if (!atividade) {
            return res.status(404).json({ error: 'Atividade not found' });
        }
        res.status(200).json(atividade);
    } catch (error) {
        console.error('Error fetching atividade:', error);
        res.status(500).json({ error: error.message });
    }
};

// Create a new atividade
export const createAtividade = async (req, res) => {
    try {
        // estagiario_id can be in params (if using /atividades/:estagiario_id) or body
        const estagiario_id = req.params.estagiario_id || req.body.estagiario_id;
        const { dia, inicio, final, atividade } = req.body;

        const newAtividade = await Atividades.create(estagiario_id, dia, inicio, final, atividade);
        res.status(201).json(newAtividade);
    } catch (error) {
        console.error('Error creating atividade:', error);
        res.status(500).json({ error: error.message });
    }
};

// Update a atividade by ID
export const updateAtividade = async (req, res) => {
    try {
        const { id } = req.params;
        const { estagiario_id, dia, inicio, final, atividade } = req.body;

        const updated = await Atividades.update(id, estagiario_id, dia, inicio, final, atividade);
        if (!updated) {
            // Note: In strict REST, if update works but nothing changed, we might still 204 or 200. 
            // The model returns affectedRows > 0 only if a row matched. 
            // If the ID doesn't exist, it returns false.
            // If the ID exists but data is identical, mysql/mariadb may return affectedRows = 0 depending on flags.
            // Assuming affectedRows check implies "record found and processed".
            // Since we use ID to find it, if it returns 0 affectedRows often means ID not found.
            // However, let's stick to the server.js behavior which always sent 204 regardless of affected rows (it didn't check).
            // But we should try to be better. If we want to strictly mimic server.js:
            // server.js: await conn.query(...); res.status(204).end();
            // It didn't check if row existed.
            // I'll stick to strict 204.
            // But checking if it exists is better for DX. I'll behave like the other controllers (alunoController).
            // But wait, if affectedRows is 0 because no changes were made (but id exists), returning 404 is wrong.
            // Let's assume the user wants standard behavior.
            // I'll just return 204 if successful, catch error otherwise.
        }
        res.status(204).end();
    } catch (error) {
        console.error('Error updating atividade:', error);
        res.status(500).json({ error: error.message });
    }
};

// Delete a atividade by ID
export const deleteAtividade = async (req, res) => {
    try {
        const { id } = req.params;
        const deleted = await Atividades.delete(id);
        // Similar to update, server.js didn't check for existence.
        res.status(204).end();
    } catch (error) {
        console.error('Error deleting atividade:', error);
        res.status(500).json({ error: error.message });
    }
};
