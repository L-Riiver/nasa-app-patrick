import { create } from "zustand";
import type {
  Forecast, Inventory, Plot, Player, SeedRef
} from "../../game/core/types";
import { INTERACT_RADIUS, PLAYER, SCENE, RIVER_POSITION, MAX_TANK_CAPACITY, ACTIONS_PER_MONTH, EGG_PRICE, PLAYER_INITIAL_POSITION, PLAYER_INITIAL_FACING, INITIAL_WATER_TANKS, INITIAL_CURRENCY, INITIAL_SEED_QUANTITIES } from "../../game/core/constants";
import ASSETS from "../../assets/gameAssets";
import { rollForecast, stepGrowth } from "../../game/core/rules";
import i18n from "../../i18n";

// export type PlotStage = 0|1|2|3|4|5; // 0 suelo, 1 brote… 5 dorado/cosecha
export type PlotStage = 0|1; // 0 suelo, 1 brote… 5 dorado/cosecha
export type Tile = { id:number; x:number; y:number; stage:PlotStage; moisture:number; hasCrop:boolean; };

type Weather = { label:string; rainMm:number; prob:number; };
type Resources = { water:number; aquifer:number; turns:number; score:{prod:number;sost:number;res:number} };

/* ---------- helpers ---------- */
const clampScene = (x:number,y:number) => ({
  x: Math.max(0, Math.min(SCENE.w - PLAYER.w, x)),
  y: Math.max(0, Math.min(SCENE.h - PLAYER.h, y)),
});
const dist = (ax:number,ay:number,bx:number,by:number) => Math.hypot(ax-bx, ay-by);

function nearestPlotId(player: Player, plots: Plot[]) {
  const cx = player.x + player.w/2, cy = player.y + player.h/2;
  console.log('nearestPlotId: player center', cx, cy);
  let best: string | null = null, dBest = Infinity;
  for (const p of plots){
    const d = dist(cx, cy, p.x+36, p.y+36);
    console.log(`Plot ${p.id} at ${p.x+36},${p.y+36}, dist ${d}`);
    if (d < dBest && d <= INTERACT_RADIUS){ best = p.id; dBest = d; }
  }
  console.log('nearestId:', best, 'dist:', dBest);
  return best;
}

function makePlots(n: number): Plot[] {
  const out: Plot[] = [];
  const origin = { x: 350, y: 250 };
  const cols = 3;
  let idx = 0;
  for (let r=0;r<Math.ceil(n/cols);r++){
    for (let c=0;c<cols && idx<n;c++){
      out.push({
        id:`p${idx}`,
        x: origin.x + c*86,
        y: origin.y + r*86,
        stage: 0 as const,
        moisture: 0.25,
        alive: true,
        hydrated: false,
        lastMonthWet: false,
        lastMonthManual: false,
        seed: null
      });
      idx++;
    }
  }
  return out;
}

/* ---------- store ---------- */
type Facing = "left" | "right";

