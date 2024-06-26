import { normalize, dotProduct } from './VectorsOperations';

export const calculateNormal = (p0, p1, p2) => {
    //isVectorsAnticlockwise(p0, p1, p2)

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

    const normalizedVectorToVRP =  normalize(vectorToVRP)

    const dotProduct1 = dotProduct(normal, normalizedVectorToVRP)

    return dotProduct1 > 0;
};

  const isVectorsAnticlockwise = (p0, p1, p2) => {
    const AB = {
        x: p1.x - p0.x,
        y: p1.y - p0.y,
        z: p1.z - p0.z
    };

    const AC = {
        x: p2.x - p0.x,
        y: p2.y - p0.y,
        z: p2.z - p0.z
    };

    const crossProduct = {
        x: AB.y * AC.z - AB.z * AC.y,
        y: AB.z * AC.x - AB.x * AC.z,
        z: AB.x * AC.y - AB.y * AC.x
    };

    const area = 0.5 * Math.sqrt(crossProduct.x * crossProduct.x + crossProduct.y * crossProduct.y + crossProduct.z * crossProduct.z);

    const orientation = area < 0 ? 'sentido horario' : 'sentido anti-horario';

    console.log(orientation);
}