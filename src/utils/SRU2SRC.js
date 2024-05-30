import { multiplyMatrices } from './MatricesOperations';
import { normalize, crossProduct } from './VectorsOperations';

export const computeCameraMatrix = (VRP, P, viewUp) => {
    // Calculate N, the normalized direction vector from VRP to P
    const N = normalize({
      x: VRP.x - P.x,
      y: VRP.y - P.y,
      z: VRP.z -P.z,
    });
    //console.log('Vector N')
    //console.log(N)

    // Calculate U, the perpendicular vector to N and viewUp
    const U = normalize(crossProduct(viewUp, N));

    // Calculate V, the adjusted viewUp vector
    const V = crossProduct(N, U);
    //console.log('Vector V')
    //console.log(V)

    // Create the rotation matrix
    const rotationMatrix = [
      [U.x, U.y, U.z, 0],
      [V.x, V.y, V.z, 0],
      [N.x, N.y, N.z, 0],
      [0, 0, 0, 1],
    ];

    // Create the translation matrix
    const translationMatrix = [
      [1, 0, 0, -VRP.x],
      [0, 1, 0, -VRP.y],
      [0, 0, 1, -VRP.z],
      [0, 0, 0, 1],
    ];

    // Combine the rotation and translation matrix
    // M(SRU, SRC)
    const cameraMatrix = multiplyMatrices(rotationMatrix, translationMatrix );

    /*console.log('Camera Matrix:');
    for (const row of cameraMatrix) {
        console.log(row.join('\t'));
    }
    console.log('________________________')*/
    return cameraMatrix;
  };