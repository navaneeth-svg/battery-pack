# Battery Pack Designer Deployment Guide

## 🎯 Deployment to optv1 VPS

This guide explains how to deploy the Battery Pack Designer as a standalone application on the optv1 VPS.

---

## 📋 Prerequisites

### VPS Requirements
- Ubuntu 20.04+ or Windows Server
- Python 3.9+
- Node.js 18+
- 2GB RAM minimum
- 10GB disk space

### Access Requirements
- SSH access to optv1 VPS
- Sudo/admin privileges
- Firewall configured (ports 80, 443, 5000)

---

## 🚀 Deployment Options

### Option 1: Standalone Deployment (Recommended)

Deploy battery pack designer as a completely separate application.

**Pros:**
- ✅ Complete isolation
- ✅ Independent scaling
- ✅ Easier to maintain
- ✅ Can use different tech stack later

**Cons:**
- ⚠️ Requires separate authentication
- ⚠️ Need to sync cell inventory data
- ⚠️ More infrastructure to manage

### Option 2: Integrated Deployment

Deploy the full main app to optv1, configure to show only battery pack designer.

**Pros:**
- ✅ Shared authentication
- ✅ Direct access to inventory
- ✅ Less setup time

**Cons:**
- ⚠️ More resources needed
- ⚠️ Tightly coupled

---

## 📦 Option 1: Standalone Deployment Steps

### Step 1: Create New React App

```bash
# On your local machine
npm create vite@latest battery-pack-designer -- --template react
cd battery-pack-designer

# Copy frontend components
cp -r ../battery-pack-designer/frontend/components ./src/
cp -r ../battery-pack-designer/frontend/contexts ./src/
cp ../battery-pack-designer/config/api.js ./src/config/

# Install dependencies
npm install @mui/material @mui/icons-material @emotion/react @emotion/styled
npm install react-router-dom axios
```

### Step 2: Create Main App Component

Create `src/App.jsx`:

```jsx
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { PhysicalTwinning } from './components/PhysicalTwinning';
import { InventoryProvider } from './contexts/InventoryContext';
import './App.css';

function App() {
  return (
    <BrowserRouter>
      <InventoryProvider>
        <Routes>
          <Route path="/" element={<Navigate to="/pack-designer" />} />
          <Route path="/pack-designer" element={<PhysicalTwinning />} />
        </Routes>
      </InventoryProvider>
    </BrowserRouter>
  );
}

export default App;
```

### Step 3: Update API Configuration

Edit `src/config/api.js` to point to optv1:

```javascript
const BASE_URL = 'https://optv1.yourdomain.com:5000';  // Update with actual optv1 URL

export const API_ENDPOINTS = {
  DESIGN_BATTERY_PACK: `${BASE_URL}/design-battery-pack`,
  HEALTH: `${BASE_URL}/health`,
};
```

### Step 4: Build Frontend

```bash
npm run build
```

This creates a `dist/` folder with production build.

### Step 5: Deploy Backend to optv1

```bash
# SSH to optv1
ssh user@optv1.yourdomain.com

# Create directory
mkdir -p /opt/battery-pack-designer/backend
cd /opt/battery-pack-designer/backend

# Copy backend files
# (Use scp or git to transfer files)
scp pack_designer_api.py user@optv1:/opt/battery-pack-designer/backend/
scp requirements.txt user@optv1:/opt/battery-pack-designer/backend/

# Install dependencies
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt

# Test backend
python pack_designer_api.py
# Should show: "🚀 Battery Pack Designer API starting..."
```

### Step 6: Configure Backend as Service

Create `/etc/systemd/system/pack-designer-api.service`:

```ini
[Unit]
Description=Battery Pack Designer API
After=network.target

[Service]
Type=simple
User=www-data
WorkingDirectory=/opt/battery-pack-designer/backend
Environment="PATH=/opt/battery-pack-designer/backend/venv/bin"
ExecStart=/opt/battery-pack-designer/backend/venv/bin/python pack_designer_api.py
Restart=always

[Install]
WantedBy=multi-user.target
```

Enable and start:

```bash
sudo systemctl daemon-reload
sudo systemctl enable pack-designer-api
sudo systemctl start pack-designer-api
sudo systemctl status pack-designer-api
```

### Step 7: Deploy Frontend

```bash
# Copy dist folder to optv1
scp -r dist/* user@optv1:/var/www/battery-pack-designer/

# Configure Nginx
sudo nano /etc/nginx/sites-available/pack-designer
```

Nginx configuration:

```nginx
server {
    listen 80;
    server_name optv1.yourdomain.com;
    
    root /var/www/battery-pack-designer;
    index index.html;
    
    # Frontend
    location / {
        try_files $uri $uri/ /index.html;
    }
    
    # Backend API
    location /api/ {
        proxy_pass http://localhost:5000/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

Enable site:

```bash
sudo ln -s /etc/nginx/sites-available/pack-designer /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

### Step 8: Configure SSL (Optional but Recommended)

```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d optv1.yourdomain.com
```

### Step 9: Test Deployment

```bash
# Test backend
curl http://optv1.yourdomain.com/api/health

# Should return:
# {"status": "healthy", "service": "Battery Pack Designer API", "version": "1.0.0"}

# Test frontend
# Open browser: http://optv1.yourdomain.com
# Should see battery pack designer interface
```

---

## 📦 Option 2: Integrated Deployment Steps

### Step 1: Deploy Full App to optv1

