import { Router, Request, Response } from 'express';
import db from '../database/init';
import { MapCell } from '../types';

const router = Router();

// Get all map cells
router.get('/', (req: Request, res: Response) => {
    try {
        const cells = db.prepare('SELECT * FROM map_cells').all();
        res.json(cells);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch map cells' });
    }
});

// Create or update map cell
router.post('/', (req: Request, res: Response) => {
    try {
        const { x, y, type, aisle_id } = req.body;
        
        // Check if cell exists
        const existingCell = db.prepare(
            'SELECT * FROM map_cells WHERE x = ? AND y = ?'
        ).get(x, y);
        
        if (existingCell) {
            // Update existing cell
            db.prepare(
                'UPDATE map_cells SET type = ?, aisle_id = ? WHERE x = ? AND y = ?'
            ).run(type, aisle_id, x, y);
            
            const updatedCell = db.prepare(
                'SELECT * FROM map_cells WHERE x = ? AND y = ?'
            ).get(x, y);
            
            res.json(updatedCell);
        } else {
            // Create new cell
            const result = db.prepare(
                'INSERT INTO map_cells (x, y, type, aisle_id) VALUES (?, ?, ?, ?)'
            ).run(x, y, type, aisle_id);
            
            const newCell = db.prepare(
                'SELECT * FROM map_cells WHERE id = ?'
            ).get(result.lastInsertRowid);
            
            res.status(201).json(newCell);
        }
    } catch (error) {
        res.status(500).json({ error: 'Failed to create/update map cell' });
    }
});

// Delete map cell
router.delete('/:x/:y', (req: Request<{ x: string; y: string }>, res: Response) => {
    try {
        const { x, y } = req.params;
        const result = db.prepare(
            'DELETE FROM map_cells WHERE x = ? AND y = ?'
        ).run(x, y);
        
        if (result.changes === 0) {
            return res.status(404).json({ error: 'Map cell not found' });
        }
        
        res.status(204).send();
    } catch (error) {
        res.status(500).json({ error: 'Failed to delete map cell' });
    }
});

// Get cells by aisle
router.get('/aisle/:aisleId', (req: Request<{ aisleId: string }>, res: Response) => {
    try {
        const { aisleId } = req.params;
        const cells = db.prepare(
            'SELECT * FROM map_cells WHERE aisle_id = ?'
        ).all(aisleId);
        
        res.json(cells);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch aisle cells' });
    }
});

export default router; 