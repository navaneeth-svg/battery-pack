import React, { useState, useEffect } from "react";
import { 
  Button, 
  InputAdornment, 
  MenuItem, 
  Select, 
  TextField, 
  Typography, 
  CircularProgress,
  Tabs,
  Tab,
  Box,
  Stepper,
  Step,
  StepLabel,
  Skeleton,
  Snackbar,
  Alert,
  Paper,
  Grid,
  Card,
  CardHeader,
  CardContent,
  Stack,
  FormControl,
  Avatar,
  Divider
} from "@mui/material";
import { 
  Settings as SettingsIcon, 
  GridView as GridViewIcon, 
  Equalizer as EqualizerIcon, 
  Inventory as InventoryIcon, 
  DonutSmall as DonutSmallIcon 
} from '@mui/icons-material';
import { DynamicBoxes } from "./DynamicBoxes";
import { BatteryCells } from "./BatteryCells";
import { BatteryCellPlots } from "./BatteryCellPlots";
import { BatteryCellMasterPlot } from "./BatteryCellMasterPlot";
import cylindrical from "../../assets/img/newcellWObg.png";
import prismatic from "../../assets/img/prismatic.png";
import pouch from "../../assets/img/newPouch.png";
import circuitImage from "../../assets/img/portfolio/newCell2.jpg";
import { GhostLinks } from "./GhostLinks";
import PlotComponent from "../CellInfo/PlotComponent";
import { styled } from '@mui/material/styles';
import axios from 'axios';
import { ToggleButton, ToggleButtonGroup } from '@mui/material';
import { useInventory } from '../../contexts/InventoryContext';
import InventoryDistribution from './InventoryDistribution';
import PackComposition from './PackComposition';
import { Build } from '@mui/icons-material';

// Styled Components for Output Tabs
const StyledTabs = styled(Tabs)({
  '& .MuiTabs-indicator': {
    backgroundColor: '#e8442d',
    height: 3,
  },
});

const StyledTab = styled(Tab)({
  fontFamily: 'Bai Jamjuree, sans-serif',
  fontWeight: 700,
  fontSize: '16px',
  color: '#666',
  '&.Mui-selected': {
    color: '#e8442d',
  },
  '&:hover': {
    color: '#eb5a46',
  },
});

const steps = ['Enter Specifications', 'Procure Cells', 'Analyze Pack'];

const TabPanel = ({ children, value, index }) => {
  return (
    <div role="tabpanel" hidden={value !== index}>
      {value === index && <Box sx={{ pt: 2, width: '100%' }}>{children}</Box>}
    </div>
  );
};

