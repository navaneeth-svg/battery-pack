import React, { useEffect, useState } from 'react';

function InternalResistanceVsCyclePlot({ currentSOH }) {
    const [resistanceData, setResistanceData] = useState(null);
    const [capacityData, setCapacityData] = useState(null);
    const [markers, setMarkers] = useState([]);

    useEffect(() => {
        // Load resistance data
        fetch('/resistance_vs_cycle_data.json')
            .then(response => response.json())
            .then(jsonData => {
                const data = jsonData.data; // Access nested data object
                setResistanceData(data);
            })
            .catch(error => console.error('Error loading resistance data:', error));

        // Load capacity data to map SOH to cycle number
        fetch('/capacity_vs_cycle_data.json')
            .then(response => response.json())
            .then(jsonData => {
                const data = jsonData.data; // Access nested data object
                setCapacityData(data);
            })
            .catch(error => console.error('Error loading capacity data:', error));
    }, []);

    useEffect(() => {
        if (!capacityData || !resistanceData || !capacityData.cycles || !capacityData.capacity_mah) return;

        // Calculate SOH from capacity values and find cycle number where SOH matches currentSOH
        const initialCapacity = capacityData.capacity_mah[0];
        let closestIndex = 0;
        let minDiff = Infinity;
        
        for (let i = 0; i < capacityData.capacity_mah.length; i++) {
            const sohAtCycle = (capacityData.capacity_mah[i] / initialCapacity) * 100;
            const diff = Math.abs(sohAtCycle - currentSOH);
            if (diff < minDiff) {
                minDiff = diff;
                closestIndex = i;
            }
        }
        
        const cycleNumber = capacityData.cycles[closestIndex];
        
        // Find corresponding resistance value at that cycle
        const resistanceCycles = resistanceData.cycles || [];
        const resistanceValues = resistanceData.resistance_mohm || [];
        const resistanceIndex = resistanceCycles.findIndex(c => c >= cycleNumber);
        const resistanceValue = resistanceValues[resistanceIndex] || resistanceValues[resistanceValues.length - 1];
        
        setMarkers([{
            x: cycleNumber,
            y: resistanceValue,
            name: 'This Cell',
            color: '#ffffff'
        }]);
    }, [currentSOH, capacityData, resistanceData]);

    useEffect(() => {
        if (!resistanceData || !window.Plotly || !resistanceData.cycles || !resistanceData.resistance_mohm) return;

        const trace = {
            x: resistanceData.cycles,
            y: resistanceData.resistance_mohm,
            mode: 'lines+markers',
            name: 'Internal Resistance',
            line: {
                color: '#ff6600',
                width: 2
            },
            marker: {
                size: 4,
                color: '#ff6600'
            }
        };

        const markerTraces = markers.map(marker => ({
            x: [marker.x],
            y: [marker.y],
            mode: 'markers+text',
            name: marker.name,
            marker: {
                size: 12,
                color: marker.color,
                symbol: 'circle',
                line: {
                    color: '#000000',
                    width: 2
                }
            },
            text: [marker.name],
            textposition: 'top center',
            textfont: {
                color: marker.color,
                size: 12,
                family: 'Bai Jamjuree, sans-serif'
            }
        }));

        const traces = [trace, ...markerTraces];

        // Add annotations for resistance milestones
        const annotations = [
            {
                x: resistanceData.cycles[0],
                y: resistanceData.resistance_mohm[0],
                text: `Initial<br>R: ${resistanceData.resistance_mohm[0].toFixed(2)} mΩ`,
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

        // Find resistance increase milestones (e.g., 50% increase, 100% increase)
        const initialR = resistanceData.resistance_mohm[0];
        const threshold50Index = resistanceData.resistance_mohm.findIndex(r => r >= initialR * 1.5);
        if (threshold50Index >= 0) {
            annotations.push({
                x: resistanceData.cycles[threshold50Index],
                y: resistanceData.resistance_mohm[threshold50Index],
                text: `+50% R<br>${resistanceData.resistance_mohm[threshold50Index].toFixed(2)} mΩ`,
                showarrow: true,
                arrowhead: 2,
                ax: 40,
                ay: -40,
                font: { color: '#ffaa00', size: 10, family: 'Bai Jamjuree, sans-serif' },
                bgcolor: 'rgba(0,0,0,0.7)',
                bordercolor: '#ffaa00',
                borderwidth: 1
            });
        }

        const threshold100Index = resistanceData.resistance_mohm.findIndex(r => r >= initialR * 2);
        if (threshold100Index >= 0) {
            annotations.push({
                x: resistanceData.cycles[threshold100Index],
                y: resistanceData.resistance_mohm[threshold100Index],
                text: `+100% R<br>${resistanceData.resistance_mohm[threshold100Index].toFixed(2)} mΩ`,
                showarrow: true,
                arrowhead: 2,
                ax: -40,
                ay: 40,
                font: { color: '#ff0000', size: 10, family: 'Bai Jamjuree, sans-serif' },
                bgcolor: 'rgba(0,0,0,0.7)',
                bordercolor: '#ff0000',
                borderwidth: 1
            });
        }

        const layout = {
            title: {
                text: 'Internal Resistance vs Cycle Number',
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
                    text: 'Internal Resistance (mΩ)',
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

        window.Plotly.newPlot('resistancePlot', traces, layout, config);

        return () => {
            if (window.Plotly) {
                window.Plotly.purge('resistancePlot');
            }
        };
    }, [resistanceData, markers]);

    useEffect(() => {
        // Load Plotly if not already loaded
        if (!window.Plotly) {
            const script = document.createElement('script');
            script.src = 'https://cdn.plot.ly/plotly-latest.min.js';
            script.async = true;
            document.body.appendChild(script);
        }
    }, []);

    return (
        <div className="flex flex-col border border-[#e8432d29] bg-[#111111] rounded-lg p-4 my-20 py-10 max-w-[1400px] mx-auto">
            <div id="resistancePlot" style={{ width: '100%', height: '500px' }}></div>
        </div>
    );
}

export default InternalResistanceVsCyclePlot;
