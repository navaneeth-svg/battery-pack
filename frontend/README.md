# Battery Pack Designer - Frontend

## 🚀 Quick Start

### Development
```bash
npm install
npm run dev
```
App will run on `http://localhost:5173`

### Production Build
```bash
npm run build
```
Output will be in `dist/` folder

---

## 📁 Project Structure

```
frontend/
├── index.html              # Entry HTML
├── package.json            # Dependencies
├── vite.config.js          # Vite configuration
├── src/
│   ├── main.jsx            # React entry point
│   ├── App.jsx             # Main app component
│   ├── App.css             # App styles
│   ├── index.css           # Global styles
│   ├── components/
│   │   └── PhysicalTwinning/    # Battery pack designer components (13 files)
│   ├── contexts/
│   │   ├── auth.jsx             # Authentication context
│   │   └── InventoryContext.jsx # Inventory state management
│   └── config/
│       └── api.js               # API endpoints (UPDATE FOR PRODUCTION!)
└── dist/                   # Build output (generated)
```

---

## ⚙️ Configuration

### API Endpoint

Edit `src/config/api.js` to point to your backend:

```javascript
// For local development
const BASE_URL = 'http://localhost:5000';

// For production (optv1)
const BASE_URL = 'https://optv1.yourdomain.com:5000';
```

Or use environment variables:

```javascript
const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
```

Then create `.env.production`:
```
VITE_API_URL=https://optv1.yourdomain.com:5000
```

---

## 🔧 Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server (port 5173) |
| `npm run build` | Build for production |
| `npm run preview` | Preview production build locally |
| `npm run lint` | Run ESLint |

---

## 📦 Dependencies

### Core Libraries
- **React 18** - UI framework
- **React Router DOM** - Routing
- **Material-UI (MUI)** - UI components
- **Axios** - HTTP client
- **D3** - Data visualization

### Build Tools
- **Vite** - Fast build tool
- **ESLint** - Code linting

---

## 🌐 Backend Integration

This frontend expects a backend API running at the configured `BASE_URL` with the following endpoint:

### POST /design-battery-pack

**Request:**
```json
{
  "cells": [...],  // Array of cell objects
  "num_series": 7,
  "num_parallel": 22
}
```

**Response:**
```json
{
  "success": true,
  "pack_matrix": [[...]],
  "column_totals": {...},
  "statistics": {...},
  "warnings": [...]
}
```

---

## 🧪 Testing Locally

1. **Start backend:**
   ```bash
   cd ../backend
   python pack_designer_api.py
   ```
   Backend runs on `http://localhost:5000`

2. **Start frontend:**
   ```bash
   npm run dev
   ```
   Frontend runs on `http://localhost:5173`

3. **Test:**
   - Open `http://localhost:5173` in browser
   - Configure pack (voltage, capacity, series, parallel)
   - Select cells from inventory
   - Click "Procure Cells" to design pack

---

## 📱 Routes

| Route | Component | Description |
|-------|-----------|-------------|
| `/` | Redirect | Redirects to `/pack-designer` |
| `/pack-designer` | PhysicalTwinning | Battery pack configuration interface |

---

## 🎨 Styling

- Global styles in `index.css`
- Component-specific styles in component files
- MUI theme customized for dark mode
- Primary color: `#e8442d` (ThinkClock red)

---

## 🔐 Authentication

Currently uses `InventoryContext` from BatteryScopeV2-C. For standalone deployment:

1. **Option A:** Implement simple token-based auth
2. **Option B:** Integrate with main app's auth system
3. **Option C:** Use OAuth (Google, GitHub, etc.)

---

## 🚀 Deployment

### Build for Production

```bash
npm run build
```

This creates `dist/` folder with:
- Optimized JavaScript bundles
- Minified CSS
- Static assets
- `index.html` entry point

### Deploy to Static Hosting

**Option 1: Nginx**
```bash
# Copy dist/ to web server
scp -r dist/* user@server:/var/www/pack-designer/
```

**Option 2: Firebase Hosting**
```bash
npm install -g firebase-tools
firebase init hosting
firebase deploy
```

**Option 3: Vercel**
```bash
npm install -g vercel
vercel --prod
```

---

## 🐛 Troubleshooting

### "Cannot connect to backend"

1. Check backend is running: `curl http://localhost:5000/health`
2. Check API URL in `config/api.js`
3. Check CORS is enabled on backend
4. Check browser console for errors

### "Inventory not loading"

1. Ensure `InventoryContext` is properly initialized
2. Check backend returns cell data in expected format
3. Verify cell objects have required properties: `capacity`, `soh`, `ir`

### Build fails

1. Delete `node_modules` and reinstall: `rm -rf node_modules && npm install`
2. Clear Vite cache: `rm -rf .vite`
3. Update dependencies: `npm update`

---

## 📚 Learn More

- [Vite Documentation](https://vitejs.dev/)
- [React Documentation](https://react.dev/)
- [Material-UI Documentation](https://mui.com/)
- [React Router Documentation](https://reactrouter.com/)

---

## 🤝 Integration with Main App

This frontend can be used standalone OR integrated back into main ThinkClock app:

**Standalone:**
- Separate deployment
- Independent auth
- Pulls data via API

**Integrated:**
- Route in main app: `/auth/BatteryScope`
- Shared auth context
- Direct access to inventory

---

**Need help?** See `../DEPLOYMENT.md` for full deployment instructions.
