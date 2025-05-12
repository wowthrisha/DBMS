import { Router, Request, Response } from 'express';
import db from '../database/init';
import { Aisle } from '../types';

const router = Router();

// Get all aisles
router.get('/', (req: Request, res: Response) => {
    try {
        const aisles = db.prepare('SELECT * FROM aisles ORDER BY name').all();
        res.json(aisles);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch aisles' });
    }
});

// Create new aisle
router.post('/', (req: Request, res: Response) => {
    try {
        const { name, description } = req.body;
        const result = db.prepare(
            'INSERT INTO aisles (name, description) VALUES (?, ?)'
        ).run(name, description);
        
        const newAisle = db.prepare('SELECT * FROM aisles WHERE id = ?').get(result.lastInsertRowid);
        res.status(201).json(newAisle);
    } catch (error) {
        res.status(500).json({ error: 'Failed to create aisle' });
    }
});

// Update aisle
router.put('/:id', (req: Request<{ id: string }>, res: Response) => {
    try {
        const { id } = req.params;
        const { name, description } = req.body;
        
        db.prepare(
            'UPDATE aisles SET name = ?, description = ? WHERE id = ?'
        ).run(name, description, id);
        
        const updatedAisle = db.prepare('SELECT * FROM aisles WHERE id = ?').get(id);
        if (!updatedAisle) {
            return res.status(404).json({ error: 'Aisle not found' });
        }
        
        res.json(updatedAisle);
    } catch (error) {
        res.status(500).json({ error: 'Failed to update aisle' });
    }
});

// Delete aisle
router.delete('/:id', (req: Request<{ id: string }>, res: Response) => {
    try {
        const { id } = req.params;
        const result = db.prepare('DELETE FROM aisles WHERE id = ?').run(id);
        
        if (result.changes === 0) {
            return res.status(404).json({ error: 'Aisle not found' });
        }
        
        res.status(204).send();
    } catch (error) {
        res.status(500).json({ error: 'Failed to delete aisle' });
    }
});

export default router; 