type GameState = {
  player: Player & { facing: Facing };
  plots: Plot[];
  forecast: Forecast;
  ndvi: number;
  grid: Tile[];
  res: Resources;
  weather: Weather;
  isNearRiver: boolean;
  drought: boolean;
  selectedAction: "plant" | "water" | "harvest" | null;

  // tutorial
  tutorialShown: boolean;
  riverTutorialCompleted: boolean;
  shopTutorialCompleted: boolean;
  seedTutorialCompleted: boolean;
  closeShopTutorialCompleted: boolean;
  plantTutorialCompleted: boolean;
  weatherTutorialCompleted: boolean;
  finalTutorialCompleted: boolean;
  buyPlotTutorialCompleted: boolean;
  buyHenTutorialCompleted: boolean;
  buyPetTutorialCompleted: boolean;
  selectedRegion: string;
  selectedDistrict: string;
  playerName: string;

  // plots
  setPlots: (next: Plot[] | ((prev: Plot[]) => Plot[])) => void;
  updatePlot: (id: string, patch: Partial<Plot> | ((p: Plot) => Plot)) => void;
  resetPlots: (n: number) => void;

  // recursos / meta
  resources: { waterTanks: number[]; currency: number; turn: number; actionsRemaining: number };
  numPlots: number;
  decorations: string[];

  // inventario
  inventory: Inventory;
  selectedSeedId: string | null;

  // UI
  showShop: boolean;
  showControls: boolean;

  // selectors
  nearestId(): string | null;

  // actions
  move(dx:number,dy:number,dt:number): void;
  face(dir: Facing): void;

  selectSeed(id: string): void;
  cycleSeed(): void;

  setTutorialShown: (shown: boolean) => void;
  setRiverTutorialCompleted: (completed: boolean) => void;
  setShopTutorialCompleted: (completed: boolean) => void;
  setSeedTutorialCompleted: (completed: boolean) => void;
  setCloseShopTutorialCompleted: (completed: boolean) => void;
  setPlantTutorialCompleted: (completed: boolean) => void;
  setWeatherTutorialCompleted: (completed: boolean) => void;
  setFinalTutorialCompleted: (completed: boolean) => void;
  setBuyPlotTutorialCompleted: (completed: boolean) => void;
  setBuyHenTutorialCompleted: (completed: boolean) => void;
  setBuyPetTutorialCompleted: (completed: boolean) => void;
  plant(): void;                   // si stage 0: siembra; 1-4: crecimiento forzado; 5: cosecha
  harvest(id: string): void;
  feedHen(): void;                 // drop seed on hen to get egg
  irrigate(): void;                // gasta 1 del primer tanque con agua, +humedad y marca irrigado
  nextTurn(): void;                // aplica lluvia y evap, limpia isIrrigated

  setNumPlots(n:number): void;     // rehace el grid
  addTank(): void;

  // utilidades para Shop (si la usas)
  setInventory(inv: Inventory): void;
  setCurrency(v: number): void;
  setDecorations(ids: string[]): void;
  toggleShop(): void;
  toggleControls(): void;

  nextTurn: () => void;
  setAction: (a:GameState["selectedAction"]) => void;
  actOnTile: (id: number) => void;
  
  // utilidades para Shop (si la usas)
  setInventory(inv: Inventory): void;
  setCurrency(v: number): void;
  setDecorations(ids: string[]): void;
  toggleShop(): void;
  toggleControls(): void;

  setIsNearRiver: (isNearRiver: boolean) => void;
  isNearHen: () => boolean;
  setWaterTanks: (next: number[] | ((prev: number[]) => number[])) => void;
  addWaterTank: (value: number) => void;
  clearWaterTanks: () => void;

  setSelectedRegion: (region: string) => void;
  setSelectedDistrict: (district: string) => void;
  setPlayerName: (name: string) => void;
  reset: () => void;
};

const makeGrid = (cols=3, rows=3, origin={x:520,y:390}, size=72, gap=14): Tile[] =>
  Array.from({length: cols*rows}, (_,i)=>{
    const cx = i%cols, cy = (i/cols|0);
    return { id:i, x:origin.x+cx*(size+gap), y:origin.y+cy*(size+gap), stage:0, moisture:0.35, hasCrop:false };
  });

const nextForecast = ():Weather => {
  const p = Math.random();
  if (p>0.75) return {label:"Lluvia fuerte", rainMm:10+Math.random()*10, prob:p};
  if (p>0.45) return {label:"Lluvia", rainMm:3+Math.random()*5, prob:p};
  if (p>0.25) return {label:"Llovizna", rainMm:0.5+Math.random()*1.5, prob:p};
  return {label:"Seco", rainMm:0, prob:p};
};

const clamp01 = (n: number) => (n < 0 ? 0 : n > 1 ? 1 : n);
const MOISTURE_IRRIGATION_DELTA = 0.25;

