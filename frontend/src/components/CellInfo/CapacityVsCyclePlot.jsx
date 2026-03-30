import React, { useEffect, useState } from 'react';

function CapacityVsCyclePlot({ currentSOH, currentCapacity }) {
    const [plotData, setPlotData] = useState(null);
    const [markers, setMarkers] = useState([]);
    const [plotlyLoaded, setPlotlyLoaded] = useState(false);

    useEffect(() => {
        // Load capacity data
        fetch('/capacity_vs_cycle_data.json')
            .then(response => response.json())
            .then(jsonData => {
                const data = jsonData.data; // Access nested data object
                if (!data || !data.cycles || !data.capacity_mah) {
                    console.error('Invalid capacity data structure');
                    return;
                }
                
                setPlotData(data);
                
                // Find the cycle number where capacity is closest to current cell's actual capacity
                let closestIndex = 0;
                let minDiff = Math.abs(data.capacity_mah[0] - currentCapacity);
                
                for (let i = 1; i < data.capacity_mah.length; i++) {
                    const diff = Math.abs(data.capacity_mah[i] - currentCapacity);
                    if (diff < minDiff) {
                        minDiff = diff;
                        closestIndex = i;
                    }
                }
                
                const cycleNumber = data.cycles[closestIndex];
                const capacityValue = data.capacity_mah[closestIndex];
                
                // Create marker for current cell position
                setMarkers([{
                    x: cycleNumber,
                    y: capacityValue,
                    name: `This Cell (${currentCapacity.toFixed(1)} mAh, SOH: ${currentSOH.toFixed(1)}%)`,
                    color: '#00ffff'
                }]);
            })
            .catch(error => console.error('Error loading capacity data:', error));
    }, [currentSOH, currentCapacity]);

    useEffect(() => {
        if (!plotData || !plotlyLoaded || !window.Plotly) return;

        const trace = {
            x: plotData.cycles,
            y: plotData.capacity_mah,
            mode: 'lines+markers',
            name: 'Capacity',
            line: {
                color: '#00ff00',
                width: 2
            },
            marker: {
                size: 4,
                color: '#00ff00'
            }
        };

        const markerTraces = markers.map(marker => ({
            x: [marker.x],
            y: [marker.y],
            mode: 'markers+text',
            name: marker.name,
            marker: {
                size: 20,
                color: '#00ffff',
                symbol: 'star',
                line: {
                    color: '#ffffff',
                    width: 3
                }
            },
            text: [marker.name],
            textposition: 'top center',
            textfont: {
                color: '#00ffff',
                size: 14,
                family: 'Bai Jamjuree, sans-serif',
                weight: 'bold'
            }
        }));

        const traces = [trace, ...markerTraces];

        // Calculate SOH values from capacity for annotations
        const initialCapacity = plotData.capacity_mah[0];
        const sohValues = plotData.capacity_mah.map(cap => (cap / initialCapacity) * 100);

        // Add annotations for degradation milestones
        const annotations = [
            {
                x: plotData.cycles[0],
                y: plotData.capacity_mah[0],
                text: `Initial<br>SOH: ${sohValues[0].toFixed(1)}%`,
                showarrow: true,
                arrowhead: 2,
                ax: -40,
                ay: -40,
                font: { color: '#ffffff', size: 10, family: 'Bai Jamjuree, sans-serif' },
                bgcolor: 'rgba(0,0,0,0.7)',
                bordercolor: '#ffffff',
                borderwidth: 1
            }
        ];

        // Find knee onset (SOH ~95%)
        const kneeOnsetIndex = sohValues.findIndex(soh => soh <= 95);
        if (kneeOnsetIndex >= 0) {
            annotations.push({
                x: plotData.cycles[kneeOnsetIndex],
                y: plotData.capacity_mah[kneeOnsetIndex],
                text: `Knee Onset<br>SOH: ${sohValues[kneeOnsetIndex].toFixed(1)}%`,
                showarrow: true,
                arrowhead: 2,
                ax: -40,
                ay: 40,
                font: { color: '#ffaa00', size: 10, family: 'Bai Jamjuree, sans-serif' },
                bgcolor: 'rgba(0,0,0,0.7)',
                bordercolor: '#ffaa00',
                borderwidth: 1
            });
        }

        // Find knee point (SOH ~85%)
        const kneePointIndex = sohValues.findIndex(soh => soh <= 85);
        if (kneePointIndex >= 0) {
            annotations.push({
                x: plotData.cycles[kneePointIndex],
                y: plotData.capacity_mah[kneePointIndex],
                text: `Knee Point<br>SOH: ${sohValues[kneePointIndex].toFixed(1)}%`,
                showarrow: true,
                arrowhead: 2,
                ax: 40,
                ay: -40,
                font: { color: '#ff5500', size: 10, family: 'Bai Jamjuree, sans-serif' },
                bgcolor: 'rgba(0,0,0,0.7)',
                bordercolor: '#ff5500',
                borderwidth: 1
            });
        }

        // Find EOL (SOH ~80%)
        const eolIndex = sohValues.findIndex(soh => soh <= 80);
        if (eolIndex >= 0) {
            annotations.push({
                x: plotData.cycles[eolIndex],
                y: plotData.capacity_mah[eolIndex],
                text: `EOL<br>SOH: ${sohValues[eolIndex].toFixed(1)}%`,
                showarrow: true,
                arrowhead: 2,
                ax: 40,
                ay: 40,
                font: { color: '#ff0000', size: 10, family: 'Bai Jamjuree, sans-serif' },
                bgcolor: 'rgba(0,0,0,0.7)',
                bordercolor: '#ff0000',
                borderwidth: 1
            });
        }

        const layout = {
            title: {
                text: 'Capacity Degradation Over Cycles',
                font: {
                    color: '#ffffff',
                    size: 18,
                    family: 'Bai Jamjuree, sans-serif'
                }
            },
            xaxis: {
                title: {
                    text: 'Cycle Number',
                    font: { color: '#ffffff', family: 'Bai Jamjuree, sans-serif' }
                },
                gridcolor: '#333333',
                tickfont: { color: '#ffffff', family: 'Bai Jamjuree, sans-serif' }
            },
            yaxis: {
                title: {
                    text: 'Capacity (Ah)',
                    font: { color: '#ffffff', family: 'Bai Jamjuree, sans-serif' }
                },
                gridcolor: '#333333',
                tickfont: { color: '#ffffff', family: 'Bai Jamjuree, sans-serif' }
            },
            plot_bgcolor: '#000000',
            paper_bgcolor: '#111111',
            showlegend: true,
            legend: {
                font: { color: '#ffffff', family: 'Bai Jamjuree, sans-serif' }
            },
            annotations: annotations,
            hovermode: 'closest'
        };

        const config = {
            responsive: true,
            displayModeBar: true,
            displaylogo: false
        };

        window.Plotly.newPlot('capacityPlot', traces, layout, config);

        return () => {
            if (window.Plotly && document.getElementById('capacityPlot')) {
                window.Plotly.purge('capacityPlot');
            }
        };
    }, [plotData, markers, plotlyLoaded]);

    useEffect(() => {
        // Load Plotly if not already loaded
        if (window.Plotly) {
            setPlotlyLoaded(true);
        } else {
            const script = document.createElement('script');
            script.src = 'https://cdn.plot.ly/plotly-2.35.2.min.js';
            script.async = true;
            script.onload = () => setPlotlyLoaded(true);
            document.body.appendChild(script);
        }
    }, []);

    return (
        <div className="flex flex-col border border-[#e8432d29] bg-[#111111] rounded-lg p-4 my-20 py-10 max-w-[1400px] mx-auto">
            <div id="capacityPlot" style={{ width: '100%', height: '500px' }}></div>
        </div>
    );
}

export default CapacityVsCyclePlot;
