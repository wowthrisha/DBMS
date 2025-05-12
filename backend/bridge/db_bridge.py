import sqlite3
from pymongo import MongoClient
from dotenv import load_dotenv
import os
from typing import Dict, List, Any
import json

# Load environment variables
load_dotenv()

class DatabaseBridge:
    def __init__(self):
        # MongoDB connection
        self.mongo_client = MongoClient(os.getenv('MONGODB_URI', 'mongodb://localhost:27017'))
        self.mongo_db = self.mongo_client[os.getenv('MONGODB_DB', 'kartify')]
        
        # SQLite connection
        self.sqlite_conn = sqlite3.connect(os.getenv('SQLITE_DB_PATH', '../SupermarketMap/database.db'))
        self.sqlite_cursor = self.sqlite_conn.cursor()

    def sync_data(self, collection_name: str, table_name: str):
        """
        Sync data between MongoDB collection and SQLite table
        """
        try:
            # Get data from MongoDB
            mongo_data = list(self.mongo_db[collection_name].find({}, {'_id': 0}))
            
            # Get data from SQLite
            self.sqlite_cursor.execute(f"SELECT * FROM {table_name}")
            sqlite_data = self.sqlite_cursor.fetchall()
            
            # Convert SQLite data to list of dicts
            columns = [description[0] for description in self.sqlite_cursor.description]
            sqlite_data_dict = [dict(zip(columns, row)) for row in sqlite_data]
            
            return {
                'mongo_data': mongo_data,
                'sqlite_data': sqlite_data_dict
            }
        except Exception as e:
            print(f"Error syncing data: {str(e)}")
            return None

    def transfer_to_mongo(self, table_name: str, collection_name: str):
        """
        Transfer data from SQLite to MongoDB
        """
        try:
            # Get data from SQLite
            self.sqlite_cursor.execute(f"SELECT * FROM {table_name}")
            sqlite_data = self.sqlite_cursor.fetchall()
            
            # Convert to list of dicts
            columns = [description[0] for description in self.sqlite_cursor.description]
            data_to_insert = [dict(zip(columns, row)) for row in sqlite_data]
            
            # Insert into MongoDB
            if data_to_insert:
                self.mongo_db[collection_name].insert_many(data_to_insert)
            return True
        except Exception as e:
            print(f"Error transferring to MongoDB: {str(e)}")
            return False

    def transfer_to_sqlite(self, collection_name: str, table_name: str):
        """
        Transfer data from MongoDB to SQLite
        """
        try:
            # Get data from MongoDB
            mongo_data = list(self.mongo_db[collection_name].find({}, {'_id': 0}))
            
            if not mongo_data:
                return False
                
            # Get column names from first document
            columns = list(mongo_data[0].keys())
            
            # Create table if not exists
            create_table_sql = f"""
            CREATE TABLE IF NOT EXISTS {table_name} (
                {', '.join([f'{col} TEXT' for col in columns])}
            )
            """
            self.sqlite_cursor.execute(create_table_sql)
            
            # Insert data
            for doc in mongo_data:
                placeholders = ', '.join(['?' for _ in columns])
                values = [str(doc.get(col, '')) for col in columns]
                self.sqlite_cursor.execute(
                    f"INSERT INTO {table_name} ({', '.join(columns)}) VALUES ({placeholders})",
                    values
                )
            
            self.sqlite_conn.commit()
            return True
        except Exception as e:
            print(f"Error transferring to SQLite: {str(e)}")
            return False

    def close(self):
        """
        Close database connections
        """
        self.sqlite_conn.close()
        self.mongo_client.close()

# Example usage
if __name__ == "__main__":
    bridge = DatabaseBridge()
    
    # Example: Sync data between MongoDB 'products' collection and SQLite 'products' table
    sync_result = bridge.sync_data('products', 'products')
    if sync_result:
        print("Sync successful!")
        print("MongoDB data:", json.dumps(sync_result['mongo_data'], indent=2))
        print("SQLite data:", json.dumps(sync_result['sqlite_data'], indent=2))
    
    bridge.close() 