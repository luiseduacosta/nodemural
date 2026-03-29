import Area from '../models/area.js';

// Get all areas
export const getAllAreas = async (req, res) => {
    try {
        const areas = await Area.findAll();
        res.status(200).json(areas);
    } catch (error) {
        console.error('Error fetching areas:', error);
        res.status(500).json({ error: 'Error fetching areas' });
    }
};

// Get a single area by ID
export const getAreaById = async (req, res) => {
    try {
        const { id } = req.params;
        const area = await Area.findById(id);
        if (!area) {
            return res.status(404).json({ error: 'Area not found' });
        }
        res.status(200).json(area);
    } catch (error) {
        console.error('Error fetching area:', error);
        res.status(500).json({ error: 'Error fetching area' });
    }
};

// Create a new area
export const createArea = async (req, res) => {
    try {
        const { area } = req.body;
        if (!area) {
            return res.status(400).json({ error: 'Area name is required' });
        }
        const newArea = await Area.create(area);
        res.status(201).json(newArea);
    } catch (error) {
        console.error('Error creating area:', error);
        res.status(500).json({ error: 'Error creating area' });
    }
};

// Update an area by ID
export const updateArea = async (req, res) => {
    try {
        const { id } = req.params;
        const { area } = req.body;
        if (!area) {
            return res.status(400).json({ error: 'Area name is required' });
        }
        const updated = await Area.update(id, area);
        if (!updated) {
            return res.status(404).json({ error: 'Area not found' });
        }
        res.status(200).json({ id, area });
    } catch (error) {
        console.error('Error updating area:', error);
        res.status(500).json({ error: 'Error updating area' });
    }
};

// Delete an area by ID
export const deleteArea = async (req, res) => {
    try {
        const { id } = req.params;
        const deleted = await Area.delete(id);
        if (!deleted) {
            return res.status(404).json({ error: 'Area not found' });
        }
        res.status(200).json({ message: 'Area deleted successfully' });
    } catch (error) {
        console.error('Error deleting area:', error);
        res.status(500).json({ error: 'Error deleting area' });
    }
};
