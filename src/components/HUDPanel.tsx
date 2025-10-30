import React from 'react';
import { useTranslation } from 'react-i18next';
import { useInventory } from '../hooks/useInventory';
import { useGame } from '../game/state/store';
import type { InventoryItem } from '../game/core/types';
import TurnCounter from './HUD/TurnCounter';
import ActionBar from './HUD/ActionBar';

export const HUDPanel: React.FC<HUDPanelProps> = ({ showControls, setShowControls }) => {
  const { t } = useTranslation();
  const { seeds, crops, eggs, selectedSeedId, selectSeed } = useInventory();
  const { resources, toggleShop, nextTurn } = useGame();

  const handleSeedSelect = (seed: InventoryItem) => {
    console.log('SEED SELECTED: ', seed.id);
    selectSeed(seed.id);
  };

  return (
    <div className="hud-panel">
      <TurnCounter currentTurn={resources.turn} onNextTurn={nextTurn} />
      <ActionBar />
      <div className="hud-section scrollable">
        <h4>{t('game.inventory.seeds_select')}</h4>
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
      <div className="hud-section scrollable">
        <h4>{t('game.inventory.crops')}</h4>
        {crops.map(item => (
          <div key={item.id} className="inventory-item">
            {item.icon.href} {item.name}: {item.quantity}
          </div>
        ))}
      </div>
      <div className="hud-section">
        <h4>{t('game.inventory.eggs')}</h4>
        {eggs.map(item => (
          <div key={item.id} className="inventory-item">
            {item.icon.type === 'img' ? <img src={item.icon.href} alt={item.name} width="20" height="20" /> : item.icon.href} {item.name}: {item.quantity}
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
          {t('game.hud.shop')}
        </button>
        <button className="controls-btn" onClick={() => setShowControls(!showControls)}>
          {t('game.hud.controls')}
        </button>
      </div>
        <div className={`controls-popup ${showControls ? 'show':''}`}>
          <strong>E:</strong> {t('game.controls.sow_harvest')}<br/>
          <strong>R:</strong> {t('game.controls.irrigate')}<br/>
          <strong>N:</strong> {t('game.controls.next_turn')}<br/>
          <strong>TAB:</strong> {t('game.controls.cycle_seeds')}<br/>
          <strong>ESC:</strong> {t('game.controls.open_shop')}
        </div>
    </div>
  );
};