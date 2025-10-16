/*  */import React from 'react';
import type { Inventory, Item } from '../game/core/types';
import { useGame } from '../game/state/store';
import ASSETS from '../assets/gameAssets';
import { PLOT_COSTS, HEN_PRICE } from '../game/core/constants';

interface ShopProps {
  currency: number;
  setCurrency: (c: number) => void;
  inventory: Inventory;
  setInventory: (inv: Inventory) => void;
  numPlots: number;
  setNumPlots: (n: number) => void;
  waterTanks: number[];
  setWaterTanks: (t: number[]) => void;
  plots: any[]; // Plot[]
  setPlots: (p: any[]) => void;
  decorations: string[];
  setDecorations: (d: string[]) => void;
  show: boolean;
  onClose: () => void;
  onSeedBought?: () => void;
  seedTutorialCompleted: boolean;
  onPugPurchased?: (months: number) => void;
}

export default function Shop({ currency, setCurrency, inventory, setInventory, numPlots, setNumPlots, waterTanks, setWaterTanks, plots, setPlots, decorations, setDecorations, show, onClose, onSeedBought, seedTutorialCompleted, onPugPurchased }: ShopProps) {
  const selectedDistrict = useGame(state => state.selectedDistrict);
  const currentTurn = useGame(state => state.resources.turn);

  const getPlotPrice = (currentPlots: number): number => {
    if (currentPlots >= 9) return 0;
    return PLOT_COSTS[currentPlots - 1];
  };

  const districtModifiers: Record<string, Record<string, number>> = {
    'Trujillo': { 'corn-seed': 2, 'potato': -1, 'blueberry-seed': 0 },
    'Ascope': { 'corn-seed': 1, 'potato': 1, 'blueberry-seed': 1 },
    'Pacasmayo': { 'corn-seed': 2, 'potato': -1, 'blueberry-seed': -1 },
    'Chepen': { 'corn-seed': 2, 'potato': -1, 'blueberry-seed': 0 },
    'Virú': { 'corn-seed': 1, 'potato': 1, 'blueberry-seed': 1 },
    'Sánchez Carrión': { 'corn-seed': 0, 'potato': 2, 'blueberry-seed': 1 },
    'Gran Chimú': { 'corn-seed': 1, 'potato': 0, 'blueberry-seed': 2 },
    'Otuzco': { 'corn-seed': -1, 'potato': 2, 'blueberry-seed': 1 },
    'Julcán': { 'corn-seed': -1, 'potato': 2, 'blueberry-seed': 0 },
    'Santiago de Chuco': { 'corn-seed': -1, 'potato': 2, 'blueberry-seed': 1 },
    'Bolívar': { 'corn-seed': 0, 'potato': 1, 'blueberry-seed': 2 },
    'Pataz': { 'corn-seed': 0, 'potato': 1, 'blueberry-seed': 2 },
  };

  const getModifierText = (itemId: string) => {
    if (!selectedDistrict || !districtModifiers[selectedDistrict]) return '';
    const mod = districtModifiers[selectedDistrict][itemId];
    if (mod === undefined) return '';
    return ` (${mod > 0 ? '+' : ''}${mod})`;
  };

  const availableItems: Item[] = [
    {
      id: 'corn-seed',
      name: 'Corn Seed',
      type: 'seed',
      price: 8,
      icon: {
        type: 'emoji',
        href: '🌽'
      }
    },
    {
      id: 'potato',
      name: 'Potato',
      type: 'crop',
      price: 5,
      icon: {
        type: 'emoji',
        href: '🥔'
      }
    },
    {
      id: 'blueberry-seed',
      name: 'Blueberry Seed',
      type: 'seed',
      price: 12,
      icon: {
        type: 'emoji',
        href: '🫐'
      }
    },
    {
      id: 'plot',
      name: 'Plot',
      type: 'plot',
      price: getPlotPrice(numPlots),
      icon: {
        type: 'emoji',
        href: '🌱'
      }
    },
    {
      id: 'tank',
      name: 'Water Tank',
      type: 'tank',
      price: 25,
      icon: {
        type: 'emoji',
        href: '🪣'
      }
    },
    // {
    //   id: 'tree',
    //   name: 'Jungle Tree',
    //   type: 'decorative',
    //   price: 25,
    //   icon: {
    //     type: 'emoji',
    //     href: '🌳'
    //   }
    // },
    // {
    //   id: 'bush',
    //   name: 'Bush',
    //   type: 'decorative',
    //   price: 20,
    //   icon: {
    //     type: 'emoji',
    //     href: '🌿'
    //   }
    // },
    {
      id: 'hen',
      name: 'Hen',
      type: 'decorative',
      price: HEN_PRICE,
      icon: {
        type: 'url',
        href: ASSETS.hen
      }
    },
    {
      id: 'pet',
      name: 'Pet',
      type: 'decorative',
      price: 250,
      icon: {
        type: 'url',
        href: ASSETS.pet
      }
    },
  ];

  const buyItem = (item: Item) => {
    // limits: ensure purchase is possible before deducting currency
    if (item.type === 'plot' && numPlots >= 9) return;
    if (item.type === 'tank' && waterTanks.length >= 10) return;
    if (item.type === 'decorative' && decorations.includes(item.id)) return;
    if (currency < item.price) return;

    // deduct currency
    setCurrency(currency - item.price);

    if (item.type === 'plot') {
      const index = numPlots;
      const cols = 3;
      const r = Math.floor(index / cols);
      const c = index % cols;
      const origin = { x: 350, y: 250 };
      const newPlot = {
        id: `plot_${index}`,
        x: origin.x + c * 86,
        y: origin.y + r * 86,
        stage: 0,
        moisture: 0.25,
        alive: true,
        seed: null,
      };
      setNumPlots(numPlots + 1);
      setPlots([...plots, newPlot]);
      return;
    }

    if (item.type === 'tank') {
      setWaterTanks([...waterTanks, 0]);
      return;
    }

    if (item.type === 'decorative') {
      if (!decorations.includes(item.id)) {
        setDecorations([...decorations, item.id]);
        if (item.id === 'pet') {
          onPugPurchased?.(currentTurn);
          onClose(); // Close the shop after purchasing
        }
      }
      return;
    }

    // seeds, crops and other inventory items
    const existing = inventory.find(i => i.id === item.id && i.type === item.type);
    if (existing) {
      const newInv = inventory.map(i => (i.id === existing.id && i.type === existing.type ? { ...i, quantity: i.quantity + 1 } : i));
      setInventory(newInv as Inventory);
    } else {
      setInventory([
        ...inventory,
        {
          id: item.id,
          name: item.name,
          type: item.type as 'seed' | 'crop',
          quantity: 1,
          price: item.price,
          icon: item.icon,
        },
      ] as Inventory);
    }

    if (item.type === 'seed' || item.type === 'crop') {
      onSeedBought?.();
    }
  };

  const sellItem = (itemId: string) => {
    const item = inventory.find(i => i.id === itemId && (i.type === 'crop' || i.type === 'egg'));
    if (!item || item.quantity <= 0) return;

    setCurrency(currency + item.price);

    if (item.quantity === 1) {
      setInventory(inventory.filter(i => !(i.id === itemId && (i.type === 'crop' || i.type === 'egg'))) as Inventory);
    } else {
      setInventory(inventory.map(i => (i.id === itemId && (i.type === 'crop' || i.type === 'egg') ? { ...i, quantity: i.quantity - 1 } : i)) as Inventory);
    }
  };

  const sellAll = () => {
    const itemsToSell = inventory.filter(i => (i.type === 'crop' || i.type === 'egg') && i.quantity > 0);
    const totalEarnings = itemsToSell.reduce((sum, item) => sum + item.quantity * item.price, 0);
    setCurrency(currency + totalEarnings);
    setInventory(inventory.filter(i => !((i.type === 'crop' || i.type === 'egg') && i.quantity > 0)) as Inventory);
  };

  return (
    <div className={show ? "shop show" : "shop"}>
      <div className='shop-header'>
        <h3>Shop</h3>
        <div>🪙: {currency}</div>
        <button onClick={onClose}>Close</button>
      </div>
      <div className='shop-body'>
        <div className='shop-buy'>
          <h4>Buy</h4>
          {availableItems.map(item => {
            let disabled = currency < item.price;
            let maxText = '';
            if (item.type === 'plot') {
              disabled = disabled || numPlots >= 9;
              maxText = ` (${numPlots}/9)`;
            } else if (item.type === 'tank') {
              disabled = disabled || waterTanks.length >= 10;
              maxText = ` (${waterTanks.length}/10)`;
            } else if (item.type === 'decorative') {
              disabled = disabled || decorations.includes(item.id);
              maxText = decorations.includes(item.id) ? ' (Owned)' : '';
            }
            return (
              <div className='shop-item' key={item.id} style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                <div>
                  {item.icon.type === 'url' ? <img src={item.icon.href} alt={item.name} width="20" height="20" /> : item.icon.href} {item.name}{getModifierText(item.id)}{maxText}
                </div>
                <div>
                  {item.price}🪙 <button onClick={() => buyItem(item)} disabled={disabled}>Buy</button>
                </div>
              </div>
            );
          })}
        </div>
        <div className='shop-sell'>
           <h4>Sell</h4>
           <button onClick={sellAll} disabled={inventory.filter(i => (i.type === 'crop' || i.type === 'egg') && i.quantity > 0).length === 0}>Sell All</button>
           {inventory.filter(i => (i.type === 'crop' || i.type === 'egg') && i.quantity > 0).map(item => (
             <div className='shop-item' key={item.id}>
               {item.icon.type === 'img' ? <img src={item.icon.href} alt={item.name} width="20" height="20" /> : item.icon.href} {item.name}: {item.quantity} - {item.price}🪙 each <button onClick={() => sellItem(item.id)}>Sell</button>
             </div>
           ))}
         </div>
        {!seedTutorialCompleted && <div className="seed-tutorial">Buy your seed.</div>}
      </div>
    </div>
  );
}