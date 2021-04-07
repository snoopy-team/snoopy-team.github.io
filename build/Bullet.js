import { ctx } from "./index.js";
/**
 * Holds the state and behavior for a bullet, such as updating and drawing itself
 */
var Bullet = /** @class */ (function () {
    function Bullet(position, velocity) {
        var _this = this;
        /**
         * Returns this Bullets position
         */
        this.getPosition = function () {
            return _this.position;
        };
        /**
         * Draws the sprite of this bullet. Note that the size parameter represents the radius on both the
         * x AND y axis.
         */
        this.drawSprite = function (pos, size) {
            ctx.fillStyle = 'black';
            ctx.beginPath();
            ctx.arc(pos.x, pos.y, size.x, 0, Math.PI * 2);
            ctx.fill();
        };
        /**
         *
         */
        this.getSize = function () {
            return { x: _this.radius, y: _this.radius };
        };
        /**
         * Given an amount of time that has passed since the last frame, update the properties of this
         * bullet.
         * @param deltaTime the amount of time in seconds (typically a fraction of a second) that has
         * passed since the last update
         */
        this.update = function (deltaTime) {
            _this.position.x += _this.velocity.x * deltaTime;
            _this.position.y += _this.velocity.y * deltaTime;
        };
        /**
         * Given a server update BulletState, set this bullet's properties to the new state provided
         * @param newState the state to interpolate toward
         */
        this.getServerUpdate = function (newState) {
            _this.velocity = newState.velocity;
            _this.position = newState.position;
        };
        this.position = position;
        this.velocity = velocity;
        this.radius = 10;
    }
    return Bullet;
}());
export { Bullet };
//# sourceMappingURL=Bullet.js.map