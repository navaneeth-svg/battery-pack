import React from "react";
import { orderData } from "./dummyData";

export const DynamicBoxes = ({
  packVoltage,
  packCapacity,
  packWeight,
  totalCells,
  packPrice,
  isConfig,
  num_cols,
  num_row,
}) => {
  return (
    <div className="flex flex-row gap-6 flex-wrap items-center justify-center text-sm text-center md:text-lg lg:text-xl max-xs:flex-col max-xs:items-center">
      <div className="max-w-[200px] flex flex-col items-center border-4 border-double border-[#ff851b] p-4 max-xs:w-full">
        <span>No. of Cells</span>
        <span className="text-[#e8442d]">
          {num_cols && num_row ? `${num_cols}S${num_row}P = ${totalCells} cells` : totalCells}
        </span>
      </div>
      <div className="max-w-[200px] flex flex-col items-center border-4 border-double border-[#ff851b] p-4 max-xs:w-full">
        <span>Pack Voltage</span>
        <span className="text-[#e8442d]">{packVoltage} V</span>
      </div>
      <div className="max-w-[200px] flex flex-col items-center border-4 border-double border-[#ff851b] p-4 max-xs:w-full">
        <span>Pack Capacity</span>
        <span className="text-[#e8442d]">{packCapacity} AH</span>
      </div>
      {!isConfig && (
        <>
          <div className="max-w-[200px] flex flex-col items-center border-4 border-double border-[#ff851b] p-4 max-xs:w-full">
            <span>Pack Weight</span>
            <span className="text-[#e8442d]">{packWeight} Kg</span>
          </div>
          <div className="max-w-[200px] flex flex-col items-center border-4 border-double border-[#ff851b] p-4 max-xs:w-full">
            <span>Pack Price</span>
            <span className="text-[#e8442d]">{packPrice} $</span>
          </div>
        </>
      )}
    </div>
  );
};