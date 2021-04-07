export var origin = { x: 0, y: 0 };
/**
 * Given two vectors, returns v1 + v2
 */
export var addVectors = function (v1, v2) {
    return {
        x: v1.x + v2.x,
        y: v1.y + v2.y
    };
};
/**
 * Given two vectors, returns v1 - v2
 */
export var subractVectors = function (v1, v2) {
    return {
        x: v1.x - v2.x,
        y: v1.y - v2.y
    };
};
/**
 * Given two vectors, returns v1 * v2
 */
export var multiplyVectors = function (v1, v2) {
    return {
        x: v1.x * v2.x,
        y: v1.y * v2.y
    };
};
/**
 * Given two vectors, returns v1 % v2
 */
export var modVectors = function (v1, v2) {
    return {
        x: v1.x % v2.x,
        y: v1.y % v2.y
    };
};
/**
 * Generates a random number in the range [start, end], where both ends are inclusive
 * @param max (int) the beginning of the range, inclusive
 * @param min (int) the end of the range, inclusive
 */
export var randInt = function (max, min) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
};
//# sourceMappingURL=VectorMath.js.map