const CircuitParameterConstant = [
    {"name": "r0", "unit": "Ohm", "explanation": "Electrolyte resistance", "color": "green", "min": 0.001, "max": 0.1},
    {"name": "r1", "unit": "Ohm", "explanation": "Resistance due to SEI layer", "color": "#FFC300", "min": 0.01, "max": 1.0},
    {"name": "c1", "unit": "Faraday", "explanation": "Capacitance due to SEI layer", "color": "orange", "min": 0.001, "max": 0.1},
    {"name": "r2", "unit": "Ohm", "explanation": "charge-transfer resistance that models the voltage drop over the electrode–electrolyte interface due to a load", "color": "#C70039", "min": 0.1, "max": 10.0},
    {"name": "wo1", "unit": "", "explanation": "Frequency-dependent Warburg impedance models diffusion of lithium ions in the electrodes", "color": "#900C3F", "min": 0.01, "max": 1.0},
    {"name": "c2", "unit": "Faraday", "explanation": "Double-layer capacitance that models the effect of charges building up in the electrolyte at the electrode surface", "color": "#581845", "min": 0.1, "max": 10.0},
]

export default CircuitParameterConstant;
