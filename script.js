import { game, roles } from "./gameState.js";
import { saveGameState, loadGameState, canAfford, buyUpgrade, buildStructure, conductResearch, checkMission, unlockMarket, canUnlockMarket, buyResource, sellResource } from "./gameHelpers.js";
import { updateDisplay, setupTabs, updateChangelog, getPackageVersion } from "./uiHelpers.js";

window.buildStructure = buildStructure;
window.buyResource = buyResource;
window.sellResource = sellResource;
window.unlockMarket = unlockMarket;
window.canUnlockMarket = canUnlockMarket;

function setupEventListeners() {
  document.getElementById("mineMinerals").addEventListener("click", mine);
  document.getElementById("extractGas").addEventListener("click", extract);

}

function mine() {
  if (!canMine()) return;
  game.minerals += game.mineralPower;
  game.energy--;
  saveGameState();
  updateDisplay();
  animateResourceGeneration("minerals");
}

function canMine() {
  return game.energy >= 1;
}

function extract() {
  if (!canExtract()) return;
  game.gas += game.gasPower;
  game.energy--;
  saveGameState();
  updateDisplay();
  animateResourceGeneration("gas");
}

function canExtract() {
  return game.energy >= 1;
}

function animateResourceGeneration(resourceId) {
  const resourceElement = document.getElementById(resourceId);
  resourceElement.classList.add("resource-pulse");
  setTimeout(() => resourceElement.classList.remove("resource-pulse"), 500);
}

function regenerateEnergy() {
  try {
    game.energy = Math.min(game.energy + game.energyRegenRate, game.maxEnergy);
    saveGameState();
    updateDisplay();
  } catch (error) {
    console.error("Error regenerating energy:", error);
  }
}

function produceResources() {
  try {
    game.minerals += game.buildings.mineralExtractor * 0.1;
    game.gas += game.buildings.gasRefinery * 0.1;
    game.crystals += game.buildings.crystalSynthesizer * 0.05;
    game.deuterium += game.buildings.deuteriumCollector * 0.01;
    saveGameState();
    updateDisplay();
  } catch (error) {
    console.error("Error producing resources:", error);
  }
}

function updateRole() {
  const totalResources = game.minerals + game.gas + game.crystals + game.deuterium;
  const roleLevel = Math.floor(Math.log10(totalResources));
  game.role = roles[roleLevel] || roles[Object.keys(roles).length - 1];
  document.getElementById("role").textContent = game.role;
}

function checkUpgrades() {
  game.upgrades.forEach((upgrade, index) => {
    const button = document.querySelector(`#upgrades button:nth-child(${index + 1})`);
    if (button) {
      button.disabled = !canAfford(upgrade.cost);
    }
  });
}

function checkBuildings() {
  Object.keys(game.buildings).forEach((building) => {
    const button = document.querySelector(`#buildings button[data-building="${building}"]`);
    if (button) {
      const cost = getBuildingCost(building);
      button.disabled = !canAfford(cost);
    }
  });
}

function checkResearch() {
  Object.keys(game.research).forEach((tech) => {
    const button = document.querySelector(`#research button[data-tech="${tech}"]`);
    if (button) {
      const cost = getResearchCost(tech);
      button.disabled = !canAfford(cost);
    }
  });
}

function updateMarketPrices() {
  Object.keys(game.marketPrices).forEach((resource) => {
    game.marketPrices[resource] = Math.max(0.5, Math.min(5, game.marketPrices[resource] + (Math.random() - 0.5) * 0.1));
  });
  updateDisplay();
}

function checkMissions() {
  game.missions.forEach((mission, index) => {
    if (!game.completedMissions.includes(index)) {
      checkMission(index);
    }
  });
}

window.onload = () => {
  loadGameState();
  setupTabs();
  updateDisplay();
  setupEventListeners();
  updateChangelog();
  getPackageVersion();
};

setInterval(regenerateEnergy, 1000);
setInterval(produceResources, 1000);
setInterval(updateRole, 5000);
setInterval(checkUpgrades, 1000);
setInterval(checkBuildings, 1000);
setInterval(checkResearch, 1000);
setInterval(updateMarketPrices, 60000);
setInterval(checkMissions, 5000);

export {
  canMine,
  canExtract,
  setupEventListeners,
  mine,
  extract,
  regenerateEnergy,
  produceResources,
};