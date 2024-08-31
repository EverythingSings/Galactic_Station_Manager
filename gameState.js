// gameState.js

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
    {
      name: "Advanced Mining Drill",
      cost: { minerals: 10 },
      effect: () => game.mineralPower++,
    },
    {
      name: "Improved Gas Extractor",
      cost: { gas: 10 },
      effect: () => game.gasPower++,
    },
    {
      name: "Fusion Reactor",
      cost: { minerals: 50, gas: 50 },
      effect: () => (game.maxEnergy += 50),
    },
    {
      name: "Energy Efficiency",
      cost: { minerals: 100, gas: 100 },
      effect: () => game.energyRegenRate++,
    },
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
    {
      name: "First Steps",
      description:
        "Accumulate 1000 minerals to lay the foundation of your station's future growth.",
      check: () => game.minerals >= 1000,
      reward: { credits: 100 },
    },
    {
      name: "Gas Giant",
      description:
        "Accumulate 1000 gas to fuel the advanced technologies of the station.",
      check: () => game.gas >= 1000,
      reward: { credits: 150 },
    },
    {
      name: "Crystal Clear",
      description: "Synthesize 500 crystals for high-tech equipment.",
      check: () => game.crystals >= 500,
      reward: { credits: 200 },
    },
    {
      name: "Heavy Water",
      description: "Collect 250 deuterium to ensure a stable energy supply.",
      check: () => game.deuterium >= 250,
      reward: { credits: 300 },
    },
    {
      name: "Researcher",
      description:
        "Reach level 5 in any research to demonstrate your technological prowess.",
      check: () => Object.values(game.research).some((level) => level >= 5),
      reward: { credits: 500 },
    },
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

// Exporting the game state and roles
export { game, roles };