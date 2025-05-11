# Database Bridge

This bridge allows you to sync and transfer data between MongoDB (used in the main DBMS project) and SQLite3 (used in the SupermarketMap project).

## Setup

1. Install Python dependencies:
```bash
pip install -r requirements.txt
```

2. Create a `.env` file in the bridge directory with the following variables:
```
MONGODB_URI=mongodb://localhost:27017
MONGODB_DB=kartify
SQLITE_DB_PATH=../SupermarketMap/database.db
```

## Running the Bridge

1. Start the FastAPI server:
```bash
python api.py
```

The server will run on `http://localhost:8000`

## API Endpoints

### 1. Sync Data
```http
POST /sync
Content-Type: application/json

{
    "collection_name": "products",
    "table_name": "products"
}
```
This endpoint will return data from both databases for comparison.

### 2. Transfer Data
```http
POST /transfer
Content-Type: application/json

{
    "source": "sqlite",  // or "mongo"
    "collection_name": "products",
    "table_name": "products"
}
```
This endpoint will transfer data from the source database to the target database.

## Example Usage

1. To sync data between MongoDB 'products' collection and SQLite 'products' table:
```bash
curl -X POST http://localhost:8000/sync -H "Content-Type: application/json" -d '{"collection_name": "products", "table_name": "products"}'
```

2. To transfer data from SQLite to MongoDB:
```bash
curl -X POST http://localhost:8000/transfer -H "Content-Type: application/json" -d '{"source": "sqlite", "collection_name": "products", "table_name": "products"}'
```

## Notes

- The bridge automatically handles data type conversions between the two databases
- All data is converted to strings when transferring to SQLite
- MongoDB's `_id` field is excluded when transferring data
- Tables are automatically created in SQLite if they don't exist 