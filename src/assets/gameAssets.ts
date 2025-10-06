import farmer from './icons/farmer.png'
import farmerInvert from './icons/farmerInvert.png'
import farmerWalk from './icons/farmerWalk.gif'
import farmerWalkInvert from './icons/farmerWalkInvert.gif'
import tree from './icons/JungleTree.png'
import pet from './icons/pet.gif'
import plot from "./icons/plot.png"
import seed from "./icons/seed.png"
import corn1 from "./icons/corn1.png"
import corn2 from "./icons/corn2.png"
import corn3 from "./icons/corn3.png"
import riverImg from './icons/river.png'
import lowerRiverImg from './icons/lowerRiver.png'
import dryRiverImg from './icons/dryRiver.png'
import laLibertadMap from './icons/laLibertad.png'
import stageIrrigate from "./icons/wetPlot.png" // image for irrigated plot

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
  plotStages: [
    plot, // empty plot
    seed, // sown seed
    corn1, // growing
    corn2, // growing
    corn3, // almost harvest
    corn1, // harvestable
  ],
  stageIrrigate: stageIrrigate, // imagen para cuando la parcela está regada
};

export default ASSETS;