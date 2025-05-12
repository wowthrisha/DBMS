from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from db_bridge import DatabaseBridge
from typing import Optional, Dict, List

app = FastAPI(title="Database Bridge API")
bridge = DatabaseBridge()

class SyncRequest(BaseModel):
    collection_name: str
    table_name: str

class TransferRequest(BaseModel):
    source: str  # 'mongo' or 'sqlite'
    collection_name: str
    table_name: str

@app.post("/sync")
async def sync_data(request: SyncRequest):
    """
    Sync data between MongoDB collection and SQLite table
    """
    result = bridge.sync_data(request.collection_name, request.table_name)
    if result is None:
        raise HTTPException(status_code=500, detail="Failed to sync data")
    return result

@app.post("/transfer")
async def transfer_data(request: TransferRequest):
    """
    Transfer data between databases
    """
    if request.source == 'mongo':
        success = bridge.transfer_to_sqlite(request.collection_name, request.table_name)
    elif request.source == 'sqlite':
        success = bridge.transfer_to_mongo(request.table_name, request.collection_name)
    else:
        raise HTTPException(status_code=400, detail="Invalid source. Must be 'mongo' or 'sqlite'")
    
    if not success:
        raise HTTPException(status_code=500, detail="Failed to transfer data")
    return {"message": "Transfer successful"}

@app.on_event("shutdown")
async def shutdown_event():
    bridge.close()

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000) 