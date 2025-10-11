import React from 'react';
import ASSETS from '../assets/gameAssets';

const decorationImages: Record<string, string> = {
  tree: ASSETS.tree,
  bush: ASSETS.tree, // placeholder, update with actual bush image if available
  pet: ASSETS.pet,
};

export const Decorations: React.FC<DecorationsProps> = ({ decorations }) => {
  return (
    <div className="decorative">
      {decorations.map((dec, i) => (
        <div key={dec || i} className="tree">
          <img src={decorationImages[dec] || ASSETS.tree} alt={dec} width={70} />
        </div>
      ))}
    </div>
  );
};