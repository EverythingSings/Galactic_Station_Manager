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
  "Researcher": () => Object.values(game.research).some((level) => level >= 5),
};

export function generateProgressSummary() {
  return `
🚀 Galactic Station Manager Progress 🚀
Role: ${game.role}
Resources:
  Minerals: ${Math.floor(game.minerals)}
  Gas: ${Math.floor(game.gas)}
  Crystals: ${Math.floor(game.crystals)}
  Deuterium: ${Math.floor(game.deuterium)}
  Energy: ${Math.floor(game.energy)}
  Credits: ${Math.floor(game.credits)}
Buildings:
${Object.entries(game.buildings)
  .map(([building, count]) => `  ${building}: ${count}`)
  .join('\n')}
Research Levels:
${Object.entries(game.research)
  .map(([tech, level]) => `  ${tech}: ${level}`)
  .join('\n')}
Completed Missions: ${game.completedMissions.length}
Alien Races Contacted: ${game.alienRaces.length}
  `;
}

export function saveGameState() {
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

export function attemptFirstContact() {
  if (game.firstContactReadiness >= 5) {
    const newRace = generateAlienRace();
    game.alienRaces.push(newRace);
    game.diplomaticRelations[newRace.name] = 0;
    game.firstContactReadiness -= 5;
    return newRace;
  }
  return null;
}
function generateAlienRace() {
  const races = [
    "Zorgons",
    "Blipblops",
    "Quarxians",
    "Nebulosians",
    "Vortexians",
    "Xylophites",
    "Orbitrons",
    "Luminara",
    "Plasmoids",
    "Aetherians",
    "Quasarians",
    "Galactoids",
    "Novaquins"
  ];
  const name = races[Math.floor(Math.random() * races.length)];
  return {
    name,
    tradePreference: Math.random() < 0.5 ? "minerals" : "gas",
    personalityTrait: Math.random() < 0.5 ? "peaceful" : "aggressive",
  };
}
export function conductDiplomacy(raceName, action) {
  const race = game.alienRaces.find((r) => r.name === raceName);
  if (!race) return;
  switch (action) {
    case "trade":
      if (game[race.tradePreference] >= 100) {
        game[race.tradePreference] -= 100;
        game.credits += 150;
        game.diplomaticRelations[raceName] += 1;
      }
      break;
    case "gift":
      if (game.credits >= 100) {
        game.credits -= 100;
        game.diplomaticRelations[raceName] += 2;
      }
      break;
    case "threaten":
      game.diplomaticRelations[raceName] -= 2;
      if (race.personalityTrait === "aggressive") {
        // Potential for conflict or retaliation
        game.credits -= 50;
      }
      break;
  }
  saveGameState();
}

export function updateDiplomacy() {
  const diplomacyDiv = document.getElementById("diplomacy");
  diplomacyDiv.innerHTML = "";
  const firstContactButton = document.createElement("button");
  firstContactButton.classList.add("purchase-button");
  firstContactButton.textContent = `Attempt First Contact (Readiness: ${game.firstContactReadiness}/5)`;
  firstContactButton.disabled = game.firstContactReadiness < 5;
  firstContactButton.onclick = () => {
    const newRace = attemptFirstContact();
    if (newRace) {
      showModal(
        "First Contact!",
        `You've made contact with the ${newRace.name}!`,
      );
      updateDiplomacy();
    }
  };
  diplomacyDiv.appendChild(firstContactButton);
  game.alienRaces.forEach((race) => {
    const raceDiv = document.createElement("div");
    raceDiv.className = "alien-race";
    raceDiv.innerHTML = `
      <h3>${race.name}</h3>
      <p>Relations: ${game.diplomaticRelations[race.name]}</p>
      <button onclick="conductDiplomacy('${race.name}', 'trade')">Trade</button>
      <button onclick="conductDiplomacy('${race.name}', 'gift')">Send Gift</button>
      <button onclick="conductDiplomacy('${race.name}', 'threaten')">Threaten</button>
    `;
    diplomacyDiv.appendChild(raceDiv);
  });
}

export function loadGameState() {
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

export function clearGameState() {
  localStorage.removeItem("gameState");
  location.reload();
}

export function canAfford(cost) {
  return Object.entries(cost).every(
    ([resource, amount]) => game[resource] >= amount,
  );
}

export function buyUpgrade(index) {
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

export function buildStructure(building) {
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

export function getBuildingCost(building) {
  const costs = {
    mineralExtractor: { minerals: 100, energy: 50 },
    gasRefinery: { minerals: 150, gas: 50, energy: 75 },
    crystalSynthesizer: { minerals: 200, gas: 100, energy: 100 },
    deuteriumCollector: { minerals: 250, gas: 150, crystals: 50, energy: 150 },
  };
  return costs[building];
}

export function conductResearch(tech) {
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

export function getResearchCost(tech) {
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

export function applyResearchEffects(tech) {
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

export function produceResources() {
  try {
    game.minerals += game.buildings.mineralExtractor * 0.1;
    game.gas += game.buildings.gasRefinery * 0.1;
    game.crystals += game.buildings.crystalSynthesizer * 0.05;
    game.deuterium += game.buildings.deuteriumCollector * 0.01;
    saveGameState();
  } catch (error) {
    console.error("Error producing resources:", error);
  }
}

export function mine() {
  if (canMine()) {
    game.minerals += game.mineralPower;
    game.energy--;
    saveGameState();
  }
}

export function extract() {
  if (canExtract()) {
    game.gas += game.gasPower;
    game.energy--;
    saveGameState();
  }
}

export function regenerateEnergy() {
  try {
    game.energy = Math.min(game.energy + game.energyRegenRate, game.maxEnergy);
    saveGameState();
  } catch (error) {
    console.error("Error regenerating energy:", error);
  }
}

export function canMine() {
  return game.energy >= 1;
}

export function canExtract() {
  return game.energy >= 1;
}

export function buyResource(resource, amount = 10) {
  if (!game.marketUnlocked) {
    console.log("Market is not unlocked yet!");
    return;
  }

  const cost = game.marketPrices[resource] * amount;
  console.log(
    `Attempting to buy ${amount} ${resource} for ${cost} credits. Current credits: ${game.credits}`,
  );

  if (game.credits >= cost) {
    game.credits -= cost;
    game[resource] += amount;
    console.log(
      `Successfully bought ${amount} ${resource} for ${cost} credits. New balance: ${game.credits} credits, ${game[resource]} ${resource}`,
    );
    saveGameState();
  } else {
    console.log(
      `Not enough credits to buy ${amount} ${resource}. Required: ${cost}, Available: ${game.credits}`,
    );
  }
}

export function sellResource(resource, amount = 10) {
  if (!game.marketUnlocked) {
    console.log("Market is not unlocked yet!");
    return;
  }

  console.log(
    `Attempting to sell ${amount} ${resource}. Current amount: ${game[resource]}`,
  );
  const availableAmount = Math.min(game[resource], amount);
  if (availableAmount > 0) {
    game[resource] -= availableAmount;
    const earnings = game.marketPrices[resource] * availableAmount;
    game.credits += earnings;
    console.log(`Sold ${availableAmount} ${resource} for ${earnings} credits`);
    saveGameState();
  } else {
    console.log(
      `Not enough ${resource} to sell. Current amount: ${game[resource]}`,
    );
  }
}
export function checkMission(index) {
  const mission = game.missions[index];
  if (mission.check() && !game.completedMissions.includes(index)) {
    game.completedMissions.push(index);
    game.credits += mission.reward.credits;
  }
}

export function canUnlockMarket() {
  const unlockCost = {
    minerals: 500,
    gas: 250,
    energy: 1000,
  };
  return canAfford(unlockCost);
}

export function unlockMarket() {
  const unlockCost = {
    minerals: 500,
    gas: 250,
    energy: 1000,
  };
  if (canUnlockMarket()) {
    Object.entries(unlockCost).forEach(([resource, amount]) => {
      game[resource] -= amount;
    });
    game.marketUnlocked = true;
    saveGameState();
  }
}

window.buildStructure = buildStructure;
window.buyResource = buyResource;
window.sellResource = sellResource;
window.unlockMarket = unlockMarket;
window.canUnlockMarket = canUnlockMarket;
window.conductResearch = conductResearch;
