import React, { useEffect } from 'react';

function ChargeDischargePlot({ currentCapacity = 3.0 }) {
    // Generate synthetic charge/discharge curves based on capacity
    const generateCurves = (capacity) => {
        const points = 100;
        
        // Charge curve: exponential rise from 2.5V to 4.1V
        const chargeVoltage = [];
        const chargeTime = [];
        for (let i = 0; i <= points; i++) {
            const progress = i / points;
            const voltage = 2.5 + 1.6 * Math.pow(progress, 0.7);
            chargeVoltage.push(voltage);
            chargeTime.push(progress * capacity);
        }
        
        // Discharge curve: polynomial drop from 4.1V to 2.5V
        const dischargeVoltage = [];
        const dischargeTime = [];
        for (let i = 0; i <= points; i++) {
            const progress = i / points;
            const voltage = 4.1 - 1.6 * Math.pow(progress, 2.5);
            dischargeVoltage.push(voltage);
            dischargeTime.push(progress * capacity);
        }
        
        return { chargeVoltage, chargeTime, dischargeVoltage, dischargeTime };
    };

    useEffect(() => {
        if (!window.Plotly) {
            const script = document.createElement('script');
            script.src = 'https://cdn.plot.ly/plotly-2.35.2.min.js';
            script.async = true;
            document.body.appendChild(script);
            script.onload = () => renderPlot();
        } else {
            renderPlot();
        }

        function renderPlot() {
            const curves100 = generateCurves(currentCapacity);
            const curves90 = generateCurves(currentCapacity * 0.9);
            const curves70 = generateCurves(currentCapacity * 0.7);

            const traces = [
                {
                    x: curves100.chargeTime,
                    y: curves100.chargeVoltage,
                    mode: 'lines',
                    name: 'Charge (100%)',
                    line: { color: '#00ff00', width: 2 }
                },
                {
                    x: curves100.dischargeTime,
                    y: curves100.dischargeVoltage,
                    mode: 'lines',
                    name: 'Discharge (100%)',
                    line: { color: '#0099ff', width: 2 }
                },
                {
                    x: curves90.chargeTime,
                    y: curves90.chargeVoltage,
                    mode: 'lines',
                    name: 'Charge (90%)',
                    line: { color: '#88ff00', width: 2, dash: 'dot' }
                },
                {
                    x: curves90.dischargeTime,
                    y: curves90.dischargeVoltage,
                    mode: 'lines',
                    name: 'Discharge (90%)',
                    line: { color: '#00aaff', width: 2, dash: 'dot' }
                },
                {
                    x: curves70.chargeTime,
                    y: curves70.chargeVoltage,
                    mode: 'lines',
                    name: 'Charge (70%)',
                    line: { color: '#ffaa00', width: 2, dash: 'dash' }
                },
                {
                    x: curves70.dischargeTime,
                    y: curves70.dischargeVoltage,
                    mode: 'lines',
                    name: 'Discharge (70%)',
                    line: { color: '#00ccff', width: 2, dash: 'dash' }
                }
            ];

            const layout = {
                title: {
                    text: 'Charge and Discharge Curves at Different Capacities',
                    font: { color: '#ffffff', size: 18, family: 'Bai Jamjuree, sans-serif' }
                },
                xaxis: {
                    title: { text: 'Time (hours)', font: { color: '#ffffff', family: 'Bai Jamjuree, sans-serif' } },
                    gridcolor: '#333333',
                    tickfont: { color: '#ffffff', family: 'Bai Jamjuree, sans-serif' }
                },
                yaxis: {
                    title: { text: 'Voltage (V)', font: { color: '#ffffff', family: 'Bai Jamjuree, sans-serif' } },
                    gridcolor: '#333333',
                    tickfont: { color: '#ffffff', family: 'Bai Jamjuree, sans-serif' },
                    range: [2.3, 4.3]
                },
                plot_bgcolor: '#000000',
                paper_bgcolor: '#111111',
                showlegend: true,
                legend: { font: { color: '#ffffff', family: 'Bai Jamjuree, sans-serif' } },
                hovermode: 'x unified',
                annotations: [
                    {
                        x: currentCapacity * 0.5,
                        y: 3.8,
                        text: 'Charge',
                        showarrow: false,
                        font: { color: '#00ff00', size: 14, family: 'Bai Jamjuree, sans-serif' },
                        bgcolor: 'rgba(0,0,0,0.7)',
                        bordercolor: '#00ff00',
                        borderwidth: 1
                    },
                    {
                        x: currentCapacity * 0.5,
                        y: 3.2,
                        text: 'Discharge',
                        showarrow: false,
                        font: { color: '#0099ff', size: 14, family: 'Bai Jamjuree, sans-serif' },
                        bgcolor: 'rgba(0,0,0,0.7)',
                        bordercolor: '#0099ff',
                        borderwidth: 1
                    }
                ]
            };

            const config = {
                responsive: true,
                displayModeBar: true,
                displaylogo: false
            };

            window.Plotly.newPlot('chargeDischargePlot', traces, layout, config);
        }

        return () => {
            if (window.Plotly) {
                window.Plotly.purge('chargeDischargePlot');
            }
        };
    }, [currentCapacity]);

    return (
        <div className="flex flex-col border border-[#e8432d29] bg-[#111111] rounded-lg p-4 my-20 py-10 max-w-[1400px] mx-auto">
            <div id="chargeDischargePlot" style={{ width: '100%', height: '500px' }}></div>
        </div>
    );
}

export default ChargeDischargePlot;
