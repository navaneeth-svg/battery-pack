import React, { useState, useEffect } from "react";
import { Button, InputAdornment, MenuItem, Select, TextField, Typography, CircularProgress } from "@mui/material";
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
import { Tabs, Tab, Box } from '@mui/material';
import { styled } from '@mui/material/styles';
import axios from 'axios';
import { ToggleButton, ToggleButtonGroup } from '@mui/material';
import { useInventory } from '../../contexts/InventoryContext';
import InventoryDistribution from './InventoryDistribution';
import PackComposition from './PackComposition';

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

const TabPanel = ({ children, value, index }) => {
  return (
    <div role="tabpanel" hidden={value !== index}>
      {value === index && <Box sx={{ pt: 0, width: '100%' }}>{children}</Box>}
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

  // Load state from sessionStorage on mount
  useEffect(() => {
    try {
      const savedState = sessionStorage.getItem('batteryConfigState');
      if (savedState) {
        const state = JSON.parse(savedState);
        console.log('📦 Restoring session state:', state);
        
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
    if (cellsData.length > 0 || packDesignData !== null) {
      try {
        const stateToSave = {
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
    cellType, cellCondition, voltage, capacity,
    cellsData, packDesignData, allInventoryCells,
    numSeries, numParallel, totalCells,
    packVoltage, packCapacity, packWeight, packPrice, num_cols,
    outputTabValue, showOutput, isConfig
  ]);


  const batteryConfig = () => {
    setIsConfig(true);
    setConfigType('config');
    setShowOutput(true); // Show output
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
      alert(
        `❌ No Cells Found!\n\n` +
        `Could not load cells from backend or IndexedDB.\n\n` +
        `To add cells:\n` +
        `1. Go to BatteryScope-C (/#/batteryscope-c)\n` +
        `2. Click "Fast Scan" to scan cells\n` +
        `3. Or manually add cells to inventory\n` +
        `4. Come back here and click "Procure Your Cells"\n\n` +
        `Note: Backend should have cells in Prediction/ folder with metadata.json`
      );
      return;
    }
    
    // Warn if insufficient cells, but continue with what we have
    if (availableCells.length < total_cells) {
      alert(
        `⚠️ Insufficient Inventory!\n\n` +
        `Required cells: ${total_cells}\n` +
        `Available cells in inventory: ${availableCells.length}\n\n` +
        `Proceeding with available ${availableCells.length} cells.\n` +
        `SOH View will show your actual cells.\n` +
        `Pack Design will design the best pack possible with available cells.\n\n` +
        `Note: Add more cells in BatteryScope-C to complete the full pack.`
      );
      // Continue with available cells instead of returning
    }

    // Ensure cells have proper structure with defaults for missing fields
    const cellsWithDefaults = availableCells.map(cell => ({
      ...cell,
      // Ensure these fields exist for backend optimization
      // DO NOT use default values for soh/capacity - preserve null/undefined for cells without predictions
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

    console.log('🔍 SOH Status:', {
      totalCells: cellsWithDefaults.length,
      cellsWithValidSOH: cellsWithValidData.length,
      cellsWithoutSOH: cellsWithDefaults.length - cellsWithValidData.length
    });

    // Use cells with valid data, but if not enough, use all available with defaults
    const cellsToUse = cellsWithValidData.length >= total_cells 
      ? cellsWithValidData 
      : cellsWithDefaults.map(cell => ({
          ...cell,
          // Only apply defaults if we don't have enough valid cells
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
    setPackDesignLoading(true);
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
      } else {
        console.error('Pack design failed:', response.data.error);
        alert(
          `❌ Pack Design Error\n\n${response.data.error}\n\n` +
          `The SOH View and Inventory View will still work with basic cell selection.`
        );
        setPackDesignData(null);
      }
    } catch (error) {
      console.error('Pack design API error:', error);
      const errorMsg = error.response?.data?.error || error.message || 'Unknown error';
      
      alert(
        `❌ Backend Connection Failed\n\n` +
        `Error: ${errorMsg}\n\n` +
        `The Pack Matrix view requires the backend server.\n\n` +
        `To start the backend:\n` +
        `1. Open terminal in: backend/\n` +
        `2. Run: python app.py\n` +
        `3. Wait for "Running on http://127.0.0.1:5000"\n\n` +
        `SOH View and Inventory View will still work.`
      );
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
    <div className="flex flex-col justify-center items-center text-center gap-12 w-full">
      <div className="flex flex-row max-lg:flex-col items-center justify-center w-full gap-10">
        <div className="rounded-md p-8 flex flex-col gap-8 items-center justify-between w-[30%] max-lg:w-[60%]  medium:w-[70%] max-sm:w-[80%] shadow-[0px_0px_11px_0px_#e8442d]">
          <div className="flex flex-row item-center justify-between w-full max-md:flex-col max-md:items-start max-md:gap-2">
            <label htmlFor="voltage" className="max-md:w-full max-md:text-left text-black font-semibold">
              Battery Voltage
            </label>
            <div className="flex flex-row justify-center items-center w-1/2 max-md:w-full">
              <TextField
                fullWidth
                name="voltage"
                className="max-md:w-full"
                variant="outlined"
                size="small"
                type="number"
                value={voltage}
                onChange={(e) => setVoltage(e.target.value)}
                sx={{
                  backgroundColor: "white",
                  borderRadius: "0.3rem",
                  fontFamily: "Bai Jamjuree",
                  "& .MuiOutlinedInput-root .MuiOutlinedInput-notchedOutline": {
                    borderColor: "#ff851b",
                  },
                  "& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline": {
                    borderColor: "#ff851b",
                  },
                }}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <Typography sx={{
                        fontWeight: "700", fontFamily: "Bai Jamjuree"
                      }}>V</Typography>
                    </InputAdornment>
                  ),
                  inputProps: {
                    style: {
                      fontWeight: "700",
                      fontFamily: "Bai Jamjuree",
                    },
                  },
                }}
              />
            </div>
          </div>
          <div className="flex flex-row item-center justify-between w-full max-md:flex-col max-md:items-start max-md:gap-2">
            <label htmlFor="capacity" className="max-md:w-full max-md:text-left text-black font-semibold">
              Battery Capacity
            </label>
            <div className=" flex flex-row justify-center items-center w-1/2 max-md:w-full">
              <TextField
                fullWidth
                name="capacity"
                id="capactiy"
                className="max-md:w-full"
                variant="outlined"
                size="small"
                type="number"
                value={capacity}
                onChange={(e) => setCapacity(e.target.value)}
                sx={{
                  backgroundColor: "white",
                  borderRadius: "0.3rem",
                  fontFamily: "Bai Jamjuree",
                  "& .MuiOutlinedInput-root .MuiOutlinedInput-notchedOutline": {
                    borderColor: "#ff851b",
                  },
                  "& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline": {
                    borderColor: "#ff851b",
                  },
                }}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <Typography sx={{
                        fontWeight: "700", fontFamily: "Bai Jamjuree"
                      }}>Ah</Typography>
                    </InputAdornment>
                  ),
                  inputProps: {
                    style: {
                      fontWeight: "700",
                      fontFamily: "Bai Jamjuree",
                    },
                  },
                }}
              />
            </div>
          </div>
          <Button
            fullWidth
            className="max-xsm:text-xs"
            variant="outlined"
            size="medium"
            sx={{
              borderColor: "#ff851b",
              backgroundColor: "#e8442d",
              color: "white",
              fontWeight: "900",
              fontFamily: "Bai Jamjuree",
              "&:hover": {
                borderColor: "#ffae68",
                backgroundColor: "#eb5a46",
              },
            }}
            onClick={batteryConfig}
          >
            Create Your Battery Configuration
          </Button>
        </div>
        <div className="rounded-md p-8 flex flex-col gap-8 items-center justify-between w-[30%] max-lg:w-[60%] medium:w-[70%] max-sm:w-[80%] shadow-[0px_0px_11px_0px_#e8442d]">
          <div className="flex flex-row item-center justify-between w-full max-md:flex-col max-md:items-start max-md:gap-2">
            <label htmlFor="voltage" className="max-md:w-full max-md:text-left text-black font-semibold">
              Enter Cell Type
            </label>
            <div className="flex flex-row justify-center items-center w-1/2 max-md:w-full">
              <Select
                value={cellType}
                name="cellType"
                className="max-md:w-full"
                onChange={(e) => setCellType(e.target.value)}
                id="cellType"
                fullWidth
                size="small"
                sx={{
                  backgroundColor: "white",
                  fontWeight: "700",
                  fontFamily: "Bai Jamjuree",
                }}
              >
                <MenuItem value={"Cylindrical"} sx={{ fontWeight: "700", fontFamily: "Bai Jamjuree" }}>
                  Cylindrical
                </MenuItem>
                <MenuItem value={"Pouch"} sx={{ fontWeight: "700", fontFamily: "Bai Jamjuree" }}>
                  Pouch
                </MenuItem>
                <MenuItem value={"Prismatic"} sx={{ fontWeight: "700", fontFamily: "Bai Jamjuree" }}>
                  Prismatic
                </MenuItem>
              </Select>
            </div>
          </div>
          <div className="flex flex-row item-center justify-between w-full max-md:flex-col max-md:items-start max-md:gap-2">
            <label htmlFor="capacity" className="max-md:w-full max-md:text-left text-black font-semibold">
              Enter Cell Condition
            </label>
            <div className="flex flex-row justify-center items-center w-1/2 max-md:w-full">
              <Select
                value={cellCondition}
                name="ellCondition"
                className="max-md:w-full"
                onChange={(e) => setCellCondition(e.target.value)}
                id="cellCondition"
                fullWidth
                size="small"
                sx={{
                  backgroundColor: "white",
                  fontWeight: "700",
                  fontFamily: "Bai Jamjuree",
                }}
              >
                <MenuItem value={"Recycled cell"} sx={{ fontWeight: "700", fontFamily: "Bai Jamjuree" }}>
                  Recycled cell
                </MenuItem>
                <MenuItem value={"New cell"} sx={{ fontWeight: "700", fontFamily: "Bai Jamjuree" }}>
                  New cell
                </MenuItem>
              </Select>
            </div>
          </div>

          <div className="flex gap-3 w-full">
            <Button
              fullWidth
              onClick={BatteryProcure}
              className="max-xsm:text-xs"
              variant="outlined"
              size="medium"
              sx={{
                borderColor: "#ff851b",
                backgroundColor: "#e8442d",
                color: "white",
                fontWeight: "900",
                fontFamily: "Bai Jamjuree",
                "&:hover": {
                  borderColor: "#ffae68",
                  backgroundColor: "#eb5a46",
                },
              }}
            >
              Procure Your Cells
            </Button>
            
            <Button
              onClick={clearSession}
              className="max-xsm:text-xs"
              variant="outlined"
              size="medium"
              sx={{
                borderColor: "#666",
                backgroundColor: "transparent",
                color: "#666",
                fontWeight: "700",
                fontFamily: "Bai Jamjuree",
                minWidth: "150px",
                "&:hover": {
                  borderColor: "#e8442d",
                  backgroundColor: "#fff",
                  color: "#e8442d",
                },
              }}
            >
              Clear Session
            </Button>
          </div>
        </div>
      </div>

      {filePlot &&
        <>
          <h1 className="text-xl text-[#e8442d] underline text-center md:text-xl lg:text-2xl">
            Battery Data Plot
          </h1>
          <PlotComponent plotData={filePlot} />
        </>
      }

      {/* Show stats and output only after button click */}
      {showOutput && totalCells > 0 && (
        <>

          {configType === 'config' ? (
            <>
              <Box sx={{ display: 'flex', justifyContent: 'center', mb: 1 }}>
                <Box
                  sx={{
                    px: 4,
                    py: 1.5,
                    backgroundColor: '#f44336d7',
                    color: 'white',
                    fontWeight: 700,
                    border: '1px solid black',
                    borderRadius: '4px',
                    cursor: 'default'
                  }}
                >
                  Schematic View
                </Box>
              </Box>

              {/* <div style={{ width: '100%', overflowX: 'auto', overflowY: 'hidden', maxHeight: '500px' }}> */}
              <BatteryCells
                cellsData={cellsData}
                setCellsData={setCellsData}
                num_cols={num_cols}
                div_html={div_html}
                isConfig={isConfig}
                cellImage={cellImage}
                totalCells={totalCells}
              />
              {/* </div> */}
            </>
          ) : (
            // For PROCURE CELLS button: Show toggle buttons and both views
            <>
              <Box sx={{ display: 'flex', justifyContent: 'center', mb: 1 }}>
                <ToggleButtonGroup
                  value={outputTabValue}
                  exclusive
                  onChange={(e, newValue) => newValue !== null && handleOutputTabChange(e, newValue)}
                  aria-label="battery output view"
                  sx={{
                    '& .MuiToggleButton-root': {
                      px: 4,
                      py: 1.5,
                      textTransform: 'none',
                      fontWeight: 700,
                      color: "black",
                      border: '1px solid black',
                      '&.Mui-selected': {
                        backgroundColor: '#f44336',
                        color: 'white',
                        fontWeight: 700,
                        '&:hover': {
                          backgroundColor: '#d32f2f',
                        },
                      },
                    },
                  }}
                >
                  <ToggleButton value={0}>SOH View</ToggleButton>
                  <ToggleButton value={1}>Pack Design</ToggleButton>
                  <ToggleButton value={2}>Inventory Distribution</ToggleButton>
                  <ToggleButton value={3}>Pack Composition</ToggleButton>
                </ToggleButtonGroup>
              </Box>

              {/* TAB PANEL 1: SoH View */}
              <Box sx={{ width: '100%', px: { xs: 2, sm: 4, md: 6 }, mb: 2 }}>
                <TabPanel value={outputTabValue} index={0}>
                  {/* <div style={{ width: '100%', overflowX: 'auto', overflowY: 'hidden', maxHeight: '500px' }}> */}
                  <BatteryCells
                    cellsData={cellsData}
                    setCellsData={setCellsData}
                    num_cols={num_cols}
                    div_html={div_html}
                    isConfig={isConfig}
                    cellImage={cellImage}
                    totalCells={totalCells}
                  />
                  {/* </div> */}
                </TabPanel>

                {/* TAB PANEL 2: Pack Design View - Enhanced with backend optimization */}
                <TabPanel value={outputTabValue} index={1}>
                  {packDesignLoading ? (
                    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', p: 4 }}>
                      <CircularProgress size={60} sx={{ color: '#e8442d' }} />
                      <Typography sx={{ ml: 2, color: '#fff', fontWeight: 700 }}>Optimizing pack design...</Typography>
                    </Box>
                  ) : (
                    <BatteryCells
                      cellsData={cellsData}
                      setCellsData={setCellsData}
                      num_cols={num_cols}
                      div_html={div_html}
                      isConfig={isConfig}
                      cellImage={cellImage}
                      totalCells={totalCells}
                      showInventoryView={true}
                      inventoryItems={predictionItems}
                      packDesignData={packDesignData}
                      numSeries={numSeries}
                      numParallel={numParallel}
                    />
                  )}
                </TabPanel>

                {/* TAB PANEL 3: Inventory Distribution - Shows all cells capacity distribution */}
                <TabPanel value={outputTabValue} index={2}>
                  <InventoryDistribution cellsData={allInventoryCells} />
                </TabPanel>

                {/* TAB PANEL 4: Pack Composition - Shows selected cells capacity distribution */}
                <TabPanel value={outputTabValue} index={3}>
                  <PackComposition packDesignData={packDesignData} />
                </TabPanel>
              </Box>
            </>
          )}
          <div className="rounded-md p-8 w-[70%] max-sm:w-[90%] shadow-[0px_0px_20px_0px_#e8442d] border-2 border-[#ff851b]">
            <div className="grid grid-cols-5 max-lg:grid-cols-3 max-md:grid-cols-2 max-sm:grid-cols-1 gap-4">
              <div className="border-2 border-black rounded-md p-3 text-center bg-white">
                <p className="text-sm font-semibold mb-1">Configuration</p>
                <p className="text-[#e8442d] text-lg font-semibold">
                  {numSeries}S x {numParallel}P = {totalCells} Cells
                </p>
              </div>
              <div className="border-2 border-black rounded-md p-3 text-center bg-white">
                <p className="text-sm font-semibold mb-1">Pack Voltage</p>
                <p className="text-[#e8442d] text-lg font-semibold">{packVoltage} V</p>
              </div>
              <div className="border-2 border-black rounded-md p-3 text-center bg-white">
                <p className="text-sm font-semibold mb-1">Pack Capacity</p>
                <p className="text-[#e8442d] text-lg font-semibold">{packCapacity} AH</p>
              </div>
              <div className="border-2 border-black rounded-md p-3 text-center bg-white">
                <p className="text-sm font-semibold mb-1">Pack Weight</p>
                <p className="text-[#e8442d] text-lg font-semibold">{packWeight} Kg</p>
              </div>
              <div className="border-2 border-black rounded-md p-3 text-center bg-white">
                <p className="text-sm font-semibold mb-1">Pack Price</p>
                <p className="text-[#e8442d] text-lg font-semibold">{packPrice} $</p>
              </div>
            </div>
          </div>
        </>
      )}

      <p className="text-lg text-center md:text-xl lg:text-3xl w-[80%] text-black">
        We offer fully-characterized recycled cells with decent SoH at bargain price{" "}
        <span className="text-[#e8442d]">(approx. 50% cheaper)</span>
      </p>
      <p className="text-sm text-center md:text-lg lg:text-xl w-[70%] text-black">
        Our CellScope engine will fetch most-uniform bunch of cells for your pack from our
        warehouse, which stores large number of fully-characterized new and old cells.
      </p>

      {!isConfig && cellsData && cellsData.length !== 0 && (
        <>
          <h1 className="text-xl text-[#e8442d] text-center md:text-2xl lg:text-4xl">
            Battery Pack Cell Variability Analysis
          </h1>
          <Box sx={{ width: '100%' }}>
            <Tabs
              value={tabValue}
              onChange={handleTabChange}
              centered
              indicatorColor="secondary"
              textColor="inherit"
              variant="fullWidth"
              sx={{
                '& .MuiTab-root': {
                  fontWeight: 'bold',
                  fontFamily: 'Bai Jamjuree, sans-serif',
                },
              }}
            >
              <Tab label="Capacity vs Cycle Plots" />
              <Tab label="IR vs Cycle Plots" />
              <Tab label="Master Capacity vs Cycle" />
              <Tab label="Master IR vs Cycle" />
            </Tabs>
          </Box>

          {tabValue === 0 && (
            <>
              <h1 className="text-xl text-[#e8442d] underline text-center md:text-xl lg:text-2xl">
                Cells Variability Capacity vs Cycle Plots
              </h1>
              <BatteryCellPlots
                cellsData={cellsData}
                num_cols={num_cols}
                totalCells={totalCells}
                url="battery_variance_capacity_vs_cycle"
                plotType="Capacity vs Cycle Plot"
              />
            </>
          )}
          {tabValue === 1 && (
            <>
              <h1 className="text-xl text-[#e8442d] underline text-center md:text-xl lg:text-2xl">
                Modules Variability IR vs Cycle Plots
              </h1>
              <BatteryCellPlots
                cellsData={cellsData}
                num_cols={num_cols}
                totalCells={totalCells}
                url="battery_variance_ir_vs_cycle"
                plotType="IR vs Cycle Plot"
              />
            </>
          )}
          {tabValue === 2 && (
            <>
              <div className="flex flex-col border border-[#e8432d29] bg-[#111111] rounded-lg w-[100%] py-5">
                <h1 className="text-xl text-[#ffffff] underline text-center md:text-xl lg:text-2xl">
                  Master Plot Capacity vs Cycle Plots
                </h1>
                <BatteryCellMasterPlot
                  cellsData={cellsData}
                  num_cols={num_cols}
                  totalCells={totalCells}
                  url="battery_variance_master_capacity_vs_cycle"
                />
              </div>
            </>
          )}
          {tabValue === 3 && (
            <>
              <div className="flex flex-col border border-[#e8432d29] bg-[#111111] rounded-lg w-[100%] py-5">
                <h1 className="text-xl text-[#ffffff] underline text-center md:text-xl lg:text-2xl">
                  Master Plot IR vs Cycle Plots
                </h1>
                <BatteryCellMasterPlot
                  cellsData={cellsData}
                  num_cols={num_cols}
                  totalCells={totalCells}
                  url="battery_variance_master_ir_vs_cycle"
                />
              </div>
            </>
          )}
        </>
      )}

      <GhostLinks orderData={{
        numberOfCells: totalCells,
        pricePerCell: cellCondition === "Recycled cell" ? 1 : 1,
        cellType: cellType,
        cellCondition: cellCondition,
        packVoltage: packVoltage,
        packCapacity: packCapacity
      }} />

      <div className="text-black pt-4 flex flex-col gap-12 items-center justify-center">
        <h1 className="text-xl text-[#e8442d] text-center md:text-2xl lg:text-4xl">
          BatteryScope: Battery Rapid Prototyping powered by Digital Twins
        </h1>
        <p className="text-sm  md:text-lg lg:text-xl w-[85%] text-justify text-black">
          Our Physical Twinning service helps you do rapid Battery Prototyping for any climatic
          condition on earth and beyond. Just enter your battery specs, pick fully characterized cells
          from our Cell store, build a digital twin and analyse the performance. Once you are happy,
          let us build a Physical prototype and collect data in our lab using Battery Cycler, Thermal
          chamber, Potentiostat, etc. under real-world climatic conditions. We will stream the data
          back to you through our portal quickly so that you can have real-fun with your battery.
        </p>
      </div>

    </div>
  );
};

export default BatteryConfig;