export const useGame = create<GameState>((set, get) => ({
  player: { ...PLAYER_INITIAL_POSITION, w: PLAYER.w, h: PLAYER.h, facing: PLAYER_INITIAL_FACING },
  plots: makePlots(1),
  forecast: { mm: 0.5 + Math.random()*1.5, label: "ligera" as const },
  ndvi: 0,
  grid: makeGrid(),
  res: { water:100, aquifer:60, turns:1, score:{prod:0,sost:0,res:0} },
  weather: nextForecast(),
  drought: false,
  selectedAction: null,
  resources: { waterTanks: [...INITIAL_WATER_TANKS], currency: INITIAL_CURRENCY, turn: 1, actionsRemaining: ACTIONS_PER_MONTH },
  numPlots: 1,
  isNearRiver: false,
  decorations: [],
  inventory: [
    { id:"corn_seed", name:i18n.t('game.shop.corn_seed'), type:"seed", quantity: INITIAL_SEED_QUANTITIES["corn_seed"], price: 8, icon:{ type:"emoji", href:"🌽" } },
    { id:"potato_seed", name:i18n.t('game.shop.potato_seed'), type:"seed", quantity: INITIAL_SEED_QUANTITIES["potato_seed"], price: 5, icon:{ type:"emoji", href:"🥔" } },
    { id:"blueberry_seed", name:i18n.t('game.shop.blueberry_seed'), type:"seed", quantity: INITIAL_SEED_QUANTITIES["blueberry_seed"], price: 12, icon:{ type:"emoji", href:"🫐" } },
    { id:"corn", name:i18n.t('game.inventory.corn'), type:"crop", quantity:0, price: 6, icon:{ type:"emoji", href:"🌽" } },
    { id:"potato", name:i18n.t('game.inventory.potato'), type:"crop", quantity:0, price: 3, icon:{ type:"emoji", href:"🥔" } },
    { id:"blueberry", name:i18n.t('game.inventory.blueberry'), type:"crop", quantity:0, price: 9, icon:{ type:"emoji", href:"🫐" } },
    { id:"egg", name:i18n.t('game.inventory.egg'), type:"egg", quantity:0, price: EGG_PRICE, icon:{ type:"img", href: ASSETS.egg } },
  ],
  selectedSeedId: "corn_seed",

  showShop: false,
  showControls: false,

  tutorialShown: false,
  riverTutorialCompleted: false,
  shopTutorialCompleted: false,
  seedTutorialCompleted: false,
  closeShopTutorialCompleted: false,
  plantTutorialCompleted: false,
  weatherTutorialCompleted: false,
  finalTutorialCompleted: false,
  buyPlotTutorialCompleted: false,
  buyHenTutorialCompleted: false,
  buyPetTutorialCompleted: false,
    selectedRegion: "",
    selectedDistrict: "",
    playerName: "",

  // reemplaza SOLO waterTanks, dejando currency/turn intactos
  setWaterTanks: next =>
    set(state => {
      const prev = state.resources.waterTanks;
      const value = typeof next === "function" ? (next as (p: number[]) => number[])(prev) : next;
      // micro-optimización: si no cambia la referencia, no rompas nada
      if (value === prev) return state;
      return { resources: { ...state.resources, waterTanks: value } };
    }),

  // utilidades comunes
  addWaterTank: value =>
    set(state => ({
      resources: { ...state.resources, waterTanks: [...state.resources.waterTanks, value] }
    })),

  clearWaterTanks: () =>
    set(state => ({ resources: { ...state.resources, waterTanks: [] } })),

  setIsNearRiver: isNearRiver => set({isNearRiver: isNearRiver}),

  setPlots: next =>
    set(state => {
      const prev = state.plots;
      const value = typeof next === "function" ? (next as (p: Plot[]) => Plot[])(prev) : next;
      if (value === prev) return state;               // sin cambios, no re-render
      return { plots: value };
    }),

  // 2) Actualizar UNA parcela por id, inmutable y sin recrear todo por deporte
  updatePlot: (id, patch) =>
    set(state => {
      const i = state.plots.findIndex(p => p.id === id);
      if (i < 0) return state;                        // id inexistente, no rompas nada
      const curr = state.plots[i];
      const next = typeof patch === "function" ? (patch as (p: Plot) => Plot)(curr) : { ...curr, ...patch };
      if (next === curr) return state;                // nada cambió
      const copy = state.plots.slice();
      copy[i] = next;
      return { plots: copy };
  }),

  // 3) Recrear el tablero rápido
  resetPlots: n => set({ plots: makePlots(n) }),

  /* selectors */
  nearestId() { return nearestPlotId(get().player, get().plots); },
  isNearHen() {
    const { player, decorations } = get();
    if (!decorations.includes('hen')) return false;

    const playerCenter = { x: player.x + player.w / 2, y: player.y + player.h / 2 };
    // Fixed hen position: left: 714, top: 220, width: 70, height: 70
    const henCenter = { x: 930, y: 350 };
    const distance = Math.hypot(playerCenter.x - henCenter.x, playerCenter.y - henCenter.y);

    const hasValidSeed = get().selectedSeedId === 'corn_seed' || get().selectedSeedId === 'blueberry_seed';
    return distance <= INTERACT_RADIUS && hasValidSeed &&
            get().inventory.some(i => i.id === get().selectedSeedId && i.type === 'seed' && i.quantity >= 1);
  },
  
  /* movimiento y facing (para cambiar sprite izquierda/derecha) */
  move(dx,dy,dt){
    if (!dx && !dy) return;
    const len = Math.hypot(dx,dy)||1; dx/=len; dy/=len;
    const newX = dx*PLAYER.speed*dt, newY = dy*PLAYER.speed*dt;
    console.log('move: dx,dy', dx, dy, 'new pos', newX, newY);
    set(s => ({ player: {
      ...s.player,
      ...clampScene(s.player.x + newX, s.player.y + newY)
    }}));
  },
  face(dir){ set(s => ({ player: { ...s.player, facing: dir }})); },

  /* inventario */
  selectSeed(id){ set({ selectedSeedId: id }); },
  cycleSeed(){
    const seeds = get().inventory.filter(i => i.type==="seed" && i.quantity>0);
    if (!seeds.length) return;
    const cur = get().selectedSeedId;
    const idx = seeds.findIndex(s => s.id===cur);
    set({ selectedSeedId: seeds[(idx===-1?0:(idx+1)%seeds.length)].id });
  },

  setAction: (a)=> set({selectedAction:a}),
  actOnTile: (id)=>{
    const { grid, selectedAction, res } = get();
    const t = grid.find(g=>g.id===id)!;
    if (!t) return;

    if (selectedAction==="plant" && !t.hasCrop && res.water>=0) {
      t.hasCrop = true; t.stage = 1; set({ grid:[...grid] });
    }
    if (selectedAction==="water" && t.hasCrop && res.water>0) {
      // riego básico: sube humedad y acelera crecimiento
      t.moisture = Math.min(1, t.moisture + 0.15);
      set({ grid:[...grid], res:{...res, water: Math.max(0, res.water-8), aquifer: Math.max(0, res.aquifer-1)} });
    }
    if (selectedAction==="harvest" && t.hasCrop && t.stage>=4) {
      t.hasCrop = false; t.stage = 0;
      set({ grid:[...grid], res:{...res, score:{...res.score, prod: res.score.prod+1}} });
    }
  },

  setTutorialShown: (shown)=> set({tutorialShown: shown}),
  setRiverTutorialCompleted: (completed)=> set({riverTutorialCompleted: completed}),
  setShopTutorialCompleted: (completed)=> set({shopTutorialCompleted: completed}),
  setSeedTutorialCompleted: (completed)=> set({seedTutorialCompleted: completed}),
  setCloseShopTutorialCompleted: (completed)=> set({closeShopTutorialCompleted: completed}),
  setPlantTutorialCompleted: (completed)=> set({plantTutorialCompleted: completed}),
  setWeatherTutorialCompleted: (completed)=> set({weatherTutorialCompleted: completed}),
  setFinalTutorialCompleted: (completed) => set({ finalTutorialCompleted: completed }),
  setBuyPlotTutorialCompleted: (completed) => set({ buyPlotTutorialCompleted: completed }),
  setBuyHenTutorialCompleted: (completed) => set({ buyHenTutorialCompleted: completed }),
  setBuyPetTutorialCompleted: (completed) => set({ buyPetTutorialCompleted: completed }),
  
  setSelectedRegion: (region)=> set({selectedRegion: region}),
  setSelectedDistrict: (district)=> set({selectedDistrict: district}),
  setPlayerName: (name)=> set({playerName: name}),

  /* siembra/crecimiento/cosecha como en tu versión larga */
  plant(){
    const { resources } = get();
    if (resources.actionsRemaining <= 0) return;

    const id = get().nearestId();
    console.log('plant: nearestId', id);
    if (!id) return;

    const plots = get().plots;
    const target = plots.find(p => p.id===id)!;

    // si está maduro, cosecha directo (comportamiento original)
    if (target.stage === 5) {
      get().harvest(id);
      return;
    }

    // si está vacío, siembra usando semilla seleccionada e inventario
    if (target.stage === 0) {
      const selId = get().selectedSeedId;
      if (!selId) return;

      const inv = structuredClone(get().inventory) as Inventory;
      const seedItem = inv.find(i => i.id===selId && i.type==="seed");
      if (!seedItem || seedItem.quantity <= 0) return;

      seedItem.quantity -= 1; // Seeds now cost 1 unit per planting (but will plant 2 seeds per action)
      const cleaned = inv.filter(i => !(i.type==="seed" && i.quantity<=0));

      set(s => ({
        inventory: cleaned,
        plots: s.plots.map(p => p.id===id
          ? {
              ...p,
              stage: 1 as const,
              moisture: Math.max(p.moisture, 0.25),
              seed: { id: seedItem.id, name: seedItem.name, icon: seedItem.icon as SeedRef["icon"] }
            }
          : p
        ),
        plantTutorialCompleted: true,
        resources: { ...s.resources, actionsRemaining: s.resources.actionsRemaining - 1 }
      }));
      if (get().resources.actionsRemaining === 0) {
        get().nextTurn();
      }
      return;
    }
  },

  harvest(id){
    const { resources } = get();
    if (resources.actionsRemaining <= 0) return;
    const p = get().plots.find(pl => pl.id===id);
    if (!p || p.stage!==5 || !p.seed) return;

    const inv = structuredClone(get().inventory) as Inventory;

    // For potatoes, return the harvested quantity as seeds instead of crops
    if (p.seed!.id === 'potato_seed') {
      const seedId = 'potato_seed';
      const harvestedSeedName = i18n.t('game.shop.potato_seed');
      const seedsToReturn = 6;
      let seedItem = inv.find(i => i.id === seedId && i.type === "seed");
      if (seedItem) {
        seedItem.quantity += seedsToReturn;
      } else {
        inv.push({ id: seedId, name: harvestedSeedName, type: "seed", quantity: seedsToReturn, price: 5, icon: p.seed!.icon });
      }
    } else {
      // For other crops, harvest normally
      let produceName, harvestQuantity;
      if (p.seed!.id === 'corn_seed') {
        produceName = i18n.t('game.inventory.corn');
        harvestQuantity = 4;
      } else if (p.seed!.id === 'blueberry_seed') {
        produceName = i18n.t('game.inventory.blueberry');
        harvestQuantity = 6;
      } else {
        produceName = p.seed!.name;
        harvestQuantity = 1;
      }

      // Try to find an existing crop by produce name first
      let crop = inv.find(i => i.type === "crop" && i.name === produceName) as (typeof inv)[number] | undefined;
      if (!crop) {
        // Fallback to find by ID if name doesn't match
        crop = inv.find(i => i.type === "crop" && i.id === p.seed!.id);
      }

      if (crop) {
        crop.quantity += harvestQuantity;
      } else {
        // create a slug id from the produce name
        const idSlug = produceName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') || p.seed.id;
        inv.push({ id: idSlug, name: produceName, type:"crop", quantity: harvestQuantity, price: produceName === i18n.t('game.inventory.corn') ? 6 : produceName === i18n.t('game.inventory.potato') ? 3 : 9, icon: p.seed.icon });
      }

      // Return 2 seeds back to inventory after harvest for corn and blueberry
      const seedId = p.seed!.id;
      const harvestedSeedName = p.seed!.name;
      let seedItem = inv.find(i => i.id === seedId && i.type === "seed");
      if (seedItem) {
        seedItem.quantity += 2;
      } else {
        inv.push({ id: seedId, name: harvestedSeedName, type: "seed", quantity: 2, price: harvestedSeedName === i18n.t('game.shop.corn_seed') ? 8 : harvestedSeedName === i18n.t('game.shop.blueberry_seed') ? 12 : 0, icon: p.seed!.icon });
      }
    }

    set(s => ({
      inventory: inv,
      plots: s.plots.map(pl => pl.id === id
        ? { ...pl, stage: 0 as const, seed: null }
        : pl),
      resources: { ...s.resources, actionsRemaining: s.resources.actionsRemaining - 1 }
    }));
    if (get().resources.actionsRemaining === 0) {
      get().nextTurn();
    }
  },

  feedHen(){
    const { resources, decorations, inventory, selectedSeedId } = get();
    if (resources.actionsRemaining <= 0) return;

    // Check if hen is placed
    const hasHen = decorations.includes('hen');
    if (!hasHen) return;

    // Only allow corn and blueberry seeds (not potato)
    if (!selectedSeedId || (selectedSeedId !== 'corn_seed' && selectedSeedId !== 'blueberry_seed')) return;

    // Check if player has enough of the selected seed (now costs 1)
    const seedItem = inventory.find(i => i.id === selectedSeedId && i.type === 'seed' && i.quantity >= 1);
    if (!seedItem) return;

    const inv = structuredClone(inventory) as Inventory;
    const seedToUse = inv.find(i => i.id === selectedSeedId && i.type === 'seed');
    if (seedToUse) {
      seedToUse.quantity -= 1;
      if (seedToUse.quantity <= 0) {
        const filtered = inv.filter(i => !(i.id === selectedSeedId && i.type === 'seed'));
        set({ inventory: filtered });
      } else {
        set({ inventory: inv });
      }

      // Add 2 eggs to inventory per seed fed
      const eggItem = inv.find(i => i.id === 'egg' && i.type === 'egg');
      if (eggItem) {
        eggItem.quantity += 2;
      } else {
        inv.push({ id: 'egg', name: i18n.t('game.inventory.egg'), type: 'egg', quantity: 2, price: EGG_PRICE, icon: { type: 'img', href: ASSETS.egg } });
      }

      set(s => ({
        inventory: inv,
        resources: { ...s.resources, actionsRemaining: s.resources.actionsRemaining - 1 }
      }));

      if (get().resources.actionsRemaining === 0) {
        get().nextTurn();
      }
    }
  },

  irrigate() {
    console.log('IRRRIGATE CALLED');
    const { isNearRiver, setRiverTutorialCompleted, player, plots, resources, setWaterTanks, updatePlot, forecast } = get();
    if (resources.actionsRemaining <= 0) return;
    if (isNearRiver) setRiverTutorialCompleted(true);

    const playerCenter = { x: player.x + player.w / 2, y: player.y + player.h / 2 };
    const riverDist = dist(playerCenter.x, playerCenter.y, RIVER_POSITION.x, RIVER_POSITION.y);

    // Check if near river and fill tank, but not when river is dry
    if (riverDist <= 200 && forecast.label !== "seca") {
      const fillIndex = resources.waterTanks.findIndex(t => t < MAX_TANK_CAPACITY);
      if (fillIndex !== -1) {
        setWaterTanks(prev => {
          const newTanks = [...prev];
          newTanks[fillIndex] = Math.min(MAX_TANK_CAPACITY, newTanks[fillIndex] + 1);
          return newTanks;
        });
        set(state => ({ resources: { ...state.resources, actionsRemaining: state.resources.actionsRemaining - 1 } }));
        if (get().resources.actionsRemaining === 0) {
          get().nextTurn();
        }
        console.log('TANK FILLED');
      }
    }

    // Check for nearest irrigable plot
     let nearestPlot: Plot | null = null;
     let minDist = Infinity;
     for (const p of plots) {
       console.log('PLOT', p)
       if (p.hydrated) continue;
       const plotCenter = { x: p.x + 36, y: p.y + 36 };
       const d = dist(playerCenter.x, playerCenter.y, plotCenter.x, plotCenter.y);
       console.log('DIST', d)
       if (d <= INTERACT_RADIUS && d < minDist) {
         minDist = d;
         nearestPlot = p;
       }
     }
    console.log('NEAREST PLOT', nearestPlot);

    if (nearestPlot) {
      const tankIndex = resources.waterTanks.findIndex(t => t > 0);
      console.log('RESOURCES', resources)
      console.log('TANK INDEX', tankIndex)
      if (tankIndex !== -1) {
        setWaterTanks(prev => {
          const newTanks = [...prev];
          newTanks[tankIndex] = Math.max(0, newTanks[tankIndex] - 1);
          return newTanks;
        });
        updatePlot(nearestPlot.id, {
          moisture: clamp01(nearestPlot.moisture + MOISTURE_IRRIGATION_DELTA),
          hydrated: true
        });
        set(state => ({ resources: { ...state.resources, actionsRemaining: state.resources.actionsRemaining - 1 } }));
        if (get().resources.actionsRemaining === 0) {
          get().nextTurn();
        }
        console.log('PLOT IRRIGATED', nearestPlot.id);
      } else {
        console.log('NO WATER IN TANKS');
      }
    } else {
      console.log('NO VALID PLOT TO IRRIGATE');
    }
  },
  
  nextTurn: ()=>{
    const { grid, res, weather, drought, plots, resources } = get();
    // recarga acuífero si llueve
    const aquiferGain = weather.rainMm > 3 ? 2 : weather.rainMm>0 ? 1 : 0;
    const newAquifer = Math.min(100, res.aquifer + aquiferGain);

    // actualizar cada parcela
    const nextGrid = grid.map(t=>{
      // evapotranspiración
      const evap = drought ? 0.08 : 0.05;
      let moisture = Math.max(0, Math.min(1, t.moisture - evap + weather.rainMm/50));

      // crecimiento si hay cultivo
      let stage = t.stage;
      if (t.hasCrop) {
        if (moisture >= 0.3 && moisture <= 0.8) {
          // incrementar hasta el máximo de la etapa (0|1)
          stage = Math.min(1, stage + 1) as PlotStage;
        } else if (moisture < 0.15) {
          // decrementar hasta el mínimo (0)
          stage = Math.max(0, stage - 1) as PlotStage;
        }
      }
  return {...t, moisture, stage};
    });

    // Apply growth to plots
     const newForecast = rollForecast();
     const nextPlots = plots.map(p => stepGrowth(p, newForecast));

    // nueva predicción y sequía aleatoria
    const nw = nextForecast();
    const ndrought = Math.random()<0.12 ? true : Math.random()<0.6 ? drought : false;

    // sostenibilidad y resiliencia de forma simple
    const sost = res.score.sost + (weather.rainMm>0 && res.water<90 ? 1 : 0);
    const alive = nextGrid.some(t=>t.hasCrop);
    const resil = res.score.res + (alive ? 1 : 0);

    set({
      grid: nextGrid,
      plots: nextPlots,
      forecast: newForecast,
      res: { water: res.water, aquifer: newAquifer, turns: res.turns+1, score:{prod:res.score.prod, sost, res:resil} },
      weather: nw,
      drought: ndrought,
      resources: { ...resources, turn: resources.turn + 1, actionsRemaining: ACTIONS_PER_MONTH }
    });
  },

  rollForecast(){
    const r = Math.random();
    if (r > .7) return { mm: 8 + Math.random()*8, label: "fuerte" as const };
    if (r > .4) return { mm: 3 + Math.random()*3, label: "moderada" as const };
    if (r > .2) return { mm: 0.5 + Math.random()*1.5, label: "ligera" as const };
    return { mm: 0, label: "seca" as const };
  },

  setNumPlots(n){
    set(() => ({ numPlots: n, plots: makePlots(n) }));
  },

  addTank(){ set(s => ({ resources: { ...s.resources, waterTanks: [...s.resources.waterTanks, 0] }})); },

  // utilidades para Shop
  setInventory(inv){ set({ inventory: inv }); },
  setCurrency(v){ set(s => ({ resources: { ...s.resources, currency: v } })); },
  setDecorations(ids){ set({ decorations: ids }); },

  toggleShop() {

    const {showShop, shopTutorialCompleted, closeShopTutorialCompleted, setShopTutorialCompleted, setCloseShopTutorialCompleted} = get()

    if (!showShop && !shopTutorialCompleted) {
          setShopTutorialCompleted(true);
        } else if (!closeShopTutorialCompleted) {
          console.log("close shop");
          setCloseShopTutorialCompleted(true);
    }
    set(s => ({ showShop: !s.showShop }));
  },
  toggleControls(){ set(s => ({ showControls: !s.showControls })); },
  reset: ()=> set({
    grid: makeGrid(),
    res: { water:100, aquifer:60, turns:1, score:{prod:0,sost:0,res:0} },
    forecast: { mm: 0.5 + Math.random()*1.5, label: "ligera" as const },
    weather: nextForecast(),
    drought:false,
    selectedAction:null,
    tutorialShown: false,
    riverTutorialCompleted: false,
    shopTutorialCompleted: false,
    seedTutorialCompleted: false,
    closeShopTutorialCompleted: false,
    plantTutorialCompleted: false,
    weatherTutorialCompleted: false,
    finalTutorialCompleted: false,
    buyPlotTutorialCompleted: false,
    buyHenTutorialCompleted: false,
    buyPetTutorialCompleted: false,
    selectedRegion: "",
    selectedDistrict: "",
    playerName: "",
    player: { ...PLAYER_INITIAL_POSITION, w: PLAYER.w, h: PLAYER.h, facing: PLAYER_INITIAL_FACING },
    inventory: [
      { id:"corn_seed", name:i18n.t('game.shop.corn_seed'), type:"seed", quantity: INITIAL_SEED_QUANTITIES["corn_seed"], price: 8, icon:{ type:"emoji", href:"🌽" } },
      { id:"blueberry_seed", name:i18n.t('game.shop.blueberry_seed'), type:"seed", quantity: INITIAL_SEED_QUANTITIES["blueberry_seed"], price: 12, icon:{ type:"emoji", href:"🫐" } },
      { id:"corn", name:i18n.t('game.inventory.corn'), type:"crop", quantity:0, price: 6, icon:{ type:"emoji", href:"🌽" } },
      { id:"potato", name:i18n.t('game.inventory.potato'), type:"crop", quantity:0, price: 3, icon:{ type:"emoji", href:"🥔" } },
      { id:"blueberry", name:i18n.t('game.inventory.blueberry'), type:"crop", quantity:0, price: 9, icon:{ type:"emoji", href:"🫐" } },
      { id:"egg", name:i18n.t('game.inventory.egg'), type:"egg", quantity:0, price: EGG_PRICE, icon:{ type:"img", href: ASSETS.egg } },
    ],
    resources: { waterTanks: [...INITIAL_WATER_TANKS], currency: INITIAL_CURRENCY, turn: 1, actionsRemaining: ACTIONS_PER_MONTH }
  })
}));
