import AreaInstituicao from '../models/areaInstituicao.js';

// Get all area_instituicoes
export const getAllAreaInstituicoes = async (req, res) => {
    try {
        const areas = await AreaInstituicao.findAll();
        res.status(200).json(areas);
    } catch (error) {
        console.error('Error fetching area_instituicoes:', error);
        res.status(500).json({ error: 'Error fetching area_instituicoes' });
    }
};

// Get a single area_instituicao by ID
export const getAreaInstituicaoById = async (req, res) => {
    try {
        const { id } = req.params;
        const area = await AreaInstituicao.findById(id);
        if (!area) {
            return res.status(404).json({ error: 'AreaInstituicao not found' });
        }
        res.status(200).json(area);
    } catch (error) {
        console.error('Error fetching area_instituicao:', error);
        res.status(500).json({ error: 'Error fetching area_instituicao' });
    }
};

// Create a new area_instituicao
export const createAreaInstituicao = async (req, res) => {
    try {
        const { area } = req.body;
        if (!area) {
            return res.status(400).json({ error: 'Area name is required' });
        }
        const newArea = await AreaInstituicao.create(area);
        res.status(201).json(newArea);
    } catch (error) {
        console.error('Error creating area_instituicao:', error);
        res.status(500).json({ error: 'Error creating area_instituicao' });
    }
};

// Update an area_instituicao by ID
export const updateAreaInstituicao = async (req, res) => {
    try {
        const { id } = req.params;
        const { area } = req.body;
        if (!area) {
            return res.status(400).json({ error: 'Area name is required' });
        }
        const updated = await AreaInstituicao.update(id, area);
        if (!updated) {
            return res.status(404).json({ error: 'AreaInstituicao not found' });
        }
        res.status(200).json({ id, area });
    } catch (error) {
        console.error('Error updating area_instituicao:', error);
        res.status(500).json({ error: 'Error updating area_instituicao' });
    }
};

// Delete an area_instituicao by ID
export const deleteAreaInstituicao = async (req, res) => {
    try {
        const { id } = req.params;
        const deleted = await AreaInstituicao.delete(id);
        if (!deleted) {
            return res.status(404).json({ error: 'AreaInstituicao not found' });
        }
        res.status(200).json({ message: 'AreaInstituicao deleted successfully' });
    } catch (error) {
        console.error('Error deleting area_instituicao:', error);
        res.status(500).json({ error: 'Error deleting area_instituicao' });
    }
};
