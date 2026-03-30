import { useState, useEffect } from 'react';
import axios from 'axios';
import CircuitParameterConstant from './CircuitParameterConstant';
import equivalentcircuit from '../../assets/equivalentcircuit.png';
import { Loader } from "../Loaders/loader";

function CircuitParameters({ cellId, showEnhanced = false }) {
    const [CircuitParameters, setCircuitParameters] = useState({});
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        axios.get(`${process.env.BACKEND_URL}batteries/circuit_parameters/${cellId}`)
            .then(response => {
                if (typeof response.data === 'object') {
                    setCircuitParameters(response.data);
                    setError('');
                } else {
                    setError('Invalid response format: ' + response.data);
                    setCircuitParameters({});
                }
                setLoading(false);
            })
            .catch(error => {
                console.error('Error fetching circuit parameters:', error);
                setError('Error fetching circuit parameters');
                setLoading(false);
            });
    }, [cellId]);

    const getCircuitExplanation = (parameter) => {
        const constant = CircuitParameterConstant.find(constant => constant.name === parameter);
        return constant ? constant.explanation : '';
    }

    const getCircuitUnit = (parameter) => {
        const constant = CircuitParameterConstant.find(constant => constant.name === parameter);
        return constant ? constant.unit : '';
    }

    const getColor = (parameter) => {
        const constant = CircuitParameterConstant.find(constant => constant.name === parameter);
        return constant ? constant.color : '';
    }

    const getMinValue = (parameter) => {
        const constant = CircuitParameterConstant.find(constant => constant.name === parameter);
        return constant ? constant.min : 0;
    }

    const getMaxValue = (parameter) => {
        const constant = CircuitParameterConstant.find(constant => constant.name === parameter);
        return constant ? constant.max : 1;
    }

    const getValuePercentage = (parameter, value) => {
        const min = getMinValue(parameter);
        const max = getMaxValue(parameter);
        const percentage = ((value - min) / (max - min)) * 100;
        return Math.max(0, Math.min(100, percentage));
    }

    const getBarColor = (percentage) => {
        if (percentage < 30) return '#4CAF50'; // Green for good
        if (percentage < 70) return '#FF9800'; // Orange for moderate
        return '#F44336'; // Red for high
    }

    return (
        <div className="flex flex-col justify-center items-center w-[100%] gap-10">
            <div className="flex flex-col justify-center items-center gap-6 w-[100%] my-10">
                <h1 className="text-2xl text-[#e8442d] max-md:text-xl max-xsm:text-lg text-center mb-10">Equivalent Circuit Diagram:</h1>
                <img src={equivalentcircuit} alt="circuitImage" className="max-w-[100%] md:max-w-[90%] xl:max-w-[1000px]" />
            </div>
            <h1 className="text-2xl text-[#e8442d] text-center my-10">Equivalent Circuit Model Parameters</h1>
            {loading ? <Loader widget={true} /> : (
                error ? (
                    <div className="text-red-500 text-center">
                        {error}
                    </div>
                ) : (
                <>
                    <div className={`table-container overflow-x-auto ${showEnhanced ? 'w-[100%] md:w-[100%] max-w-[1400px]' : 'w-[100%] md:w-[70%] max-w-[1400px]'}`}>
                        <table className="table w-full bg-white">
                            <tbody className="w-full">
                                <tr
                                    className={`border-b-[1px] border-[#e8432da7] ${showEnhanced ? '' : 'bg-[#f1f1f1]'}`}
                                    style={showEnhanced ? { background: '#fff' } : {}}
                                >
                                    <th className={`text-sm md:text-lg ${showEnhanced ? '' : ''}`}
                                        style={showEnhanced ? { color: '#000', fontWeight: 700 } : {}}>
                                        Parameter
                                    </th>
                                    <th className={`text-sm md:text-lg text-left ${showEnhanced ? '' : ''}`}
                                        style={showEnhanced ? { color: '#000', fontWeight: 700 } : {}}>
                                        Value
                                    </th>
                                    {showEnhanced && (
                                        <>
                                            <th className='text-sm md:text-lg text-left' style={{ color: '#000', fontWeight: 700 }}>
                                                Min Value
                                            </th>
                                            <th className='text-sm md:text-lg text-left' style={{ color: '#000', fontWeight: 700 }}>
                                                Max Value
                                            </th>
                                            <th className='text-sm md:text-lg text-left' style={{ color: '#000', fontWeight: 700 }}>
                                                Range
                                            </th>
                                        </>
                                    )}
                                    <th className={`text-sm md:text-lg text-left ${showEnhanced ? '' : ''}`}
                                        style={showEnhanced ? { color: '#000', fontWeight: 700 } : {}}>
                                        Explanation
                                    </th>
                                </tr>
                                {CircuitParameters && Object.keys(CircuitParameters).map((parameter, index) => {
                                    const currentValue = CircuitParameters[parameter];
                                    const percentage = getValuePercentage(parameter, currentValue);
                                    const barColor = getBarColor(percentage);
                                    
                                    return (
                                        <tr key={parameter}>
                                            <td className={`font-bold w-auto md:w-[40px] text-sm md:text-lg text-[${getColor(parameter)}]`} style={{ color: getColor(parameter) }}>
                                                {parameter && parameter.charAt(0).toUpperCase() + parameter.slice(1).replace(/_/g, ' ')}</td>
                                            <td className={`text-sm md:text-lg w-auto md:w-[40px] text-left`}>
                                                {parameter && CircuitParameters && CircuitParameters[parameter] && CircuitParameters[parameter].toFixed(2)} &nbsp;
                                                {parameter && CircuitParameters && getCircuitUnit(parameter)}
                                            </td>
                                            {showEnhanced && (
                                                <>
                                                    <td className='text-sm md:text-lg text-left'>
                                                        {getMinValue(parameter).toFixed(3)} {getCircuitUnit(parameter)}
                                                    </td>
                                                    <td className='text-sm md:text-lg text-left'>
                                                        {getMaxValue(parameter).toFixed(3)} {getCircuitUnit(parameter)}
                                                    </td>
                                                    <td className='text-sm md:text-lg text-left'>
                                                        <div className="flex items-center gap-2">
                                                            <div className="w-20 h-3 bg-gray-200 rounded-full overflow-hidden relative">
                                                                <div
                                                                    className="absolute left-0 top-0 h-full rounded-full"
                                                                    style={{
                                                                        width: '100%',
                                                                        backgroundColor: '#e0e0e0',
                                                                        opacity: 0.5,
                                                                        zIndex: 1
                                                                    }}
                                                                ></div>
                                                                <div
                                                                    className="absolute left-0 top-0 h-full rounded-full transition-all duration-300"
                                                                    style={{
                                                                        width: `${Math.max(percentage, 10)}%`,
                                                                        minWidth: '8px',
                                                                        backgroundColor: barColor,
                                                                        zIndex: 2
                                                                    }}
                                                                ></div>
                                                            </div>
                                                            <span className="text-xs text-gray-600">
                                                                {percentage.toFixed(1)}%
                                                            </span>
                                                        </div>
                                                    </td>
                                                </>
                                            )}
                                            <td className='w-auto md:max-w-[300px] text-wrap text-xs md:text-lg text-left'>
                                                {parameter && getCircuitExplanation(parameter)}
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </>
                )
        )}
        </div>
    );
}

export default CircuitParameters;
