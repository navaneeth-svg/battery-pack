import { Button } from "@mui/material";
import React from "react";
import { useNavigate } from "react-router-dom";
import arrow from "../../assets/img/arrow.png";

const linkData = [
  {
    metaData:
      "If you are happy with the performance of your battery-pack, you can order the best-matched cells from our warehouse",
    buttonText: "Proceed to Order Cells",
    image: arrow,
  },
];

export const GhostLinks = ({ orderData }) => {
  return (
    <div className="flex flex-col gap-10 mt-8 items-center w-[90%]">
      {linkData.map((data, index) => (
        <GhostLink key={index} data={data} orderData={orderData} />
      ))}
    </div>
  );
};

const GhostLink = ({ data, orderData }) => {
  const navigate = useNavigate();

  const handleClick = () => {
    if (orderData) {
      // Use the correct path based on your routing structure
      navigate('/order-cells', { state: { orderData } });
    } else {
      alert('Please configure your battery first before proceeding to order cells.');
    }
  };

  return (
    <div className="flex flex-col md:flex-row justify-between items-center w-full border-[0.5px] border-[#ffccc5] p-8 gap-5 rounded-md md:gap-0 md:rounded-none">
      <p className="w-[100%] md:w-[50%] text-left text-sm md:text-lg lg:text-xl md:max-sm:w-[40%] text-black">
        {data.metaData}
      </p>
      <div className="hidden md:flex md:flex-row justify-center items-center w-[10%] max-sm:w-[5%] ">
        <img src={data.image} alt="arrow" className="w-6 md:w-10" />
        <img src={arrow} alt="arrow" className="w-6 md:w-10" />
      </div>
      <Button
        variant="contained"
        size="large"
        className="text-xs md:text-sm lg:text-lg md:w-[30%] md:max-sm:w-[40%] max-xsm:text-[10px]"
        sx={{
          backgroundColor: "#e8442d",
          fontWeight: "700",
          fontFamily: "Bai Jamjuree",
          "&:hover": {
            backgroundColor: "#e85d01",
          },
          "&:active": {
            backgroundColor: "#e85d01",
          },
        }}
        onClick={handleClick}
      >
        {data.buttonText}
      </Button>
    </div>
  );
};