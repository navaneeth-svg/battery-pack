// config/api.js

// Detect environment
const isProduction = process.env.NODE_ENV === 'production';
const isLocalDevelopment = window.location.hostname === 'localhost' || 
                          window.location.hostname === '127.0.0.1';

// Backend URL Configuration
const LOCAL_BACKEND = 'http://127.0.0.1:5000';
const CLOUD_BACKEND = process.env.REACT_APP_CLOUD_BACKEND_URL || 'https://your-cloud-backend.com'; // Optional cloud backend

// Use local backend for all hardware operations
// Even when frontend is deployed to cloud, hardware operations need local backend
const BASE_URL = LOCAL_BACKEND;

export const API_ENDPOINTS = {
  // Battery Pack Designer Endpoints
  FETCH_INVENTORY: `${BASE_URL}/fetch-inventory`,
  DESIGN_BATTERY_PACK: `${BASE_URL}/design-battery-pack`,
  HEALTH_CHECK: `${BASE_URL}/health`,
  
  // Device Connection Endpoints (Always Local)
  CONNECT_PICOSCOPE: `${BASE_URL}/connect-picoscope`,
  CONNECT_POCKETVNA: `${BASE_URL}/connect-pocketvna`,
  DISCONNECT_DEVICE: `${BASE_URL}/disconnect-device`,
  DEVICE_STATUS: `${BASE_URL}/device-status`,

  START_FAST_SCAN: `${BASE_URL}/start-fast-scan`,
  
  // Live Data Acquisition (Always Local - hardware dependent)
  START_LIVE_CAPTURE: `${BASE_URL}/start-live-capture`,
  ANALYZE_LIVE_DATA: `${BASE_URL}/analyze-live-data`,
  
  // File Analysis Endpoints (Local - for local file processing)
  ANALYZE_UNIFIED: `${BASE_URL}/analyze-unified`,
  ANALYZE_DATASET: `${BASE_URL}/analyze-dataset`,
  ANALYZE_MULTIPLE_BINARY: `${BASE_URL}/analyze-multiple-binary`,
  
  // Training Endpoints (Local)
  UPLOAD_TRAINING_DATA: `${BASE_URL}/upload_training_data`,
  
  // Visualization Endpoints (Local)
  GENERATE_TIME_SERIES: `${BASE_URL}/generate-time-series`,
  GET_HOLOGRAM_DATA: `${BASE_URL}/get-hologram-data`,
  GET_RECENT_FILES: `${BASE_URL}/get-recent-files`,
  
  // Health Check (Local)
  HEALTH: `${BASE_URL}/health`,

  // List available models
  LIST_MODELS: `${BASE_URL}/list-models`,
  
  // Inventory file listing
  LIST_TRAINING_FILES: `${BASE_URL}/list-training-files`,
  LIST_PREDICTION_FILES: `${BASE_URL}/list-prediction-files`,
  
  // Batch SOH Prediction
  BATCH_PREDICT_SOH: `${BASE_URL}/batch-predict-soh`,
  CANCEL_BATCH_PREDICTION: `${BASE_URL}/cancel-batch-prediction`,
  
  // Manual SOH Prediction (single scan)
  PREDICT_SOH: `${BASE_URL}/predict-soh`,
  
  // File Management
  DELETE_INVENTORY_FILE: `${BASE_URL}/delete-inventory-file`
};

// Connection status helper
export const checkLocalBackendStatus = async () => {
  try {
    const response = await fetch(API_ENDPOINTS.HEALTH, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    if (response.ok) {
      const data = await response.json();
      return {
        connected: true,
        status: 'healthy',
        message: data.message || 'Backend connected',
        picoscope_available: data.picoscope_available,
        pocketvna_available: data.pocketvna_available
      };
    }
    
    return {
      connected: false,
      status: 'error',
      message: 'Backend not responding'
    };
  } catch (error) {
    return {
      connected: false,
      status: 'error',
      message: 'Cannot connect to local backend. Please ensure BatteryScope-C-Local.exe is running.'
    };
  }
};

// Enhanced API call helper function with better error handling
export const apiCall = async (url, options = {}) => {
  try {
    // Get JWT token from localStorage
    const token = localStorage.getItem('auth_token');
    
    // Check if making a file upload request
    const isFileUpload = options.body instanceof FormData;
    
    const response = await fetch(url, {
      headers: isFileUpload ? {
        // Don't set Content-Type for FormData - browser will set it with boundary
        ...(token && { 'Authorization': `Bearer ${token}` }),
        ...options.headers,
      } : {
        'Content-Type': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` }),
        ...options.headers,
      },
      ...options,
    });

    if (!response.ok) {
      // Try to get error message from response
      let errorMessage = `HTTP error! status: ${response.status}`;
      try {
        const errorData = await response.json();
        errorMessage = errorData.error || errorData.message || errorMessage;
      } catch (e) {
        // If response is not JSON, use status text
        errorMessage = response.statusText || errorMessage;
      }
      
      throw new Error(errorMessage);
    }

    return await response.json();
  } catch (error) {
    console.error(`API call failed for ${url}:`, error);
    
    // Provide user-friendly error messages
    if (error.message.includes('Failed to fetch') || error.message.includes('NetworkError')) {
      throw new Error('Cannot connect to local backend. Please ensure BatteryScope-C-Local.exe is running on your computer.');
    }
    
    throw error;
  }
};

// Helper function to check if local backend is required for current operation
export const isLocalBackendRequired = (endpoint) => {
  const localRequiredEndpoints = [
    'CONNECT_PICOSCOPE',
    'CONNECT_POCKETVNA',
    'START_LIVE_CAPTURE',
    'DEVICE_STATUS'
  ];
  
  const endpointKey = Object.keys(API_ENDPOINTS).find(
    key => API_ENDPOINTS[key] === endpoint
  );
  
  return localRequiredEndpoints.includes(endpointKey);
};

// Export configuration info for debugging
export const getAPIConfig = () => ({
  environment: isProduction ? 'production' : 'development',
  isLocalDevelopment,
  baseURL: BASE_URL,
  endpoints: API_ENDPOINTS,
  localBackendRequired: true,
  instructions: isProduction 
    ? 'Running in production. Ensure BatteryScope-C-Local.exe is running for hardware access.'
    : 'Running in development. Backend should be running on localhost:5000'
});

// Log configuration on load (only in development)
if (!isProduction) {
  console.log('🔧 BatteryScope-C API Configuration:', getAPIConfig());
}

export default {
  API_ENDPOINTS,
  apiCall,
  checkLocalBackendStatus,
  isLocalBackendRequired,
  getAPIConfig
};