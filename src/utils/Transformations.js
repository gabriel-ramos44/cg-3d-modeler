export const translate = (point, tx, ty, tz) => {
    return {
      x: point.x + tx,
      y: point.y + ty,
      z: point.z + tz,
    };
  };

  export const rotateX = (point, angleInDegrees) => {
    const angleInRadians = (angleInDegrees * Math.PI) / 180;
    return {
      x: point.x,
      y: point.y * Math.cos(angleInRadians) - point.z * Math.sin(angleInRadians),
      z: point.y * Math.sin(angleInRadians) + point.z * Math.cos(angleInRadians),
    };
  };

  export const rotateY = (point, angleInDegrees) => {
    const angleInRadians = (angleInDegrees * Math.PI) / 180;
    return {
      x: point.x * Math.cos(angleInRadians) + point.z * Math.sin(angleInRadians),
      y: point.y,
      z: -point.x * Math.sin(angleInRadians) + point.z * Math.cos(angleInRadians),
    };
  };

  export const rotateZ = (point, angleInDegrees) => {
    const angleInRadians = (angleInDegrees * Math.PI) / 180;
    return {
      x: point.x * Math.cos(angleInRadians) - point.y * Math.sin(angleInRadians),
      y: point.x * Math.sin(angleInRadians) + point.y * Math.cos(angleInRadians),
      z: point.z,
    };
  };

  export const scale = (point, scaleFactor) => {
    return {
      x: point.x * scaleFactor,
      y: point.y * scaleFactor,
      z: point.z * scaleFactor,
    };
  };

  export const calculateCentroid = (vertices) => {
    let sumX = 0;
    let sumY = 0;
    let sumZ = 0;

    vertices.forEach(slice => {
      slice.forEach(point => {
        sumX += point.x;
        sumY += point.y;
        sumZ += point.z;
      });
    });

    const totalPoints = vertices.length * vertices[0].length;
    const centroid = {
      x: sumX / totalPoints,
      y: sumY / totalPoints,
      z: sumZ / totalPoints,
    };

    return centroid;
  };
