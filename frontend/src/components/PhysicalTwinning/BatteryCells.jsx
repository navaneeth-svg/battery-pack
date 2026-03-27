import React, { useState, useEffect } from "react";
import axios from "axios";
import "./dummy.css";
import { ConfigCells } from "./ConfigCells";
import { Tooltip, IconButton, Typography, Box, Paper, Grid, Alert } from "@mui/material";
import { ViewCompact, ViewModule, InfoOutlined } from "@mui/icons-material";

export const BatteryCells = ({
  cellsData,
  setCellsData,
  num_cols,
  isConfig,
  cellImage,
  totalCells,
  showInventoryView = false,
  inventoryItems = [],
  packDesignData = null,
  numSeries = 0,
  numParallel = 0
}) => {
  const [cells, setCells] = useState([]);
  const [modules, setModules] = useState({});
  const [isCompact, setIsCompact] = useState(false);

  useEffect(() => {
    // If cellsData is already provided (from BatteryProcure), use it directly
    if (cellsData && cellsData.length > 0) {
      setCells(cellsData);
      const modulesData = {};
      cellsData.forEach((cell, index) => {
        const colIndex = index % num_cols + 1;
        if (!modulesData[`module${colIndex}`]) {
          modulesData[`module${colIndex}`] = [];
        }
        modulesData[`module${colIndex}`].push(cell);
      });
      setModules(modulesData);
      return;
    }

    // Fallback: Fetch random cells from backend (old behavior)
    const fetchCellsData = async () => {
      try {
        const response = await axios.post(`${process.env.BACKEND_URL}batteries/random_cells`, {
          total_cells: totalCells,
          rows: Math.ceil(totalCells / num_cols),
          columns: num_cols
        });
        const cells = response.data;
        const modulesData = {};
        cells.forEach((cell, index) => {
          const colIndex = index % num_cols + 1;
          if (!modulesData[`module${colIndex}`]) {
            modulesData[`module${colIndex}`] = [];
          }
          modulesData[`module${colIndex}`].push(cell);
        });
        setModules(modulesData);
        setCells(response.data);
        setCellsData(response.data);
      } catch (error) {
        console.error("Error fetching cells data:", error);
      }
    };

    fetchCellsData();
  }, [totalCells, num_cols, cellsData]);

  // If Pack Design Data is available, show enhanced matrix view
  if (showInventoryView && packDesignData && packDesignData.pack_matrix) {
    const { pack_matrix, column_totals, statistics, warnings } = packDesignData;
    
    const getCapacityColor = (capacity) => {
      if (capacity > 4500) return '#4caf50'; // Green
      if (capacity > 4300) return '#8bc34a'; // Light green
      if (capacity > 4200) return '#ffc107'; // Yellow
      if (capacity > 4100) return '#ff9800'; // Orange
      return '#f44336'; // Red
    };

    const LegendItem = ({ color, label }) => (
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <Box sx={{ width: 14, height: 14, bgcolor: color, borderRadius: '2px', border: '1px solid rgba(255,255,255,0.2)' }} />
        <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.7)', fontSize: '11px' }}>{label}</Typography>
      </Box>
    );

    return (
      <div className="flex flex-col items-center w-full gap-6 p-4">
        {/* Warnings */}
        {warnings && warnings.length > 0 && (
          <div className="w-full max-w-6xl">
            {warnings.map((warning, idx) => (
              <Alert key={idx} severity="warning" variant="filled" sx={{ mb: 2, bgcolor: '#ff9800' }}>
                {warning}
              </Alert>
            ))}
          </div>
        )}

        {(!warnings || warnings.length === 0) && (
          <div className="w-full max-w-6xl">
            <Alert severity="success" variant="filled" sx={{ bgcolor: '#4caf50' }}>
              ✓ Pack design optimal - no warnings detected
            </Alert>
          </div>
        )}

        {/* Improved Matrix Section */}
        <div className="w-full max-w-7xl">
          <Paper elevation={4} sx={{ 
            p: { xs: 2, md: 4 }, 
            bgcolor: '#1a1a1a', 
            borderRadius: '12px',
            border: '1px solid #333'
          }}>
            {/* Toolbar */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4, flexWrap: 'wrap', gap: 2 }}>
              <Box>
                <Typography variant="h5" sx={{ color: '#fff', fontWeight: 700 }}>
                  {numSeries}S × {numParallel}P Pack Matrix
                </Typography>
                <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.5)' }}>
                  Optimized Cell Distribution (Capacity Balanced)
                </Typography>
              </Box>
              
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                  <LegendItem color="#4caf50" label=">4.5Ah" />
                  <LegendItem color="#8bc34a" label=">4.3Ah" />
                  <LegendItem color="#ffc107" label=">4.2Ah" />
                  <LegendItem color="#ff9800" label=">4.1Ah" />
                  <LegendItem color="#f44336" label="<4.1Ah" />
                </Box>
                <Box sx={{ borderLeft: '1px solid #444', pl: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Tooltip title={isCompact ? "Switch to Detailed View" : "Switch to Compact View"}>
                    <IconButton onClick={() => setIsCompact(!isCompact)} sx={{ color: '#e8442d' }}>
                      {isCompact ? <ViewModule /> : <ViewCompact />}
                    </IconButton>
                  </Tooltip>
                </Box>
              </Box>
            </Box>

            {/* Matrix Grid */}
            <div className="overflow-x-auto">
              <div className="flex flex-col gap-3 min-w-max pb-4">
                {Array.from({ length: numParallel }).map((_, parallelIdx) => (
                  <div key={`parallel-${parallelIdx}`} className="flex gap-2 items-center">
                    <Box sx={{ 
                      width: 80, 
                      height: isCompact ? 32 : 80,
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'center', 
                      bgcolor: '#2196f3',
                      color: '#fff',
                      fontWeight: 700,
                      borderRadius: '4px',
                      fontSize: '12px',
                      boxShadow: '0 2px 4px rgba(0,0,0,0.3)',
                      flexShrink: 0
                    }}>
                      P-{parallelIdx + 1}
                    </Box>

                    <div className="flex gap-2">
                      {pack_matrix.map((seriesString, seriesIdx) => {
                        const cell = seriesString[parallelIdx];
                        const cap = cell ? (cell.capacity || cell.predicted_capacity) : 0;
                        const bgColor = cell ? getCapacityColor(cap) : '#333';
                        
                        return (
                          <Tooltip 
                            key={`cell-${seriesIdx}-${parallelIdx}`}
                            title={cell ? `UID: ${cell.uid} | SOH: ${cell.soh || cell.predicted_soh}% | IR: ${cell.ir || 0}Ω` : "Empty Slot"}
                            arrow
                          >
                            <Box sx={{
                              width: isCompact ? 32 : 100,
                              height: isCompact ? 32 : 80,
                              bgcolor: bgColor,
                              borderRadius: '4px',
                              display: 'flex',
                              flexDirection: 'column',
                              alignItems: 'center',
                              justifyContent: 'center',
                              cursor: 'pointer',
                              border: '1px solid rgba(255,255,255,0.1)',
                              transition: 'all 0.2s',
                              '&:hover': {
                                transform: 'scale(1.05)',
                                zIndex: 10,
                                boxShadow: '0 0 15px ' + bgColor
                              }
                            }}>
                              {!isCompact && cell && (
                                <>
                                  <Typography sx={{ color: '#000', fontSize: '10px', fontWeight: 800 }}>{cap.toFixed(0)}</Typography>
                                  <Typography sx={{ color: '#000', fontSize: '10px', opacity: 0.8 }}>mAh</Typography>
                                  <Typography sx={{ color: '#000', fontSize: '9px', fontWeight: 600, mt: 0.5 }}>S:{seriesIdx + 1}</Typography>
                                </>
                              )}
                              {isCompact && cell && (
                                <Typography sx={{ color: '#000', fontSize: '9px', fontWeight: 900 }}>{seriesIdx + 1}</Typography>
                              )}
                            </Box>
                          </Tooltip>
                        );
                      })}
                    </div>

                    {/* Column Total */}
                    <Box sx={{ 
                      width: 70, 
                      height: isCompact ? 32 : 80,
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'center', 
                      color: '#fff',
                      fontWeight: 700,
                      fontSize: '12px',
                      flexShrink: 0,
                      borderLeft: '2px dashed #444',
                      ml: 1
                    }}>
                      {column_totals[parallelIdx]?.toFixed(2)} Ah
                    </Box>
                  </div>
                ))}
              </div>
            </div>
          </Paper>
        </div>
      </div>
    );
  }

  // Default grid view (existing code)
  return (
    <div id="btryConfig" className="flex flex-col justify-center items-center w-full">
      <div className="flex flex-row justify-between" style={{ width: 'fit-content', minWidth: '60%' }}>
        <div className="col-auto mr-auto cellEndCol1 w-8 max-xsm:w-4 text-[#000]">
          <h3>+</h3>
        </div>
        <div className="col-auto ml-auto cellEndCol2 w-8 max-xsm:w-4 text-[#000]">
          <h2>-</h2>
        </div>
      </div>
      <div className={`col-sm-auto fixed_window ${isConfig ? '' : 'bg-[black]'}`}>
        <div
          className={`grid-container grid ${isConfig ? 'schematic-view' : ''}`}
          style={{
            gridTemplateColumns: `repeat(${num_cols.toString()}, minmax(180px, 200px))`,
            ...(isConfig ? {} : { gridTemplateRows: `30px repeat(auto-fill, minmax(30px, auto))` }),
            width: 'fit-content',
            gap: '0px',
            margin: '0',
            padding: '0'
          }}
        >
          {[...Array(num_cols)].map((_, index) => (
            <div key={`section-${index}`}>
              {!isConfig &&
                <div key={`header-${index}`} className="col-header">
                  Section {String(index + 1).padStart(2, '0')}
                </div>}
            </div>
          ))}

          {showInventoryView ? (
            // Inventory View: Show UID/Barcode with SOH
            cells.map((cell, index) => {
              // Check for valid SOH values (not null/undefined)
              const sohValue = (cell.soh != null) ? cell.soh : 
                               (cell.predicted_soh != null) ? cell.predicted_soh : 
                               "N/A";
              
              return (
                <ConfigCells
                  key={`inv-${cell.id || cell.uid || index}`}
                  isConfig={false}
                  cellImage={cell.image || cellImage}
                  row={Math.floor(index / num_cols)}
                  col={index % num_cols}
                  numCols={num_cols}
                  numRows={Math.ceil(totalCells / num_cols)}
                  soh={sohValue}
                  cellId={cell.id || cell.uid}
                  showInventoryView={true}
                  inventoryData={cell}
                />
              );
            })
          ) : (
            // SOH View: Show cells with SOH data and UID
            cells.map((cell, index) => {
              // Check for valid SOH values (not null/undefined)
              const sohValue = (cell.soh != null) ? cell.soh : 
                               (cell.predicted_soh != null) ? cell.predicted_soh : 
                               (cell.meta?.soh != null) ? cell.meta.soh : 
                               "N/A";
              const cellIdValue = cell.id || cell.uid || cell._id || `cell-${index}`;
              
              return (
                <ConfigCells
                  key={index}
                  isConfig={isConfig}
                  cellImage={cell.image || cellImage}
                  row={Math.floor(index / num_cols)}
                  col={index % num_cols}
                  numCols={num_cols}
                  numRows={Math.ceil(totalCells / num_cols)}
                  soh={sohValue}
                  cellId={cellIdValue}
                  showInventoryView={false}
                  inventoryData={cell}
                />
              );
            })
          )}
        </div>
      </div>
    </div >
  );
};