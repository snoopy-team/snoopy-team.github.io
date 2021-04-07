import { canvas, ctx, constants, imageSnoopy } from './index.js';
import { Agent } from './Agents.js';
import { Bullet } from './Bullet.js';
import { Camera, DebugCamera } from './Scene.js';
import { GridBackground } from './GridBackground.js';
import { origin } from './VectorMath.js';
/**
 * Holds the main game loop for this dogfighting game. Holds the state and behavior necessary to
 * continuously run a game.
 */
var GameWorld = /** @class */ (function () {
    /**
     * Constructs a GameWorld from information that is available via a server update packet.
     * @param players the dogfighters to render
     * @param bullets the bullets to render
     * @param updateManager the manager for the server we're listening to that will provide us with
     * updates to our game objects
     */
    function GameWorld(updateManager) {
        var _this = this;
        /**
         * This will loop at the speed of constants.FPS, moving and animating all players and bullets on
         * the screen.
         */
        this.gameLoop = function () {
            // Only request continual updates once, on the first call of the gameLoop
            if (!_this.isRequestingUpdates) {
                _this.serverUpdateManager.beginRequestingUpdates();
                _this.isRequestingUpdates = true;
            }
            var now = Date.now();
            _this.millisPassedSinceLastFrame += now - _this.before;
            var millisPerFrame = 1000 / constants.FPS;
            if (_this.millisPassedSinceLastFrame >= millisPerFrame) {
                // Clear screen before next draw
                ctx.clearRect(0, 0, canvas.width, canvas.height);
                // apply all updates, if any, to the players and bullets
                if (_this.serverUpdateManager.hasUpdate()) {
                    // Get most recent update
                    var serverUpdate = _this.serverUpdateManager.getUpdate();
                    var _loop_1 = function (state) {
                        // Check if player is new
                        var playerIsNew = !_this.players.hasOwnProperty(state.id);
                        if (playerIsNew) {
                            var agent_1 = new Agent(state, function (pos, size) {
                                // TODO: figure out how to determine which player to draw (Snoopy vs Red Barron)
                                ctx.drawImage(imageSnoopy, pos.x, pos.y, size.x, size.y);
                            }, { x: 100, y: 150 } // Will need to change this for drawing Red Barron sprite
                            );
                            _this.players[state.id] = agent_1;
                            _this.scene.push(agent_1);
                            _this.camera.centerOn(agent_1.getPosition);
                            if (constants.DEBUG_MODE) {
                                ctx.font = "15px Arial";
                                _this.camera.addToDebugMenu(function () { return "Player ID: \"" + state.id + "\", Position: (" + Math.round(agent_1.getPosition().x) + ", " + Math.round(agent_1.getPosition().y) + ")"; });
                                _this.camera.addToDebugMenu(function () { return "Press \"s\" to simulate camera shake."; });
                            }
                        }
                        _this.players[state.id].getServerUpdate(state);
                    };
                    // Update players
                    for (var _i = 0, _a = serverUpdate.players; _i < _a.length; _i++) {
                        var state = _a[_i];
                        _loop_1(state);
                    }
                    // Update bullets
                    for (var _b = 0, _c = serverUpdate.bullets; _b < _c.length; _b++) {
                        var state = _c[_b];
                        // Check if bullet is new
                        var bulletIsNew = !_this.bullets.hasOwnProperty(state.id);
                        if (bulletIsNew) {
                            var bullet = new Bullet(state.position, state.velocity);
                            _this.bullets[state.id] = bullet;
                            _this.scene.push(bullet);
                        }
                        _this.bullets[state.id].getServerUpdate(state);
                    }
                }
                // Update players
                for (var _d = 0, _e = Object.keys(_this.players); _d < _e.length; _d++) {
                    var playerID = _e[_d];
                    var secPerFrame = millisPerFrame / 1000;
                    var player = _this.players[playerID];
                    player.update(_this.millisPassedSinceLastFrame / 1000);
                }
                // Update bullets
                for (var _f = 0, _g = Object.keys(_this.bullets); _f < _g.length; _f++) {
                    var bulletID = _g[_f];
                    var secPerFrame = millisPerFrame / 1000;
                    var bullet = _this.bullets[bulletID];
                    bullet.update(_this.millisPassedSinceLastFrame / 1000);
                }
                // Draw all game objects
                _this.camera.update(_this.millisPassedSinceLastFrame / 1000);
                _this.camera.renderAll();
                // Add debug info to the top left
                if (constants.DEBUG_MODE) {
                    _this.camera.displayDebugMenu();
                }
                _this.millisPassedSinceLastFrame = 0;
            }
            _this.before = now;
            requestAnimationFrame(_this.gameLoop);
        };
        /**
         * Registers a new player given an Agent to represent the player and an ID for the player
         * @param player a new player in the game. Can be any type of player (i.e. AI, manual, etc.)
         * @param id the id that we will associate the player with when we receive updates from the server
         */
        this.addPlayer = function (player, id) {
            _this.players[id] = player;
            _this.scene.push(player);
        };
        /**
         * Registers a new bullet, given an Agent and and a string ID to associate this new player with.
         * @param bullet the bullet object
         * @param id an ID to associate the bullet with
         */
        this.addBullet = function (bullet, id) {
            _this.bullets[id] = bullet;
            _this.scene.push(bullet);
        };
        this.players = {};
        this.bullets = {};
        this.serverUpdateManager = updateManager;
        this.isRequestingUpdates = false;
        this.before = Date.now();
        this.millisPassedSinceLastFrame = 0;
        this.scene = [];
        this.camera = new Camera(function () { return origin; }, this.scene, new GridBackground());
        this.camera = new DebugCamera(this.scene, new GridBackground());
        this.finishedCreatingDebugMenu = false;
    }
    return GameWorld;
}());
export { GameWorld };
//# sourceMappingURL=GameWorld.js.map