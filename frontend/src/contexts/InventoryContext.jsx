import React, { createContext, useState, useContext, useEffect } from 'react';
import { saveToIndexedDB, loadFromIndexedDB } from "../utils/indexedDB";

const InventoryContext = createContext();

export const useInventory = () => {
  const context = useContext(InventoryContext);
  if (!context) {
    throw new Error('useInventory must be used within InventoryProvider');
  }
  return context;
};

export const InventoryProvider = ({ children }) => {
  const [inventoryItems, setInventoryItems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedCellData, setSelectedCellData] = useState(null);
  const [trainingItems, setTrainingItems] = useState([]);
  const [predictionItems, setPredictionItems] = useState([]);
  const [pendingCaptureData, setPendingCaptureData] = useState(null);
  const [lastProcessedFile, setLastProcessedFile] = useState(null);

  // Load from IndexedDB on mount
  // REPLACE the existing useEffect for loading with:
  useEffect(() => {
    const loadData = async () => {
      try {
        const savedData = await loadFromIndexedDB();
        if (savedData) {
          setTrainingItems(savedData.trainingItems || []);
          setPredictionItems(savedData.predictionItems || []);
          setLastProcessedFile(savedData.lastProcessedFile || null);
        }
      } catch (error) {
        console.error('Failed to load inventory:', error);
      } finally {
        setIsLoading(false);
      }
    };
    loadData();
  }, []);

  // Save to IndexedDB whenever items change
  useEffect(() => {
    if (!isLoading) {
      const dataToSave = {
        trainingItems,
        predictionItems,
        lastProcessedFile
      };
      saveToIndexedDB(dataToSave).catch(error => {
        console.error('Failed to save inventory:', error);
      });
    }
  }, [trainingItems, predictionItems, isLoading, lastProcessedFile]);

  // Helper function to get random cell image
  const getRandomCellImage = () => {
    // Use existing images from inventory if available
    const existingImages = inventoryItems
      .filter(item => item.image)
      .map(item => item.image);

    if (existingImages.length > 0) {
      return existingImages[Math.floor(Math.random() * existingImages.length)];
    }

    // Fallback to placeholder SVG
    return 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHJlY3Qgd2lkdGg9IjYwIiBoZWlnaHQ9IjYwIiBmaWxsPSIjMzMzIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtc2l6ZT0iMTQiIGZpbGw9IiNlODQ0MmQiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj5DYXR0ZXJ5PC90ZXh0Pjwvc3ZnPg==';
  };

  // Add inventory item from captured or selected file
  const addInventoryItemFromFile = (fileData) => {
    // *** USE PROVIDED ID/BARCODE DIRECTLY - NO GENERATION ***
    const newItem = {
      id: fileData.id || fileData.barcode, // Use scanned barcode
      barcode: fileData.barcode, // Use scanned barcode
      makeModel: fileData.makeModel || 'Unknown',
      cellChemistry: fileData.cellChemistry || 'Unknown',
      specifiedCapacity: fileData.specifiedCapacity || 'Unknown',
      cellFormat: fileData.cellFormat || 'Unknown',
      image: fileData.image || getRandomCellImage(),
      soh: fileData.soh_capacity || null,
      timestamp: fileData.timestamp || new Date().toISOString(),
      dataSource: 'file',
      filename: fileData.filename,
      filepath: fileData.filepath
    };

    console.log('Adding item to inventory:', newItem);

    if (fileData.sample_type === 'reference') {
      setTrainingItems(prev => [...prev, newItem]);
    } else {
      setPredictionItems(prev => [...prev, newItem]);
    }

    // Update lastProcessedFile to prevent duplicates
    setLastProcessedFile(fileData.filepath);
  };

  // Monitor folders for new captured files
  const checkForNewCapturedFiles = async () => {
    try {
      const response = await fetch('http://localhost:5000/get-recent-files');
      const data = await response.json();

      if (data.success && data.newFile) {
        // Check if this file hasn't been processed yet
        if (lastProcessedFile !== data.newFile.filepath) {
          addInventoryItemFromFile(data.newFile);
        }
      }
    } catch (error) {
      console.error('Error checking for new files:', error);
    }
  };

  const addInventoryItem = (itemData) => {
    const newItem = {
      id: Date.now().toString(),
      barcode: `BC${Date.now()}`,
      timestamp: new Date().toISOString(),
      soh: null,
      ...itemData
    };
    setInventoryItems(prev => [newItem, ...prev]);
    return newItem.id;
  };

  const updateInventoryItem = (id, updates) => {
    setInventoryItems(prev =>
      prev.map(item => item.id === id ? { ...item, ...updates } : item)
    );
  };

  const deleteInventoryItem = async (id, type = 'training') => {
    // Find the item to get its filepath
    let item;
    if (type === 'training') {
      item = trainingItems.find(i => i.id === id);
    } else if (type === 'prediction') {
      item = predictionItems.find(i => i.id === id);
    }

    // If item has a filepath, delete the actual file from backend
    if (item && item.filepath) {
      try {
        const response = await fetch('http://127.0.0.1:5000/delete-inventory-file', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            filepath: item.filepath,
            sample_type: type
          })
        });

        const data = await response.json();
        
        if (!data.success) {
          console.error('Failed to delete file:', data.error);
          alert(`Failed to delete file: ${data.error}`);
          return;
        }
        
        console.log('✅ File deleted from disk:', item.filepath);
      } catch (error) {
        console.error('Error deleting file:', error);
        alert(`Error deleting file: ${error.message}`);
        return;
      }
    }

    // Remove from state
    if (type === 'training') {
      setTrainingItems(prev => prev.filter(item => item.id !== id));
      console.log('Deleted from Training inventory:', id);
    } else if (type === 'prediction') {
      setPredictionItems(prev => prev.filter(item => item.id !== id));
      console.log('Deleted from Prediction inventory:', id);
    }

    // Also remove from main inventoryItems array if it exists there
    setInventoryItems(prev => prev.filter(item => item.id !== id));
  };

  const getInventoryItem = (id) => {
    return inventoryItems.find(item => item.id === id);
  };

  const generateBulkCells = (count = 300) => {
    const makes = ['LG'];
    const models = ['21700'];
    const chemistries = ['NMC'];

    // Get existing images from current inventory
    const existingImages = inventoryItems
      .filter(item => item.image)
      .map(item => item.image);

    const newCells = [];

    for (let i = 0; i < count; i++) {
      const soh = Math.floor(Math.random() * 31) + 70;  // Generates SOH between 70-100
      const make = makes[Math.floor(Math.random() * makes.length)];
      const model = models[Math.floor(Math.random() * models.length)];
      const chemistry = chemistries[Math.floor(Math.random() * chemistries.length)];

      // Use existing images randomly, or fallback to placeholder
      const randomImage = existingImages.length > 0
        ? existingImages[Math.floor(Math.random() * existingImages.length)]
        : 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHJlY3Qgd2lkdGg9IjYwIiBoZWlnaHQ9IjYwIiBmaWxsPSIjMzMzIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtc2l6ZT0iMTQiIGZpbGw9IiNlODQ0MmQiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj5CYXR0ZXJ5PC90ZXh0Pjwvc3ZnPg==';

      newCells.push({
        id: `${Date.now()}_${i}_${Math.random()}`,
        barcode: `BC${Date.now()}${String(i).padStart(4, '0')}`,
        makeModel: `${make} ${model}`,
        cellChemistry: chemistry,
        soh: soh,
        image: randomImage,
        timestamp: new Date().toISOString()
      });
    }
    setInventoryItems(prev => [...newCells, ...prev]);
  };

  const addTrainingItem = (itemData) => {
    const newItem = {
      id: Date.now().toString(),
      barcode: `TRN${Date.now()}`,
      timestamp: new Date().toISOString(),
      soh: itemData.soh || null, // Don't generate random SOH - use provided or null
      image: itemData.image || getRandomCellImage(), // Use provided image or random
      ...itemData,
      type: 'training'
    };
    setTrainingItems(prev => [newItem, ...prev]);
    return newItem.id;
  };

  const addPredictionItem = (itemData) => {
    const newItem = {
      id: Date.now().toString(),
      barcode: `PRD${Date.now()}`,
      timestamp: new Date().toISOString(),
      soh: null, // No SOH for prediction items
      image: itemData.image || getRandomCellImage(), // Use provided image or random
      ...itemData,
      type: 'prediction'
    };
    setPredictionItems(prev => [newItem, ...prev]);
    return newItem.id;
  };

  // Update training items (for batch SOH prediction)
  const updateTrainingItems = (updatedItems) => {
    setTrainingItems(updatedItems);
  };

  // Update prediction items (for batch SOH prediction)
  const updatePredictionItems = (updatedItems) => {
    setPredictionItems(updatedItems);
  };

  return (
    <InventoryContext.Provider value={{
      inventoryItems,
      trainingItems,
      predictionItems,
      addInventoryItem,
      addTrainingItem,
      addPredictionItem,
      addInventoryItemFromFile,
      checkForNewCapturedFiles,
      updateInventoryItem,
      deleteInventoryItem,
      getInventoryItem,
      generateBulkCells,
      selectedCellData,
      setSelectedCellData,
      pendingCaptureData,
      setPendingCaptureData,
      updateTrainingItems,
      updatePredictionItems,
      isLoading
    }}>
      {children}
    </InventoryContext.Provider>
  );
};