import "./loader.css";
import { useEffect, useState } from "react";
export const Loader = ({
  fullScreen = true,
  widget = false,
  opacity = 100,
}) => {
  const [isFullScreen, setFullScreen] = useState(fullScreen);
  
  useEffect(() => {
    if (widget) {
      setFullScreen(false);
    }
  }, [widget]);

  return (
    <div className={`${isFullScreen ? 'loader-container':'loader-widget'} opacity-${opacity}`}>
      <svg width="80" height="100" viewBox="0 0 77 83" className="global-loader">
        <path
          d="M41 6L6.00007 28.5L6 32L6.00007 34.5L41 57.5"
          fill="none"
          stroke="#262641"
          strokeWidth="12px"
          strokeDasharray="100 100"
          className="path-1"
        />
        <path
          d="M36 77.5L70.9999 55L71 51.5L70.9999 49L36 26"
          fill="none"
          stroke="#262641"
          strokeWidth="12px"
          strokeDasharray="100 100"
          className="path-2"
        />
      </svg>
    </div>
  );
};
