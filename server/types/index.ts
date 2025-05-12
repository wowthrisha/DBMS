export interface Aisle {
    id: number;
    name: string;
    description: string | null;
    created_at: string;
}

export interface MapCell {
    id: number;
    x: number;
    y: number;
    type: 'walkable' | 'obstacle' | 'aisle';
    aisle_id: number | null;
    created_at: string;
}

export interface Path {
    id: number;
    name: string;
    start_cell_id: number;
    end_cell_id: number;
    path_data: string; // JSON string containing the path coordinates
    created_at: string;
}

export interface PathCoordinate {
    x: number;
    y: number;
} 