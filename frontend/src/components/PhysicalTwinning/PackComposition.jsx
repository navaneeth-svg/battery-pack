import React, { useMemo } from 'react';
import Plot from 'react-plotly.js';
import { Box, Typography } from '@mui/material';

const PackComposition = ({ packDesignData }) => {
  const chartData = useMemo(() => {
    if (!packDesignData || !packDesignData.pack_matrix) {
      return { bins: [], counts: [] };
    }

    // Extract capacities from pack_matrix (flatten the 2D array)
    // Keep in mAh - filter out null cells first
    const packCells = packDesignData.pack_matrix.flat().filter(cell => cell !== null);
    const capacities = packCells
      .map(cell => cell.capacity || cell.predicted_capacity)
      .filter(cap => cap !== null && cap !== undefined && !isNaN(cap));

    if (capacities.length === 0) {
      return { bins: [], counts: [] };
    }

    // Calculate bin ranges with fixed 50 mAh bin size
    const minCap = Math.min(...capacities);
    const maxCap = Math.max(...capacities);
    const binSize = 50; // Fixed 50 mAh bin size
    const numBins = Math.ceil((maxCap - minCap) / binSize);
    
    // Create bins
    const bins = [];
    const counts = [];
    
    for (let i = 0; i < numBins; i++) {
      const binStart = minCap + (i * binSize);
      const binEnd = minCap + ((i + 1) * binSize);
      const binLabel = `${binStart.toFixed(0)}-${binEnd.toFixed(0)}`;
      
      // Count cells in this bin
      const count = capacities.filter(cap => 
        cap >= binStart && (i === numBins - 1 ? cap <= binEnd : cap < binEnd)
      ).length;
      
      bins.push(binLabel);
      counts.push(count);
    }

    return { bins, counts, totalCells: capacities.length };
  }, [packDesignData]);

  if (!packDesignData || !packDesignData.pack_matrix) {
    return (
      <Box sx={{ textAlign: 'center', p: 4 }}>
        <Typography variant="h6" sx={{ color: '#666' }}>
          No pack design data available. Please generate a pack design first.
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', p: 2 }}>
      <Typography variant="h6" sx={{ mb: 2, fontWeight: 700, color: '#333' }}>
        Pack Composition by Capacity
      </Typography>
      <Typography variant="body2" sx={{ mb: 3, color: '#666', textAlign: 'center' }}>
        Distribution of {chartData.totalCells || 0} cells selected for the optimized pack design
      </Typography>
      <Plot
        data={[
          {
            x: chartData.bins,
            y: chartData.counts,
            type: 'bar',
            marker: {
              color: '#4CAF50',
              line: {
                color: '#388E3C',
                width: 2
              }
            },
            text: chartData.counts.map(c => c.toString()),
            textposition: 'outside',
            hovertemplate: '<b>Capacity Range:</b> %{x} mAh<br><b>Number of Cells:</b> %{y}<extra></extra>',
          }
        ]}
        layout={{
          xaxis: {
            title: 'Capacity Range (mAh)',
            titlefont: { size: 14, family: 'Bai Jamjuree, sans-serif', weight: 700 },
            tickfont: { size: 12 }
          },
          yaxis: {
            title: 'Number of Cells',
            titlefont: { size: 14, family: 'Bai Jamjuree, sans-serif', weight: 700 },
            tickfont: { size: 12 }
          },
          margin: { t: 40, r: 40, b: 80, l: 60 },
          plot_bgcolor: '#f5f5f5',
          paper_bgcolor: '#ffffff',
          height: 400,
          width: 800,
          showlegend: false
        }}
        config={{
          displayModeBar: true,
          displaylogo: false,
          modeBarButtonsToRemove: ['pan2d', 'lasso2d', 'select2d']
        }}
      />
    </Box>
  );
};

export default PackComposition;
