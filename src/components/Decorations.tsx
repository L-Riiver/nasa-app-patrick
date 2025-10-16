import React from 'react';
import ASSETS from '../assets/gameAssets';

const decorationImages: Record<string, string> = {
  pet: ASSETS.pet,
  hen: ASSETS.hen,
};

export const Decorations: React.FC<DecorationsProps> = ({ decorations }) => {
  return (
    <div className="decorative">
      {decorations.map((dec, i) => {
        // Define fixed positions for decorations
        const positions = {
          pet: { left: 0, top: 100 },
          hen: { left: 0, top: 0 }
        };
        const position = positions[dec as keyof typeof positions];

        return (
          <div
            key={dec || i}
            className="tree"
            style={{
              position: 'absolute',
              left: position.left,
              top: position.top,
              width: 70,
              height: 70,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <img src={decorationImages[dec]} alt={dec} width={70} />
          </div>
        );
      })}
    </div>
  );
};