import React from 'react';
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper } from '@mui/material';
import CircuitParameterConstant from './CircuitParameterConstant';

function CircuitParametersTable({ parameters, enhanced = false }) {
    const getParameterInfo = (key) => {
        return CircuitParameterConstant.find(param => param.key === key);
    };

    const calculateBar = (value, min, max) => {
        const percentage = ((value - min) / (max - min)) * 100;
        let color = '#00ff00'; // green
        if (percentage >= 30 && percentage < 70) {
            color = '#ff6600'; // orange
        } else if (percentage >= 70) {
            color = '#ff0000'; // red
        }
        return { percentage: Math.min(100, Math.max(0, percentage)), color };
    };

    return (
        <TableContainer component={Paper} sx={{ backgroundColor: '#111111', maxWidth: '900px', margin: '20px auto' }}>
            <Table>
                <TableHead>
                    <TableRow sx={{ backgroundColor: '#1a1a1a' }}>
                        <TableCell sx={{ color: '#ffffff', fontFamily: 'Bai Jamjuree, sans-serif', fontWeight: 'bold' }}>
                            Parameter
                        </TableCell>
                        <TableCell sx={{ color: '#ffffff', fontFamily: 'Bai Jamjuree, sans-serif', fontWeight: 'bold' }}>
                            Value
                        </TableCell>
                        <TableCell sx={{ color: '#ffffff', fontFamily: 'Bai Jamjuree, sans-serif', fontWeight: 'bold' }}>
                            Unit
                        </TableCell>
                        {enhanced && (
                            <>
                                <TableCell sx={{ color: '#ffffff', fontFamily: 'Bai Jamjuree, sans-serif', fontWeight: 'bold' }}>
                                    Min Value
                                </TableCell>
                                <TableCell sx={{ color: '#ffffff', fontFamily: 'Bai Jamjuree, sans-serif', fontWeight: 'bold' }}>
                                    Max Value
                                </TableCell>
                                <TableCell sx={{ color: '#ffffff', fontFamily: 'Bai Jamjuree, sans-serif', fontWeight: 'bold', minWidth: '200px' }}>
                                    Range
                                </TableCell>
                            </>
                        )}
                    </TableRow>
                </TableHead>
                <TableBody>
                    {Object.entries(parameters).map(([key, value]) => {
                        const info = getParameterInfo(key);
                        if (!info) return null;

                        const barInfo = enhanced ? calculateBar(value, info.min, info.max) : null;

                        return (
                            <TableRow key={key} sx={{ '&:hover': { backgroundColor: '#1a1a1a' } }}>
                                <TableCell sx={{ color: info.color, fontFamily: 'Bai Jamjuree, sans-serif', fontWeight: '600' }}>
                                    {info.key.toUpperCase()}
                                </TableCell>
                                <TableCell sx={{ color: '#ffffff', fontFamily: 'Bai Jamjuree, sans-serif' }}>
                                    {typeof value === 'number' ? value.toFixed(4) : value}
                                </TableCell>
                                <TableCell sx={{ color: '#aaaaaa', fontFamily: 'Bai Jamjuree, sans-serif' }}>
                                    {info.unit}
                                </TableCell>
                                {enhanced && (
                                    <>
                                        <TableCell sx={{ color: '#aaaaaa', fontFamily: 'Bai Jamjuree, sans-serif' }}>
                                            {info.min.toFixed(4)}
                                        </TableCell>
                                        <TableCell sx={{ color: '#aaaaaa', fontFamily: 'Bai Jamjuree, sans-serif' }}>
                                            {info.max.toFixed(4)}
                                        </TableCell>
                                        <TableCell>
                                            <div style={{ 
                                                width: '100%', 
                                                height: '20px', 
                                                backgroundColor: '#333333', 
                                                borderRadius: '4px',
                                                position: 'relative'
                                            }}>
                                                <div style={{
                                                    width: `${barInfo.percentage}%`,
                                                    height: '100%',
                                                    backgroundColor: barInfo.color,
                                                    borderRadius: '4px',
                                                    transition: 'width 0.3s ease'
                                                }} />
                                                <span style={{
                                                    position: 'absolute',
                                                    top: '50%',
                                                    left: '50%',
                                                    transform: 'translate(-50%, -50%)',
                                                    color: '#ffffff',
                                                    fontSize: '11px',
                                                    fontFamily: 'Bai Jamjuree, sans-serif',
                                                    fontWeight: 'bold',
                                                    textShadow: '1px 1px 2px #000000'
                                                }}>
                                                    {barInfo.percentage.toFixed(0)}%
                                                </span>
                                            </div>
                                        </TableCell>
                                    </>
                                )}
                            </TableRow>
                        );
                    })}
                </TableBody>
            </Table>
        </TableContainer>
    );
}

export default CircuitParametersTable;
