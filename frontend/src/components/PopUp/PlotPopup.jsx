import React from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Box } from '@mui/material';

/**
 * PlotPopup - Simplified popup component for displaying plots
 * Shows plot data in a modal dialog
 */
const PlotPopup = ({ open, onClose, title = 'Plot Details', children, data }) => {
  return (
    <Dialog 
      open={open} 
      onClose={onClose}
      maxWidth="lg"
      fullWidth
      PaperProps={{
        sx: {
          backgroundColor: '#1a1a1a',
          color: '#fff'
        }
      }}
    >
      <DialogTitle>{title}</DialogTitle>
      <DialogContent>
        <Box sx={{ minHeight: '400px', padding: '20px' }}>
          {children || (
            <Box sx={{ 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              height: '100%' 
            }}>
              <div style={{ textAlign: 'center' }}>
                <h3>Plot Viewer</h3>
                {data && <p style={{ fontSize: '12px', color: '#888' }}>
                  Data available: {JSON.stringify(data).length} bytes
                </p>}
              </div>
            </Box>
          )}
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="primary" variant="contained">
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default PlotPopup;
