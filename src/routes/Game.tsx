import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import Shop from "../components/Shop";
import ClimatePanel from "../components/ClimatePanel";
import { HUDPanel } from "../components/HUDPanel";
import { Player } from "../components/Player";
import { Plots } from "../components/Plots";
import { Tanks } from "../components/Tanks"
import { Decorations } from "../components/Decorations";
import River from "../components/River";
import { MissionsChecklist } from "../components/MissionsChecklist";
import { usePlayerMovement } from "../hooks/usePlayerMovement";
import { useGameActions } from "../hooks/useGameActions";
import { useGame } from "../game/state/store";
import "./game.css";
import ASSETS from "../assets/gameAssets";

// const PLAYER = { w: 65, h: 105, speed: 250 };

export default function Game() {
  const { t } = useTranslation();
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
    buyPlotTutorialCompleted,
    buyHenTutorialCompleted,
    buyPetTutorialCompleted,
    nearestId,
    setPlots,
    setInventory,
    setWaterTanks,
    numPlots,
    isNearHen,
    playerName } = useGame();

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


  const tutorialSteps = [
    { key: 'controls', completed: tutorialShown },
    { key: 'river_water', completed: riverTutorialCompleted },
    { key: 'open_shop', completed: shopTutorialCompleted },
    { key: 'close_shop', completed: closeShopTutorialCompleted },
    { key: 'plant_crop', completed: plantTutorialCompleted },
    { key: 'open_phone', completed: weatherTutorialCompleted },
    { key: 'phone_weather', completed: weatherTutorialCompleted },
    { key: 'buy_plot', completed: buyPlotTutorialCompleted },
    { key: 'buy_hen', completed: buyHenTutorialCompleted },
    { key: 'buy_pet', completed: buyPetTutorialCompleted },
  ];

  const handleSkipTutorial = () => {
    setTutorialShown(true);
    setRiverTutorialCompleted(true);
    setShopTutorialCompleted(true);
    setSeedTutorialCompleted(true);
    setCloseShopTutorialCompleted(true);
    setPlantTutorialCompleted(true);
    setWeatherTutorialCompleted(true);
    setFinalTutorialCompleted(true);
  };

  return (
    <>
      <div className="background">
        <div className="title-banner">{playerName || t('game.title')} - {t('game.hud.month')} {resources.turn}</div>
        <button className="exit-btn" onClick={() => { if (window.confirm(t('game.buttons.exit') + "? " + t('messages.exit_confirm'))) { nav("/"); } }}>{t('game.buttons.exit')}</button>
      </div>
      <div className="scene">
        <HUDPanel showControls={showControls} setShowControls={toggleControls} />

        {/* Missions Checklist */}
        {!finalTutorialCompleted && (
          <MissionsChecklist tutorialSteps={tutorialSteps} onSkip={handleSkipTutorial} />
        )}

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
            {t('game.missions.feed_prompt')}
          </div>
        )}

        {/* Tanques de agua */}
        <Tanks />
        
        <Plots plots={plots} nearestId={nearestId() || undefined} />
<Decorations decorations={decorations} />



        
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
<h2>{t('game.messages.congratulations')}</h2>
<p>{t('game.messages.pug_achievement', { months: pugMonths })}</p>
<div className="pug-congrats-buttons">
  <button onClick={() => { if (window.confirm(t('game.buttons.exit') + "? " + t('messages.exit_confirm'))) { nav("/"); } }}>{t('game.buttons.exit')}</button>
  <button onClick={() => setShowPugCongrats(false)}>{t('game.buttons.continue_playing')}</button>
</div>
</div>
</div>
)}
    </>
  )
}

