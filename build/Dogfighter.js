import { canvas, ctx, constants } from './index.js';
import { Agent } from './Agents.js';
import { Bullet } from './Bullet.js';
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
            _this.serverUpdateManager.beginRequestingUpdates();
            var millisPerFrame = 1000 / constants.FPS;
            setInterval(function () {
                // Clear screen before next draw
                ctx.clearRect(0, 0, canvas.width, canvas.height);
                // Render background
                ctx.fillStyle = constants.BACKGROUND_COLOR;
                ctx.fillRect(0, 0, canvas.width, canvas.height);
                // apply all updates, if any, to the players and bullets
                if (_this.serverUpdateManager.hasUpdate()) {
                    // Get most recent update
                    var serverUpdate = _this.serverUpdateManager.getUpdate();
                    // Update players
                    for (var _i = 0, _a = serverUpdate.players; _i < _a.length; _i++) {
                        var state = _a[_i];
                        // Check if player is new
                        var playerIsNew = !_this.players.hasOwnProperty(state.id);
                        if (playerIsNew) {
                            _this.players[state.id] = new Agent(state);
                        }
                        _this.players[state.id].getServerUpdate(state);
                    }
                    // Update bullets
                    for (var _b = 0, _c = serverUpdate.bullets; _b < _c.length; _b++) {
                        var state = _c[_b];
                        // Check if bullet is new
                        var bulletIsNew = !_this.bullets.hasOwnProperty(state.id);
                        if (bulletIsNew) {
                            _this.bullets[state.id] = new Bullet(state.position, state.velocity);
                        }
                        _this.bullets[state.id].getServerUpdate(state);
                    }
                }
                // Update players
                for (var _d = 0, _e = Object.keys(_this.players); _d < _e.length; _d++) {
                    var playerID = _e[_d];
                    var secPerFrame = millisPerFrame / 1000;
                    var player = _this.players[playerID];
                    player.update(secPerFrame);
                    player.drawSprite();
                }
                // Update bullets
                for (var _f = 0, _g = Object.keys(_this.bullets); _f < _g.length; _f++) {
                    var bulletID = _g[_f];
                    var secPerFrame = millisPerFrame / 1000;
                    var bullet = _this.bullets[bulletID];
                    bullet.update(secPerFrame);
                    bullet.drawSprite();
                }
                // Add debug info to the top left
                if (constants.DEBUG_MODE) {
                    var index = 0;
                    for (var _h = 0, _j = Object.keys(_this.players); _h < _j.length; _h++) {
                        var key = _j[_h];
                        var player = _this.players[key];
                        ctx.font = "15px Arial";
                        var pos = "(" + player.getPosition().x + ", " + player.getPosition().y + ")";
                        ctx.fillText("Player ID: \"" + key + "\", Position: " + pos, 30, 30);
                        index++;
                    }
                }
            }, millisPerFrame);
        };
        /**
         * Registers a new player given an Agent to represent the player and an ID for the player
         * @param player a new player in the game. Can be any type of player (i.e. AI, manual, etc.)
         * @param id the id that we will associate the player with when we receive updates from the server
         */
        this.addPlayer = function (player, id) {
            _this.players[id] = player;
        };
        /**
         * Registers a new bullet, given an Agent and and a string ID to associate this new player with.
         * @param bullet the bullet object
         * @param id an ID to associate the bullet with
         */
        this.addBullet = function (bullet, id) {
            _this.bullets[id] = bullet;
        };
        this.players = {};
        this.bullets = {};
        this.serverUpdateManager = updateManager;
    }
    return GameWorld;
}());
export { GameWorld };
//# sourceMappingURL=Dogfighter.js.map