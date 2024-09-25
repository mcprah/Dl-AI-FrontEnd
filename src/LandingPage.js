import React from "react";
import "./LandingPage.css";
import Logo from "./assets/header-logo-blue.svg";

function LandingPage({ handleNewChatClick }) {
  return (
    <div className="landing-page">
      <img src={Logo} alt="Logo" className="center-logo" />
      <div className="options">
        <div className="option-card" onClick={handleNewChatClick}>
          <span className="icon"></span>
          <p>Chat with DennisAI</p>
        </div>
        <div className="option-card" onClick={() => window.location.href = 'https://www.dennislawgh.com/dl-search'}>
          <span className="icon"></span>
          <p>Search for Legal Cases</p>
        </div>
        <div className="option-card" onClick={() => window.location.href = 'https://www.dennislawgh.com/'}>
          <span className="icon"></span>
          <p>Visit our Dennis Law Website</p>
        </div>
      </div>
    </div>
  );
}

export default LandingPage;
