# Battery Pack Designer - Standalone Package

This folder contains all files needed to deploy the Battery Pack Designer as a separate application.

## 📦 Package Contents

### Frontend Components
Located in `frontend/components/PhysicalTwinning/`:
- `index.jsx` - Main entry component
- `BatteryConfig.jsx` - Battery pack configuration interface
- `ConfigCells.jsx` - Cell configuration logic
- `ProcureCells.jsx` - Cell procurement interface
- `BatteryCells.jsx` - Cell selection and display
- `BatteryCellPlots.jsx` - Individual cell performance plots
- `BatteryCellMasterPlot.jsx` - Master performance visualization
- `DynamicBoxes.jsx` - Dynamic pack visualization
- `PackComposition.jsx` - Pack structure composition view
- `InventoryDistribution.jsx` - Inventory distribution charts
- `GhostLinks.jsx` - Navigation helpers
- `dummyData.js` - Sample data for testing
- `dummy.css` - Component styles

### Backend API
Located in `backend/`:
- `api_endpoints.py` - Battery pack design API endpoints
- `pack_designer.py` - Core pack design algorithm

### Configuration
Located in `config/`:
- `api.js` - API endpoint configuration (point to optv1 VPS)
- `credentials.py` - Authentication configuration
- `deployment.md` - Deployment instructions

### Context/State Management
Located in `frontend/contexts/`:
- `InventoryContext.jsx` - Cell inventory state management
- `auth.jsx` - Authentication context

## 🚀 Deployment Options

### Option 1: Deploy as Standalone App to optv1 VPS
1. Create new Vite/React app
2. Copy `frontend/` contents to `src/`
3. Copy `backend/` to separate Flask app
4. Deploy both to optv1 VPS
5. Configure API endpoints in `config/api.js`

### Option 2: Keep in Main App, Route to optv1
1. Configure USER_ENDPOINTS to route specific users to optv1
2. Deploy full app to optv1
3. Restrict UI to show only battery pack designer routes

## 📋 Dependencies

### Frontend
```json
{
  "@mui/material": "^5.15.14",
  "@mui/icons-material": "^5.15.14",
  "react": "^18.2.0",
  "react-router-dom": "^6.22.3",
  "axios": "^1.6.8"
}
```

### Backend
```txt
Flask==3.0.0
flask-cors==4.0.0
bcrypt==4.0.1
```

## 🔗 Integration Points

### With Main App
- **Shared Auth**: Uses same authentication system (`credentials.py`)
- **Shared Inventory**: Pulls cell data from prediction inventory
- **API Endpoint**: `/design-battery-pack` (backend/app.py line 5344)

### With optv1 VPS
- **Database**: Connects to optv1 cell inventory database
- **Storage**: Stores pack configurations on optv1
- **API**: Backend runs on optv1, frontend calls optv1 endpoints

## 📊 Data Flow

```
User Login → Battery Config Page → Select Cells from Inventory
    ↓
Configure Pack (voltage, capacity, series, parallel)
    ↓
POST /design-battery-pack (with inventory cells)
    ↓
Backend Algorithm (sorts cells by composite score, distributes optimally)
    ↓
Returns: Pack matrix, performance metrics, visualizations
    ↓
Display: Pack composition, cell distribution, performance plots
```

## 🎯 Current Route

- **Main App**: `http://localhost:5173/#/auth/BatteryScope`
- **Component**: `PhysicalTwinning` (renders `BatteryConfig`)
- **Protected**: Requires authentication

## 🔧 Configuration for optv1

Edit `config/api.js`:
```javascript
const BASE_URL = 'https://optv1.yourdomain.com:5000';
```

Edit `config/credentials.py`:
```python
USERS = {
    'optv1_user': 'hashed_password',
    'admin': 'admin_hashed_password'
}

USER_ENDPOINTS = {
    'optv1_user': '/optv1',
    'admin': '/optv1'
}
```

## 📝 Next Steps

1. **Review Files**: Check all copied files are complete
2. **Test Locally**: Run battery pack designer in current app
3. **Plan Deployment**: Decide on deployment strategy (Option 1 or 2)
4. **Configure VPS**: Set up optv1 VPS environment
5. **Deploy**: Deploy to optv1 following deployment.md

## ⚠️ Important Notes

- All files copied from main project on March 26, 2026
- Backend endpoint extracted from `backend/app.py` lines 5344-5600
- Inventory integration requires BatteryScopeV2-C inventory system
- Authentication uses bcrypt hashed passwords
- Designed for optv1 VPS deployment

## 📧 Contact

For questions about deployment or integration, refer to main project documentation.

---

**Created**: March 26, 2026
**Version**: 1.0.0
**Source Project**: ThinkClock BatteryScope
