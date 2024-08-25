const game = {
  minerals: 0,
  gas: 0,
  crystals: 0,
  deuterium: 0,
  energy: 25,
  maxEnergy: 25,
  credits: 0,
  energyRegenRate: 1,
  mineralPower: 1,
  gasPower: 1,
  role: "Novice Commander",
  upgrades: [
    { name: "Advanced Mining Drill", cost: { minerals: 10 }, effect: () => game.mineralPower++ },
    { name: "Improved Gas Extractor", cost: { gas: 10 }, effect: () => game.gasPower++ },
    { name: "Fusion Reactor", cost: { minerals: 50, gas: 50 }, effect: () => game.maxEnergy += 50 },
    { name: "Energy Efficiency", cost: { minerals: 100, gas: 100 }, effect: () => game.energyRegenRate++ }
  ],
  buildings: {
    mineralExtractor: 0,
    gasRefinery: 0,
    crystalSynthesizer: 0,
    deuteriumCollector: 0,
  },
  research: {
    mineralEfficiency: 0,
    gasEfficiency: 0,
    crystalFormation: 0,
    deuteriumSynthesis: 0,
    energyManagement: 0,
  },
  marketPrices: {
    minerals: 1,
    gas: 1.5,
    crystals: 3,
    deuterium: 5,
  },
  missions: [
    { name: "First Steps", description: "Accumulate 1000 minerals to lay the foundation of your station's future growth.", check: () => game.minerals >= 1000, reward: { credits: 100 } },
    { name: "Gas Giant", description: "Accumulate 1000 gas to fuel the advanced technologies of the station.", check: () => game.gas >= 1000, reward: { credits: 150 } },
    { name: "Crystal Clear", description: "Synthesize 500 crystals for high-tech equipment.", check: () => game.crystals >= 500, reward: { credits: 200 } },
    { name: "Heavy Water", description: "Collect 250 deuterium to ensure a stable energy supply.", check: () => game.deuterium >= 250, reward: { credits: 300 } },
    { name: "Researcher", description: "Reach level 5 in any research to demonstrate your technological prowess.", check: () => Object.values(game.research).some(level => level >= 5), reward: { credits: 500 } },
  ],
  completedMissions: [],
};

const roles = {
  1: "Junior Commander",
  2: "Senior Commander",
  3: "Master Strategist",
  4: "Chief Engineer",
  5: "Grand Scientist",
};

function saveGameState() {
  localStorage.setItem('gameState', JSON.stringify(game));
}

function loadGameState() {
  const savedState = localStorage.getItem('gameState');
  if (savedState) {
    Object.assign(game, JSON.parse(savedState));
    updateDisplay();
  }
}

// Save the game state when the user leaves the page
window.addEventListener('unload', saveGameState);

// Load the game state when the page is loaded
window.addEventListener('load', loadGameState);

function checkMission(index) {
  const mission = game.missions[index];
  if (mission.check()) {
    game.completedMissions.push(index);
    Object.entries(mission.reward).forEach(([resource, amount]) => game[resource] += amount);
    updateDisplay();
    saveGameState(); // Save the state after missions checked
    alert(`Mission "${mission.name}" completed! Your new role is "${game.role}".`);
  } else {
    alert("Mission not yet completed. Keep working!");
  }
}

document.getElementById('mineMinerals').addEventListener('click', mine);
document.getElementById('extractGas').addEventListener('click', extract);
document.getElementById('viewCrystals').addEventListener('click', viewCrystals);
document.getElementById('viewDeuterium').addEventListener('click', viewDeuterium);
document.getElementById('viewEnergy').addEventListener('click', viewEnergy);
document.getElementById('viewCredits').addEventListener('click', viewCredits);

function mine() {
  if (game.energy >= 1) {
    game.minerals += game.mineralPower;
    game.energy--;
    updateDisplay();
    saveGameState(); // Save the state after mining
  } else {
    alert("Not enough energy to mine minerals.");
  }
}

function extract() {
  if (game.energy >= 1) {
    game.gas += game.gasPower;
    game.energy--;
    updateDisplay();
    saveGameState(); // Save the state after extraction
  } else {
    alert("Not enough energy to extract gas.");
  }
}

function viewCrystals() {
  alert(`You have ${game.crystals} Crystals.`);
}

function viewDeuterium() {
  alert(`You have ${game.deuterium} Deuterium.`);
}

