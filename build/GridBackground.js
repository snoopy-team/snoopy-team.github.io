import { canvas } from "./index.js";
import { modVectors, origin, subractVectors } from "./VectorMath.js";
/**
 * For drawing the actual game background that a player should see when playing the game. Has a blue
 * background with some clouds that will pass by as the player flies by.
 */
var CloudySkyBackground = /** @class */ (function () {
    function CloudySkyBackground() {
        // TODO
        this.draw = function (topLeft) {
            var clouds = [];
        };
    }
    return CloudySkyBackground;
}());
export { CloudySkyBackground };
/**
 * For drawing grid lines as a background. This won't necessarily be used as our final background
 * for the project but it will serve the purpose to visually test our camera.
 */
var GridBackground = /** @class */ (function () {
    function GridBackground() {
        // TODO: take in parameters in constructor that are only relevant to GridBackground such as
        // dimensions. Go ahead and make CloudySkyBackground draw() method and see what parameters it
        // needs. Then, abstract to Background interface. 
        /**
         * Given a point of origin and screen bounds (top left, bottom right), draws a grid background
         * where each grid square is the size given by `dimensions`
         * @param ctx our canvas drawing context
         * @param topLeft the absolute, world coordinate of the top left of our viewing area
         * @param bottomRight the absolute, world coordinate of the bottom right of our viewing area
         */
        this.draw = function (ctx, topLeft, bottomRight, dimensions) {
            // This is the (x,y) of the intersection of the top, leftmost horizintal and vertical lines
            // Should be above and to the left of the `topLeft` viewing bound.
            var gridOriginOffset = modVectors(topLeft, dimensions);
            var gridOrigin = subractVectors(origin, gridOriginOffset);
            // Draw vertical lines
            for (var x = gridOrigin.x; x <= canvas.width; x += dimensions.x) {
                ctx.beginPath();
                ctx.moveTo(x, 0);
                ctx.lineTo(x, canvas.height);
                ctx.stroke();
            }
            // Draw horizontal lines
            for (var y = gridOrigin.y; y <= canvas.height; y += dimensions.y) {
                ctx.beginPath();
                ctx.moveTo(0, y);
                ctx.lineTo(canvas.width, y);
                ctx.stroke();
            }
        };
    }
    return GridBackground;
}());
export { GridBackground };
//# sourceMappingURL=GridBackground.js.map