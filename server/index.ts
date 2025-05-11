import express from 'express';
import cors from 'cors';
import aislesRouter from './routes/aisles';
import mapRouter from './routes/map';
import pathsRouter from './routes/paths';

const app = express();
const port = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/aisles', aislesRouter);
app.use('/api/map', mapRouter);
app.use('/api/paths', pathsRouter);

// Error handling middleware
app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
    console.error(err.stack);
    res.status(500).json({ error: 'Something went wrong!' });
});

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
}); 