# DBMS Project - Supermarket Map Feature

## Overview
This project implements a supermarket mapping system with both admin and customer interfaces, integrated with MongoDB and Redis for data persistence and caching.

## Recent Changes

### 1. Supermarket Map Feature
- **Location**: `frontend/src/components/SupermarketMap.jsx`
- **Purpose**: Main component for the supermarket map interface
- **Features**:
  - 20x20 grid system for map layout
  - Admin/Customer mode toggle
  - Path finding between aisles
  - Map image upload
  - Aisle management
  - Zoom controls
  - Legend system

### 2. Database Integration
- **MongoDB Connection**:
  - Connected to MongoDB Atlas cluster
  - Stores user data, orders, and session information
  - Handles authentication and authorization

- **Redis Integration**:
  - Used for caching and session management
  - Improves performance for frequent queries
  - Handles real-time updates

- **Local Storage (SQLite-like)**:
  - Stores map configurations
  - Saves aisle data
  - Caches map images
  - Maintains user preferences

### 3. New Files Added

#### Frontend
- `frontend/src/components/SupermarketMap.jsx`
  - Main map component
  - Handles grid rendering and interactions
  - Manages state and data persistence

- `frontend/src/components/SupermarketMap.css`
  - Styling for the map interface
  - Responsive design
  - Theme consistency with DBMS project

- `frontend/src/pages/SupermarketMapPage.jsx`
  - Page wrapper component
  - Handles routing and layout

#### Backend
- `backend/bridge/api.py`
  - API endpoints for map data
  - Handles data synchronization

- `backend/bridge/db_bridge.py`
  - Database connection management
  - Handles data persistence

- `server/routes/map.ts`
  - Map-related API routes
  - Handles map data requests

- `server/routes/paths.ts`
  - Path finding algorithms
  - Route optimization

- `server/types/index.ts`
  - TypeScript type definitions
  - Ensures type safety

### 4. Database Schema Changes
- Added new collections in MongoDB:
  - `orders`: Stores order information with Stripe integration
  - `users`: Manages user authentication
  - `sessions`: Handles user sessions

### 5. Known Issues
1. MongoDB duplicate index warning on `stripeSessionId`
2. Redis connection timeout handling
3. Local storage limitations for large map images

### 6. Performance Optimizations
- Redis caching for frequent queries
- Local storage for map data
- Index optimization in MongoDB
- Efficient pathfinding algorithm

## Setup Instructions

1. Install dependencies:
```bash
npm install
```

2. Start the development server:
```bash
npm run dev
```

3. Access the application:
- Frontend: http://localhost:5173
- Backend: http://localhost:5000

## Environment Variables
Create a `.env` file with:
```
MONGODB_URI=your_mongodb_uri
REDIS_URL=your_redis_url
```

## Contributing
1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License
This project is licensed under the MIT License. 