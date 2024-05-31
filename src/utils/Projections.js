
// COMPLETE MATRIX
/*export const computePerspectiveProjMatrix = (window) => {

  const left = window.x.min;
  const right = window.x.max;
  const bottom = window.y.min;
  const top = window.y.max;
  const near = window.z.min;
  const far = window.z.max;

  return [
      [(2 * near) / (right - left), 0, 0, 0],
      [0, (2 * near) / (top - bottom), 0, 0],
      [(right + left) / (right - left), (top + bottom) / (top - bottom), -(far + near) / (far - near), -1],
      [0, 0, -(2 * far * near) / (far - near), 0]
  ];
}*/

export const computeParallelProjectionMatrix = (window) => {
  const { x, y, z } = window;

  const left = x.min;
  const right = x.max;
  const bottom = y.min;
  const top = y.max;
  const near = z.min;
  const far = z.max;
  return[
    [1, 0, 0, 0],
    [0, 1, 0, 0],
    [0, 0, 1, 0],
    [0, 0, 0, 1]

  ]
  /*return [
      [2 / (right - left), 0, 0, -(right + left) / (right - left)],
      [0, 2 / (top - bottom), 0, -(top + bottom) / (top - bottom)],
      [0, 0, -2 / (far - near), -(far + near) / (far - near)],
      [0, 0, 0, 1]
  ];*/
}

export const computePerspectiveProjMatrix = (distance) => {

  const mPers =[
    [1, 0, 0, 0],
    [0, 1, 0, 0],
    [0, 0, 1, 0],
    [0, 0, -1/distance, 0]
  ]

  return mPers;
};
