import React, { useState, useEffect } from 'react';

const PlotComponent = ({ plotData }) => {
  const [Plot, setPlot] = useState(null);

  useEffect(() => {
    // Dynamically import the Plot component
    import('react-plotly.js').then(module => {
      setPlot(() => module.default);
    });
  }, []);

  if (!Plot) {
    return <div>Loading plot...</div>;
  }

  return (
    <Plot
      data={plotData.data}
      layout={plotData.layout}
      frames={plotData.frames}
      config={plotData.config}
      style={{ width: '100%', height: '100%' }}
    />
  );
};

export default PlotComponent;
