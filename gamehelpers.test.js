import { game } from './gameState.js';
import * as gameHelpers from './gameHelpers.js';
import { mine, canMine, extract, canExtract, regenerateEnergy, produceResources } from './script.js';

describe('gameHelpers', () => {
  beforeEach(() => {
    // Reset game state before each test
    game.minerals = 1000;
    game.energy = 25;
    game.credits = 100;
    game.gas = 0;
    game.crystals = 0;
    game.deuterium = 0;
    game.mineralPower = 1;
    game.gasPower = 1;
    game.energyRegenRate = 1;
    game.maxEnergy = 25;
    game.upgrades = [
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
    ];
    game.buildings = {
      mineralExtractor: 1,
      gasRefinery: 0,
      crystalSynthesizer: 0,
      deuteriumCollector: 0,
    };
    game.research = {
      mineralEfficiency: 0,
      gasEfficiency: 0,
      crystalFormation: 0,
      deuteriumSynthesis: 0,
      energyManagement: 0,
    };
  });

  test('canAfford returns true if player can afford the cost', () => {
    const cost = { minerals: 500, energy: 10 };
    expect(gameHelpers.canAfford(cost)).toBeTruthy();
  });

  test('canAfford returns false if player cannot afford the cost', () => {
    const cost = { minerals: 2000, energy: 10 };
    expect(gameHelpers.canAfford(cost)).toBeFalsy();
  });

  test('buyUpgrade decreases resources accordingly and applies effect', () => {
    const upgradeIndex = 0; // Advanced mining 
    gameHelpers.buyUpgrade(upgradeIndex);
    expect(game.minerals).toBe(990);
    expect(game.mineralPower).toBe(2); 
  });

  test('saveGameState and loadGameState', () => {
    game.minerals = 500;
    gameHelpers.saveGameState();
    game.minerals = 0;
    gameHelpers.loadGameState();
    expect(game.minerals).toBe(500);
  });

  test('mine increases minerals and decreases energy', () => {
    mine();
    expect(game.minerals).toBe(1001);
    expect(game.energy).toBe(24);
  });

  test('canMine returns true if energy is sufficient', () => {
    expect(canMine()).toBeTruthy();
  });

  test('canMine returns false if energy is insufficient', () => {
    game.energy = 0;
    expect(canMine()).toBeFalsy();
  });

  test('extract increases gas and decreases energy', () => {
    extract();
    expect(game.gas).toBe(1);
    expect(game.energy).toBe(24);
  });

  test('canExtract returns true if energy is sufficient', () => {
    expect(canExtract()).toBeTruthy();
  });

  test('canExtract returns false if energy is insufficient', () => {
    game.energy = 0;
    expect(canExtract()).toBeFalsy();
  });

  test('regenerateEnergy increases energy up to maxEnergy', () => {
    game.energy = 20;
    regenerateEnergy();
    expect(game.energy).toBe(21);
  });

  test('produceResources increases resources based on buildings', () => {
    produceResources();
    expect(game.minerals).toBe(1000 + game.buildings.mineralExtractor * 0.1);
  });

  test('canAfford returns true when player has enough resources', () => {
    game.minerals = 1000;
    game.energy = 500;
    const cost = { minerals: 500, energy: 250 };
    expect(gameHelpers.canAfford(cost)).toBeTruthy();
  });
  test('canAfford returns false when player does not have enough resources', () => {
    game.minerals = 100;
    game.energy = 50;
    const cost = { minerals: 500, energy: 250 };
    expect(gameHelpers.canAfford(cost)).toBeFalsy();
  });
  test('buyUpgrade applies the correct upgrade effect', () => {
    game.minerals = 1000;
    game.mineralPower = 1;
    const upgradeIndex = 0; // Assuming "Advanced Mining Drill" is at index 0
    gameHelpers.buyUpgrade(upgradeIndex);
    expect(game.mineralPower).toBe(2);
  });
  test('buildStructure increases the correct building count', () => {
    game.minerals = 1000;
    game.energy = 1000;
    game.buildings.mineralExtractor = 0;
    gameHelpers.buildStructure('mineralExtractor');
    expect(game.buildings.mineralExtractor).toBe(1);
  });
  test('conductResearch increases the correct research level', () => {
    game.minerals = 10000;
    game.energy = 10000;
    game.research.mineralEfficiency = 0;
    gameHelpers.conductResearch('mineralEfficiency');
    expect(game.research.mineralEfficiency).toBe(1);
  });
  test('applyResearchEffects correctly applies mineral efficiency research', () => {
    game.mineralPower = 1;
    gameHelpers.applyResearchEffects('mineralEfficiency');
    expect(game.mineralPower).toBeCloseTo(1.1, 2);
  });

  // Market functions
  test('buyResource increases resource and decreases credits', () => {
    game.credits = 100;
    game.minerals = 0;
    gameHelpers.buyResource('minerals', 10);
    expect(game.minerals).toBe(10);
    expect(game.credits).toBe(90);
  });
  test('sellResource decreases resource and increases credits', () => {
    game.credits = 100;
    game.gas = 20;
    gameHelpers.sellResource('gas', 10);
    expect(game.gas).toBe(10);
    expect(game.credits).toBe(115); // Assuming gas price is 1.5 credits
  });
  // Mission completion and rewards
  test('checkMission completes mission and awards credits', () => {
    game.minerals = 1000;
    game.credits = 0;
    gameHelpers.checkMission(0); // Assuming "First Steps" mission is at index 0
    expect(game.completedMissions).toContain(0);
    expect(game.credits).toBe(100);
  });
  // Game state progression
  test('game state progresses correctly over time', () => {
    game.minerals = 0;
    game.energy = 25;
    game.buildings.mineralExtractor = 1;

    // Simulate 10 seconds of game time
    for (let i = 0; i < 10; i++) {
      produceResources();
      regenerateEnergy();
    }
    expect(game.minerals).toBeCloseTo(1, 1); // 0.1 minerals per second for 10 seconds
    expect(game.energy).toBe(25); // Should regenerate to max
  });
  // Edge cases and error handling
  test('canAfford handles missing resources', () => {
    game.minerals = 100;
    const cost = { minerals: 50, nonexistentResource: 10 };
    expect(() => gameHelpers.canAfford(cost)).not.toThrow();
    expect(gameHelpers.canAfford(cost)).toBeFalsy();
  });
  test('buyUpgrade fails if upgrade does not exist', () => {
    expect(() => gameHelpers.buyUpgrade(999)).toThrow('Upgrade at index 999 does not exist');
  });

  test('conductResearch fails if research does not exist', () => {
    expect(() => gameHelpers.conductResearch('nonexistentResearch')).toThrow("Research 'nonexistentResearch' does not exist");
  });
  
  test('maxEnergy is not exceeded when regenerating energy', () => {
    game.energy = 24;
    game.maxEnergy = 25;
    game.energyRegenRate = 2;
    regenerateEnergy();
    expect(game.energy).toBe(25);
  });
  test('resources are not produced if buildings do not exist', () => {
    game.minerals = 0;
    game.buildings.mineralExtractor = 0;
    produceResources();
    expect(game.minerals).toBe(0);
  });

  test('minerals do not go below zero when selling', () => {
    game.minerals = 5;
    game.credits = 0;
    gameHelpers.sellResource('minerals', 10);
    expect(game.minerals).toBe(0);
    expect(game.credits).toBe(5 * game.marketPrices.minerals); // Only 5 minerals should be sold
  });
  
  test('energy does not exceed maxEnergy when regenerating', () => {
    game.energy = 24;
    game.maxEnergy = 25;
    game.energyRegenRate = 5;
    regenerateEnergy();
    expect(game.energy).toBe(25);
  });
  
  test('buying resources with exact credit amount', () => {
    game.credits = 10;
    game.minerals = 0;
    gameHelpers.buyResource('minerals', 10);
    expect(game.minerals).toBe(10);
    expect(game.credits).toBe(0);
  });
  test('selling resources with fractional amounts', () => {
    game.gas = 10.5;
    game.credits = 0;
    gameHelpers.sellResource('gas', 10.5);
    expect(game.gas).toBe(0);
    expect(game.credits).toBeCloseTo(15.75, 2); // Assuming gas price is 1.5
  });
  test('research level does not exceed maximum (if there is a max)', () => {
    const maxLevel = 10; // Assume max level is 10
    for (let i = 0; i < 15; i++) {
      gameHelpers.conductResearch('mineralEfficiency');
    }
    expect(game.research.mineralEfficiency).toBeLessThanOrEqual(maxLevel);
  });
  test('mission completion does not award credits multiple times', () => {
    game.minerals = 2000;
    game.credits = 0;
    gameHelpers.checkMission(0); // Complete "First Steps" mission
    const creditsBefore = game.credits;
    gameHelpers.checkMission(0); // Try to complete it again
    expect(game.credits).toBe(creditsBefore);
  });
  test('resource production handles very large numbers', () => {
    game.buildings.mineralExtractor = 1e6; // 1 million extractors
    const mineralsBefore = game.minerals;
    gameHelpers.produceResources();
    expect(game.minerals).toBeGreaterThan(mineralsBefore);
    expect(isFinite(game.minerals)).toBeTruthy();
  });
  test('upgrade costs increase correctly after multiple purchases', () => {
    const initialCost = game.upgrades[0].cost.minerals;
    for (let i = 0; i < 5; i++) {
      gameHelpers.buyUpgrade(0);
    }
    expect(game.upgrades[0].cost.minerals).toBeGreaterThan(initialCost);
  });
  test('game state handles simultaneous resource changes', () => {
    game.minerals = 100;
    game.energy = 100;
    Promise.all([
      gameHelpers.mine(),
      gameHelpers.extract(),
      gameHelpers.regenerateEnergy()
    ]).then(() => {
      expect(game.minerals).toBeGreaterThan(100);
      expect(game.gas).toBeGreaterThan(0);
      expect(game.energy).toBeLessThan(100);
    });
  });


});