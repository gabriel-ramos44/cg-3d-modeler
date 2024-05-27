export const calculateNormal = (p0, p1, p2) => {
    const u = {
        x: p1.x - p0.x,
        y: p1.y - p0.y,
        z: p1.z - p0.z
    };

    const v = {
        x: p2.x - p0.x,
        y: p2.y - p0.y,
        z: p2.z - p0.z
    };

    const normal = {
        x: u.y * v.z - u.z * v.y,
        y: u.z * v.x - u.x * v.z,
        z: u.x * v.y - u.y * v.x
    };

    const length = Math.sqrt(normal.x * normal.x + normal.y * normal.y + normal.z * normal.z);
    return { x: normal.x / length, y: normal.y / length, z: normal.z / length };
};

export const isFaceVisible = (centroid, normal, VRP) => {
    const vectorToVRP = {
        x: VRP.x - centroid.x,
        y: VRP.y - centroid.y,
        z: VRP.z - centroid.z
    };

    const length = Math.sqrt(vectorToVRP.x * vectorToVRP.x + vectorToVRP.y * vectorToVRP.y + vectorToVRP.z * vectorToVRP.z);
    const normalizedVectorToVRP = { x: vectorToVRP.x / length, y: vectorToVRP.y / length, z: vectorToVRP.z / length };

    const dotProduct = normal.x * normalizedVectorToVRP.x + normal.y * normalizedVectorToVRP.y + normal.z * normalizedVectorToVRP.z;
    return dotProduct < 0;
};
