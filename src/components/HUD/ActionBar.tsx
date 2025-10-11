import React from 'react';
import { useGame } from '../../game/state/store';
import { ACTIONS_PER_MONTH } from '../../game/core/constants';

export default function ActionBar() {
  const { resources } = useGame();
  const { actionsRemaining } = resources;

  return (
    <div className="hud-section">
      <h4>Actions Left</h4>
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