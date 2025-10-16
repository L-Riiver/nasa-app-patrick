import farmer from './icons/farmer.png'
import farmerInvert from './icons/farmerInvert.png'
import farmerWalk from './icons/farmerWalk.gif'
import farmerWalkInvert from './icons/farmerWalkInvert.gif'
import tree from './icons/JungleTree.png'
import pet from './icons/pet.gif'
import hen from './icons/hen.gif'
import egg from './icons/egg.png'
import plot from "./icons/plot.png"
import seed from "./icons/seed.png"
import corn1 from "./icons/corn1.png"
import corn2 from "./icons/corn2.png"
import corn3 from "./icons/corn3.png"
import corn4 from "./icons/corn4.png"
import potato1 from "./icons/potato1.png"
import potato2 from "./icons/potato2.png"
import potato3 from "./icons/potato3.png"
import potato4 from "./icons/potato4.png"
import blueberries1 from "./icons/blueberries1.png"
import blueberries2 from "./icons/blueberries2.png"
import blueberries3 from "./icons/blueberries3.png"
import blueberries4 from "./icons/blueberries4.png"
import riverImg from './icons/river.png'
import lowerRiverImg from './icons/lowerRiver.png'
import dryRiverImg from './icons/dryRiver.png'
import laLibertadMap from './icons/laLibertad.png'
import stageIrrigate from "./icons/wetPlot.png" // image for irrigated plot
import rainGif from "./icons/rain.gif" // rain overlay gif
import month from "./icons/month.svg" // f4f logo svg

const ASSETS = {
  riverImg: riverImg,
  lowerRiverImg: lowerRiverImg,
  dryRiverImg: dryRiverImg,
  farmer: farmer,
  farmerInvert: farmerInvert,
  farmerWalk: farmerWalk,
  farmerWalkInvert: farmerWalkInvert,
  laLibertadMap: laLibertadMap,
  tree: tree,
  pet: pet,
  hen: hen,
  egg: egg,
  plotStages: [
    plot, // empty plot
    seed, // sown seed
    corn1, // growing
    corn2, // growing
    corn3, // almost harvest
    corn4, // harvestable
  ],
  cropStages: {
    corn: [
      plot, // 0: empty
      seed, // 1: sown seed
      corn1, // 2: growing
      corn2, // 3: growing
      corn3, // 4: almost harvest
      corn4, // 5: harvestable
    ],
    potato: [
      plot, // 0: empty
      seed, // 1: sown seed
      potato1, // 2: growing
      potato2, // 3: growing
      potato3, // 4: almost harvest
      potato4, // 5: harvestable
    ],
    blueberry: [
      plot, // 0: empty
      seed, // 1: sown seed
      blueberries1, // 2: growing
      blueberries2, // 3: growing
      blueberries3, // 4: almost harvest
      blueberries4, // 5: harvestable
    ],
  },
  stageIrrigate: stageIrrigate, // imagen para cuando la parcela está regada
  rainGif: rainGif, // rain overlay gif
  month: month, // f4f logo svg
};

export const getStageImage = (stage: number, seedId?: string | null): string => {
  if (stage === 0 || !seedId) {
    return ASSETS.plotStages[stage] || ASSETS.plotStages[0];
  }

  // Map seedId to crop type
  let cropType: keyof typeof ASSETS.cropStages;
  if (seedId === 'corn-seed') cropType = 'corn';
  else if (seedId === 'potato') cropType = 'potato';
  else if (seedId === 'blueberry-seed') cropType = 'blueberry';
  else cropType = 'corn'; // fallback

  return ASSETS.cropStages[cropType][stage] || ASSETS.plotStages[stage] || ASSETS.plotStages[0];
};

export default ASSETS;