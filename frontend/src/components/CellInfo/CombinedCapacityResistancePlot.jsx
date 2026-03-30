import React, { useEffect, useState } from 'react';
import Plot from 'react-plotly.js';
import { CircularProgress } from '@mui/material';

function CombinedCapacityResistancePlot({ currentSOH }) {
    const [plotData, setPlotData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch('/combined_capacity_resistance_vs_cycle_data.json')
            .then(response => response.json())
            .then(jsonData => {
                const data = jsonData.data; // Access nested data object
                if (!data || !data.cycles || !data.capacity_mah) {
                    console.error('Invalid combined data structure');
                    return;
                }
                
                setPlotData(data);
                setLoading(false);
            })
            .catch(error => {
                console.error('Error loading combined data:', error);
                setLoading(false);
            });
    }, []);

    if (loading) {
        return (
            <div className="flex justify-center items-center h-[500px] border border-[#e8432d29] bg-[#111111] rounded-lg my-20">
                <CircularProgress style={{ color: '#d98532' }} />
            </div>
        );
    }

    if (!plotData || !plotData.cycles || !plotData.capacity_mah) {
        return (
            <div className="flex justify-center items-center h-[500px] border border-[#e8432d29] bg-[#111111] rounded-lg my-20">
                <p className="text-white">Failed to load data</p>
            </div>
        );
    }

    // Calculate SOH from capacity values and find current cell position
    const initialCapacity = plotData.capacity_mah[0];
    const capacitiesAsSOH = plotData.capacity_mah.map(cap => (cap / initialCapacity) * 100);
    
    let closestIndex = 0;
    let minDiff = Math.abs(capacitiesAsSOH[0] - currentSOH);
    
    for (let i = 1; i < capacitiesAsSOH.length; i++) {
        const diff = Math.abs(capacitiesAsSOH[i] - currentSOH);
        if (diff < minDiff) {
            minDiff = diff;
            closestIndex = i;
        }
    }
    
    const currentCycle = plotData.cycles[closestIndex];
    const currentCapacity = plotData.capacity_mah[closestIndex];
    const currentResistance = plotData.resistance_mohm ? plotData.resistance_mohm[closestIndex] : 0;

    // Capacity trace
    const capacityTrace = {
        x: plotData.cycles,
        y: plotData.capacity_mah,
        type: 'scatter',
        mode: 'lines+markers',
        name: 'Capacity',
        yaxis: 'y',
        line: { color: '#00ff00', width: 2 },
        marker: { size: 4, color: '#00ff00' }
    };

    // Resistance trace
    const resistanceTrace = {
        x: plotData.cycles,
        y: plotData.resistance_mohm || [],
        type: 'scatter',
        mode: 'lines+markers',
        name: 'Resistance',
        yaxis: 'y2',
        line: { color: '#ff6600', width: 2 },
        marker: { size: 4, color: '#ff6600' }
    };

    // Current cell marker - capacity
    const currentCapacityMarker = {
        x: [currentCycle],
        y: [currentCapacity],
        type: 'scatter',
        mode: 'markers+text',
        name: 'This Cell (Capacity)',
        yaxis: 'y',
        marker: {
            size: 15,
            color: '#ffffff',
            symbol: 'circle',
            line: { color: '#000000', width: 2 }
        },
        text: ['This Cell'],
        textposition: 'top center',
        textfont: { color: '#ffffff', size: 12, family: 'Bai Jamjuree, sans-serif' }
    };

    // Current cell marker - resistance
    const currentResistanceMarker = {
        x: [currentCycle],
        y: [currentResistance],
        type: 'scatter',
        mode: 'markers',
        name: 'This Cell (Resistance)',
        yaxis: 'y2',
        marker: {
            size: 15,
            color: '#ffffff',
            symbol: 'diamond',
            line: { color: '#000000', width: 2 }
        },
        showlegend: false
    };

    const traces = [capacityTrace, resistanceTrace, currentCapacityMarker, currentResistanceMarker];

    // Add milestone markers based on calculated SOH
    const milestones = [
        { soh: 100, label: 'Initial', color: '#00ff00' },
        { soh: 95, label: 'Knee Onset', color: '#ffaa00' },
        { soh: 85, label: 'Knee Point', color: '#ff5500' },
        { soh: 80, label: 'EOL', color: '#ff0000' },
        { soh: 70, label: 'Severe Degradation', color: '#aa00ff' }
    ];

    milestones.forEach(milestone => {
        const index = capacitiesAsSOH.findIndex(soh => soh <= milestone.soh);
        if (index >= 0 && index < plotData.cycles.length) {
            traces.push({
                x: [plotData.cycles[index]],
                y: [plotData.capacity_mah[index]],
                type: 'scatter',
                mode: 'markers',
                name: milestone.label,
                yaxis: 'y',
                marker: {
                    size: 8,
                    color: milestone.color,
                    symbol: 'star'
                }
            });
        }
    });

    const layout = {
        title: {
            text: 'Combined Capacity and Resistance Degradation',
            font: { color: '#ffffff', size: 18, family: 'Bai Jamjuree, sans-serif' }
        },
        xaxis: {
            title: { text: 'Cycle Number', font: { color: '#ffffff', family: 'Bai Jamjuree, sans-serif' } },
            gridcolor: '#333333',
            tickfont: { color: '#ffffff', family: 'Bai Jamjuree, sans-serif' }
        },
        yaxis: {
            title: { text: 'Capacity (Ah)', font: { color: '#00ff00', family: 'Bai Jamjuree, sans-serif' } },
            gridcolor: '#333333',
            tickfont: { color: '#00ff00', family: 'Bai Jamjuree, sans-serif' },
            side: 'left'
        },
        yaxis2: {
            title: { text: 'Internal Resistance (mΩ)', font: { color: '#ff6600', family: 'Bai Jamjuree, sans-serif' } },
            tickfont: { color: '#ff6600', family: 'Bai Jamjuree, sans-serif' },
            overlaying: 'y',
            side: 'right'
        },
        plot_bgcolor: '#000000',
        paper_bgcolor: '#111111',
        showlegend: true,
        legend: { font: { color: '#ffffff', family: 'Bai Jamjuree, sans-serif' } },
        hovermode: 'x unified'
    };

    const config = {
        responsive: true,
        displayModeBar: true,
        displaylogo: false,
        scrollZoom: true
    };

    return (
        <div className="flex flex-col border border-[#e8432d29] bg-[#111111] rounded-lg p-4 my-20 py-10 max-w-[1400px] mx-auto">
            <Plot
                data={traces}
                layout={layout}
                config={config}
                style={{ width: '100%', height: '500px' }}
            />
        </div>
    );
}

export default CombinedCapacityResistancePlot;
