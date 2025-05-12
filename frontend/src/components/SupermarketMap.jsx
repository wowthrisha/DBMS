import { useEffect, useRef, useState } from 'react';
import './SupermarketMap.css';
import { Route, Search, ZoomIn, ZoomOut, X, Save } from 'lucide-react';
import { toast } from 'sonner';

const Index = () => {
  // Grid configuration
  const gridSize = 20;
  const [grid, setGrid] = useState(Array(gridSize).fill(0).map(() => Array(gridSize).fill(0)));
  const [isAdmin, setIsAdmin] = useState(false);
  const [mapImage, setMapImage] = useState(null);
  const [zoom, setZoom] = useState(1);
  const [aisles, setAisles] = useState({});
  const [newAisleName, setNewAisleName] = useState('');
  const [selectedCells, setSelectedCells] = useState([]);
  const [startAisle, setStartAisle] = useState('');
  const [endAisle, setEndAisle] = useState('');
  const [path, setPath] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectionMode, setSelectionMode] = useState('obstacle');
  const canvasRef = useRef(null);
  const [showLegend, setShowLegend] = useState(false);

  // Load data from local storage on initial render
  useEffect(() => {
    const savedGrid = localStorage.getItem('kartifuyGrid');
    const savedAisles = localStorage.getItem('kartifuyAisles');
    const savedImage = localStorage.getItem('kartifuyImage');

    if (savedGrid) setGrid(JSON.parse(savedGrid));
    if (savedAisles) setAisles(JSON.parse(savedAisles));
    if (savedImage) setMapImage(savedImage);
  }, []);

  // Save grid and aisles to local storage when they change
  useEffect(() => {
    localStorage.setItem('kartifuyGrid', JSON.stringify(grid));
  }, [grid]);

  useEffect(() => {
    localStorage.setItem('kartifuyAisles', JSON.stringify(aisles));
  }, [aisles]);

  useEffect(() => {
    if (mapImage) localStorage.setItem('kartifuyImage', mapImage);
  }, [mapImage]);

  // Handle file upload for map image
  const handleImageUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setMapImage(event.target.result);
          toast.success('Map image uploaded successfully!');
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // Handle cell click based on current selection mode
  const handleCellClick = (x, y) => {
    if (!isAdmin) return;
    
    if (selectionMode === 'obstacle') {
      // Toggle cell between walkable (0) and obstacle (1)
      const newGrid = [...grid];
      newGrid[y][x] = newGrid[y][x] === 0 ? 1 : 0;
      setGrid(newGrid);
    } else if (selectionMode === 'aisle') {
      // Select/deselect cells for aisle labeling
      const cellIndex = selectedCells.findIndex(cell => cell.x === x && cell.y === y);
      if (cellIndex >= 0) {
        // Deselect the cell
        setSelectedCells(selectedCells.filter((_, i) => i !== cellIndex));
      } else {
        // Select the cell
        setSelectedCells([...selectedCells, { x, y }]);
      }
    }
  };

  // Create a new aisle with selected cells
  const saveAisle = () => {
    if (newAisleName.trim() === '' || selectedCells.length === 0) return;

    setAisles({
      ...aisles,
      [newAisleName]: selectedCells
    });
    setNewAisleName('');
    setSelectedCells([]);
    toast.success(`Aisle "${newAisleName}" saved successfully!`);
  };

  // Save the entire map configuration
  const saveMapConfiguration = () => {
    if (Object.keys(aisles).length === 0) {
      toast.error('Please create at least one aisle before saving the configuration.');
      return;
    }
    
    const mapConfig = {
      grid,
      aisles,
      mapImage
    };
    
    localStorage.setItem('kartifuyMapConfiguration', JSON.stringify(mapConfig));
    toast.success('Map configuration saved successfully!');
  };

  // Reset all data
  const resetAll = () => {
    if (window.confirm('Are you sure you want to reset all data?')) {
      setGrid(Array(gridSize).fill(0).map(() => Array(gridSize).fill(0)));
      setAisles({});
      setMapImage(null);
      setSelectedCells([]);
      setPath([]);
      setStartAisle('');
      setEndAisle('');
      localStorage.removeItem('kartifuyGrid');
      localStorage.removeItem('kartifuyAisles');
      localStorage.removeItem('kartifuyImage');
      localStorage.removeItem('kartifuyMapConfiguration');
      toast.success('All data has been reset');
    }
  };

  // Calculate cell number based on x,y coordinates
  const calculateCellNumber = (x, y) => {
    return y * gridSize + x + 1;
  };

  // Improved A* pathfinding algorithm
  const findPath = () => {
    if (!startAisle || !endAisle || !aisles[startAisle] || !aisles[endAisle]) {
      toast.error('Please select valid start and end aisles');
      return;
    }

    // Get the closest walkable cells from each aisle as start/end points
    const startCells = aisles[startAisle];
    const endCells = aisles[endAisle];
    
    if (!startCells.length || !endCells.length) {
      toast.error('One or both of the selected aisles have no cells');
      return;
    }
    
    // Try all combinations of start and end points to find the shortest path
    let shortestPath = [];
    let shortestDistance = Infinity;
    
    for (const startCell of startCells) {
      for (const endCell of endCells) {
        const path = findPathBetweenPoints(startCell, endCell);
        if (path.length > 0 && (shortestPath.length === 0 || path.length < shortestDistance)) {
          shortestPath = path;
          shortestDistance = path.length;
        }
      }
    }
    
    if (shortestPath.length > 0) {
      setPath(shortestPath);
      toast.success('Path found! Follow the highlighted route.');
    } else {
      setPath([]);
      toast.error('No path found between these aisles. Try marking fewer obstacles or check if the aisles are completely surrounded by obstacles.');
    }
  };
  
  // A* algorithm to find path between two specific points
  const findPathBetweenPoints = (start, end) => {
    // Simple implementation of A* algorithm
    const openSet = [{
      x: start.x,
      y: start.y,
      f: 0,
      g: 0,
      parent: null
    }];

    const closedSet = {};
    const pathFound = {};

    while (openSet.length > 0) {
      // Find node with lowest f score
      let currentIndex = 0;
      for (let i = 0; i < openSet.length; i++) {
        if (openSet[i].f < openSet[currentIndex].f) {
          currentIndex = i;
        }
      }

      const current = openSet[currentIndex];
      
      // Found path
      if (current.x === end.x && current.y === end.y) {
        const path = [];
        let currentPath = current;
        while (currentPath) {
          path.unshift({ x: currentPath.x, y: currentPath.y });
          currentPath = currentPath.parent;
        }
        return path;
      }

      // Remove current from openSet and add to closedSet
      openSet.splice(currentIndex, 1);
      closedSet[`${current.x},${current.y}`] = true;

      // Check neighbors
      const neighbors = [
        { x: current.x + 1, y: current.y },
        { x: current.x - 1, y: current.y },
        { x: current.x, y: current.y + 1 },
        { x: current.x, y: current.y - 1 }
      ];

      for (const neighbor of neighbors) {
        // Skip if out of bounds or obstacle
        if (
          neighbor.x < 0 || neighbor.x >= gridSize ||
          neighbor.y < 0 || neighbor.y >= gridSize ||
          grid[neighbor.y][neighbor.x] === 1 ||
          closedSet[`${neighbor.x},${neighbor.y}`]
        ) {
          continue;
        }

        const gScore = current.g + 1;
        const hScore = Math.abs(neighbor.x - end.x) + Math.abs(neighbor.y - end.y);
        const fScore = gScore + hScore;

        const existingNode = openSet.find(node => node.x === neighbor.x && node.y === neighbor.y);
        if (!existingNode || gScore < existingNode.g) {
          openSet.push({
            x: neighbor.x,
            y: neighbor.y,
            f: fScore,
            g: gScore,
            parent: current
          });
        }
      }
    }

    return []; // No path found
  };

  const getCellAisle = (x, y) => {
    for (const [aisleName, cells] of Object.entries(aisles)) {
      if (cells.some(cell => cell.x === x && cell.y === y)) {
        return aisleName;
      }
    }
    return null;
  };

  const isInPath = (x, y) => {
    return path.some(point => point.x === x && point.y === y);
  };

  // Get filtered aisle names based on search term
  const filteredAisles = Object.keys(aisles).filter(
    aisle => aisle.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="supermarket-container">
      <header className="supermarket-header">
        <h1>Indoor Map Navigation</h1>
        <div className="header-actions">
          <div className="zoom-controls">
            <button className="action-button" onClick={() => setZoom(Math.max(0.5, zoom - 0.1))}><ZoomOut size={16} /> Zoom Out</button>
            <span>{Math.round(zoom * 100)}%</span>
            <button className="action-button" onClick={() => setZoom(Math.min(2, zoom + 0.1))}><ZoomIn size={16} /> Zoom In</button>
          </div>
          {isAdmin && (
            <button className="save-map-button" onClick={saveMapConfiguration}>
              <Save size={16} /> Save Map
            </button>
          )}
          <button className="reset-button" onClick={resetAll}><X size={16} /> Reset</button>
          <button className="legend-button" onClick={() => setShowLegend(!showLegend)}>
            {showLegend ? 'Hide Legend' : 'Show Legend'}
          </button>
          <label className="toggle">
            <input 
              type="checkbox" 
              checked={isAdmin} 
              onChange={() => setIsAdmin(!isAdmin)} 
            />
            <span>Admin Mode</span>
          </label>
          {isAdmin && (
            <label className="file-input">
              <input 
                type="file" 
                accept="image/*" 
                onChange={handleImageUpload} 
              />
              <span>Upload Map</span>
            </label>
          )}
        </div>
      </header>

      <div className="supermarket-content">
        <div className="supermarket-sidebar">
          {showLegend && (
            <div className="sidebar-section">
              <h2>Legend</h2>
              <div className="legend">
                <div className="legend-item">
                  <div className="legend-color walkable"></div>
                  <span>Walkable</span>
                </div>
                <div className="legend-item">
                  <div className="legend-color obstacle"></div>
                  <span>Obstacle</span>
                </div>
                <div className="legend-item">
                  <div className="legend-color selected"></div>
                  <span>Selected</span>
                </div>
                <div className="legend-item">
                  <div className="legend-color path"></div>
                  <span>Path</span>
                </div>
                <div className="legend-item">
                  <div className="legend-color aisle"></div>
                  <span>Aisle</span>
                </div>
              </div>
            </div>
          )}

          {isAdmin && (
            <div className="sidebar-section">
              <h2>Admin Controls</h2>
              <div className="admin-instructions">
                <p>• Click on cells to mark obstacles or select for aisles</p>
                <p>• Name and save each aisle</p>
                <p>• Save the complete map when finished</p>
              </div>
              
              <div className="selection-mode-controls">
                <div className="toggle-buttons">
                  <button 
                    className={selectionMode === 'obstacle' ? 'active' : ''} 
                    onClick={() => setSelectionMode('obstacle')}
                  >
                    Obstacle Mode
                  </button>
                  <button 
                    className={selectionMode === 'aisle' ? 'active' : ''} 
                    onClick={() => setSelectionMode('aisle')}
                  >
                    Aisle Mode
                  </button>
                </div>
                <p className="mode-instruction">
                  {selectionMode === 'obstacle' 
                    ? 'Click on grid cells to toggle obstacles' 
                    : 'Click on cells to select for current aisle'}
                </p>
              </div>
              
              {selectionMode === 'aisle' && (
                <div className="aisle-controls">
                  <input
                    type="text"
                    value={newAisleName}
                    onChange={(e) => setNewAisleName(e.target.value)}
                    placeholder="Aisle Name"
                  />
                  <div className="selected-cells-list">
                    {selectedCells.length > 0 ? (
                      <div>
                        {selectedCells.map((cell, index) => (
                          <div key={`sel-${index}`}>
                            Cell #{calculateCellNumber(cell.x, cell.y)} (x:{cell.x}, y:{cell.y})
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div>No cells selected. Click to select cells.</div>
                    )}
                  </div>
                  <button onClick={saveAisle} disabled={newAisleName.trim() === '' || selectedCells.length === 0}>
                    Save Aisle
                  </button>
                  <p>{selectedCells.length} cells selected</p>
                </div>
              )}
              
              {Object.keys(aisles).length > 0 && (
                <div className="aisle-list">
                  {Object.entries(aisles).map(([aisleName, cells]) => (
                    <div key={aisleName} className="aisle-list-item">
                      <span className="aisle-name">{aisleName}</span>
                      <span className="aisle-cell-count">{cells.length} cells</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {!isAdmin && (
            <div className="sidebar-section">
              <h2>Find Path</h2>
              <div className="search-box">
                <div className="search-input-wrapper">
                  <Search size={16} className="search-icon" />
                  <input
                    type="text"
                    placeholder="Search Aisles..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>

              {searchTerm && filteredAisles.length > 0 && (
                <div className="search-results">
                  {filteredAisles.map((aisle) => (
                    <div 
                      key={aisle} 
                      className="search-result" 
                      onClick={() => {
                        if (!startAisle) setStartAisle(aisle);
                        else if (!endAisle) setEndAisle(aisle);
                        else {
                          setStartAisle(aisle);
                          setEndAisle('');
                        }
                        setSearchTerm('');
                      }}
                    >
                      {aisle}
                    </div>
                  ))}
                </div>
              )}

              <div className="path-controls">
                <div className="aisle-select">
                  <label>Start Aisle:</label>
                  <select 
                    value={startAisle} 
                    onChange={(e) => setStartAisle(e.target.value)}
                  >
                    <option value="">Select Aisle</option>
                    {Object.keys(aisles).map(aisleName => (
                      <option key={aisleName} value={aisleName}>{aisleName}</option>
                    ))}
                  </select>
                </div>

                <div className="aisle-select">
                  <label>End Aisle:</label>
                  <select 
                    value={endAisle} 
                    onChange={(e) => setEndAisle(e.target.value)}
                  >
                    <option value="">Select Aisle</option>
                    {Object.keys(aisles).map(aisleName => (
                      <option key={aisleName} value={aisleName}>{aisleName}</option>
                    ))}
                  </select>
                </div>

                <button 
                  onClick={findPath}
                  disabled={!startAisle || !endAisle}
                  className="find-path-button"
                >
                  <Route className="inline-block mr-1" size={16} /> Find Path
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="map-container" style={{ transform: `scale(${zoom})` }}>
          {mapImage && (
            <img 
              src={mapImage} 
              alt="Supermarket Layout" 
              className="map-image" 
            />
          )}
          <div className="grid-container">
            {grid.map((row, y) => (
              <div key={`row-${y}`} className="grid-row">
                {row.map((cell, x) => {
                  const isSelected = selectedCells.some(c => c.x === x && c.y === y);
                  const aisleName = getCellAisle(x, y);
                  const inPath = isInPath(x, y);
                  const cellNumber = calculateCellNumber(x, y);

                  return (
                    <div
                      key={`cell-${x}-${y}`}
                      className={`grid-cell 
                        ${cell === 1 ? 'obstacle' : ''} 
                        ${isSelected ? 'selected' : ''} 
                        ${aisleName ? 'aisle' : ''} 
                        ${inPath ? 'path' : ''}
                      `}
                      onClick={() => isAdmin ? handleCellClick(x, y) : null}
                      title={aisleName ? aisleName : `Cell #${cellNumber}`}
                    >
                      <span className="cell-number">{cellNumber}</span>
                      {aisleName && <span className="aisle-label">{aisleName}</span>}
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;