```bash
# Build main app
npm run build

# Copy to optv1
scp -r dist/* user@optv1:/var/www/thinkclock/
scp -r backend/ user@optv1:/opt/thinkclock/backend/
```

### Step 2: Configure User Routing

Edit `backend/config/credentials.py` on optv1:

```python
USERS = {
    'pack_designer_user': '$2b$12$...',  # Hash for pack designer access
}

USER_ENDPOINTS = {
    'pack_designer_user': '/optv1',
}
```

### Step 3: Restrict UI for Pack Designer Users

Edit frontend to hide non-pack-designer routes for certain users.

In `src/components/Navbar/Nav.jsx`:

```javascript
const isPackDesignerOnly = localStorage.getItem('user_type') === 'pack_designer';

// Hide other navigation items if pack designer only
{!isPackDesignerOnly && (
  <MenuItem>Cell Inventory</MenuItem>
  // ... other menu items
)}
```

---

## 🔧 Configuration

### Database Connection (If Needed)

If you need to store pack designs or pull cell inventory from database:

Edit `backend/pack_designer_api.py`:

```python
import psycopg2  # or pymysql

def get_db_connection():
    return psycopg2.connect(
        host='optv1.yourdomain.com',
        database='cell_inventory',
        user='pack_designer',
        password='your_password'
    )
```

### Environment Variables

Create `.env` file:

```bash
# optv1 VPS
FLASK_ENV=production
DATABASE_URL=postgresql://user:pass@localhost/battery_db
SECRET_KEY=your_secret_key_here
CORS_ORIGIN=https://optv1.yourdomain.com
```

---

## 🧪 Testing

### Local Testing Before Deployment

```bash
# Test backend
cd battery-pack-designer/backend
python pack_designer_api.py

# Should start on http://localhost:5000
# Test with curl:
curl -X POST http://localhost:5000/design-battery-pack \
  -H "Content-Type: application/json" \
  -d '{"cells": [...], "num_series": 7, "num_parallel": 22}'
```

### Frontend Testing

```bash
cd battery-pack-designer
npm run dev

# Should start on http://localhost:5173
# Open browser and test pack designer interface
```

---

## 📊 Monitoring

### Check Backend Status

```bash
# Service status
sudo systemctl status pack-designer-api

# View logs
sudo journalctl -u pack-designer-api -f

# Check if port is open
sudo netstat -tuln | grep 5000
```

### Check Frontend Status

```bash
# Nginx status
sudo systemctl status nginx

# View access logs
sudo tail -f /var/log/nginx/access.log

# View error logs
sudo tail -f /var/log/nginx/error.log
```

---

## 🔒 Security Considerations

### Backend Security
- ✅ Use HTTPS (SSL certificate)
- ✅ Configure CORS properly
- ✅ Rate limiting on API endpoints
- ✅ Input validation on all endpoints
- ✅ Use strong authentication

### Frontend Security
- ✅ Sanitize user inputs
- ✅ Use HTTPS only
- ✅ Implement CSP headers
- ✅ Regular security updates

---

## 🆘 Troubleshooting

### Backend Won't Start

```bash
# Check Python version
python3 --version  # Should be 3.9+

# Check dependencies
pip list | grep Flask

# Check port availability
sudo lsof -i :5000

# Check error logs
sudo journalctl -u pack-designer-api --no-pager | tail -50
```

### Frontend Shows Blank Page

```bash
# Check Nginx config
sudo nginx -t

# Check file permissions
ls -la /var/www/battery-pack-designer/

# Check browser console for errors
# (Open DevTools → Console)
```

### API Calls Failing

```bash
# Check CORS configuration
curl -I http://optv1.yourdomain.com/api/health

# Check firewall
sudo ufw status

# Check backend logs
sudo journalctl -u pack-designer-api -f
```

---

## 📈 Performance Optimization

### Backend
- Use Gunicorn with multiple workers
- Enable caching for repeated calculations
- Use database connection pooling

### Frontend
- Enable Nginx gzip compression
- Use CDN for static assets
- Implement lazy loading

---

## 🔄 Updates & Maintenance

### Updating Frontend

```bash
# Pull latest changes
git pull

# Rebuild
npm run build

# Deploy
scp -r dist/* user@optv1:/var/www/battery-pack-designer/
```

### Updating Backend

```bash
# SSH to optv1
ssh user@optv1.yourdomain.com

# Update code
cd /opt/battery-pack-designer/backend
# ... update files ...

# Restart service
sudo systemctl restart pack-designer-api
```

---

## 📝 Backup & Recovery

### Backup

```bash
# Backup frontend
tar -czf pack-designer-frontend-$(date +%Y%m%d).tar.gz /var/www/battery-pack-designer/

# Backup backend
tar -czf pack-designer-backend-$(date +%Y%m%d).tar.gz /opt/battery-pack-designer/
```

### Recovery

```bash
# Restore frontend
tar -xzf pack-designer-frontend-YYYYMMDD.tar.gz -C /var/www/

# Restore backend
tar -xzf pack-designer-backend-YYYYMMDD.tar.gz -C /opt/
sudo systemctl restart pack-designer-api
```

---

## ✅ Post-Deployment Checklist

- [ ] Backend API responding at `/health`
- [ ] Frontend loads correctly
- [ ] Pack designer UI functional
- [ ] API calls successful
- [ ] SSL certificate installed
- [ ] Firewall configured
- [ ] Monitoring set up
- [ ] Backups configured
- [ ] Documentation updated
- [ ] Team trained on new system

---

**Questions?** Refer to main project documentation or contact DevOps team.
