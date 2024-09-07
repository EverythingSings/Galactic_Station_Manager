import { game, updateRole } from "./gameState.js";
import { saveGameState, loadGameState, canAfford, buyUpgrade, buildStructure, conductResearch, checkMission, unlockMarket, canUnlockMarket, buyResource, sellResource } from "./gameHelpers.js";
import { updateDiplomacy, conductDiplomacy, generateProgressSummary } from "./gameHelpers.js";
import { updateDisplay, setupTabs, updateChangelog } from "./uiHelpers.js";

window.buildStructure = buildStructure;
window.buyResource = buyResource;
window.sellResource = sellResource;
window.unlockMarket = unlockMarket;
window.canUnlockMarket = canUnlockMarket;

function setupEventListeners() {
  document.getElementById("mineMinerals").addEventListener("click", mine);
  document.getElementById("extractGas").addEventListener("click", extract);

  document.getElementById("about-tab").addEventListener("click", (e) => {
    if (e.target.id === "shareProgress") {
      shareProgress();
    } else if (e.target.textContent.includes("Contact EverythingSings")) {
      openContactForm();
    }
  });

  document.getElementById("diplomacy").addEventListener("click", (e) => {
    if (e.target.tagName === "BUTTON") {
      const action = e.target.textContent.toLowerCase();
      const raceName = e.target.closest(".alien-race").querySelector("h3").textContent;
      conductDiplomacy(raceName, action);
      updateDiplomacy();
    }
  });
}


function shareProgress() {
  const summary = generateProgressSummary();

  if (navigator.share) {
    navigator.share({
      title: 'My Galactic Station Manager Progress',
      text: summary
    }).then(() => {
      console.log('Shared successfully');
    }).catch((error) => {
      console.error('Error sharing:', error);
      fallbackShare(summary);
    });
  } else {
    fallbackShare(summary);
  }
}
function fallbackShare(summary) {
  const textarea = document.createElement('textarea');
  textarea.value = summary;
  document.body.appendChild(textarea);
  textarea.select();
  document.execCommand('copy');
  document.body.removeChild(textarea);
  alert('Progress summary copied to clipboard!');
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
};

const intervals = [
  { fn: regenerateEnergy, time: 1000 },
  { fn: produceResources, time: 1000 },
  { fn: updateRole, time: 5000 },
  { fn: checkUpgrades, time: 1000 },
  { fn: checkBuildings, time: 1000 },
  { fn: checkResearch, time: 1000 },
  { fn: updateMarketPrices, time: 60000 },
  { fn: checkMissions, time: 5000 },
  { fn: () => updateDiplomacy(), time: 5000 }
];

intervals.forEach(({ fn, time }) => setInterval(fn, time));

export {
  canMine,
  canExtract,
  setupEventListeners, 
  mine,
  extract,
  regenerateEnergy,
  produceResources,
};