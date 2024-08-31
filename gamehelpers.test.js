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
    game.marketUnlocked = false;
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
    const upgradeIndex = 0; // Advanced mining drill
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

  test('buyResource increases resource and decreases credits when market is unlocked', () => {
    game.marketUnlocked = true;
    game.credits = 100;
    game.minerals = 0;
    gameHelpers.buyResource('minerals', 10);
    expect(game.minerals).toBe(10);
    expect(game.credits).toBe(90); // Assuming mineral price is 1 credit
  });

  test('buyResource does not allow purchase if market is locked', () => {
    game.marketUnlocked = false;
    game.credits = 100;
    game.minerals = 0;
    gameHelpers.buyResource('minerals', 10);
    expect(game.minerals).toBe(0);
    expect(game.credits).toBe(100);
  });

  test('sellResource decreases resource and increases credits when market is unlocked', () => {
    game.marketUnlocked = true;
    game.credits = 100;
    game.gas = 20;
    gameHelpers.sellResource('gas', 10);
    expect(game.gas).toBe(10);
    expect(game.credits).toBe(115); // Assuming gas price is 1.5 credits
  });

  test('sellResource does not allow selling if market is locked', () => {
    game.marketUnlocked = false;
    game.credits = 100;
    game.gas = 20;
    gameHelpers.sellResource('gas', 10);
    expect(game.gas).toBe(20);
    expect(game.credits).toBe(100);
  });

  test('canUnlockMarket returns false when resources are insufficient', () => {
    game.minerals = 1000;
    game.gas = 1000;
    game.energy = 500;
    expect(gameHelpers.canUnlockMarket()).toBeFalsy();
  });

  test('canUnlockMarket returns true when resources are sufficient', () => {
    game.minerals = 5000;
    game.gas = 2500;
    game.energy = 1000;
    expect(gameHelpers.canUnlockMarket()).toBeTruthy();
  });

  test('unlockMarket function unlocks the market and deducts resources', () => {
    game.minerals = 500;
    game.gas = 250;
    game.energy = 1000;
    gameHelpers.unlockMarket();
    expect(game.marketUnlocked).toBeTruthy();
    expect(game.minerals).toBe(0);
    expect(game.gas).toBe(0);
    expect(game.energy).toBe(0);
  });

  test('market prices are correctly applied when market is unlocked', () => {
    game.marketUnlocked = true;
    game.credits = 1000;
    game.deuterium = 0;
    gameHelpers.buyResource('deuterium', 100);
    expect(game.deuterium).toBe(100);
    expect(game.credits).toBe(500); // Assuming deuterium price is 5 credits
  });

  test('market is initially locked', () => {
    expect(game.marketUnlocked).toBeFalsy();
  });

  test('minerals do not go below zero when selling', () => {
    game.marketUnlocked = true;
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
    game.marketUnlocked = true;
    game.credits = 10;
    game.minerals = 0;
    gameHelpers.buyResource('minerals', 10);
    expect(game.minerals).toBe(10);
    expect(game.credits).toBe(0);
  });

  test('selling resources with fractional amounts', () => {
    game.marketUnlocked = true;
    game.gas = 10.5;
    game.credits = 0;
    gameHelpers.sellResource('gas', 10.5);
    expect(game.gas).toBe(0);
    expect(game.credits).toBeCloseTo(15.75, 2); // Assuming gas price is 1.5
  });

  test('mission completion does not award credits multiple times', () => {
    game.minerals = 2000;
    game.credits = 0;
    gameHelpers.checkMission(0); // Complete "First Steps" mission
    const creditsBefore = game.credits;
    gameHelpers.checkMission(0); // Try to complete it again
    expect(game.credits).toBe(creditsBefore);
  });

  test('upgrade costs increase correctly after multiple purchases', () => {
    const initialCost = game.upgrades[0].cost.minerals;
    for (let i = 0; i < 5; i++) {
      gameHelpers.buyUpgrade(0);
    }
    expect(game.upgrades[0].cost.minerals).toBeGreaterThan(initialCost);
  });
});