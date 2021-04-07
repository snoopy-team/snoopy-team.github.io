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
//# sourceMappingURL=Vectors.js.map