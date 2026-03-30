/**
 * IndexedDB utility functions
 * Simplified version for battery pack designer standalone app
 */

const DB_NAME = 'BatteryPackDesigner';
const STORES = {
  PREDICTIONS: 'predictions',
  TRAINING: 'training'
};

// Initialize IndexedDB
const openDB = () => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, 1);
    
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
    
    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      
      // Create object stores if they don't exist
      if (!db.objectStoreNames.contains(STORES.PREDICTIONS)) {
        db.createObjectStore(STORES.PREDICTIONS, { keyPath: 'id' });
      }
      if (!db.objectStoreNames.contains(STORES.TRAINING)) {
        db.createObjectStore(STORES.TRAINING, { keyPath: 'id' });
      }
    };
  });
};

// Save data to IndexedDB
export const saveToIndexedDB = async (storeName, data) => {
  try {
    const db = await openDB();
    const transaction = db.transaction([storeName], 'readwrite');
    const store = transaction.objectStore(storeName);
    
    // Clear existing data first
    await store.clear();
    
    // If data is an array, save each item
    if (Array.isArray(data)) {
      for (const item of data) {
        if (item.id || item.barcode) {
          await store.put({ ...item, id: item.id || item.barcode });
        }
      }
    } else if (data && (data.id || data.barcode)) {
      await store.put({ ...data, id: data.id || data.barcode });
    }
    
    return { success: true };
  } catch (error) {
    console.error('Error saving to IndexedDB:', error);
    return { success: false, error };
  }
};

// Load data from IndexedDB
export const loadFromIndexedDB = async (storeName) => {
  try {
    const db = await openDB();
    const transaction = db.transaction([storeName], 'readonly');
    const store = transaction.objectStore(storeName);
    
    return new Promise((resolve, reject) => {
      const request = store.getAll();
      request.onsuccess = () => resolve(request.result || []);
      request.onerror = () => reject(request.error);
    });
  } catch (error) {
    console.error('Error loading from IndexedDB:', error);
    return [];
  }
};

// Delete data from IndexedDB
export const deleteFromIndexedDB = async (storeName, id) => {
  try {
    const db = await openDB();
    const transaction = db.transaction([storeName], 'readwrite');
    const store = transaction.objectStore(storeName);
    
    await store.delete(id);
    
    return { success: true };
  } catch (error) {
    console.error('Error deleting from IndexedDB:', error);
    return { success: false, error };
  }
};

// Clear all data from a store
export const clearStore = async (storeName) => {
  try {
    const db = await openDB();
    const transaction = db.transaction([storeName], 'readwrite');
    const store = transaction.objectStore(storeName);
    
    await store.clear();
    
    return { success: true };
  } catch (error) {
    console.error('Error clearing store:', error);
    return { success: false, error };
  }
};
