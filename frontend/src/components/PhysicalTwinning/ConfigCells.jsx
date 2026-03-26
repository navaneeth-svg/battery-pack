import React from "react";
import BarcodeDisplay from '../../pages/BatteryScopeV2-C/layout/BarcodeDisplay';
import { autoType } from "d3";

export const ConfigCells = ({
  isConfig,
  cellImage,
  row,
  col,
  numCols,
  numRows,
  soh,
  cellId,
  showInventoryView = false,
  inventoryData = null
}) => {
  const volts = [3.4, 3.5, 3.6, 3.7];
  const isFirstInRow = col === 0;
  const isInLastRow = row === numRows - 1;

  const handleShowCellDetails = (uid) => {
    // Redirect to cell health certificate with the actual UID
    const cellUID = uid || cellId || 'unknown';
    window.open(`/#/batteryscope-c/cell-health-certificate?uid=${cellUID}`, "_blank");
  };

  const createSvg = (soh) => {
    // Handle null/undefined SOH values
    if (soh == null || soh === '' || soh === 'N/A') {
      // Default to 0% fill for cells without SOH data
      const fillWidth = 0;
      const remainingWidth = 1292;
      
      return (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="75%"
          height="75%"
          viewBox="0 0 1792 1792"
          id="battery"
          style={{ zIndex: 7, position: 'relative' }}
          className="battery-svg"
          onClick={() => handleShowCellDetails(inventoryData?.uid || inventoryData?.id || inventoryData?.barcode || cellId)}
        >
          <path
            fill="gray"
            d="M199.111 1192.889V595.556H896v597.333H199.111zm1493.333-547.556q41.223 0 70.39 29.167Q1792 703.667 1792 744.889v298.667q0 41.222-29.167 70.388-29.166 29.167-70.389 29.167v124.445q0 51.333-36.555 87.888Q1619.333 1392 1568 1392H124.444q-51.333 0-87.888-36.556Q0 1318.89 0 1267.556V520.889q0-51.334 36.556-87.89 36.555-36.555 87.888-36.555H1568q51.333 0 87.889 36.556 36.555 36.555 36.555 87.889v124.444zm0 398.223V744.889h-99.555v-224q0-10.89-7-17.89T1568 496H124.444q-10.888 0-17.888 7-7 7-7 17.89v746.667q0 10.888 7 17.888 7 7 17.888 7H1568q10.889 0 17.889-7t7-17.888v-224h99.555z"
          ></path>
          <rect x="199.111" y="595.556" width="1292" height="607.333" fill="lightgray" />
        </svg>
      );
    }
    
    // Handle both number (88.64) and string ("88.64%") formats
    const sohValue = typeof soh === 'number' 
      ? soh 
      : parseFloat(String(soh).replace("%", ""));
    
    // Validate parsed value
    if (isNaN(sohValue)) {
      return createSvg(null); // Recursive call for null handling
    }
    
    const fillWidth = (sohValue / 100) * 1292;
    const remainingWidth = 1292 - fillWidth;

    return (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="75%"  // Changed from "80%"
        height="75%"  // Changed from "80%"
        viewBox="0 0 1792 1792"
        id="battery"
        style={{ zIndex: 7, position: 'relative' }}
        className="battery-svg"
        onClick={() => handleShowCellDetails(inventoryData?.uid || inventoryData?.id || inventoryData?.barcode || cellId)}
      >
        <defs>
          <linearGradient id="greenGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#008000" />
          </linearGradient>
          <linearGradient id="redGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#FFFF00" />
          </linearGradient>
        </defs>
        <path
          fill="black"
          d="M240 1170V630H880v540H240zm1460-500q38 0 66 26Q1788 700 1788 740v295q0 38-26 66-26 26-66 26v115q0 48-34 82Q1613 1380 1565 1380H135q-48 0-82-34Q10 1313 10 1265V530q0-48 34-82 34-34 82-34H1565q48 0 82 34 34 34 34 82v115z"
        />

        <path
          fill="white"
          d="M199.111 1192.889V595.556H896v597.333H199.111zm1493.333-547.556q41.223 0 70.39 29.167Q1792 703.667 1792 744.889v298.667q0 41.222-29.167 70.388-29.166 29.167-70.389 29.167v124.445q0 51.333-36.555 87.888Q1619.333 1392 1568 1392H124.444q-51.333 0-87.888-36.556Q0 1318.89 0 1267.556V520.889q0-51.334 36.556-87.89 36.555-36.555 87.888-36.555H1568q51.333 0 87.889 36.556 36.555 36.555 36.555 87.889v124.444zm0 398.223V744.889h-99.555v-224q0-10.89-7-17.89T1568 496H124.444q-10.888 0-17.888 7-7 7-7 17.89v746.667q0 10.888 7 17.888 7 7 17.888 7H1568q10.889 0 17.889-7t7-17.888v-224h99.555z"
        ></path>
        <rect
          x="199.111"
          y="595.556"
          width={fillWidth}
          height="607.333"
          fill="#FF9100"
        />
        <rect
          x={199.111 + fillWidth}
          y="595.556"
          width={remainingWidth}
          height="607.333"
          fill="white"
        />
      </svg>
    );
  };

  // Inventory View - Barcode in battery cell shape with SOH
  if (showInventoryView && inventoryData) {
    const displayUID = inventoryData.uid || inventoryData.barcode || inventoryData.id || 'N/A';
    // Check for valid SOH values (not null/undefined)
    const displaySOH = (inventoryData.soh != null) ? inventoryData.soh : 
                       (inventoryData.predicted_soh != null) ? inventoryData.predicted_soh : 
                       'N/A';
    
    return (
      <div className="relative flex flex-col items-center cursor-pointer" onClick={() => handleShowCellDetails(displayUID)}>
        {/* Battery Cell SVG with UID and SOH */}
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="75%"
          height="75%"
          viewBox="0 0 1792 1792"
          id="battery"
          style={{ zIndex: 7, position: 'relative' }}
          className="battery-svg"
        >
          <path
            fill="black"
            d="M240 1170V630H880v540H240zm1460-500q38 0 66 26Q1788 700 1788 740v295q0 38-26 66-26 26-66 26v115q0 48-34 82Q1613 1380 1565 1380H135q-48 0-82-34Q10 1313 10 1265V530q0-48 34-82 34-34 82-34H1565q48 0 82 34 34 34 34 82v115z"
          />
          <path
            fill="#e8442d"
            d="M199.111 1192.889V595.556H896v597.333H199.111zm1493.333-547.556q41.223 0 70.39 29.167Q1792 703.667 1792 744.889v298.667q0 41.222-29.167 70.388-29.166 29.167-70.389 29.167v124.445q0 51.333-36.555 87.888Q1619.333 1392 1568 1392H124.444q-51.333 0-87.888-36.556Q0 1318.89 0 1267.556V520.889q0-51.334 36.556-87.89 36.555-36.555 87.888-36.555H1568q51.333 0 87.889 36.556 36.555 36.555 36.555 87.889v124.444zm0 398.223V744.889h-99.555v-224q0-10.89-7-17.89T1568 496H124.444q-10.888 0-17.888 7-7 7-7 17.89v746.667q0 10.888 7 17.888 7 7 17.888 7H1568q10.889 0 17.889-7t7-17.888v-224h99.555z"
          />

          {/* White background for content */}
          <rect
            x="199.111"
            y="595.556"
            width="696.889"
            height="607.333"
            fill="white"
          />

          {/* Display UID and SOH */}
          <foreignObject x="199.111" y="595.556" width="696.889" height="607.333">
            <div xmlns="http://www.w3.org/1999/xhtml" style={{
              width: '100%',
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              alignItems: 'center',
              gap: '15px',
              padding: '10px'
            }}>
              {/* UID Display */}
              <div style={{
                fontSize: '24px',
                fontWeight: 'bold',
                color: '#000',
                letterSpacing: '2px',
                textAlign: 'center',
                fontFamily: 'monospace'
              }}>
                UID: {displayUID}
              </div>
              
              {/* SOH Display */}
              <div style={{
                fontSize: '28px',
                fontWeight: 'bold',
                color: '#e8442d',
                textAlign: 'center'
              }}>
                SOH: {typeof displaySOH === 'number' ? `${displaySOH.toFixed(2)}%` : displaySOH}
              </div>
              
              {/* See Data indicator */}
              <div style={{
                fontSize: '12px',
                fontWeight: 'normal',
                color: '#0066cc',
                textAlign: 'center',
                marginTop: '8px',
                textDecoration: 'underline',
                cursor: 'pointer'
              }}>
                Click to see details
              </div>
            </div>
          </foreignObject>
        </svg>

        {/* Horizontal line - always show */}
        <div className="hr absolute bottom-[49%]"></div>

        {/* Vertical line - show for all except first column */}
        {!isFirstInRow && !isInLastRow && (
          <div className="vr absolute left-0 top-[50%] h-[100%]" style={{ transform: 'translateX(-50%)' }}></div>
        )}
      </div>
    );
  }

  // Original SOH View with connections
  return isConfig ? (
    <div className="mybox schematic-view">
      <div className="mybox">
        <img src={cellImage} style={{ width: "100%", backgroundColor: "black" }} alt="Cell" />
      </div>
    </div>
  ) : (
    <div className="relative flex flex-col items-center">
      {createSvg(soh)}
      <div className="my_centered flex flex-col font-bold bottom-[37%]" style={{ fontSize: '14px' }}>
        {/* Display UID if available from inventory data */}
        {inventoryData && (inventoryData.uid || inventoryData.barcode || inventoryData.id) && (
          <div style={{ fontSize: '12px', color: '#333', marginBottom: '4px' }}>
            UID: {inventoryData.uid || inventoryData.barcode || inventoryData.id}
          </div>
        )}
        {/* Display SOH */}
        <div style={{ fontSize: '16px', color: '#e8442d' }}>
          SOH: {typeof soh === 'number' ? `${soh.toFixed(2)}%` : soh}
        </div>
        <div 
          onClick={() => handleShowCellDetails(inventoryData?.uid || inventoryData?.id || inventoryData?.barcode || cellId)} 
          className="underline text-blue" 
          style={{ fontSize: '11px', cursor: 'pointer', marginTop: '4px' }}
        >
          See Data
        </div>
      </div>
      {/* Horizontal line - always show */}
      <div className="hr absolute bottom-[49%]"></div>

      {/* Vertical line - show for all except first column */}
      {!isFirstInRow && !isInLastRow && (
        <div className="vr absolute left-0 top-[50%] h-[100%]" style={{ transform: 'translateX(-50%)' }}></div>
      )}
    </div>
  );
};