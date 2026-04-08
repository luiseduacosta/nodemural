import Complemento from '../models/complemento.js';

export const getAllComplementos = async (req, res) => {
    try {
        const complementos = await Complemento.findAll();
        res.status(200).json(complementos);
    } catch (error) {
        console.error('Error fetching complementos:', error);
        res.status(500).json({ error: 'Error fetching complementos' });
    }
};

export const getComplementoById = async (req, res) => {
    try {
        const { id } = req.params;
        const complemento = await Complemento.findById(id);
        if (!complemento) {
            return res.status(404).json({ error: 'Complemento not found' });
        }
        res.status(200).json(complemento);
    } catch (error) {
        console.error('Error fetching complemento:', error);
        res.status(500).json({ error: 'Error fetching complemento' });
    }
};

export const createComplemento = async (req, res) => {
    try {
        const { complemento } = req.body;
        if (!complemento) {
            return res.status(400).json({ error: 'Complemento is required' });
        }
        const newComplemento = await Complemento.create(complemento);
        res.status(201).json(newComplemento);
    } catch (error) {
        console.error('Error creating complemento:', error);
        res.status(500).json({ error: 'Error creating complemento' });
    }
};

export const updateComplemento = async (req, res) => {
    try {
        const { id } = req.params;
        const { complemento } = req.body;
        if (!complemento) {
            return res.status(400).json({ error: 'Complemento is required' });
        }
        const updated = await Complemento.update(id, complemento);
        if (!updated) {
            return res.status(404).json({ error: 'Complemento not found' });
        }
        res.status(200).json({ id, complemento });
    } catch (error) {
        console.error('Error updating complemento:', error);
        res.status(500).json({ error: 'Error updating complemento' });
    }
};

export const deleteComplemento = async (req, res) => {
    try {
        const { id } = req.params;
        const deleted = await Complemento.delete(id);
        if (!deleted) {
            return res.status(404).json({ error: 'Complemento not found' });
        }
        res.status(200).json({ message: 'Complemento deleted successfully' });
    } catch (error) {
        console.error('Error deleting complemento:', error);
        res.status(500).json({ error: 'Error deleting complemento' });
    }
};
