export const parallelProjection = (point) => {
    return {
      x: point.x,
      y: point.y
    };
  };

export const perspectiveProjection = (point, d) => {
    return {
      x: (point.x * d) / (point.z + d),
      y: (point.y * d) / (point.z + d)
    };
  };
