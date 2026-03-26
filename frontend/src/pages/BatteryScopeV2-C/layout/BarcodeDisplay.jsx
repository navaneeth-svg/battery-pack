import React from 'react';
import { Box, Typography } from '@mui/material';

/**
 * BarcodeDisplay - Simplified version for battery pack designer
 * Displays barcode information in a simple format
 */
const BarcodeDisplay = ({ barcode, cellData }) => {
  return (
    <Box 
      sx={{ 
        padding: '8px', 
        border: '1px solid #666',
        borderRadius: '4px',
        backgroundColor: '#f5f5f5',
        display: 'inline-block'
      }}
    >
      <Typography variant="body2" sx={{ fontFamily: 'monospace', fontSize: '14px' }}>
        {barcode || 'No barcode'}
      </Typography>
      {cellData && (
        <Typography variant="caption" sx={{ display: 'block', marginTop: '4px', color: '#666' }}>
          Cell ID: {cellData.id || 'N/A'}
        </Typography>
      )}
    </Box>
  );
};

export default BarcodeDisplay;
