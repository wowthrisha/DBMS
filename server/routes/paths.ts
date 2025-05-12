import { Router, Request, Response } from 'express';
import db from '../database/init';
import { Path } from '../types';

const router = Router();

// Get all paths
router.get('/', (req: Request, res: Response) => {
    try {
        const paths = db.prepare('SELECT * FROM paths ORDER BY created_at DESC').all();
        res.json(paths);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch paths' });
    }
});

// Create new path
router.post('/', (req: Request, res: Response) => {
    try {
        const { name, start_cell_id, end_cell_id, path_data } = req.body;
        
        const result = db.prepare(
            'INSERT INTO paths (name, start_cell_id, end_cell_id, path_data) VALUES (?, ?, ?, ?)'
        ).run(name, start_cell_id, end_cell_id, path_data);
        
        const newPath = db.prepare('SELECT * FROM paths WHERE id = ?').get(result.lastInsertRowid);
        res.status(201).json(newPath);
    } catch (error) {
        res.status(500).json({ error: 'Failed to create path' });
    }
});

// Get path by ID
router.get('/:id', (req: Request<{ id: string }>, res: Response) => {
    try {
        const { id } = req.params;
        const path = db.prepare('SELECT * FROM paths WHERE id = ?').get(id);
        
        if (!path) {
            return res.status(404).json({ error: 'Path not found' });
        }
        
        res.json(path);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch path' });
    }
});

// Delete path
router.delete('/:id', (req: Request<{ id: string }>, res: Response) => {
    try {
        const { id } = req.params;
        const result = db.prepare('DELETE FROM paths WHERE id = ?').run(id);
        
        if (result.changes === 0) {
            return res.status(404).json({ error: 'Path not found' });
        }
        
        res.status(204).send();
    } catch (error) {
        res.status(500).json({ error: 'Failed to delete path' });
    }
});

export default router; 