import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import Shop from "../components/Shop";
import ClimatePanel from "../components/ClimatePanel";
import { HUDPanel } from "../components/HUDPanel";
import { Player } from "../components/Player";
import { Plots } from "../components/Plots";
import { Tanks } from "../components/Tanks"
import { Decorations } from "../components/Decorations";
import River from "../components/River";
import { usePlayerMovement } from "../hooks/usePlayerMovement";
import { useGameActions } from "../hooks/useGameActions";
import { useGame } from "../game/state/store";
import "./game.css";
import ASSETS from "../assets/gameAssets";

// const PLAYER = { w: 65, h: 105, speed: 250 };

export default function Game() {
  const [showMonthAnimation, setShowMonthAnimation] = useState(false);
  const [showPugCongrats, setShowPugCongrats] = useState(false);
  const [pugMonths, setPugMonths] = useState(0);

  // Use hooks for state and logic
  const { player, frameFarmer } = usePlayerMovement();
  const { setCurrency, setDecorations, toggleControls, setNumPlots, toggleShop } = useGameActions();
  const {
    showShop,
    showControls,
    resources,
    forecast,
    plots,
    decorations,
    inventory,
    selectedDistrict,
    setIsNearRiver,
    tutorialShown,
    riverTutorialCompleted,
    shopTutorialCompleted,
    seedTutorialCompleted,
    setSeedTutorialCompleted,
    closeShopTutorialCompleted,
    plantTutorialCompleted,
    weatherTutorialCompleted,
    setWeatherTutorialCompleted,
    setFinalTutorialCompleted,
    finalTutorialCompleted,
    setTutorialShown,
    setRiverTutorialCompleted,
    setShopTutorialCompleted,
    setCloseShopTutorialCompleted,
    setPlantTutorialCompleted,
    nearestId,
    setPlots,
    setInventory,
    setWaterTanks,
    numPlots,
    isNearHen } = useGame();

  // const [frameFarmer, setFrameFarmer] = useState(ASSETS.farmerWalk)
  // const [facingRight, setFacingRight] = useState(false);
  // const facingRightRef = useRef(facingRight);
  // useEffect(() => { facingRightRef.current = facingRight; }, [facingRight]);

  // const [forecast, setForecast] = useState<{ mm: number; label: "fuerte" | "moderada" | "ligera" | "seca" }>(() => ({ mm: 0.5 + Math.random()*1.5, label: "ligera" as const }));

  // grid based on numPlots
  // const [plots, setPlots] = useState<Plot[]>(() => makePlots(numPlots));
  const plotsRef = useRef(plots);


  useEffect(() => { plotsRef.current = plots; }, [plots]);
  const forecastRef = useRef(forecast);
  useEffect(() => { forecastRef.current = forecast; }, [forecast]);

  const showShopRef = useRef(showShop);
  useEffect(() => { showShopRef.current = showShop; }, [showShop]);

  // Trigger animation when turn increases
  useEffect(() => {
    if (resources.turn > 1) {
      setShowMonthAnimation(true);
      const timer = setTimeout(() => setShowMonthAnimation(false), 1000); // 1 second animation
      return () => clearTimeout(timer);
    }
  }, [resources.turn]);

  /* ----------------- acciones ----------------- */

  const nav = useNavigate();


  return (
    <>
      <div className="background">
        <div className="title-banner">F4F - Month {resources.turn}</div>
        <button className="exit-btn" onClick={() => { if (window.confirm("¿Estás seguro de que quieres salir? Perderás tu progreso.")) { nav("/"); } }}>Salir</button>
      </div>
      <div className="scene">
        <HUDPanel showControls={showControls} setShowControls={toggleControls} />

        <Shop
          currency={resources.currency}
          setCurrency={setCurrency}
          inventory={inventory}
          setInventory={setInventory}
          numPlots={numPlots}
          setNumPlots={setNumPlots} // CORREGIDO () => {}
          waterTanks={resources.waterTanks}
          setWaterTanks={setWaterTanks} // CORREGIDO () => {}
          plots={plots}
          setPlots={setPlots} // CORREGIDO () => {}
          decorations={decorations}
          setDecorations={setDecorations}
          show={showShop}
          onClose={() => toggleShop()}
          onSeedBought={() => setSeedTutorialCompleted(true)}
          seedTutorialCompleted={seedTutorialCompleted}
          onPugPurchased={(months) => { setPugMonths(months); setShowPugCongrats(true); }} />

        {/* Climate panel */}
        <ClimatePanel currentTurn={resources.turn} currentForecast={forecast} onExpand={() => setWeatherTutorialCompleted(true)} isWeatherTutorialActive={plantTutorialCompleted && !weatherTutorialCompleted} selectedDistrict={selectedDistrict} />

        {/* Río */}
        <River forecast={forecast} player={player} setIsNearRiver={setIsNearRiver} />

        <Player player={player} frameFarmer={frameFarmer} nearest={!!nearestId()} finalTutorialCompleted={finalTutorialCompleted} />

        {isNearHen() && (
          <div className="feed-prompt">
            Press E to feed
          </div>
        )}

        {/* Tanques de agua */}
        <Tanks />
        
        <Plots plots={plots} nearestId={nearestId() || undefined} />
<Decorations decorations={decorations} />



        
      {!tutorialShown && (
        <div className="tutorial-modal">
          <button
            className="skip-tutorial-btn"
            onClick={() => {
              setTutorialShown(true);
              setRiverTutorialCompleted(true);
              setShopTutorialCompleted(true);
              setSeedTutorialCompleted(true);
              setCloseShopTutorialCompleted(true);
              setPlantTutorialCompleted(true);
              setWeatherTutorialCompleted(true);
              setFinalTutorialCompleted(true);
            }}
          >
            SKIP TUTORIAL
          </button>
          <span className="tutorial-text">Use WASD or arrow keys (↑ → ↓ ←) to move around the map.</span>
        </div>
      )}

      {tutorialShown && !riverTutorialCompleted && (
        <div className="tutorial-modal">
          <button
            className="skip-tutorial-btn"
            onClick={() => {
              setTutorialShown(true);
              setRiverTutorialCompleted(true);
              setShopTutorialCompleted(true);
              setSeedTutorialCompleted(true);
              setCloseShopTutorialCompleted(true);
              setPlantTutorialCompleted(true);
              setWeatherTutorialCompleted(true);
              setFinalTutorialCompleted(true);
            }}
          >
            SKIP TUTORIAL
          </button>
          <span className="tutorial-text">Go to the river and press R to collect water.</span>
        </div>
      )}

      {riverTutorialCompleted && !shopTutorialCompleted && (
        <div className="tutorial-modal">
          <span className="tutorial-text">Open the shop whit ESC.</span>
        </div>
      )}

      {seedTutorialCompleted && !closeShopTutorialCompleted && (
        <div className="tutorial-modal zindex">
          <span className="tutorial-text">Close the shop whit ESC and go to the available plot.</span>
        </div>
      )}

      {closeShopTutorialCompleted && !plantTutorialCompleted && (
        <div className="tutorial-modal">
          <span className="tutorial-text">Go to the plot, press R to water and E to plant.</span>
        </div>
      )}

      {plantTutorialCompleted && !weatherTutorialCompleted && (
        <div className="tutorial-modal">
          <span className="tutorial-text">Clic on the phone to open</span>
        </div>
      )}

      {weatherTutorialCompleted && !finalTutorialCompleted && (
        <div className="tutorial-modal">
          <span className="tutorial-text">With the cell phone you can see the weather in the following months.</span>
          <span className="tutorial-text">You have a limit of 5 actions per month.</span>
          <span className="tutorial-text">You can skip the month with the Skip Time button at the top.</span>
          <span className="tutorial-text">Get luck.</span>
          <button
          className="finish-tutorial-btn"
          onClick={() => {
            setFinalTutorialCompleted(true);
          }
          }>Finish the tutorial</button>
        </div>
      )}
      </div>
{/* Rain overlay when weather is Modest or Heavy */}
{(forecast.label === 'moderada' || forecast.label === 'fuerte') && (
  <div className="rain-overlay">
    <img src={ASSETS.rainGif} alt="Rain" className="rain-gif" />
  </div>
)}
{/* Month animation overlay */}
{showMonthAnimation && (
<div className="month-animation-overlay"></div>
)}

{/* Pug Congratulations Modal */}
{showPugCongrats && (
<div className="pug-congrats-modal">
<div className="pug-congrats-content">
<h2>Congratulations!</h2>
<p>You got the Pug in {pugMonths} months!</p>
<div className="pug-congrats-buttons">
 <button onClick={() => { if (window.confirm("¿Estás seguro de que quieres salir? Perderás tu progreso.")) { nav("/"); } }}>Exit</button>
 <button onClick={() => setShowPugCongrats(false)}>Continue Playing</button>
</div>
</div>
</div>
)}
    </>
  )
}