const BatteryConfig = () => {
  const [cellType, setCellType] = useState("Cylindrical");
  const [cellCondition, setCellCondition] = useState("Recycled cell");
  const [voltage, setVoltage] = useState(30);
  const [capacity, setCapacity] = useState(10);
  const [num_cols, setNum_cols] = useState(9);
  const [div_html, setDivHtml] = useState([]);
  const [packVoltage, setPackVoltage] = useState(33.3);
  const [packCapacity, setPackCapacity] = useState(10);
  const [packWeight, setPackWeight] = useState(1.3);
  const [totalCells, setTotalCells] = useState(0); // Changed to 0 initially
  const [packPrice, setPackPrice] = useState(108);
  const [isConfig, setIsConfig] = useState(false);
  const [cellImage, setCellImage] = useState(cylindrical);
  const [cellsData, setCellsData] = useState([]);
  const [modules, setModules] = useState({});
  const [selectedFile, setSelectedFile] = useState(null);
  const [csvData, setCsvData] = useState(null);
  const [filePlot, setFilePlot] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [tabValue, setTabValue] = useState(0);
  const [numSeries, setNumSeries] = useState(0);
  const [numParallel, setNumParallel] = useState(0);
  const [outputTabValue, setOutputTabValue] = useState(0); // NEW: For output tabs
  const [showOutput, setShowOutput] = useState(false); // NEW: Control output visibility
  const { predictionItems } = useInventory(); // Use predictionItems from prediction inventory
  const [configType, setConfigType] = useState(null);
  const [packDesignData, setPackDesignData] = useState(null); // Enhanced pack design data
  const [packDesignLoading, setPackDesignLoading] = useState(false);
  const [allInventoryCells, setAllInventoryCells] = useState([]); // Store ALL inventory cells for distribution chart
  
  const [activeStep, setActiveStep] = useState(0);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'info' });

  const handleCloseSnackbar = () => setSnackbar({ ...snackbar, open: false });

  // Load state from sessionStorage on mount
  useEffect(() => {
    try {
      const savedState = sessionStorage.getItem('batteryConfigState');
      if (savedState) {
        const state = JSON.parse(savedState);
        console.log('📦 Restoring session state:', state);
        
        // Restore step
        if (state.activeStep !== undefined) setActiveStep(state.activeStep);

        // Restore configuration inputs
        if (state.cellType) setCellType(state.cellType);
        if (state.cellCondition) setCellCondition(state.cellCondition);
        if (state.voltage !== undefined) setVoltage(state.voltage);
        if (state.capacity !== undefined) setCapacity(state.capacity);
        
        // Restore results
        if (state.cellsData) setCellsData(state.cellsData);
        if (state.packDesignData) setPackDesignData(state.packDesignData);
        if (state.allInventoryCells) setAllInventoryCells(state.allInventoryCells);
        if (state.numSeries !== undefined) setNumSeries(state.numSeries);
        if (state.numParallel !== undefined) setNumParallel(state.numParallel);
        if (state.totalCells !== undefined) setTotalCells(state.totalCells);
        if (state.packVoltage !== undefined) setPackVoltage(state.packVoltage);
        if (state.packCapacity !== undefined) setPackCapacity(state.packCapacity);
        if (state.packWeight !== undefined) setPackWeight(state.packWeight);
        if (state.packPrice !== undefined) setPackPrice(state.packPrice);
        if (state.num_cols !== undefined) setNum_cols(state.num_cols);
        
        // Restore UI state
        if (state.outputTabValue !== undefined) setOutputTabValue(state.outputTabValue);
        if (state.showOutput !== undefined) setShowOutput(state.showOutput);
        if (state.isConfig !== undefined) setIsConfig(state.isConfig);
        
        console.log('✓ Session state restored successfully');
      }
    } catch (error) {
      console.error('❌ Error loading session state:', error);
      // Clear corrupted state
      sessionStorage.removeItem('batteryConfigState');
    }
  }, []); // Run only once on mount

  // Save state to sessionStorage whenever important states change
  useEffect(() => {
    // Only save if there's meaningful data
    if (cellsData.length > 0 || packDesignData !== null || voltage !== 30) {
      try {
        const stateToSave = {
          activeStep,
          // Configuration inputs
          cellType,
          cellCondition,
          voltage,
          capacity,
          
          // Results
          cellsData,
          packDesignData,
          allInventoryCells,
          numSeries,
          numParallel,
          totalCells,
          packVoltage,
          packCapacity,
          packWeight,
          packPrice,
          num_cols,
          
          // UI state
          outputTabValue,
          showOutput,
          isConfig,
          
          // Metadata
          savedAt: new Date().toISOString()
        };
        
        sessionStorage.setItem('batteryConfigState', JSON.stringify(stateToSave));
        console.log('💾 Session state saved');
      } catch (error) {
        console.error('❌ Error saving session state:', error);
      }
    }
  }, [
    activeStep, cellType, cellCondition, voltage, capacity,
    cellsData, packDesignData, allInventoryCells,
    numSeries, numParallel, totalCells,
    packVoltage, packCapacity, packWeight, packPrice, num_cols,
    outputTabValue, showOutput, isConfig
  ]);


  const batteryConfig = () => {
    setIsConfig(true);
    setConfigType('config');
    setShowOutput(true); // Show output
    setActiveStep(1); // Move to procurement step
    setSnackbar({ open: true, message: 'Configuration set! Now procure cells.', severity: 'success' });
    const wt = 72;
    const default_cell_capacity = 5;
    const num_row = Math.ceil(capacity / default_cell_capacity);
    const num_cols = Math.ceil(voltage / 3.7);
    const total_cap = default_cell_capacity * num_row;
    const total_wt = (wt * num_cols * num_row) / 1000;
    const total_cells = num_row * num_cols;
    setTotalCells(total_cells);
    setNumSeries(num_cols);
    setNumParallel(num_row);
    setNum_cols(num_cols);
    setPackVoltage(Math.round(num_cols * 3.7 * 100) / 100);
    setPackCapacity(Math.round(total_cap * 100) / 100);
    setPackWeight(Math.round(total_wt * 100) / 100);
    let tempDivs = [];
    for (let i = 0; i < total_cells; i++) {
      tempDivs.push(
        <div className="mybox" key={i}>
          <img src={cellImage} style={{ width: "100%", backgroundColor: "black" }} alt="Cell" />
        </div>,
      );
    }
    setCellImage(circuitImage);
    setDivHtml(tempDivs);
    
    // Generate placeholder cells for schematic view
    const placeholderCells = Array.from({ length: total_cells }, (_, i) => ({
      id: `cell-${i}`,
      uid: `cell-${i}`,
      meta: { soh: null },
      capacity: default_cell_capacity * 1000,  // 5000 mAh
      predicted_capacity: default_cell_capacity * 1000,
      soh: null,
      predicted_soh: null,
      image: circuitImage
    }));
    setCellsData(placeholderCells);
  };

  const BatteryProcure = async () => {
    setConfigType('procure');
    setPackDesignLoading(true);
    if (cellType === "Prismatic") setCellImage(prismatic);
    else if (cellType === "Cylindrical") setCellImage(cylindrical);
    else setCellImage(pouch);
    setIsConfig(false);
    const wt = 72;
    const pricePerCellOld = 1;
    const pricePerCellNew = 1;
    const default_cell_capacity = 5;
    const num_row = Math.ceil(capacity / default_cell_capacity);
    const num_cols = Math.ceil(voltage / 3.7);
    const total_cap = default_cell_capacity * num_row;
    const total_cells = num_row * num_cols;
    const total_wt = (wt * num_cols * num_row) / 1000;

    // ========== FETCH CELLS FROM BACKEND VPS STORAGE ==========
    console.log('📡 Fetching cells from VPS storage (training_daq files)...');
    let availableCells = [];
    
    try {
      // Fetch training inventory from VPS storage via backend
      const response = await axios.get('http://localhost:5000/fetch-inventory?sample_type=training&limit=500');
      
      if (response.data && response.data.success) {
        const backendCells = response.data.cells || [];
        console.log('✅ VPS Storage returned cells:', backendCells.length);
        
        // Transform backend cell format to match inventory format
        availableCells = backendCells.map(cell => ({
          id: cell.id || cell.uid || cell.barcode,
          uid: cell.uid || cell.barcode,
          barcode: cell.barcode || cell.uid,
          // Use SOH and capacity from VPS storage
          predicted_soh: cell.soh,
          predicted_capacity: cell.capacity,
          soh: cell.soh,
          capacity: cell.capacity,
          ocv: cell.ocv,
          ir: cell.ir,
          voltage: cell.voltage || cell.ocv,
          type: cell.type,
          condition: cell.condition,
          filename: cell.file_name,
          timestamp: cell.timestamp
        }));
        
        console.log('🔧 Transformed cells:', availableCells.length);
        console.log('📊 Sample cell:', availableCells[0]);
      } else {
        console.warn('⚠️ Backend returned no cells or error:', response.data);
      }
    } catch (error) {
      console.error('❌ Failed to fetch cells from backend:', error);
      console.error('Error details:', error.response?.data || error.message);
      
      // Fallback to IndexedDB if backend fails
      console.log('🔄 Falling back to IndexedDB...');
      availableCells = predictionItems.filter(item => item.id || item.barcode);
    }
    
    // Store ALL inventory cells for the distribution chart
    setAllInventoryCells(availableCells);
    
    console.log('🔍 Inventory Check:', {
      totalAvailable: availableCells.length,
      required: total_cells,
      sample: availableCells.slice(0, 2) // Log first 2 cells for debugging
    });
    
    if (availableCells.length === 0) {
      setSnackbar({ open: true, message: 'No cells found in inventory!', severity: 'error' });
      setPackDesignLoading(false);
      return;
    }
    
    // Warn if insufficient cells, but continue with what we have
    if (availableCells.length < total_cells) {
      setSnackbar({ open: true, message: `Only ${availableCells.length}/${total_cells} cells available.`, severity: 'warning' });
    }

    // Ensure cells have proper structure with defaults for missing fields
    const cellsWithDefaults = availableCells.map(cell => ({
      ...cell,
      capacity: cell.capacity || cell.predicted_capacity || null,
      predicted_capacity: cell.predicted_capacity || cell.capacity || null,
      soh: cell.soh || cell.predicted_soh || null,
      predicted_soh: cell.predicted_soh || cell.soh || null,
      ir: cell.ir || null,
      uid: cell.uid || cell.id || cell.barcode,
      cellId: cell.cellId || cell.id || cell.barcode
    }));

    // Filter out cells without SOH data for better pack design
    const cellsWithValidData = cellsWithDefaults.filter(cell => {
      const hasSoh = cell.soh != null || cell.predicted_soh != null;
      const hasCapacity = cell.capacity != null || cell.predicted_capacity != null;
      return hasSoh && hasCapacity;
    });

    // Use cells with valid data, but if not enough, use all available with defaults
    const cellsToUse = cellsWithValidData.length >= total_cells 
      ? cellsWithValidData 
      : cellsWithDefaults.map(cell => ({
          ...cell,
          capacity: cell.capacity || cell.predicted_capacity || 4000,
          predicted_capacity: cell.predicted_capacity || cell.capacity || 4000,
          soh: cell.soh || cell.predicted_soh || 95,
          predicted_soh: cell.predicted_soh || cell.soh || 95,
          ir: cell.ir || 45
        }));

    // Select best-matched cells based on SOH uniformity (legacy method)
    const selectedCells = selectBestMatchedCells(cellsToUse, total_cells);
    setCellsData(selectedCells);
    
    setShowOutput(true); // Show output
    setTotalCells(Math.round(num_cols * num_row));
    setNumSeries(num_cols);
    setNumParallel(num_row);
    setPackVoltage(Math.round(num_cols * 3.7 * 100) / 100);
    setPackCapacity(Math.round(total_cap * 100) / 100);
    setPackWeight(Math.round(total_wt * 100) / 100);
    setNum_cols(num_cols);
    if (cellCondition === "Recycled cell") {
      setPackPrice(total_cells * pricePerCellOld);
    } else {
      setPackPrice(total_cells * pricePerCellNew);
    }

    // Call enhanced pack design API
    try {
      console.log('🚀 Sending cells to backend:', cellsToUse.length);
      
      const response = await axios.post('http://localhost:5000/design-battery-pack', {
        cells: cellsToUse,
        num_series: num_cols,
        num_parallel: num_row
      });

      if (response.data.success) {
        console.log('✓ Enhanced pack design complete:', response.data);
        setPackDesignData(response.data);
        
        // Update pack stats with enhanced data
        const stats = response.data.statistics;
        setPackCapacity(Math.round(stats.pack_capacity_ah * 100) / 100);
        setPackVoltage(Math.round(stats.nominal_voltage * 100) / 100);
        
        setSnackbar({ open: true, message: 'Pack optimized successfully!', severity: 'success' });
        setActiveStep(2); // Analysis phase
        setOutputTabValue(0);
      } else {
        console.error('Pack design failed:', response.data.error);
        setSnackbar({ open: true, message: 'Optimization failed. Using fallback design.', severity: 'error' });
        setPackDesignData(null);
      }
    } catch (error) {
      console.error('Pack design API error:', error);
      setSnackbar({ open: true, message: 'Backend connection failed.', severity: 'error' });
      setPackDesignData(null);
    } finally {
      setPackDesignLoading(false);
    }
  };

  // Function to select best-matched cells based on SOH uniformity
  const selectBestMatchedCells = (cells, count) => {
    // If fewer cells available than requested, return all available cells
    if (cells.length <= count) {
      console.log(`⚠️ Only ${cells.length} cells available (requested ${count}), returning all`);
      return cells;
    }
    
    // Sort cells by SOH value
    const sortedCells = [...cells].sort((a, b) => (b.soh || 0) - (a.soh || 0));
    
    // Find the most uniform group of cells
    let bestGroup = [];
    let minVariance = Infinity;
    
    // Sliding window to find most uniform group
    for (let i = 0; i <= sortedCells.length - count; i++) {
      const group = sortedCells.slice(i, i + count);
      const sohValues = group.map(c => c.soh || 0);
      const mean = sohValues.reduce((a, b) => a + b, 0) / sohValues.length;
      const variance = sohValues.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / sohValues.length;
      
      if (variance < minVariance) {
        minVariance = variance;
        bestGroup = group;
      }
    }
    
    return bestGroup;
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file && file.type === 'text/csv') {
      setSelectedFile(file);
      setCsvData(null);
    } else {
      alert('Please upload a valid CSV file.');
      setSelectedFile(null);
    }
  };

  const handleShowPlot = async () => {
    if (!selectedFile) return;

    setLoading(true);
    setError(null);

    const formData = new FormData();
    formData.append('file', selectedFile);

    try {
      const response = await axios.post(`${process.env.BACKEND_URL}batteries/battery_pack_plot`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (response.status === 200) {
        console.log(response.data);
        setFilePlot(response.data);
      } else {
        setError('Failed to upload file.');
      }
    } catch (error) {
      setError('Error uploading file: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const handleOutputTabChange = (event, newValue) => {
    setOutputTabValue(newValue);
  };

  // Clear session state and reset to defaults
  const clearSession = () => {
    if (window.confirm('Are you sure you want to clear the session and reset all configuration?')) {
      try {
        sessionStorage.removeItem('batteryConfigState');
        console.log('🗑️ Session state cleared');
        
        // Reset all state to defaults
        setCellType("Cylindrical");
        setCellCondition("Recycled cell");
        setVoltage(30);
        setCapacity(10);
        setNum_cols(9);
        setPackVoltage(33.3);
        setPackCapacity(10);
        setPackWeight(1.3);
        setTotalCells(0);
        setPackPrice(108);
        setIsConfig(false);
        setCellsData([]);
        setPackDesignData(null);
        setAllInventoryCells([]);
        setNumSeries(0);
        setNumParallel(0);
        setOutputTabValue(0);
        setShowOutput(false);
        
        alert('✓ Session cleared successfully. Start fresh!');
      } catch (error) {
        console.error('❌ Error clearing session:', error);
        alert('Error clearing session state');
      }
    }
  };


  return (
    <Box sx={{ width: '100%', p: 0 }}>
      {/* Interaction Stepper */}
      <Paper elevation={2} sx={{ p: 2, mb: 3, borderRadius: 2 }}>
        <Stepper activeStep={activeStep} alternativeLabel>
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>
      </Paper>

      <Grid container spacing={3}>
        {/* Left Column: Specifications Input */}
        <Grid item xs={12} md={4}>
          <Card elevation={4} sx={{ borderRadius: 3 }}>
            <CardHeader 
              title="Pack Specifications" 
              subheader="Configure your target battery pack"
              avatar={<Avatar sx={{ bgcolor: 'primary.main' }}><SettingsIcon /></Avatar>}
            />
            <Divider />
            <CardContent>
              <Stack spacing={3}>
                <Box>
                  <Typography variant="subtitle2" color="textSecondary" gutterBottom>
                    Operating Voltage (V)
                  </Typography>
                  <TextField
                    fullWidth
                    type="number"
                    variant="outlined"
                    value={voltage}
                    onChange={(e) => setVoltage(e.target.value)}
                    placeholder="e.g. 48"
                    InputProps={{
                      startAdornment: <InputAdornment position="start">⚡</InputAdornment>,
                    }}
                  />
                </Box>

                <Box>
                  <Typography variant="subtitle2" color="textSecondary" gutterBottom>
                    Target Capacity (Ah)
                  </Typography>
                  <TextField
                    fullWidth
                    type="number"
                    variant="outlined"
                    value={capacity}
                    onChange={(e) => setCapacity(e.target.value)}
                    placeholder="e.g. 20"
                    InputProps={{
                      startAdornment: <InputAdornment position="start">🔋</InputAdornment>,
                    }}
                  />
                </Box>

                <Box>
                  <Typography variant="subtitle2" color="textSecondary" gutterBottom>
                    Cell Form Factor
                  </Typography>
                  <FormControl fullWidth>
                    <Select
                      value={cellType}
                      onChange={(e) => setCellType(e.target.value)}
                    >
                      <MenuItem value="Cylindrical">Cylindrical (18650/21700)</MenuItem>
                      <MenuItem value="Prismatic">Prismatic</MenuItem>
                      <MenuItem value="Pouch">Pouch / Lipo</MenuItem>
                    </Select>
                  </FormControl>
                </Box>

                <Box>
                  <Typography variant="subtitle2" color="textSecondary" gutterBottom>
                    Cell Condition
                  </Typography>
                  <FormControl fullWidth>
                    <Select
                      value={cellCondition}
                      onChange={(e) => setCellCondition(e.target.value)}
                    >
                      <MenuItem value="Fresh cell">Brand New (Fresh)</MenuItem>
                      <MenuItem value="Recycled cell">Second Life (Recycled)</MenuItem>
                    </Select>
                  </FormControl>
                </Box>

                <Stack direction="row" spacing={2} sx={{ pt: 2 }}>
                  <Button 
                    fullWidth 
                    variant="outlined" 
                    color="primary" 
                    onClick={batteryConfig}
                    sx={{ fontWeight: 'bold' }}
                  >
                    Set Config
                  </Button>
                  <Button 
                    fullWidth 
                    variant="contained" 
                    color="primary" 
                    onClick={BatteryProcure}
                    disabled={packDesignLoading}
                    sx={{ fontWeight: 'bold' }}
                  >
                    {packDesignLoading ? <CircularProgress size={24} color="inherit" /> : 'Procure'}
                  </Button>
                </Stack>
                
                <Button 
                  fullWidth 
                  variant="text" 
                  color="inherit" 
                  onClick={clearSession}
                  size="small"
                  sx={{ mt: 1, opacity: 0.6 }}
                >
                  Reset All
                </Button>
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        {/* Right Column: Visualization Output */}
        <Grid item xs={12} md={8}>
          {!showOutput ? (
            <Card sx={{ height: '100%', borderRadius: 3, display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#f8f9fa', border: '2px dashed #dee2e6', minHeight: '400px' }}>
              <Box textAlign="center" p={5}>
                <SettingsIcon sx={{ fontSize: 80, color: '#ced4da', mb: 2 }} />
                <Typography variant="h5" color="textSecondary">Ready to Design</Typography>
                <Typography variant="body1" color="textSecondary">
                  Enter specifications and click "Set Config" to begin
                </Typography>
              </Box>
            </Card>
          ) : (
            <Stack spacing={3}>
              <DynamicBoxes
                totalCells={totalCells}
                packVoltage={packVoltage}
                packCapacity={packCapacity}
                packWeight={packWeight}
                packPrice={packPrice}
              />

              <Card elevation={4} sx={{ borderRadius: 3 }}>
                <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                  <Tabs 
                    value={outputTabValue} 
                    onChange={handleOutputTabChange} 
                    variant="fullWidth"
                  >
                    <Tab label="Pack Matrix" icon={<GridViewIcon />} iconPosition="start" />
                    <Tab label="SOH Analysis" icon={<EqualizerIcon />} iconPosition="start" />
                    <Tab label="Inventory Distribution" icon={<InventoryIcon />} iconPosition="start" />
                    <Tab label="Composition Chart" icon={<DonutSmallIcon />} iconPosition="start" />
                  </Tabs>
                </Box>
                <CardContent sx={{ p: 2 }}>
                  {outputTabValue === 0 && (
                    <Box>
                       {packDesignLoading ? (
                        <Box sx={{ p: 4, textAlign: 'center' }}>
                          <CircularProgress />
                          <Typography sx={{ mt: 2 }}>Optimizing Matrix...</Typography>
                        </Box>
                      ) : (
                        <BatteryCells
                          cellsData={cellsData}
                          num_cols={num_cols}
                          cellImage={cellImage}
                          packDesignData={packDesignData}
                        />
                      )}
                    </Box>
                  )}
                  {outputTabValue === 1 && (
                    <Box>
                      {cellsData.length > 0 ? (
                        <BatteryCellPlots
                          cellsData={cellsData}
                          num_cols={num_cols}
                          totalCells={totalCells}
                          url="battery_variance_capacity_vs_cycle"
                          plotType="Capacity vs Cycle Plot"
                        />
                      ) : (
                        <Typography sx={{ p: 4, textAlign: 'center' }}>No cell data available for analysis.</Typography>
                      )}
                    </Box>
                  )}
                  {outputTabValue === 2 && (
                    <InventoryDistribution allInventoryCells={allInventoryCells} />
                  )}
                  {outputTabValue === 3 && (
                    <PackComposition packDesignData={packDesignData} />
                  )}
                </CardContent>
              </Card>
            </Stack>
          )}
        </Grid>
      </Grid>

      {/* Legacy Plots Section - Hidden if using new layout but kept for compatibility */}
      {/* ... keeping simplified versions if needed ... */}

      {/* Snackbar for Notifications */}
      <Snackbar 
        open={snackbar.open} 
        autoHideDuration={6000} 
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default BatteryConfig;