function viewEnergy() {
  alert(`You have ${game.energy} Energy out of a maximum of ${game.maxEnergy}.`);
}

function viewCredits() {
  alert(`You have ${game.credits} Credits.`);
}

function updateDisplay() {
  document.getElementById('minerals').textContent = Math.floor(game.minerals);
  document.getElementById('gas').textContent = Math.floor(game.gas);
  document.getElementById('crystals').textContent = Math.floor(game.crystals);
  document.getElementById('deuterium').textContent = Math.floor(game.deuterium);
  document.getElementById('energy').textContent = Math.floor(game.energy);
  document.getElementById('credits').textContent = Math.floor(game.credits);
  document.getElementById('role').textContent = game.role;  // Display the role
  updateUpgrades();
  updateBuildings();
  updateResearch();
  updateMarket();
  updateMissions();
}

function updateUpgrades() {
  const upgradesDiv = document.getElementById('upgrades');
  upgradesDiv.innerHTML = '';
  game.upgrades.forEach((upgrade, index) => {
    const button = document.createElement('button');
    button.className = 'upgrade-button';
    let costText = Object.entries(upgrade.cost).map(([resource, amount]) => `${amount} ${resource}`).join(', ');
    button.innerHTML = `${upgrade.name}<br>Cost: ${costText}`;
    button.disabled = !canAfford(upgrade.cost);
    button.onclick = () => buyUpgrade(index);
    upgradesDiv.appendChild(button);
  });
}

function canAfford(cost) {
  return Object.entries(cost).every(([resource, amount]) => game[resource] >= amount);
}

function buyUpgrade(index) {
  const upgrade = game.upgrades[index];
  if (canAfford(upgrade.cost)) {
    Object.entries(upgrade.cost).forEach(([resource, amount]) => game[resource] -= amount);
    upgrade.effect();
    upgrade.cost = Object.fromEntries(
      Object.entries(upgrade.cost).map(([resource, amount]) => [resource, Math.ceil(amount * 1.5)])
    );
    updateDisplay();
    saveGameState(); // Save the state after purchasing upgrades
  }
}

function updateBuildings() {
  const buildingsDiv = document.getElementById('buildings');
  buildingsDiv.innerHTML = '';
  Object.entries(game.buildings).forEach(([building, count]) => {
    const div = document.createElement('div');
    div.className = 'building';
    div.innerHTML = `${formatBuildingName(building)}: ${count} <button onclick="buildStructure('${building}')">Build</button>`;
    buildingsDiv.appendChild(div);
  });
}

function buildStructure(building) {
  const cost = getBuildingCost(building);
  if (canAfford(cost)) {
    Object.entries(cost).forEach(([resource, amount]) => game[resource] -= amount);
    game.buildings[building]++;
    updateDisplay();
    saveGameState(); // Save the state after building structures
  } else {
    alert("Cannot afford to build this structure. Requires " + Object.entries(cost).map(([resource, amount]) => `${amount} ${resource}`).join(', '));
  }
}

function formatBuildingName(name) {
  return name.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
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
  const researchDiv = document.getElementById('research');
  researchDiv.innerHTML = '';
  Object.entries(game.research).forEach(([tech, level]) => {
    const div = document.createElement('div');
    div.className = 'research-item';
    div.innerHTML = `${formatResearchName(tech)}: Level ${level} <button onclick="conductResearch('${tech}')">Research</button>`;
    researchDiv.appendChild(div);
  });
}

function conductResearch(tech) {
  const cost = getResearchCost(tech);
  if (canAfford(cost)) {
    Object.entries(cost).forEach(([resource, amount]) => game[resource] -= amount);
    game.research[tech]++;
    applyResearchEffects(tech);
    updateDisplay();
    saveGameState(); // Save the state after conducting research
  } else {
    alert("Cannot afford to research this technology. Requires " + Object.entries(cost).map(([resource, amount]) => `${amount} ${resource}`).join(', '));
  }
}

function formatResearchName(name) {
  return name.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
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
  return Object.fromEntries(Object.entries(cost).map(([resource, amount]) => [resource, amount * Math.pow(1.5, level)]));
}

function applyResearchEffects(tech) {
  switch (tech) {
    case 'mineralEfficiency':
      game.mineralPower *= 1.1;
      break;
    case 'gasEfficiency':
      game.gasPower *= 1.1;
      break;
    case 'crystalFormation':
      game.buildings.crystalSynthesizer *= 1.1;
      break;
    case 'deuteriumSynthesis':
      game.buildings.deuteriumCollector *= 1.1;
      break;
    case 'energyManagement':
      game.maxEnergy *= 1.2;
      game.energyRegenRate *= 1.1;
      break;
  }
}

