import Database from 'better-sqlite3';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dbPath = path.join(__dirname, 'supermarket.db');
const schemaPath = path.join(__dirname, 'schema.sql');

// Initialize database
const db = new Database(dbPath);

// Read and execute schema
const schema = fs.readFileSync(schemaPath, 'utf8');
db.exec(schema);

// Enable foreign keys
db.pragma('foreign_keys = ON');

export default db; 