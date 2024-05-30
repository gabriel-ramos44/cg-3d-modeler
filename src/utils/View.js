// TOP
export const computeViewMatrix = (window, viewport) => {
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
/*
  export const createMjp(window, viewport) => {
    const {u, v} = viewport
    const {x, y, z} = window

    const uDiff = u.max - u.min
    const xDiff = x.max - x.min
    const vDiff = v.max - v.min

    let Mjp = [
      [uDiff/xDiff, 0, 0, Tx],
      [0, Sy, 0, Ty],
      [0, 0, 1, 0],
      [0, 0, 0, 1],
    ];
    return Mjp;
  }


  function createMjp(Xmin, Xmax, Ymin, Ymax, Umin, Umax, Vmin, Vmax) {
    let Sx = (Umax - Umin) / (Xmax - Xmin);
    let Sy = (Vmax - Vmin) / (Ymax - Ymin);
    let Tx = (Umin * Xmax - Umax * Xmin) / (Xmax - Xmin);
    let Ty = (Vmin * Ymax - Vmax * Ymin) / (Ymax - Ymin);
    let Mjp = [
      [Sx, 0, 0, Tx],
      [0, Sy, 0, Ty],
      [0, 0, 1, 0],
      [0, 0, 0, 1],
    ];
    return Mjp;
  }
*/