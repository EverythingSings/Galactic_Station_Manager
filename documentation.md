Galactic Station Manager - Architectural Documentation
1. Core Components
1.1 Game State (gameState.js)
Manages the central game object containing all game data
Includes resources, upgrades, buildings, research, market prices, and missions
1.2 Game Helpers (gameHelpers.js)
Contains core game logic functions
Handles resource production, upgrades, building construction, and research
1.3 UI Helpers (uiHelpers.js)
Manages UI updates and interactions
Handles displaying game state, upgrades, buildings, and research options
1.4 Main Script (script.js)
Entry point for the game
Sets up event listeners and initializes the game
2. Key Functions and Their Purposes
2.1 Resource Management
mine(): Increases minerals based on mining power
extract(): Increases gas based on extraction power
produceResources(): Automatically generates resources based on buildings
2.2 Upgrades and Buildings
buyUpgrade(): Purchases upgrades and applies their effects
buildStructure(): Constructs buildings to increase resource production
2.3 Research
conductResearch(): Improves various aspects of the game through research
2.4 UI Updates
updateDisplay(): Updates the UI to reflect current game state
updateUpgrades(), updateBuildings(), updateResearch(): Update specific UI sections
3. Data Flow
User interactions trigger functions in script.js
These functions modify the game state in gameState.js
gameHelpers.js functions are called to process game logic
uiHelpers.js functions update the UI to reflect changes
4. Extension Points
4.1 Adding New Resources
Extend the game object in gameState.js
Add new resource generation logic in gameHelpers.js
Update UI functions in uiHelpers.js to display new resources
4.2 New Upgrades or Buildings
Add new entries to the upgrades or buildings objects in gameState.js
Implement effects in gameHelpers.js
Update UI rendering in uiHelpers.js
4.3 New Research Areas
Add new research types to the research object in gameState.js
Implement research effects in applyResearchEffects() in gameHelpers.js
4.4 New Game Mechanics
Implement core logic in gameHelpers.js
Update game state in gameState.js
Add UI elements and update functions in uiHelpers.js
Set up event listeners in script.js
5. Testing
Unit tests are available in gamehelpers.test.js
Consider adding more tests when implementing new features or refactoring
6. Potential Improvements
Implement a module system for better code organization
Create separate files for different game systems (e.g., research, buildings)
Implement a proper state management system for easier data flow
Add more extensive error handling and logging
Improve performance by optimizing resource production calculations
