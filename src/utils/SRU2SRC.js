import { multiplyMatrices } from './MatricesOperations';
import { normalize, crossProduct, subtractVectors, dotProduct, vectorByScalar, vectorMinusScalar } from './VectorsOperations';


export const computeCameraMatrix = (VRP, P, viewUp) => {
  let n = normalize(subtractVectors(VRP, P));

  let dot = dotProduct(viewUp, n);

  let y = vectorByScalar(n, dot);
  let v = normalize(subtractVectors(viewUp, y));

  let u = crossProduct(v, n);


  // Monta a matriz de conversão Msrusrc
  let cameraMatrix = [
    [u.x, u.y, u.z, -dotProduct(u, VRP)],
    [v.x, v.y, v.z, -dotProduct(v, VRP)],
    [n.x, n.y, n.z, -dotProduct(n, VRP)],
    [0, 0, 0, 1],
  ];
  return cameraMatrix;
  };