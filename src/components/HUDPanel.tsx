import React from 'react';
import { useInventory } from '../hooks/useInventory';
import { useGame } from '../game/state/store';
import type { InventoryItem } from '../game/core/types';
import TurnCounter from './HUD/TurnCounter';
import ActionBar from './HUD/ActionBar';

export const HUDPanel: React.FC<HUDPanelProps> = ({ showControls, setShowControls }) => {
  const { seeds, crops, selectedSeedId, selectSeed } = useInventory();
  const { resources, toggleShop, nextTurn } = useGame();

  const handleSeedSelect = (seed: InventoryItem) => {
    console.log('SEED SELECTED: ', seed.id);
    selectSeed(seed.id);
  };

  return (
    <div className="hud-panel">
      <TurnCounter currentTurn={resources.turn} onNextTurn={nextTurn} />
      <ActionBar />
      <div className="hud-section">
        <h4>Seeds (Select One)</h4>
        {seeds.map(item => (
          <div
            key={item.id}
            className={`inventory-item ${selectedSeedId === item.id ? 'selected-seed' : ''}`}
            onClick={() => handleSeedSelect(item)}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') handleSeedSelect(item); }}
          >
            {item.icon.href} {item.name}: {item.quantity}
          </div>
        ))}

        
      </div>
      <div className="hud-section">
        <h4>Crops</h4>
        {crops.map(item => (
          <div key={item.id} className="inventory-item">
            {item.icon.href} {item.name}: {item.quantity}
          </div>
        ))}
      </div>
      <div className="hud-section">
        <div className="hud-row">
          <span className="ico">💧</span>
          <span className="val">{resources.waterTanks.reduce((a: number, b: number) => a + b, 0)}</span>
        </div>
        <div className="hud-row">
          <span className="ico">🪙</span>
          <span className="val">{resources.currency}</span>
        </div>
      </div>
      <div className="hud-buttons">
        <button className="shop-btn" onClick={toggleShop}>
          Shop
        </button>
        <button className="controls-btn" onClick={() => setShowControls(!showControls)}>
          Controls
        </button>
      </div>
        <div className={`controls-popup ${showControls ? 'show':''}`}>
          <strong>E:</strong> Sow / Harvest<br/>
          <strong>R:</strong> Irrigate / Regar<br/>
          <strong>N:</strong> Turn / Turno<br/>
          <strong>TAB:</strong> Cycle Seeds<br/>
          <strong>ESC:</strong> Shop
        </div>
    </div>
  );
};