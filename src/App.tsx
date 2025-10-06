import React from "react";
import { BrowserRouter, Routes, Route, useNavigate } from "react-router-dom";
import Game from "./routes/Game";
import MapSelector from "./components/MapSelector";
import farm4future from "./assets/icons/farm4future.png";
import thermoGif from "./assets/icons/thermo.gif";
import home from "./assets/icons/home.png";
import farmerImg from "./assets/icons/farmer.png";
import icon1 from "./assets/icons/icon1.png";
import icon2 from "./assets/icons/icon2.png";
import icon3 from "./assets/icons/icon3.png";
import icon4 from "./assets/icons/icon4.png";


const Home = () => {
  const nav = useNavigate();
  const [playerName, setPlayerName] = React.useState('Farm4Future');

  React.useEffect(() => {
    const saved = localStorage.getItem('playerName');
    if (saved) setPlayerName(saved);
  }, []);

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const name = e.target.value.slice(0, 20); // max 20 chars
    setPlayerName(name);
    localStorage.setItem('playerName', name);
  };

  const handleStart = () => {
    // Set in store before navigating
    // Since store is global, we need to access it here
    // But App.tsx doesn't have access to useGame
    // So, navigate with state or something
    // Actually, better to set in store in Game component, but since it's before, perhaps set in MapSelector or Game.
    // For simplicity, since MapSelector is next, set it there.
    // Or add to store here, but since no useGame, hard.
    // Store is zustand, can access without hook, but complicated.
    // Pass as param or navigate with state.
    nav('/map', { state: { playerName } });
  };

  return (
    <div className="start-wrap">

      <div className="title-board">
        <img src={farm4future} alt="Farm4Future" />
      </div>

      <div className="hero">
        <img src={home} alt="Barn" />
        <img src={farmerImg} alt="Farmer" />
        <img src={thermoGif} alt="Thermo" />
      </div>

      <div className="weather-grid">
        <button className="wx-btn"><img src={icon1}/></button>
        <button className="wx-btn"><img src={icon2}/></button>
        <button className="wx-btn"><img src={icon3}/></button>
        <button className="wx-btn"><img src={icon4}/></button>
      </div>

      <div className="name-input">
        <label>Farm Name:</label>
        <input
          type="text"
          value={playerName}
          onChange={handleNameChange}
          maxLength={20}
          placeholder="Farm4Future"
        />
      </div>

      <button className="start-btn" onClick={handleStart}>START</button>
    </div>
  );
}

const App: React.FC = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/map" element={<MapSelector />} />
        <Route path="/game" element={<Game />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;
