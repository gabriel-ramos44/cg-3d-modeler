export const dotProduct = (v1, v2) => {
    return v1.x * v2.x + v1.y * v2.y + v1.z * v2.z;
};

export const normalize = (vector) => {
    const length = Math.sqrt(vector.x * vector.x + vector.y * vector.y + vector.z * vector.z);
    return { x: vector.x / length, y: vector.y / length, z: vector.z / length };
};

export const crossProduct = (v1, v2) => ({
    x: v1.y * v2.z - v1.z * v2.y,
    y: v1.z * v2.x - v1.x * v2.z,
    z: v1.x * v2.y - v1.y * v2.x,
  });

export const subtractVectors = (v1, v2) => {
    return {
        x: v1.x - v2.x,
        y: v1.y - v2.y,
        z: v1.z - v2.z
    };
};

export const vectorByScalar = (v1, k) => {
    return {
        x: v1.x *k,
        y: v1.y *k,
        z: v1.z *k,
    };
};

export const vectorMinusScalar = (v1, k) => {
    return {
        x: v1.x -k,
        y: v1.y -k,
        z: v1.z -k,
    };
};

export const addVectors = (v1, v2) => ({
    x: v1.x + v2.x,
    y: v1.y + v2.y,
    z: v1.z + v2.z
  });