// TOP
/*export const computeViewMatrix = (window, viewport) => {
    const {u, v} = viewport
    const {x, y, z} = window

    const uDiff = u.max - u.min
    const xDiff = x.max - x.min
    const vDiff = v.max - v.min

    const topMjp =[
      [uDiff/xDiff, 0, 0, -x.min*(uDiff/xDiff)+u.min],
      [0, 1, 0, 0],
      [0, 0, (v.min-v.max)/(z.min-z.max), z.max*(vDiff/(z.min-z.max))+v.max],
      [0, 0, 0, 1]
    ]

    return topMjp;
  };*/

  export const computeViewMatrix = (window, viewport) => {
    const {u, v} = viewport
    const {x, y, z} = window

    const uDiff = u.max - u.min
    const xDiff = x.max - x.min
    const yDiff = y.max - y.min
    const vDiff = v.max - v.min

    const Mjp =[
      [uDiff/xDiff, 0, 0, -x.min*(uDiff/xDiff)+u.min],
      [0, (vDiff)/yDiff, 0, -y.min*(vDiff/yDiff)+v.min],
      [0, 0, 1, 0],
      [0, 0, 0, 1]
    ]

    return Mjp;
  };

  // FRONT
 /*export const computeViewMatrix = (window, viewport) => {
    const {u, v} = viewport
    const {x, y, z} = window

    const uDiff = u.max - u.min
    const xDiff = x.max - x.min
    const yDiff = y.max - y.min
    const vDiff = v.max - v.min

    const frontMjp =[
      [uDiff/xDiff, 0, 0, -x.min*(uDiff/xDiff)+u.min],
      [0, (v.min-v.max)/yDiff, 0, y.min*(vDiff/yDiff)+v.max],
      [0, 0, 1, 0],
      [0, 0, 0, 1]
    ]

    return frontMjp;
  };*/
