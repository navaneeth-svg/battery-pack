import TabIcon from "../../assets/Tab_Icon.png";
import "./footer.css";
import { IoLogoTwitter, IoLogoYoutube, IoLogoLinkedin } from "react-icons/io5";

export const Footer = () => {
  return (
    <footer className="footer py-7">
      <div className="footer_logo">
        <img className="footer_logo_img" src={TabIcon} alt="logo" />
        <div>ThinkClock Battery Labs</div>
      </div>

      <div className="social">
        <a className="social_link" href="https://twitter.com/ThinkClockLabs" target="_blank" rel="noopener noreferrer">
          <IoLogoTwitter color="#e8442d" />
        </a>
        <a className="social_link" href="https://www.youtube.com/channel/UCNR6jNhcVMJ6X3qOkhJIuzg" target="_blank" rel="noopener noreferrer">
          <IoLogoYoutube color="#e8442d" />
        </a>
        <a
          className="social_link"
          href="https://www.linkedin.com/company/thinkclock/about/"
          target="_blank"
          rel="noopener noreferrer"
        >
          <IoLogoLinkedin color="#e8442d" />
        </a>
      </div>

      <div className="email">
        <a href="mailto:contact@thinkclock.com">contact@thinkclock.com</a>
      </div>

      <address className="address text-center">
        ThinkClock Ltd., Cadbury Road, Sunbury on Thames, TW16 7LT
      </address>

      <div className="formality">
        <a className="formality_link" href="cookies.html">
          Cookies
        </a>
        <a className="formality_link" href="privacy.html">
          Privacy Policy
        </a>
        <a className="formality_link" href="terms.html">
          T&Cs
        </a>
      </div>

      <div className="Copyright text-center">Copyright © 2023 ThinkClock Battery Labs All rights reserved</div>
    </footer>
  );
};
