import Turno from '../models/turno.js';

export const getAllTurnos = async (req, res) => {
    try {
        const turnos = await Turno.findAll();
        res.status(200).json(turnos);
    } catch (error) {
        console.error('Error fetching turnos:', error);
        res.status(500).json({ error: 'Error fetching turnos' });
    }
};

export const getTurnoById = async (req, res) => {
    try {
        const { id } = req.params;
        const turno = await Turno.findById(id);
        if (!turno) {
            return res.status(404).json({ error: 'Turno not found' });
        }
        res.status(200).json(turno);
    } catch (error) {
        console.error('Error fetching turno:', error);
        res.status(500).json({ error: 'Error fetching turno' });
    }
};

export const createTurno = async (req, res) => {
    try {
        const { turno } = req.body;
        if (!turno) {
            return res.status(400).json({ error: 'Turno is required' });
        }
        const newTurno = await Turno.create(turno);
        res.status(201).json(newTurno);
    } catch (error) {
        console.error('Error creating turno:', error);
        res.status(500).json({ error: 'Error creating turno' });
    }
};

export const updateTurno = async (req, res) => {
    try {
        const { id } = req.params;
        const { turno } = req.body;
        if (!turno) {
            return res.status(400).json({ error: 'Turno is required' });
        }
        const updated = await Turno.update(id, turno);
        if (!updated) {
            return res.status(404).json({ error: 'Turno not found' });
        }
        res.status(200).json({ id, turno });
    } catch (error) {
        console.error('Error updating turno:', error);
        res.status(500).json({ error: 'Error updating turno' });
    }
};

export const deleteTurno = async (req, res) => {
    try {
        const { id } = req.params;
        const deleted = await Turno.delete(id);
        if (!deleted) {
            return res.status(404).json({ error: 'Turno not found' });
        }
        res.status(200).json({ message: 'Turno deleted successfully' });
    } catch (error) {
        console.error('Error deleting turno:', error);
        res.status(500).json({ error: 'Error deleting turno' });
    }
};
