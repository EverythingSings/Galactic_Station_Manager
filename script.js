import { game } from "./gameState.js";
import { saveGameState, loadGameState } from "./gameHelpers.js";
import { updateDisplay, setupTabs, updateChangelog, getPackageVersion } from "./uiHelpers.js";
import { buildStructure, buyResource, sellResource } from "./gameHelpers.js";

window.buildStructure = buildStructure;
window.buyResource = buyResource;
window.sellResource = sellResource;

function setupEventListeners() {
  document.getElementById("mineMinerals").addEventListener("click", mine);
  document.getElementById("extractGas").addEventListener("click", extract);

  document
    .getElementById("viewCrystals")
    .addEventListener("click", viewCrystals);
  document
    .getElementById("viewDeuterium")
    .addEventListener("click", viewDeuterium);
  document.getElementById("viewEnergy").addEventListener("click", viewEnergy);
  document.getElementById("viewCredits").addEventListener("click", viewCredits);
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

function viewCrystals() {
  alert(`You have ${game.crystals} crystals.`);
}

function viewDeuterium() {
  alert(`You have ${game.deuterium} deuterium.`);
}

function viewEnergy() {
  alert(`You have ${game.energy} energy.`);
}

function viewCredits() {
  alert(`You have ${game.credits} credits.`);
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

export {
  canMine,
  canExtract,
  setupEventListeners,
  mine,
  extract,
  regenerateEnergy,
  produceResources,
};
