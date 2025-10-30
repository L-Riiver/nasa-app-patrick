import React from 'react';
import { useTranslation } from 'react-i18next';

export default function TurnCounter({ currentTurn, onNextTurn }: TurnCounterProps) {
  const { t } = useTranslation();
  return (
    <div className="hud-section">
      <h4>{t('game.hud.time')}</h4>
      <div className='hud-time'>
        <div>{t('game.hud.month')} {currentTurn}</div>
        <button className="skip-time-btn" onClick={onNextTurn}>{t('game.buttons.end_turn')}</button>
      </div>
    </div>
  );
}