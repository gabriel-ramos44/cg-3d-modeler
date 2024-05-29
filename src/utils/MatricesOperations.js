export const multiplyMatrices = (m1, m2) => {
    const result = new Array(m1.length).fill(0).map(() => new Array(m2[0].length).fill(0));
    for (let i = 0; i < m1.length; i++) {
      for (let j = 0; j < m2[0].length; j++) {
        for (let k = 0; k < m1[0].length; k++) {
          result[i][j] += m1[i][k] * m2[k][j];
        }
      }
    }
    return result;
  };
