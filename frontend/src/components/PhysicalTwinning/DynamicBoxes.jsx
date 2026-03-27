import React from "react";
import { Card, CardContent, Typography, Box, Grid } from "@mui/material";

export const DynamicBoxes = ({
  packVoltage,
  packCapacity,
  packWeight,
  totalCells,
  packPrice,
  isConfig,
  num_cols,
  num_row,
}) => {
  const StatCard = ({ title, value, subValue }) => (
    <Card 
      elevation={2} 
      sx={{ 
        minWidth: 160, 
        flex: 1, 
        borderTop: '4px solid #e8442d',
        borderRadius: '8px',
        transition: 'transform 0.2s',
        '&:hover': { transform: 'translateY(-4px)' }
      }}
    >
      <CardContent sx={{ p: '16px !important', textAlign: 'center' }}>
        <Typography variant="subtitle2" sx={{ color: '#666', fontWeight: 600, mb: 1, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
          {title}
        </Typography>
        <Typography variant="h5" sx={{ color: '#e8442d', fontWeight: 700 }}>
          {value}
        </Typography>
        {subValue && (
          <Typography variant="caption" sx={{ color: '#999', display: 'block', mt: 0.5 }}>
            {subValue}
          </Typography>
        )}
      </CardContent>
    </Card>
  );

  return (
    <Box sx={{ width: '90%', mt: 2, mb: 4 }}>
      <Grid container spacing={3} justifyContent="center">
        <Grid item xs={12} sm={6} md={2.4}>
          <StatCard 
            title="Total Cells" 
            value={totalCells} 
            subValue={num_cols && num_row ? `${num_cols}S × ${num_row}P` : null}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={2.4}>
          <StatCard title="Pack Voltage" value={`${packVoltage} V`} />
        </Grid>
        <Grid item xs={12} sm={6} md={2.4}>
          <StatCard title="Pack Capacity" value={`${packCapacity} Ah`} />
        </Grid>
        {!isConfig && (
          <>
            <Grid item xs={12} sm={6} md={2.4}>
              <StatCard title="Pack Weight" value={`${packWeight} Kg`} />
            </Grid>
            <Grid item xs={12} sm={6} md={2.4}>
              <StatCard title="Pack Price" value={`$ ${packPrice}`} />
            </Grid>
          </>
        )}
      </Grid>
    </Box>
  );
};