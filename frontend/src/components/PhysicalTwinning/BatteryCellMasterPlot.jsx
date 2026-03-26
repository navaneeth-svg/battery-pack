import React, { useState, useEffect } from "react";
import axios from "axios";
import "./dummy.css";
import PlotComponent from "../CellInfo/PlotComponent";

export const BatteryCellMasterPlot = ({cellsData, num_cols, totalCells, url }) => {
  const [plotData, setPlotData] = useState({});

  const Loader = () => {
    return <div className="moduleplotloader-spinner"></div>;
  };

  useEffect(() => {
    const fetchCellsData = async () => {
        const modulesData = {};
        cellsData.forEach((cell, index) => {
          const colIndex = (index % num_cols) + 1; 
          if (!modulesData[`module${colIndex}`]) {
            modulesData[`module${colIndex}`] = [];
          }
          modulesData[`module${colIndex}`].push({
            cell_id: cell._id,
            soh: cell.meta.soh,
          });
        });
        fetchPlotData(modulesData);
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
  }, [totalCells, num_cols]);

  const moduleKeys = Object.keys(plotData);

  return (
    <>
          {(plotData && Object.keys(plotData).length != 0) ? (
            <PlotComponent plotData={plotData} />
          ) : <Loader />}
    </>
  );
};
