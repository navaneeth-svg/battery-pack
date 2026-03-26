import React from "react";
import BatteryConfig from "./BatteryConfig";
import { Button } from "@mui/material";
import { ArrowBack as ArrowBackIcon } from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import { Footer } from "../Footer";

export const PhysicalTwinning = () => {
  const navigate = useNavigate();
  
  return (
    <>
      <div className="text-black pt-4 flex flex-col gap-12 items-center justify-center">
        {/* Back to BatteryScope-C Button */}
        <div style={{ width: '100%', display: 'flex', justifyContent: 'flex-start', paddingLeft: '40px' }}>
          <Button
            variant="outlined"
            startIcon={<ArrowBackIcon />}
            onClick={() => window.location.href = '/#/batteryscope-c'}
            style={{
              color: '#e8442d',
              borderColor: '#e8442d',
              textTransform: 'none',
              fontWeight: 600,
              padding: '8px 20px',
            }}
          >
            Back to BatteryScope-C
          </Button>
        </div>
        
        <h1 className="text-xl text-[#e8442d] text-center md:text-2xl lg:text-4xl font-bold">
          Batteryscope : Let us Build Your Battery
        </h1>

        {/* <p className="text-sm  md:text-lg lg:text-xl w-[85%] text-justify">
          Our Physical Twinning service helps you do rapid Battery Prototyping for any climatic
          condition on earth and beyond. Just enter your battery specs, pick fully characterized cells
          from our Cell store, build a digital twin and analyse the performance. Once you are happy,
          let us build a Physical prototype and collect data in our lab using Battery Cycler, Thermal
          chamber, Potentiostat, etc. under real-world climatic conditions. We will stream the data
          back to you through our portal quickly so that you can have real-fun with your battery.
        </p> */}

        {/* <h1 className="text-xl text-[#e8442d] text-center md:text-2xl lg:text-4xl">
          Let us Build Your Battery
        </h1> */}

        <BatteryConfig />
      </div>

      <Footer />
    </>
  );
};
