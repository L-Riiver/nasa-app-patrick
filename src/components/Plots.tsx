import React from 'react';
import { getStageImage } from '../assets/gameAssets';

export const Plots: React.FC<PlotsProps> = ({ plots, nearestId }) => {
  console.log('Plots: nearestId', nearestId);
  plots.forEach(p => {
    console.log(`Plot ${p.id}: hydrated=${p.hydrated}, lastMonthWet=${p.lastMonthWet}, stage=${p.stage}`);
  });
  return (
    <div className="plots">
      {plots.map((p) => (
        <div
          key={p.id}
          className={`plot ${(nearestId && p.id === nearestId) ? "focus" : ""} ${!p.alive ? "dead" : ""}`}
          style={{ left: p.x, top: p.y }}
        >
          <img src={getStageImage(p.stage, p.seed?.id, p.hydrated)} alt="" draggable={false} width={65} height={65} />
          {p.hydrated && (
            <div style={{ position: 'absolute', top: -10, left: '50%', transform: 'translateX(-50%)', fontSize: '20px' }}>
              +💧
            </div>
          )}
          {!p.hydrated && (
            <div style={{ position: 'absolute', top: -10, left: '50%', transform: 'translateX(-50%)', fontSize: '20px' }}>
              −💧
            </div>
          )}
        </div>
      ))}
    </div>
  );
};