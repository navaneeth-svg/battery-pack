import React from 'react';
import { Box } from '@mui/material';

/**
 * PlotComponent - Simplified version for battery pack designer
 * Renders a simple placeholder for plots
 */
const PlotComponent = ({ data, title = 'Plot' }) => {
  return (
    <Box 
      sx={{ 
        width: '100%', 
        height: '400px', 
        border: '1px solid #333',
        borderRadius: '8px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#1a1a1a',
        color: '#fff'
      }}
    >
      <div style={{ textAlign: 'center' }}>
        <h3>{title}</h3>
        <p>Plot visualization</p>
        {data && <p style={{ fontSize: '12px', color: '#888' }}>
          {JSON.stringify(data).length} bytes of datavalue
        </p>}
      </div>
    </Box>
  );
};

export default PlotComponent;