function updateMarket() {
  const marketDiv = document.getElementById('market');
  marketDiv.innerHTML = '';
  Object.entries(game.marketPrices).forEach(([resource, price]) => {
    const div = document.createElement('div');
    div.className = 'market-item';
    div.innerHTML = `
      ${formatResourceName(resource)}: ${price.toFixed(2)} credits
      <button onclick="buyResource('${resource}')">Buy</button>
      <button onclick="sellResource('${resource}')">Sell</button>
    `;
    marketDiv.appendChild(div);
  });
}

function buyResource(resource) {
  const amount = 10; // Buy 10 units at a time
  const cost = game.marketPrices[resource] * amount;
  if (game.credits >= cost) {
    game.credits -= cost;
    game[resource] += amount;
    updateMarketPrices();
    updateDisplay();
    saveGameState(); // Save the state after buying resources
  } else {
    alert("Not enough credits to buy resources.");
  }
}

function sellResource(resource) {
  const amount = 10; // Sell 10 units at a time
  if (game[resource] >= amount) {
    game[resource] -= amount;
    game.credits += game.marketPrices[resource] * amount;
    updateMarketPrices();
    updateDisplay();
    saveGameState(); // Save the state after selling resources
  } else {
    alert("Not enough resources to sell.");
  }
}

function updateMarketPrices() {
  Object.keys(game.marketPrices).forEach(resource => {
    // Randomly adjust the price based on the market trends
    const priceChange = Math.random() * 0.5 - 0.25;
    // Ensure the price doesn't go below 0
    game.marketPrices[resource] = Math.max(0, game.marketPrices[resource] + priceChange)
  });
  saveGameState(); // Save the state after market prices updated
}

function formatResourceName(name) {
  return name.charAt(0).toUpperCase() + name.slice(1);
}

function updateMissions() {
  const missionsDiv = document.getElementById('missions');
  missionsDiv.innerHTML = '';
  game.missions.forEach((mission, index) => {
    if (!game.completedMissions.includes(index)) {
      const div = document.createElement('div');
      div.className = 'mission';
      div.innerHTML = `
        <h3>${mission.name}</h3>
        <p>${mission.description}</p>
        <button onclick="checkMission(${index})">Check Progress</button>
      `;
      missionsDiv.appendChild(div);
    }
  });
}

function checkMission(index) {
  const mission = game.missions[index];
  if (mission.check()) {
    game.completedMissions.push(index);
    Object.entries(mission.reward).forEach(([resource, amount]) => game[resource] += amount);
    updateDisplay();
    saveGameState(); // Save the state after mission checked
    alert(`Mission "${mission.name}" completed! You've been rewarded with ${Object.entries(mission.reward).map(([resource, amount]) => `${amount} ${resource}`).join(', ')}.`);
  } else {
    alert("Mission not yet completed. Keep working!");
  }
}

function regenerateEnergy() {
  game.energy = Math.min(game.energy + game.energyRegenRate, game.maxEnergy);
  updateDisplay();
  saveGameState(); // Save the state after regenerating energy
}

function produceResources() {
  game.minerals += game.buildings.mineralExtractor * 0.1;
  game.gas += game.buildings.gasRefinery * 0.1;
  game.crystals += game.buildings.crystalSynthesizer * 0.05;
  game.deuterium += game.buildings.deuteriumCollector * 0.01;
  updateDisplay();
  saveGameState(); // Save the state after producing resources
}

function setupTabs() {
  const tabs = document.querySelectorAll('.tab-button');
  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      const tabName = tab.dataset.tab;
      activateTab(tabName);
      saveGameState(); // Save the state after changing tabs
    });
  });
}

function activateTab(tabName) {
  const tabs = document.querySelectorAll('.tab-button');
  const tabContents = document.querySelectorAll('.tab-pane');
  
  tabs.forEach(tab => tab.classList.remove('active'));
  tabContents.forEach(content => content.classList.remove('active'));
  
  document.querySelector(`.tab-button[data-tab="${tabName}"]`).classList.add('active');
  document.getElementById(`${tabName}-tab`).classList.add('active');
}

setInterval(regenerateEnergy, 1000);
setInterval(produceResources, 1000);
setupTabs();
updateDisplay();