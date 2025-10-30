import React from 'react';
import { useTranslation } from 'react-i18next';
import { useGame } from '../../game/state/store';
import { ACTIONS_PER_MONTH } from '../../game/core/constants';

export default function ActionBar() {
  const { t } = useTranslation();
  const { resources } = useGame();
  const { actionsRemaining } = resources;

  return (
    <div className="hud-section">
      <h4>{t('game.hud.actions_left')}</h4>
      <div className="action-bar">
        {Array.from({ length: ACTIONS_PER_MONTH }, (_, i) => (
          <div
            key={i}
            className={`action-dot ${i < actionsRemaining ? 'active' : 'inactive'}`}
          />
        ))}
      </div>
    </div>
  );
}