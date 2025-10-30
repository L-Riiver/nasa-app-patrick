import React from 'react';

export const Player: React.FC<PlayerProps> = ({ player, frameFarmer, nearest }) => {
  return (
    <div
      className={`player ${nearest ? "near" : ""}`}
      style={{ left: player.x, top: player.y }}
    >
      <img src={frameFarmer} alt="Personaje" width={player.w} />
    </div>
  );
};