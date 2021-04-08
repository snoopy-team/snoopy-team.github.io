var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
import { canvas, ctx } from './index.js';
import { addVectors, multiplyVectors, origin, subractVectors } from './VectorMath.js';
/**
 * Represents a Camera through which the player sees the world. A Camera will control where objects
 * are rendered on the screen or if they should be rendered at all. For instance, an object that is
 * at world position (500,500) may not be rendered if the camera is currently looking at 50x50 and
 * does not have enough space on the screen to show objects at (500,500).
 *
 * Potential functionality for a Camera which is not necessarily implemented is scaling (zooming in
 * or zooming out) of a game scene, following any player (AI or manually-controlled), following a
 * defined line of motion (i.e. for a cut scene), or even following a position controlled by arrow
 * keys (i.e. for a debug camera)
 */
var Camera = /** @class */ (function () {
    /**
     * Constructs a new Camera, given information about what to follow
     * @param positionToCenter A function that returns a position where this Camera should center on.
     * For instance, you might want a Camera to focus on the (x,y) coords of an Agent. Or, you might
     * want a free Camera that moves around with your arrow keys.
     */
    function Camera(positionToCenter, scene, background, scale) {
        var _this = this;
        if (scale === void 0) { scale = 1; }
        this.FOLLOW_DISTANCE = 50;
        // Percentage of gap between curr position & dest position to close each update. See this.update
        this.lerpFactor = 0.1;
        /**
         * Updates the position to center on.
         * @param positionToCenter A function that returns a position where this Camera should center on.
         * For instance, you might want a Camera to focus on the (x,y) coords of an Agent. Or, you might
         * want a free Camera that moves around with your arrow keys.
         */
        this.centerOn = function (positionToCenter) {
            _this.destinationPosition = positionToCenter;
        };
        /**
         * Shakes the camera. Used for effects like getting hit with a bullet.
         */
        this.shake = function (deltaTime) {
            if (!_this.isShaking) {
                _this.isShaking = true;
            }
            // Only shake for 500ms
            if (_this.shakeTimeElapsed <= 0.5) {
                // let periodLength = (this.shakeTimeElapsed / Math.PI)
                var toAdd = _this.shakeTimeElapsed == 0
                    ? 0
                    : Math.sin(50 * _this.shakeTimeElapsed) / _this.shakeTimeElapsed;
                _this.augmentedPosition = addVectors(_this.pathPosition, { x: 0, y: toAdd });
                _this.shakeTimeElapsed += deltaTime;
            }
            else {
                _this.shakeTimeElapsed = 0;
                _this.isShaking = false;
                _this.augmentedPosition = _this.pathPosition;
            }
        };
        /**
         * Renders all `SceneObject`s that this `Camera` is keeping track of in `this.scene`.
         * The current approach is to linearly check if each object should be on the screen. However, a
         * future implemention of scene may allow us to simply get all coordinates in an area.
         */
        this.renderAll = function () {
            // Draw background
            var worldBounds = _this.computeWorldBounds();
            var gridSquareSize = 100;
            var gridSquareVec = { x: _this.scale * gridSquareSize, y: _this.scale * gridSquareSize };
            _this.background.draw(ctx, worldBounds.topLeft, worldBounds.bottomRight, gridSquareVec);
            // Draw all objects
            for (var _i = 0, _a = _this.scene; _i < _a.length; _i++) {
                var object = _a[_i];
                var objPos = object.getPosition();
                var scaledSize = multiplyVectors({ x: _this.scale, y: _this.scale }, object.getSize());
                if (_this.coordWithinBounds(objPos)) {
                    var objectScreenCoords = _this.worldToScreenCoords(objPos);
                    object.drawSprite(objectScreenCoords, scaledSize);
                }
            }
        };
        // Returns the top left and bottom right coordinates that this camera can see in World
        // Coordinates.
        this.computeWorldBounds = function () {
            // Compute bounds
            var topLeft = {
                x: _this.augmentedPosition.x - _this.axesRadii.x / _this.scale,
                y: _this.augmentedPosition.y - _this.axesRadii.y / _this.scale
            };
            var bottomRight = {
                x: _this.augmentedPosition.x + _this.axesRadii.x / _this.scale,
                y: _this.augmentedPosition.y + _this.axesRadii.y / _this.scale
            };
            return { topLeft: topLeft, bottomRight: bottomRight };
        };
        // Determines if the given bounds are within the bounds of what the camera can "see" in World
        // Coordinates.
        this.coordWithinBounds = function (coord) {
            // Compute bounds
            var topLeft = _this.computeWorldBounds().topLeft;
            var bottomRight = _this.computeWorldBounds().bottomRight;
            return coord.x >= topLeft.x && coord.y >= topLeft.y
                && coord.x <= bottomRight.x && coord.y <= bottomRight.y;
        };
        this.destinationPosition = positionToCenter;
        this.pathPosition = this.destinationPosition();
        this.augmentedPosition = this.pathPosition;
        this.scene = scene;
        this.background = background;
        this.scale = scale;
        this.axesRadii = { x: this.scale * (canvas.width / 2), y: this.scale * (canvas.height / 2) };
        this.shakeTimeElapsed = 0;
        this.isShaking = false;
    }
    ;
    /**
     * Smoothly interpolate toward destination until camera is FOLLOW_DISTANCE from destination, then
     * clamp to FOLLOW_DISTANCE away from destination.
     */
    Camera.prototype.update = function (deltaTime) {
        var destPos = this.destinationPosition();
        var diff = subractVectors(destPos, this.pathPosition);
        // Only update position if the difference between current and destination is greater than 1
        if (Math.abs(diff.x) > 1 || Math.abs(diff.y) > 1) {
            var newPos = { x: 0, y: 0 };
            if (diff.x <= this.FOLLOW_DISTANCE) {
                newPos.x = this.pathPosition.x + diff.x * this.lerpFactor;
            }
            else {
                newPos.x = destPos.x - Math.sign(diff.x) * this.FOLLOW_DISTANCE;
            }
            if (diff.y <= this.FOLLOW_DISTANCE) {
                newPos.y = this.pathPosition.y + diff.y * this.lerpFactor;
            }
            else {
                newPos.y = destPos.y - Math.sign(diff.y) * this.FOLLOW_DISTANCE;
            }
            this.pathPosition = newPos;
        }
        if (this.isShaking) {
            this.shake(deltaTime);
        }
        else {
            this.augmentedPosition = this.pathPosition;
        }
    };
    // Converts the given world coordinates to screen coordinates. This factors in both scaling and
    // the center position of the screen that this camera can see.
    Camera.prototype.worldToScreenCoords = function (coord) {
        return {
            x: canvas.width / 2 + this.scale * (coord.x - this.augmentedPosition.x),
            y: canvas.height / 2 + this.scale * (coord.y - this.augmentedPosition.y),
        };
    };
    return Camera;
}());
export { Camera };
/**
 * Same as normal camera, except follows arrow key controls instead of focusing on a player.
 * DebugCamera has the ability to toggle debug capabilities on or off (if off, is a normal Camera).
 */
