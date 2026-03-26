import React, { useState, useEffect } from "react";
import axios from "axios";
import "./dummy.css";
import PlotComponent from "../CellInfo/PlotComponent";
import PlotPopup from "../PopUp/PlotPopup";


export const BatteryCellPlots = ({ cellsData, num_cols, totalCells, url, plotType }) => {
  const [plotData, setPlotData] = useState({});
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [selectedPlotData, setSelectedPlotData] = useState(null);
  const [selectedModuleName, setSelectedModuleName] = useState("");

  const Loader = () => {
    return <div className="moduleplotloader-spinner"></div>;
  };

  useEffect(() => {
    const fetchCellsData = async () => {
      const modulesData = {};
      cellsData.forEach((cell, index) => {
        const colIndex = (index % num_cols) + 1;
        // Store with numeric keys temporarily
        if (!modulesData[colIndex]) {
          modulesData[colIndex] = [];
        }
        modulesData[colIndex].push({
          cell_id: cell._id || cell.id || cell.uid,
          soh: cell.soh || cell.predicted_soh || cell.meta?.soh || 0,
        });
      });

      // Convert to properly sorted module keys
      const sortedModulesData = {};
      Object.keys(modulesData)
        .map(Number) // Convert string keys to numbers
        .sort((a, b) => a - b) // Sort numerically
        .forEach(key => {
          sortedModulesData[`Section${key}`] = modulesData[key];
        });

      fetchPlotData(sortedModulesData);
    };

    const fetchPlotData = async (modulesData) => {
      try {
        const response = await axios.post(
          `${process.env.BACKEND_URL}batteries/${url}`,
          {
            modules_data: modulesData,
          },
        );
        setPlotData(response.data);
      } catch (error) {
        console.error("Error fetching plot data:", error);
      }
    };

    fetchCellsData();
  }, [totalCells, num_cols, cellsData, url]);

  // Sort module keys numerically before rendering
  const moduleKeys = Object.keys(plotData).sort((a, b) => {
    const numA = parseInt(a.replace('Section', ''));
    const numB = parseInt(b.replace('Section', ''));
    return numA - numB;
  });

  const handlePlotClick = (plotData, moduleName) => {
    setSelectedPlotData(plotData);
    setSelectedModuleName(moduleName.replace(/^module/, 'Module '));
    setIsPopupOpen(true);
  };

  const closePopup = () => {
    setIsPopupOpen(false);
    setSelectedPlotData(null);
    setSelectedModuleName("");
  };

  return (
    <>
      {(plotData && Object.keys(plotData).length != 0) ? (
        <div id="btryConfig" className="flex flex-col justify-center items-center w-full">
          <div className="flex flex-row justify-between" style={{ width: 'fit-content', minWidth: '60%' }}>
            <div className="col-auto mr-auto cellEndCol1 w-8 max-xsm:w-4 text-[#000]">
              <h3>+</h3>
            </div>
            <div className="col-auto ml-auto cellEndCol2 w-8 max-xsm:w-4 text-[#000]">
              <h2>-</h2>
            </div>
          </div>
          <div className="col-sm-auto fixed_window bg-[black]">
            <div
              className="grid-container grid"
              style={{
                gridTemplateColumns: `repeat(${num_cols.toString()}, 1fr)`,
                gridTemplateRows: `30px repeat(auto-fill, minmax(30px, auto))`,
              }}
            >
              {moduleKeys.map((moduleName, index) => (
                <div key={`header-${index}`} className="col-header">
                  {moduleName && moduleName.replace(/^module/, 'Module ')}
                </div>
              ))}
              {moduleKeys.map((moduleName, index) => (
                <div
                  key={index}
                  className="flex justify-center items-center w-[500px] h-[400px] p-2 border"
                  onClick={() => handlePlotClick(plotData[moduleName], moduleName)}
                >
                  <PlotComponent plotData={plotData[moduleName]} />
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : <Loader />}
      <PlotPopup isOpen={isPopupOpen} onClose={closePopup}>
        <div>
          <h1 className="text-[#000000] text-2xl">
            {selectedModuleName}</h1>
          <h2>({" "}{plotType || 'Unspecified Type'}{" "})</h2>
          <br />
          <PlotComponent plotData={selectedPlotData} />
        </div>
      </PlotPopup>

    </>
  );
};
