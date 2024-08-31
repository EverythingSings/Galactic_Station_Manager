import { game } from "./gameState.js";
import {
  canAfford,
  buyUpgrade,
  buildStructure,
  conductResearch,
  getResearchCost,
} from "./gameHelpers.js";
import { canMine, canExtract } from "./script.js";

function updateDisplay() {
  try {
    const resources = [
      "minerals",
      "gas",
      "crystals",
      "deuterium",
      "energy",
      "credits",
    ];

    resources.forEach((resource) => {
      const element = document.getElementById(resource);
      if (!element) {
        console.error(`Element with id ${resource} not found`);
        return; // Continue to the next iteration
      }
      element.textContent = Math.floor(game[resource]);
    });

    const roleElement = document.getElementById("role");
    if (!roleElement) {
      console.error("Element with id 'role' not found");
      return;
    }
    roleElement.textContent = game.role;

    const mineMineralsBtn = document.getElementById("mineMinerals");
    if (!mineMineralsBtn) {
      console.error("Element with id 'mineMinerals' not found");
      return;
    }
    mineMineralsBtn.disabled = !canMine();

    const extractGasBtn = document.getElementById("extractGas");
    if (!extractGasBtn) {
      console.error("Element with id 'extractGas' not found");
      return;
    }
    extractGasBtn.disabled = !canExtract();

    updateUpgrades();
    updateBuildings();
    updateResearch();
    updateMissions();
    updateMarket();
  } catch (error) {
    console.error("Error updating display:", error);
  }
}

function updateUpgrades() {
  try {
    const upgradesDiv = document.getElementById("upgrades");
    upgradesDiv.innerHTML = "";
    game.upgrades.forEach((upgrade, index) => {
      const button = document.createElement("button");
      button.className = "upgrade-button purchase-button";
      const costText = Object.entries(upgrade.cost)
        .map(([resource, amount]) => `${amount} ${resource}`)
        .join(", ");
      button.innerHTML = `<div class="button-content"><strong>${upgrade.name}</strong><span>(${costText})</span></div>`;
      button.disabled = !canAfford(upgrade.cost);
      button.onclick = () => buyUpgrade(index);
      upgradesDiv.appendChild(button);
    });
  } catch (error) {
    console.error("Error updating upgrades:", error);
  }
}

function updateBuildings() {
  try {
    const buildingsDiv = document.getElementById("buildings");
    buildingsDiv.innerHTML = "";
    Object.entries(game.buildings).forEach(([building, count]) => {
      const div = document.createElement("div");
      div.className = "building";
      const cost = getBuildingCost(building);
      const costText = Object.entries(cost)
        .map(([resource, amount]) => `${amount} ${resource}`)
        .join(", ");
      div.innerHTML = `
        <div>
          <strong>${formatBuildingName(building)}: ${count}</strong>
          <button class="purchase-button" onclick="buildStructure('${building}')" ${canAfford(cost) ? "" : "disabled"}>
            <div class="button-content">(${costText})</div>
          </button>
        </div>`;
      buildingsDiv.appendChild(div);
    });
  } catch (error) {
    console.error("Error updating buildings:", error);
  }
}

function formatBuildingName(name) {
  return name
    .replace(/([A-Z])/g, " $1")
    .replace(/^./, (str) => str.toUpperCase());
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

function updateResearch() {
  try {
    const researchDiv = document.getElementById("research");
    researchDiv.innerHTML = "";
    Object.entries(game.research).forEach(([tech, level]) => {
      const div = document.createElement("div");
      div.className = "research-item";
      const cost = getResearchCost(tech);
      const costText = Object.entries(cost)
        .map(([resource, amount]) => `${amount} ${resource}`)
        .join(", ");
      div.innerHTML = `
        <div>
          <strong>${formatResearchName(tech)}: Level ${level}</strong>
          <button class="purchase-button" onclick="conductResearch('${tech}')" ${canAfford(cost) ? "" : "disabled"}>
            <div class="button-content">(${costText})</div>
          </button>
        </div>`;
      researchDiv.appendChild(div);
    });
  } catch (error) {
    console.error("Error updating research:", error);
  }
}

function formatResearchName(name) {
  return name
    .replace(/([A-Z])/g, " $1")
    .replace(/^./, (str) => str.toUpperCase());
}

function updateMarket() {
  try {
    const marketDiv = document.getElementById("market");
    marketDiv.innerHTML = "";
    Object.entries(game.marketPrices).forEach(([resource, price]) => {
      const buyDisabled = game.credits < price * 10;
      const sellDisabled = game[resource] < 10;
      marketDiv.innerHTML += `
        <div class="market-item">
          <strong>${formatResourceName(resource)}: ${price.toFixed(2)} credits</strong>
          <button class="purchase-button" onclick="buyResource('${resource}')" ${buyDisabled ? "disabled" : ""}>
            <div class="button-content">Buy</div>
          </button>
          <button class="purchase-button" onclick="sellResource('${resource}')" ${sellDisabled ? "disabled" : ""}>
            <div class="button-content">Sell</div>
          </button>
        </div>`;
    });
  } catch (error) {
    console.error("Error updating market:", error);
  }
}

function formatResourceName(name) {
  return name.charAt(0).toUpperCase() + name.slice(1);
}

function updateMissions() {
  try {
    const missionsDiv = document.getElementById("missions");
    missionsDiv.innerHTML = "";
    game.missions.forEach((mission, index) => {
      if (!game.completedMissions.includes(index)) {
        const div = document.createElement("div");
        div.className = "mission";
        div.innerHTML = `<h3>${mission.name}</h3><p>${mission.description}</p><button class="purchase-button" onclick="checkMission(${index})" ${mission.check() ? "" : "disabled"}>Check Progress</button>`;
        missionsDiv.appendChild(div);
      }
    });
  } catch (error) {
    console.error("Error updating missions:", error);
  }
}

function setupTabs() {
  try {
    const tabs = document.querySelectorAll(".tab-button");
    tabs.forEach((tab) => {
      tab.addEventListener("click", () => {
        const tabName = tab.dataset.tab;
        activateTab(tabName);
      });
    });
  } catch (error) {
    console.error("Error setting up tabs:", error);
  }
}

function activateTab(tabName) {
  document.querySelectorAll(".tab-pane").forEach((pane) => {
    pane.classList.remove("active");
  });
  document.getElementById(`${tabName}-tab`).classList.add("active");
  document.querySelectorAll(".tab-button").forEach((button) => {
    button.classList.remove("active");
  });
  document.querySelector(`[data-tab=${tabName}]`).classList.add("active");
}

export {
  updateDisplay,
  updateUpgrades,
  updateBuildings,
  updateResearch,
  updateMarket,
  updateMissions,
  setupTabs,
  activateTab,
};
