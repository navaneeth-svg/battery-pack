import React, { useState, useEffect } from "react";
import axios from "axios";
import "./dummy.css";
import { ConfigCells } from "./ConfigCells";

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

    return (
      <div className="flex flex-col items-center w-full gap-6 p-4">
        {/* Warnings */}
        {warnings && warnings.length > 0 && (
          <div className="w-full max-w-6xl">
            {warnings.map((warning, idx) => (
              <div key={idx} className="bg-white border-2 border-black text-black p-3 rounded mb-2 font-semibold">
                {warning}
              </div>
            ))}
          </div>
        )}

        {!warnings || warnings.length === 0 && (
          <div className="bg-white border-2 border-black text-black p-3 rounded w-full max-w-6xl font-semibold">
            ✓ Pack design optimal - no warnings detected
          </div>
        )}

        {/* Statistics Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 w-full max-w-6xl">
          <div className="bg-white border-2 border-black p-4 rounded text-center">
            <p className="text-gray-700 text-sm mb-1">Configuration</p>
            <p className="text-black text-xl font-bold">{statistics.configuration}</p>
            <p className="text-gray-600 text-xs">{statistics.total_cells} cells</p>
          </div>
          
          <div className="bg-white border-2 border-black p-4 rounded text-center">
            <p className="text-gray-700 text-sm mb-1">Pack Capacity</p>
            <p className="text-black text-xl font-bold">{statistics.pack_capacity_ah?.toFixed(2)} Ah</p>
            <p className="text-gray-600 text-xs">{statistics.pack_capacity_mah?.toFixed(0)} mAh</p>
          </div>
          
          <div className="bg-white border-2 border-black p-4 rounded text-center">
            <p className="text-gray-700 text-sm mb-1">Pack Energy</p>
            <p className="text-black text-xl font-bold">{statistics.energy_wh?.toFixed(1)} Wh</p>
            <p className="text-gray-600 text-xs">{statistics.nominal_voltage?.toFixed(1)} V</p>
          </div>
          
          <div className="bg-white border-2 border-black p-4 rounded text-center">
            <p className="text-gray-700 text-sm mb-1">Avg SOH</p>
            <p className="text-black text-xl font-bold">{statistics.avg_soh?.toFixed(1)}%</p>
            <p className="text-gray-600 text-xs">IR: {statistics.avg_ir?.toFixed(1)} Ω</p>
          </div>
        </div>

        {/* Pack Matrix Title */}
        <div className="bg-gray-100 border-2 border-black p-3 rounded w-full max-w-6xl text-center">
          <h2 className="text-black text-xl font-bold">
            {numSeries}S × {numParallel}P BATTERY PACK - OPTIMIZED CELL DISTRIBUTION
          </h2>
        </div>

        {/* Matrix Grid - Unified Layout: All cells in one container */}
        <div className="overflow-x-auto w-full max-w-7xl">
          <div className="border-4 border-black rounded-lg p-6 bg-white">
            {/* Title */}
            <div className="text-center mb-6">
              <h2 className="text-gray-800 text-2xl font-bold mb-2">
                {numSeries}S × {numParallel}P Battery Pack Matrix
              </h2>
              <p className="text-gray-600 text-sm">
                Series (Vertical) × Parallel (Horizontal) Configuration
              </p>
            </div>

            {/* Battery Pack Grid */}
            <div className="flex flex-col gap-4">
              {/* Loop through each parallel string (rows) - now labeled as Series */}
              {Array.from({ length: numParallel }).map((_, parallelIdx) => (
                <div key={`parallel-${parallelIdx}`} className="flex gap-2 items-center">
                  {/* Series String Label (was Parallel) */}
                  <div className="w-20 flex flex-col items-center justify-center bg-white text-black font-bold text-sm border-2 border-black rounded p-2 flex-shrink-0">
                    <div>S{parallelIdx + 1}</div>
                    <div className="text-xs mt-1">{column_totals.capacity[parallelIdx]?.toFixed(0)} mAh</div>
                  </div>

                  {/* Parallel cells in this series string (horizontal flow) - now labeled as Parallel */}
                  <div className="flex gap-2 items-center flex-1 overflow-x-auto">
                    {pack_matrix.map((row, seriesIdx) => {
                      const cell = row[parallelIdx];
                      
                      return (
                        <React.Fragment key={`series-${seriesIdx}`}>
                          {/* Cell */}
                          <div className="relative">
                            {!cell ? (
                              <div className="w-24 h-24 bg-gray-300 border-2 border-dashed border-gray-500 rounded flex items-center justify-center flex-shrink-0">
                                <span className="text-xs text-gray-500">Empty</span>
                              </div>
                            ) : (
                              <div 
                                className="w-24 h-24 border-2 border-black rounded flex flex-col items-center justify-center gap-0.5 cursor-pointer hover:scale-105 transition-transform flex-shrink-0 relative"
                                style={{ backgroundColor: getCapacityColor(parseFloat(cell.predicted_capacity || cell.capacity || 0)) }}
                                title={`UID: ${cell.uid || cell.cellId || cell.id}\nCapacity: ${parseFloat(cell.predicted_capacity || cell.capacity || 0).toFixed(0)} mAh\nSOH: ${parseFloat(cell.predicted_soh || cell.soh || 0).toFixed(2)}%\nIR: ${parseFloat(cell.ir || 0).toFixed(2)} Ω`}
                                onClick={() => window.open(`/cell-health-certificate?uid=${cell.uid || cell.cellId || cell.id}`, "_blank")}
                              >
                                {/* Parallel label on top of first row cells */}
                                {parallelIdx === 0 && (
                                  <div className="absolute -top-7 left-1/2 transform -translate-x-1/2 bg-yellow-400 text-black font-bold text-xs border border-black rounded px-2 py-0.5 whitespace-nowrap">
                                    P{seriesIdx + 1} (3.7V)
                                  </div>
                                )}
                                
                                <span className="text-xs font-semibold text-black truncate w-full text-center px-1">{cell.uid || cell.cellId || cell.id || 'N/A'}</span>
                                <span className="text-xs font-bold text-black">{parseFloat(cell.predicted_capacity || cell.capacity || 0).toFixed(0)}</span>
                                <span className="text-xs bg-white px-1.5 py-0.5 rounded border border-black font-bold">
                                  {parseFloat(cell.predicted_soh || cell.soh || 0).toFixed(2)}%
                                </span>
                                <span className="text-xs text-black font-semibold">
                                  IR: {parseFloat(cell.ir || 0).toFixed(1)}Ω
                                </span>
                              </div>
                            )}
                          </div>

                          {/* Connection Symbol */}
                          {seriesIdx < pack_matrix.length - 1 && (
                            <div className="flex items-center justify-center text-black text-xl font-bold flex-shrink-0">
                              ━
                            </div>
                          )}
                        </React.Fragment>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>

            {/* Column Totals - Shows combined capacity of series cells at each parallel position */}
            <div className="flex gap-2 items-center mt-6">
              <div className="w-20 flex-shrink-0"></div> {/* Spacer for S label alignment */}
              <div className="flex gap-2 items-center flex-1">
                {pack_matrix.map((row, seriesIdx) => {
                  // Calculate total capacity for this parallel position (column)
                  const columnCapacity = Array.from({ length: numParallel }).reduce((sum, _, parallelIdx) => {
                    const cell = pack_matrix[seriesIdx][parallelIdx];
                    return sum + parseFloat(cell?.predicted_capacity || cell?.capacity || 0);
                  }, 0);

                  return (
                    <React.Fragment key={`col-total-${seriesIdx}`}>
                      <div className="w-24 flex flex-col items-center justify-center bg-white text-black font-bold text-xs border-2 border-black rounded p-2 flex-shrink-0">
                        <div>P{seriesIdx + 1} Total</div>
                        <div className="mt-1">{columnCapacity.toFixed(0)} mAh</div>
                      </div>
                      {seriesIdx < pack_matrix.length - 1 && (
                        <div className="w-7 flex-shrink-0"></div>
                      )}
                    </React.Fragment>
                  );
                })}
              </div>
            </div>

            {/* Grand Total */}
            <div className="mt-6 text-center">
              <div className="inline-block bg-white border-3 border-black rounded-lg px-6 py-3">
                <p className="text-black font-bold text-lg">
                  Total Pack Capacity: {column_totals.capacity.reduce((sum, cap) => sum + cap, 0).toFixed(0)} mAh
                </p>
                <p className="text-black text-sm mt-1">
                  ({numSeries} Series × {numParallel} Parallel = {numSeries * numParallel} cells)
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Legend */}
        <div className="flex flex-wrap gap-4 justify-center w-full max-w-6xl">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-green-500 border border-black"></div>
            <span className="text-black text-sm">Excellent (&gt;4500mAh)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-lime-400 border border-black"></div>
            <span className="text-black text-sm">Good (4300-4500)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-yellow-400 border border-black"></div>
            <span className="text-black text-sm">Fair (4200-4300)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-orange-500 border border-black"></div>
            <span className="text-black text-sm">Caution (4100-4200)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-red-500 border border-black"></div>
            <span className="text-black text-sm">Warning (&lt;4100)</span>
          </div>
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