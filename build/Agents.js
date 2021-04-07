import { ctx } from './index.js';
import { addVectors, subractVectors, multiplyVectors } from './VectorMath.js';
/**
 * Represents an agent, either AI controlled or player controlled.
 */
var Agent = /** @class */ (function () {
    /**
     * Sets all properties to the given state and sets the destination to the current
     * properties (i.e. this.destinationVelocity = this.velocity)
     */
    function Agent(state, drawSprite, size) {
        var _this = this;
        // ------- Where I am currently -------
        this.orientation = 0; // In radians
        /**
         * Draw sprite on the canvas, where its center is at this.position. Currently the sprite is a
         * simple black rectangle.
         */
        this.drawSprite = function (location, size) {
            var width = size.x;
            var height = size.y;
            // Where we want our rect to be drawn
            var centeredPos = {
                x: location.x - width / 2,
                y: location.y - height / 2
            };
            _this.rotateThenDraw(centeredPos, _this.orientation, centeredPos, function (pos) { return _this.drawSpriteImage(pos, size); });
        };
        /**
         * Returns the world position of this Agent (as opposed to screen coordinates)
         */
        this.getPosition = function () { return _this.position; };
        /**
         *
         */
        this.getSize = function () { return _this.size; };
        // TODO: Discuss whether below is a good design decision. Will probably lead to some weird quirks
        // with movement not feeling responsive.
        // TODO: figure out what the cooldown property is and how to update it
        /**
         * First, interpolates properties toward destination properties defined in last server update.
         * Then changes properties in response to a change in time, such as adding velocity to position.
         *
         * Note that this current implementation only internpolates the velocity and acceleration. The
         * next time the server gives us an update, we'll snap to the destination position, but until
         * then, we'll trust that our velocity and acceleration should get us there (generally).
         *
         * @param deltaTime the amount of time, in seconds, that has changed since the last update
         */
        this.update = function (deltaTime) {
            // // Find the difference between our velocity and acceleration vectors
            // let velocityDiff = subractVectors(this.destinationVelocity, this.velocity);
            // let accelerationDiff = subractVectors(this.destinationAcceleration, this.acceleration);
            // let orientationDiff = this.destinationOrientation - this.orientation;
            // // percentage to reduce the difference by on both axes
            // let reduceAmt = 0.1;
            // let reduceVec = { x: reduceAmt, y: reduceAmt };
            // this.velocity = addVectors(this.velocity, multiplyVectors(reduceVec, velocityDiff));
            // this.acceleration = addVectors(this.acceleration, multiplyVectors(reduceVec, accelerationDiff));
            // this.orientation += orientationDiff * reduceAmt;
            // Change our position according to our updated velocity and acceleration. Multiplying by
            // deltaTime makes sure we don't increase by the full velocity/acceleration every call to update
            _this.position = addVectors(_this.position, multiplyVectors(_this.velocity, { x: deltaTime, y: deltaTime }));
            _this.velocity = addVectors(_this.velocity, multiplyVectors(_this.acceleration, { x: deltaTime, y: deltaTime }));
        };
        /**
         * Given a server update AgentState, jump to the previous destination and make the new destination
         * state the given newState.
         * @param newState the state to interpolate toward
         */
        this.getServerUpdate = function (newState) {
            // Set all current attributes to the destination attributes
            _this.position = newState.position;
            _this.velocity = newState.velocity;
            _this.acceleration = newState.acceleration;
            _this.orientation = newState.orientation;
            _this.cooldown = newState.cooldown;
            // Set the destination to the new state
            // TODO: decide whether to uncomment this or not... depends on how we decide to deal with server
            // updates.
            // this.destinationPosition = newState.position;
            // this.destinationVelocity = newState.velocity;
            // this.destinationAcceleration = newState.acceleration;
            // this.destinationOrientation = newState.orientation;
            // this.destinationCooldown = newState.cooldown;
        };
        // Rotates canvas, runs the given draw function, then resets angle of canvas
        this.rotateThenDraw = function (pos, radians, centeredPos, draw) {
            // rotate() rotates the entire drawing context, and rotates about the origin. To fix this, we
            // first translate to the center of our object to draw, then rotate, then draw, then reset our
            // translation
            ctx.translate(centeredPos.x, centeredPos.y);
            ctx.rotate(radians);
            // Draw at a corrected position. The origin is now centered where we want our centered rectangle
            // to be, so we need to draw at the centered location with our current position subtracted out.
            draw(subractVectors(centeredPos, pos));
            ctx.rotate(-radians);
            ctx.translate(-centeredPos.x, -centeredPos.y);
        };
        this.size = size;
        this.drawSpriteImage = drawSprite;
        this.position = state.position;
        this.velocity = state.velocity;
        this.acceleration = state.acceleration;
        this.orientation = state.orientation;
        this.cooldown = state.cooldown;
        // Destination props are the same as current props initially
        this.destinationPosition = this.position;
        this.destinationVelocity = this.velocity;
        this.destinationAcceleration = this.acceleration;
        this.destinationOrientation = this.orientation;
        this.destinationCooldown = this.cooldown;
    }
    return Agent;
}());
export { Agent };
//# sourceMappingURL=Agents.js.map