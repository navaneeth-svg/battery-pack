import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { PhysicalTwinning } from './components/PhysicalTwinning';
import { InventoryProvider } from './contexts/InventoryContext';
import './App.css';

function App() {
  return (
    <BrowserRouter>
      <InventoryProvider>
        <div className="App">
          <Routes>
            <Route path="/" element={<Navigate to="/pack-designer" replace />} />
            <Route path="/pack-designer" element={<PhysicalTwinning />} />
          </Routes>
        </div>
      </InventoryProvider>
    </BrowserRouter>
  );
}

export default App;