var DebugCamera = /** @class */ (function (_super) {
    __extends(DebugCamera, _super);
    function DebugCamera(scene, background, scale) {
        if (scale === void 0) { scale = 1; }
        var _this = _super.call(this, function () { return origin; }, scene, background, scale) || this;
        _this.update = function (deltaTime) {
            // Show and allow debug features if debug mode is on. Otherwise, act like a normal Camera.
            if (_this.debugOn) {
                var vel = 50;
                // Update position from keyboard inputs
                if (_this.keysDown.includes('ArrowUp')) {
                    _this.augmentedPosition = addVectors({ x: 0, y: -vel }, _this.augmentedPosition);
                }
                else if (_this.keysDown.includes('ArrowDown')) {
                    _this.augmentedPosition = addVectors({ x: 0, y: vel }, _this.augmentedPosition);
                }
                if (_this.keysDown.includes('ArrowRight')) {
                    _this.augmentedPosition = addVectors({ x: vel, y: 0 }, _this.augmentedPosition);
                }
                else if (_this.keysDown.includes('ArrowLeft')) {
                    _this.augmentedPosition = addVectors({ x: -vel, y: 0 }, _this.augmentedPosition);
                }
                if (_this.isShaking)
                    _this.shake(deltaTime);
            }
            else {
                _super.prototype.update.call(_this, deltaTime);
            }
        };
        // Toggles debug menu and debug capabilities (like arrow key movement and mousewheel zooming)
        _this.toggleDebugFeatures = function () {
            _this.debugOn = !_this.debugOn;
        };
        _this.debugOn = true;
        _this.keysDown = [];
        _this.debugLines = [];
        _this.debugLines.push(function () { return "Camera Mode: " + (_this.debugOn ? 'Debug Camera' : 'Player Camera'); });
        _this.debugLines.push(function () { return "Spacebar to toggle camera mode"; });
        _this.debugLines.push(function () { return "Scroll to zoom, arrow keys to pan camera in debug mode"; });
        document.addEventListener('keydown', function (e) {
            _this.keysDown.push(e.key);
            // Toggle Camera type on space
            if (e.key == ' ') {
                _this.toggleDebugFeatures();
            }
            // Simulate shaek
            if (e.key == 's') {
                _this.shake(0);
            }
        });
        document.addEventListener('keyup', function (e) {
            _this.keysDown = _this.keysDown.filter(function (key) { return key != e.key; });
        });
        // On scroll, update zoom
        document.addEventListener('wheel', function (e) {
            e.preventDefault();
            _this.scale += e.deltaY * -0.01;
            // Restrict scale from [.125, 3]
            _this.scale = Math.min(Math.max(.125, _this.scale), 3);
        }, { passive: false });
        return _this;
    }
    /**
     * Adds a line of text to the debug menu
     * @param line a function that returns a line of text to add to the debug menu
     */
    DebugCamera.prototype.addToDebugMenu = function (line) {
        this.debugLines.push(line);
    };
    /**
     * Displays the debug menu in the top left corner of the screen
     */
    DebugCamera.prototype.displayDebugMenu = function () {
        ctx.font = "15px Arial";
        var currLineYPos = 30;
        for (var _i = 0, _a = this.debugLines; _i < _a.length; _i++) {
            var grabDebugMessage = _a[_i];
            ctx.fillText(grabDebugMessage(), 30, currLineYPos);
            currLineYPos += 30;
        }
    };
    return DebugCamera;
}(Camera));
export { DebugCamera };
//# sourceMappingURL=Scene.js.map