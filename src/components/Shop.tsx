/*  */import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
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
  const { t } = useTranslation();
  const selectedDistrict = useGame(state => state.selectedDistrict);
  const currentTurn = useGame(state => state.resources.turn);
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);

  const getPlotPrice = (currentPlots: number): number => {
    if (currentPlots >= 9) return 0;
    return PLOT_COSTS[currentPlots - 1];
  };

  const districtModifiers: Record<string, Record<string, number>> = {
    'Trujillo': { 'corn_seed': 2, 'potato_seed': -1, 'blueberry_seed': 0 },
    'Ascope': { 'corn_seed': 1, 'potato_seed': 1, 'blueberry_seed': 1 },
    'Pacasmayo': { 'corn_seed': 2, 'potato_seed': -1, 'blueberry_seed': -1 },
    'Chepen': { 'corn_seed': 2, 'potato_seed': -1, 'blueberry_seed': 0 },
    'Virú': { 'corn_seed': 1, 'potato_seed': 1, 'blueberry_seed': 1 },
    'Sánchez Carrión': { 'corn_seed': 0, 'potato_seed': 2, 'blueberry_seed': 1 },
    'Gran Chimú': { 'corn_seed': 1, 'potato_seed': 0, 'blueberry_seed': 2 },
    'Otuzco': { 'corn_seed': -1, 'potato_seed': 2, 'blueberry_seed': 1 },
    'Julcán': { 'corn_seed': -1, 'potato_seed': 2, 'blueberry_seed': 0 },
    'Santiago de Chuco': { 'corn_seed': -1, 'potato_seed': 2, 'blueberry_seed': 1 },
    'Bolívar': { 'corn_seed': 0, 'potato_seed': 1, 'blueberry_seed': 2 },
    'Pataz': { 'corn_seed': 0, 'potato_seed': 1, 'blueberry_seed': 2 },
  };

  const getModifierText = (itemId: string) => {
    if (!selectedDistrict || !districtModifiers[selectedDistrict]) return '';
    const mod = districtModifiers[selectedDistrict][itemId];
    if (mod === undefined) return '';
    return ` (${mod > 0 ? '+' : ''}${mod})`;
  };

  const availableItems: Item[] = [
    {
      id: 'corn_seed',
      name: t('game.shop.corn_seed'),
      type: 'seed',
      price: 8,
      icon: {
        type: 'emoji',
        href: '🌽'
      }
    },
    {
      id: 'potato_seed',
      name: t('game.shop.potato_seed'),
      type: 'seed',
      price: 5,
      icon: {
        type: 'emoji',
        href: '🥔'
      }
    },
    {
      id: 'blueberry_seed',
      name: t('game.shop.blueberry_seed'),
      type: 'seed',
      price: 12,
      icon: {
        type: 'emoji',
        href: '🫐'
      }
    },
    {
      id: 'plot',
      name: t('game.shop.plot'),
      type: 'plot',
      price: getPlotPrice(numPlots),
      icon: {
        type: 'emoji',
        href: '🌱'
      }
    },
    {
      id: 'water_tank',
      name: t('game.shop.water_tank'),
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
      name: t('game.shop.hen'),
      type: 'decorative',
      price: HEN_PRICE,
      icon: {
        type: 'url',
        href: ASSETS.hen
      }
    },
    {
      id: 'pet',
      name: t('game.shop.pet'),
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

      // Mark the buy plot tutorial as completed
      useGame.getState().setBuyPlotTutorialCompleted(true);
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
          useGame.getState().setBuyPetTutorialCompleted(true);
          onClose(); // Close the shop after purchasing
        } else if (item.id === 'hen') {
          useGame.getState().setBuyHenTutorialCompleted(true);
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
    const item = inventory.find(i => i.id === itemId && ((i.type === 'crop' || i.type === 'egg') || (i.type === 'seed' && i.id === 'potato_seed')));
    if (!item || item.quantity <= 0) return;

    setCurrency(currency + item.price);

    if (item.quantity === 1) {
      setInventory(inventory.filter(i => !(i.id === itemId && (i.type === 'crop' || i.type === 'egg'))) as Inventory);
    } else {
      setInventory(inventory.map(i => (i.id === itemId && (i.type === 'crop' || i.type === 'egg') ? { ...i, quantity: i.quantity - 1 } : i)) as Inventory);
    }
  };

  const sellAll = () => {
    const itemsToSell = inventory.filter(i => ((i.type === 'crop' || i.type === 'egg') || (i.type === 'seed' && i.id === 'potato_seed')) && i.quantity > 0);
    const totalEarnings = itemsToSell.reduce((sum, item) => sum + item.quantity * item.price, 0);
    setCurrency(currency + totalEarnings);
    setInventory(inventory.filter(i => !(((i.type === 'crop' || i.type === 'egg') || (i.type === 'seed' && i.id === 'potato_seed')) && i.quantity > 0)) as Inventory);
  };

  const getItemDescription = (itemId: string) => {
    return t(`game.shop.item_descriptions.${itemId}`);
  };

  return (
    <>
      <div className={show ? "shop show" : "shop"}>
        <div className='shop-header'>
          <h3>{t('game.shop.title')}</h3>
          <div>🪙: {currency}</div>
          <button onClick={onClose}>{t('game.buttons.close')}</button>
        </div>
        <div className='shop-body'>
          <div className='shop-buy'>
            <h4>{t('game.shop.buy')}</h4>
            <div style={{display: 'flex', flexWrap: 'wrap', gap: '10px'}}>
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
                  maxText = decorations.includes(item.id) ? t('game.shop.owned') : '';
                }
                return (
                  <div
                    className='shop-item-compact'
                    key={item.id}
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      padding: '8px',
                      border: '1px solid var(--panel2)',
                      borderRadius: '6px',
                      minWidth: '120px',
                      position: 'relative'
                    }}
                    onMouseEnter={() => setHoveredItem(item.id)}
                    onMouseLeave={() => setHoveredItem(null)}
                  >
                    <div style={{fontSize: '24px', marginBottom: '4px'}}>
                      {item.icon.type === 'url' ? <img src={item.icon.href} alt={item.name} width="24" height="24" /> : item.icon.href}
                    </div>
                    <div style={{fontSize: '12px', textAlign: 'center', marginBottom: '4px'}}>
                      {item.name}{getModifierText(item.id)}{maxText}
                    </div>
                    <div style={{fontSize: '14px', marginBottom: '4px'}}>
                      {item.price}🪙
                    </div>
                    <button onClick={() => buyItem(item)} disabled={disabled} style={{fontSize: '12px', padding: '4px 8px'}}>
                      {t('game.shop.buy')}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
          <div className='shop-sell'>
             <h4>{t('game.shop.sell')}</h4>
              <button onClick={sellAll} disabled={inventory.filter(i => ((i.type === 'crop' || i.type === 'egg') || (i.type === 'seed' && i.id === 'potato_seed')) && i.quantity > 0).length === 0}>
                {t('game.shop.sell_all')} ({inventory.filter(i => ((i.type === 'crop' || i.type === 'egg') || (i.type === 'seed' && i.id === 'potato_seed')) && i.quantity > 0).reduce((sum, item) => sum + item.quantity * item.price, 0)}🪙)
              </button>
              <div style={{display: 'flex', flexWrap: 'wrap', gap: '10px', marginTop: '10px'}}>
                {inventory.filter(i => ((i.type === 'crop' || i.type === 'egg') || (i.type === 'seed' && i.id === 'potato_seed')) && i.quantity > 0).map(item => (
                  <div
                    className='shop-item-compact'
                    key={item.id}
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      padding: '8px',
                      border: '1px solid var(--panel2)',
                      borderRadius: '6px',
                      minWidth: '120px',
                      position: 'relative'
                    }}
                    onMouseEnter={() => setHoveredItem(item.id)}
                    onMouseLeave={() => setHoveredItem(null)}
                  >
                    <div style={{fontSize: '24px', marginBottom: '4px'}}>
                      {item.icon.type === 'img' ? <img src={item.icon.href} alt={item.name} width="24" height="24" /> : item.icon.href}
                    </div>
                    <div style={{fontSize: '12px', textAlign: 'center', marginBottom: '4px'}}>
                      {item.name}
                    </div>
                    <div style={{fontSize: '12px', marginBottom: '4px'}}>
                      {item.quantity} × {item.price}🪙 = {item.quantity * item.price}🪙
                    </div>
                    <button onClick={() => sellItem(item.id)} style={{fontSize: '12px', padding: '4px 8px'}}>
                      {t('game.shop.sell')}
                    </button>
                  </div>
                ))}
              </div>
            </div>
           {!seedTutorialCompleted && <div className="seed-tutorial">{t('game.shop.buy_seed_tutorial')}</div>}
        </div>
      </div>
      {hoveredItem && (
        <div className="shop-tooltip" style={{
          position: 'absolute',
          top: '50%',
          right: '20px',
          background: 'rgba(0, 0, 0, 0.9)',
          color: 'white',
          padding: '10px',
          borderRadius: '5px',
          maxWidth: '300px',
          whiteSpace: 'pre-line',
          zIndex: 3000,
          pointerEvents: 'none'
        }}>
          {getItemDescription(hoveredItem)}
        </div>
      )}
    </>
  );
}