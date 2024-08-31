import { game } from "./gameState.js";

const upgradeEffects = {
  "Advanced Mining Drill": () => game.mineralPower++,
  "Improved Gas Extractor": () => game.gasPower++,
  "Fusion Reactor": () => (game.maxEnergy += 50),
  "Energy Efficiency": () => game.energyRegenRate++,
};

const missionEffects = {
  "First Steps": () => game.minerals >= 1000,
  "Gas Giant": () => game.gas >= 1000,
  "Crystal Clear": () => game.crystals >= 500,
  "Heavy Water": () => game.deuterium >= 250,
  Researcher: () => Object.values(game.research).some((level) => level >= 5),
};

function saveGameState() {
  try {
    const gameState = {
      ...game,
      upgrades: game.upgrades.map(({ name, cost }) => ({ name, cost })),
      missions: game.missions.map(({ name, description, reward }) => ({
        name,
        description,
        reward,
      })),
    };
    localStorage.setItem("gameState", JSON.stringify(gameState));
  } catch (error) {
    console.error("Error saving game state:", error);
  }
}

function loadGameState() {
  try {
    const savedState = localStorage.getItem("gameState");
    if (savedState) {
      const parsedState = JSON.parse(savedState);
      Object.assign(game, parsedState);
      parsedState.upgrades.forEach((upgrade, i) => {
        game.upgrades[i].effect = upgradeEffects[upgrade.name];
      });
      parsedState.missions.forEach((mission, i) => {
        game.missions[i].check = missionEffects[mission.name];
      });
    }
  } catch (error) {
    console.error("Error loading game state:", error);
  }
}

function clearGameState() {
  localStorage.removeItem("gameState");
  location.reload();
}

function canAfford(cost) {
  return Object.entries(cost).every(
    ([resource, amount]) => game[resource] >= amount,
  );
}

function buyUpgrade(index) {
  try {
    const upgrade = game.upgrades[index];
    if (!upgrade) {
      throw new Error(`Upgrade at index ${index} does not exist`);
    }
    if (canAfford(upgrade.cost)) {
      Object.entries(upgrade.cost).forEach(
        ([resource, amount]) => (game[resource] -= amount),
      );
      upgrade.effect();
      upgrade.cost = Object.fromEntries(
        Object.entries(upgrade.cost).map(([resource, amount]) => [
          resource,
          Math.ceil(amount * 1.5),
        ]),
      );
      saveGameState();
    }
  } catch (error) {
    console.error("Error in buyUpgrade function:", error);
    throw error; 
  }
}

function buildStructure(building) {
  try {
    const cost = getBuildingCost(building);
    if (canAfford(cost)) {
      Object.entries(cost).forEach(
        ([resource, amount]) => (game[resource] -= amount),
      );
      game.buildings[building]++;
      saveGameState();
    }
  } catch (error) {
    console.error("Error in buildStructure function:", error);
  }
}

function getBuildingCost(building) {
  const costs = {
    mineralExtractor: { minerals: 100, energy: 50 },
    gasRefinery: { minerals: 150, gas: 50, energy: 75 },
    crystalSynthesizer: { minerals: 200, gas: 100, energy: 100 },
    deuteriumCollector: { minerals: 250, gas: 150, crystals: 50, energy: 150 },
  };
  return costs[building];
}

function conductResearch(tech) {
  try {
    if (!game.research.hasOwnProperty(tech)) {
      throw new Error(`Research '${tech}' does not exist`);
    }
    const cost = getResearchCost(tech);
    if (canAfford(cost)) {
      Object.entries(cost).forEach(
        ([resource, amount]) => (game[resource] -= amount),
      );
      game.research[tech]++;
      applyResearchEffects(tech);
      saveGameState();
    }
  } catch (error) {
    console.error("Error in conductResearch function:", error);
    throw error; 
  }
}


function getResearchCost(tech) {
  const baseCosts = {
    mineralEfficiency: { minerals: 1000, energy: 500 },
    gasEfficiency: { gas: 1000, energy: 500 },
    crystalFormation: { crystals: 500, energy: 750 },
    deuteriumSynthesis: { deuterium: 250, energy: 1000 },
    energyManagement: { minerals: 500, gas: 500, crystals: 500, energy: 1000 },
  };
  const cost = baseCosts[tech];
  const level = game.research[tech];
  return Object.fromEntries(
    Object.entries(cost).map(([resource, amount]) => [
      resource,
      amount * Math.pow(1.5, level),
    ]),
  );
}

function applyResearchEffects(tech) {
  switch (tech) {
    case "mineralEfficiency":
      game.mineralPower *= 1.1;
      break;
    case "gasEfficiency":
      game.gasPower *= 1.1;
      break;
    case "crystalFormation":
      game.buildings.crystalSynthesizer *= 1.1;
      break;
    case "deuteriumSynthesis":
      game.buildings.deuteriumCollector *= 1.1;
      break;
    case "energyManagement":
      game.maxEnergy *= 1.2;
      game.energyRegenRate *= 1.1;
      break;
  }
}

export function buyResource(resource, amount) {
  const cost = game.marketPrices[resource] * amount;
  if (game.credits >= cost) {
    game.credits -= cost;
    game[resource] += amount;
  }
}

export function sellResource(resource, amount) {
  if (game[resource] >= amount) {
    game[resource] -= amount;
    game.credits += game.marketPrices[resource] * amount;
  }
}

export function checkMission(index) {
  const mission = game.missions[index];
  if (mission.check() && !game.completedMissions.includes(index)) {
    game.completedMissions.push(index);
    game.credits += mission.reward.credits;
  }
}

export {
  saveGameState,
  loadGameState,
  clearGameState,
  canAfford,
  buyUpgrade,
  buildStructure,
  conductResearch,
  getBuildingCost,
  getResearchCost,
  applyResearchEffects,
};
