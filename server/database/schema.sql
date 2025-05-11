-- Create aisles table
CREATE TABLE IF NOT EXISTS aisles (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create map_cells table
CREATE TABLE IF NOT EXISTS map_cells (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    x INTEGER NOT NULL,
    y INTEGER NOT NULL,
    type TEXT NOT NULL CHECK(type IN ('walkable', 'obstacle', 'aisle')),
    aisle_id INTEGER,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (aisle_id) REFERENCES aisles(id),
    UNIQUE(x, y)
);

-- Create paths table
CREATE TABLE IF NOT EXISTS paths (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    start_cell_id INTEGER NOT NULL,
    end_cell_id INTEGER NOT NULL,
    path_data TEXT NOT NULL, -- JSON string containing the path coordinates
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (start_cell_id) REFERENCES map_cells(id),
    FOREIGN KEY (end_cell_id) REFERENCES map_cells(id)
); 