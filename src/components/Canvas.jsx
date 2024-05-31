import React, { useRef, useState, useEffect, useReducer, useMemo } from 'react';
import './Canvas.css';
import { translate, rotateX, rotateY, rotateZ, scale } from '../utils/Transformations';
import { calculateNormal, isFaceVisible,  } from '../utils/Operations';
import { dotProduct, normalize, subtractVectors } from '../utils/VectorsOperations';
import { computeCameraMatrix } from '../utils/SRU2SRC';
import { computeViewMatrix } from '../utils/View';
import { multiplyMatrices } from '../utils/MatricesOperations'
import { computePerspectiveProjMatrix, computeParallelProjectionMatrix } from '../utils/Projections'

const transformationsInitialState = {
  translate: { x: 0, y: 0, z: 0 },
  rotate: { x: 0, y: 0, z: 0 },
  scale: 1
};

const cameraInitialState = {
  VRP: { x: 0, y: 0, z: 500 },
  focalPoint: { x: 0, y: 0, z: 0 }, // P
  distance: 500,
  window:  {x:{min: 0, max: 500}, y:{min: 0, max: 500}, z:{min: 0, max: 1000} },
  viewport:  {u:{min: 0, max: 900}, v:{min: 0, max:900}},
  viewUp: { x: 0, y: 1, z: 0 }
};

const transformReducer = (state, action) => {
  switch (action.type) {
    case 'translateX':
      return { ...state, translate: { ...state.translate, x: action.value } };
    case 'translateY':
      return { ...state, translate: { ...state.translate, y: action.value } };
    case 'translateZ':
      return { ...state, translate: { ...state.translate, z: action.value } };
    case 'rotateX':
      return { ...state, rotate: { ...state.rotate, x: action.value } };
    case 'rotateY':
      return { ...state, rotate: { ...state.rotate, y: action.value } };
    case 'rotateZ':
      return { ...state, rotate: { ...state.rotate, z: action.value } };
    case 'scale':
      return { ...state, scale: action.value };
    case 'reset':
      return { ...transformationsInitialState, ...action.value };
    default:
      return state;
  }
};

const Canvas = () => {
  const canvas2DRef = useRef(null);
  const canvas3DRef = useRef(null);
  const [profile, setProfile] = useState([]);
  const [slices, setSlices] = useState(30);
  const [transform, dispatchTransform] = useReducer(transformReducer, transformationsInitialState);
  const [projectionType, setProjectionType] = useState('perspective');//useState('parallel');
  //const VRP = { x: 0, y: 0, z: 800 };
  const [VRP, setVRP] = useState(cameraInitialState.VRP)
  //const focalPoint = { x: 0, y: 0, z: 0 }; // P
  const [focalPoint, setFocalPoint] = useState(cameraInitialState.focalPoint)

  const [window, setWindow] = useState(cameraInitialState.window)
  const [viewport, setViewport] = useState(cameraInitialState.viewport)
  const [distance, setDistance] = useState(cameraInitialState.distance)

  const  [viewUp, setViewUp]  = useState(cameraInitialState.viewUp)

  const [zBuffer, setZBuffer] = useState([]);
  const lightSource = { position: { x: 100, y: 100, z: 200 }, intensity: { r: 255, g: 255, b: 255 } };

  const [models, setModels] = useState([]);
  const [selectedModelIndex, setSelectedModelIndex] = useState(null);

  const transformationMatrix = useMemo(() => {

    // Msru src
    const cameraMatrix = computeCameraMatrix(VRP, focalPoint, viewUp);
    // Mjp
    const viewMatrix = computeViewMatrix(window, viewport);

    // Mproj
    const projectionMatrix = projectionType === 'perspective'
      ? computePerspectiveProjMatrix(distance)
      : computeParallelProjectionMatrix(window);

    const mJpXmProj = multiplyMatrices(viewMatrix, projectionMatrix);
    return multiplyMatrices(mJpXmProj, cameraMatrix);

  }, [VRP, focalPoint, viewUp, window, viewport, projectionType, distance]);


  const applyCameraTransform = (modelVertices, cameraMatrix) => {
    return modelVertices.map(slice =>
      slice.map(point => {
        const transformedPoint = centralizePointOnCanva(multiplyMatrixAndPoint(cameraMatrix, point));
        return {
          x: transformedPoint.x,
          y: transformedPoint.y,
          z: transformedPoint.z,
        };
      })
    );
  };

  const multiplyMatrixAndPoint = (matrix, point) => {
    const [x, y, z] = [point.x, point.y, point.z];
    const result = [
      x * matrix[0][0] + y * matrix[0][1] + z * matrix[0][2] + matrix[0][3],
      x * matrix[1][0] + y * matrix[1][1] + z * matrix[1][2] + matrix[1][3],
      x * matrix[2][0] + y * matrix[2][1] + z * matrix[2][2] + matrix[2][3],
      1,
    ];
    return result;
  };

  const calculateCentroid = (vertices) => {
    let sumX = 0;
    let sumY = 0;
    let sumZ = 0;

    vertices.forEach((slice) => {
      slice.forEach((point) => {
        sumX += point.x;
        sumY += point.y;
        sumZ += point.z;
      });
    });

    const totalPoints = vertices.length * vertices[0].length;
    return {
      x: sumX / totalPoints,
      y: sumY / totalPoints,
      z: sumZ / totalPoints,
    };
  };

  const centralizePointOnCanva = (p) => {
    const X = (viewport.u.max + viewport.u.min) / 2;
    const Y = (viewport.v.max + viewport.v.min) / 2;

    return {
      x: p[0] + X,
      y: -p[1] + Y,
      z: p[2],
    };
  }

  const generateFaces = (model) => {
    const newFaces = [];
    for (let i = 0; i < model.length; i++) {
      const currentSlice = model[i];
      const nextSlice = model[(i + 1) % model.length];

      for (let j = 0; j < currentSlice.length - 1; j++) {
          const p0 = currentSlice[j];
          const p1 = currentSlice[j + 1];
          const p2 = nextSlice[j + 1];
          const p3 = nextSlice[j];

          const centroid = {
              x: (p0.x + p1.x + p2.x + p3.x) / 4,
              y: (p0.y + p1.y + p2.y + p3.y) / 4,
              z: (p0.z + p1.z + p2.z + p3.z) / 4,
          };

          const normal = calculateNormal(p0, p1, p2);

          const face = {
              vertices: [p0, p1, p2, p3],
              centroid: centroid,
              depth: centroid.z,
              normal: normal, // Store normal with the face
          };
          if (isFaceVisible(face.centroid, face.normal, VRP))
          newFaces.push(face);
      }
    }
    return newFaces;
};

  const memoizedCentroids = useMemo(() => {
    return models.map(model => {
      const transformedVertices = applyCameraTransform(model.vertices, transformationMatrix);
      return calculateCentroid(transformedVertices);
    });
  }, [models, transformationMatrix]);

  const memoizedFaces = useMemo(() => {
    return models.map(model => {
      const transformedVertices = applyCameraTransform(model.vertices, transformationMatrix);
      return generateFaces(transformedVertices).sort((a, b) => b.depth - a.depth);
    });
  }, [models, transformationMatrix]);

  useEffect(() => {
    draw2DProfile(profile);
  }, [profile]);

  useEffect(() => {
    drawScene(models);
  }, [models, projectionType]);

  const handleModelSelect = (index) => {
    setSelectedModelIndex(index);
    const selectedModel = models[index];
    dispatchTransform({ type: 'reset', value: selectedModel.transform });
    setProfile(selectedModel.profile);
  };

  useEffect(() => {
    const canvas = canvas3DRef.current;
    setZBuffer(Array(canvas.width).fill(0).map(() => Array(canvas.height).fill(Infinity)));
  }, [viewport]);





  const handle2DCanvasClick = (e) => {
    const canvas = canvas2DRef.current;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const newProfile = [...profile, { x, y }];
    setProfile(newProfile);
  };

  const startCreatingNewModel = () => {
    setProfile([]);
    const canvas = canvas2DRef.current;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setSelectedModelIndex(null);
  };

  const draw2DProfile = (profile) => {
    const canvas = canvas2DRef.current;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.beginPath();
    if (profile.length > 0) {
      ctx.moveTo(profile[0].x, profile[0].y);
      profile.forEach((point) => ctx.lineTo(point.x, point.y));
    }
    ctx.closePath();
    ctx.stroke();
  };

  const updateSelectedModel = () => {
    if (selectedModelIndex !== null) {
      const updatedModels = [...models];
      const updatedModel = {
        ...updatedModels[selectedModelIndex],
        transform,
      };

      const centroid = calculateCentroid(updatedModel.vertices);
      updatedModel.vertices = translateModelToOriginAndApplyTransformations(updatedModel.vertices, centroid);
      updatedModel.transform = transformationsInitialState;
      //dispatchTransform({ type: 'reset', value: transformationsInitialState });
      updatedModels[selectedModelIndex] = updatedModel;
      setModels(updatedModels);
    }
  };



  const drawScene = (customModels) => {
    const canvas = canvas3DRef.current;
    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;
    ctx.clearRect(0, 0, width, height);


    const modelsWithTransformedVertices = customModels.map((model, index) => ({
      ...model,
      vertices: applyCameraTransform(model.vertices, transformationMatrix),
      centroid: memoizedCentroids[index], // Assign memoized centroid
      faces: memoizedFaces[index]          // Assign memoized faces
    }));

    const sortedModels = modelsWithTransformedVertices.sort((a, b) => b.centroid.z - a.centroid.z);

    clearZBuffer();

    sortedModels.forEach((model) => {
      drawFaces(ctx, model.faces, width, height);
    });
  };



  const clearZBuffer = () => {
    const canvas = canvas3DRef.current;
    setZBuffer(Array(canvas.width).fill(0).map(() => Array(canvas.height).fill(Infinity)));
  };

  const calculateFlatShading = (face, light, material) => {
    const centroid = face.centroid; // You already calculate the centroid!
    const N = normalize(face.normal); // Assuming you are storing face normals
    const L = normalize(subtractVectors(light.position, centroid));
    const dotProductLN = dotProduct(N, L);

    // Simple ambient and diffuse lighting for demonstration
    let color = { r: 50, g: 50, b: 50 }; // Ambient color
    if (dotProductLN > 0) {
      color.r += material.Kd.r * light.intensity.r * dotProductLN;
      color.g += material.Kd.g * light.intensity.g * dotProductLN;
      color.b += material.Kd.b * light.intensity.b * dotProductLN;
    }
    return color;
  };

  const generate3DModel = () => {
    const newModel = {
      vertices: generateVertices(profile, slices),
      transform: transformationsInitialState,
      profile,
    };

    const updatedModels = [...models, newModel];
    setModels(updatedModels);
    startCreatingNewModel();
  };


  const drawFaces = (ctx, faces, width, height) => {
    // Desenhar as faces na ordem ordenada
    faces.forEach(face => {
        const [p0, p1, p2, p3] = face.vertices;

        // Calculate color using flat shading
        const color = calculateFlatShading(face, lightSource, { Kd: { r: 0.8, g: 0.5, b: 0.3 } });

        ctx.strokeStyle = `rgb(0, 50, 255)`;
        ctx.fillStyle = `rgb(255, 255, 255, 0)`;

            /*ctx.beginPath();
            ctx.moveTo(pp0.x, p0.y);
            ctx.lineTo(pp1.x, p1.y);
            ctx.lineTo(pp2.x, p2.y);
            ctx.lineTo(pp3.x, p3.y);
            ctx.closePath();
            ctx.fill();
            ctx.stroke();*/
            drawPolygon(ctx, p0, p1, p2, p3, color, zBuffer);
    });
};

  const drawPolygon = (ctx, p0, p1, p2, p3, color, zBuffer) => {
    const minX = Math.min(p0.x, p1.x, p2.x, p3.x);
    const maxX = Math.max(p0.x, p1.x, p2.x, p3.x);
    const minY = Math.min(p0.y, p1.y, p2.y, p3.y);
    const maxY = Math.max(p0.y, p1.y, p2.y, p3.y);

    for (let x = Math.floor(minX); x <= Math.ceil(maxX); x++) {
      for (let y = Math.floor(minY); y <= Math.ceil(maxY); y++) {
        if (isPointInsideTriangle(x, y, p0, p1, p2, p3)) {
          // Perform depth test
          const z = calculateZValue(x, y, p0, p1, p2); // You'll need to implement this
          if (z < zBuffer[x][y]) {
            zBuffer[x][y] = z; // Update z-buffer
            ctx.fillStyle = `rgb(${color.r}, ${color.g}, ${color.b})`;
            ctx.fillRect(x, y, 1, 1);
          }
        }
      }
    }
  };

  const calculateZValue = (x, y, p0, p1, p2) => {
    // Calculate barycentric coordinates
    const denominator = (p1.y - p2.y) * (p0.x - p2.x) + (p2.x - p1.x) * (p0.y - p2.y);
    const u = ((p1.y - p2.y) * (x - p2.x) + (p2.x - p1.x) * (y - p2.y)) / denominator;
    const v = ((p2.y - p0.y) * (x - p2.x) + (p0.x - p2.x) * (y - p2.y)) / denominator;
    const w = 1 - u - v;

    // Interpolate z-value
    return u * p0.z + v * p1.z + w * p2.z;
  };

  const isPointInsideTriangle = (x, y, p0, p1, p2, p3) => {
    // Using barycentric coordinates (you can use other methods too)
    const denominator = (p1.y - p2.y) * (p0.x - p2.x) + (p2.x - p1.x) * (p0.y - p2.y);
    const a = ((p1.y - p2.y) * (x - p2.x) + (p2.x - p1.x) * (y - p2.y)) / denominator;
    const b = ((p2.y - p0.y) * (x - p2.x) + (p0.x - p2.x) * (y - p2.y)) / denominator;
    const c = 1 - a - b;

    return a >= 0 && a <= 1 && b >= 0 && b <= 1 && c >= 0 && c <= 1;
  };

  const translateModelToOriginAndApplyTransformations = (model, centroid) => {
    return model.map((slice) =>
      slice.map((point) => {
        point = translate(point, transform.translate.x, transform.translate.y, transform.translate.z);

        let newPoint = translate(point, -centroid.x, -centroid.y, -centroid.z);

        newPoint = rotateX(newPoint, transform.rotate.x);
        newPoint = rotateY(newPoint, transform.rotate.y);
        newPoint = rotateZ(newPoint, transform.rotate.z);
        newPoint = scale(newPoint, transform.scale);

        newPoint = translate(newPoint, centroid.x, centroid.y, centroid.z);
        return newPoint;
      })
    );
  };

  const generateVertices = (profile, slices) => {
    const vertices = [];
    const angleStep = (2 * Math.PI) / slices;

    for (let i = 0; i < slices; i++) {
      const angle = i * angleStep;
      const cos = Math.cos(angle);
      const sin = Math.sin(angle);

      const slice = profile.map((point) => ({
        x: point.x * cos,
        y: point.y,
        z: point.x * sin,
      }));
      vertices.push(slice);
    }

    const centroid = calculateCentroid(vertices);
    vertices.forEach((slice) => {
      slice.forEach((point) => {
        const translatedPoint = translate(point, -centroid.x, -centroid.y, -centroid.z);
        Object.assign(point, translatedPoint); // Atualiza os valores do ponto original
      });
    });
    return translateModelToOriginAndApplyTransformations(vertices, centroid);
  };

  const handleSlicesChange = (e) => {
    const value = parseInt(e.target.value, 10);
    if (Number.isInteger(value) && value >= 3 && value <= 360) {
      setSlices(value);
    }
  };

  return (
    <div className="container">
      <div className="sidebar">
        <select onChange={(e) => (e.target.value === '' ? startCreatingNewModel() : handleModelSelect(parseInt(e.target.value)))}>
          <option value="">Create New Model</option>
          {models.map((model, index) => (
            <option key={index} value={index}>
              Model {index + 1}
            </option>
          ))}
        </select>
        <canvas ref={canvas2DRef} width="200" height="200" style={{ border: '1px solid black' }} onClick={handle2DCanvasClick} />
        {selectedModelIndex === null && <button onClick={generate3DModel}>Generate 3D Model</button>}
        {(selectedModelIndex || selectedModelIndex === 0) && <button onClick={updateSelectedModel}>Update Selected Model</button>}
        <label>Slices: </label>
        <input type="number" value={slices} onChange={handleSlicesChange} min="3" max="360" />
        <div>
          <label>Projection Type: </label>
          <select value={projectionType} onChange={(e) => setProjectionType(e.target.value)}>
            <option value="parallel">Parallel</option>
            <option value="perspective">Perspective</option>
          </select>
        </div>
        <div>
        <h3>Camera</h3>
          <h4>VRP</h4>
            <label>X</label>
              <input
                type="number"
                min="-1000"
                max="1000"
                value={focalPoint.x}
                onChange={(e) => setVRP(  { ...focalPoint, x: parseInt(e.target.value)})}
              />
            <label>Y</label>
              <input
                type="number"
                min="-1000"
                max="1000"
                value={VRP.y}
                onChange={(e) => setVRP(  { ...VRP, y: parseInt(e.target.value)})}
              />
            <label>Z</label>
              <input
                type="number"
                min="-1000"
                max="1000"
                value={VRP.z}
                onChange={(e) => setVRP(  { ...VRP, z: parseInt(e.target.value)})}
              />
          <h4>Focal Point</h4>
            <div>
            <label>X</label>
              <input
                type="number"
                min="-1000"
                max="1000"
                value={focalPoint.x}
                onChange={(e) => setFocalPoint(  { ...focalPoint, x: parseInt(e.target.value)})}
              />
            <label>Y</label>
              <input
                type="number"
                min="-1000"
                max="1000"
                value={focalPoint.y}
                onChange={(e) => setFocalPoint(  { ...focalPoint, y: parseInt(e.target.value)})}
              />
            <label>Z</label>
              <input
                type="number"
                min="-1000"
                max="1000"
                value={focalPoint.z}
                onChange={(e) => setFocalPoint(  { ...focalPoint, z: parseInt(e.target.value)})}
              />
            </div>
        </div>
        <div>
          <h3>Transformations</h3>
          <div>
            <label>Translate X: </label>
            <input
              type="range"
              min="-100"
              max="100"
              value={transform.translate.x}
              onChange={(e) => dispatchTransform({ type: 'translateX', value: parseInt(e.target.value) })}
            />
            <span>{transform.translate.x}</span>
          </div>
          <div>
            <label>Translate Y: </label>
            <input
              type="range"
              min="-100"
              max="100"
              value={transform.translate.y}
              onChange={(e) => dispatchTransform({ type: 'translateY', value: parseInt(e.target.value) })}
            />
            <span>{transform.translate.y}</span>
          </div>
          <div>
            <label>Translate Z: </label>
            <input
              type="range"
              min="-100"
              max="100"
              value={transform.translate.z}
              onChange={(e) => dispatchTransform({ type: 'translateZ', value: parseInt(e.target.value) })}
            />
            <span>{transform.translate.z}</span>
            <input
              type="number"
              value={transform.translate.z}
              onChange={(e) => dispatchTransform({ type: 'translateZ', value: parseInt(e.target.value) })}
            />
          </div>
          <div>
            <label>Rotate X: </label>
            <input
              type="range"
              min="-180"
              max="180"
              value={transform.rotate.x}
              onChange={(e) => dispatchTransform({ type: 'rotateX', value: parseInt(e.target.value) })}
            />
            <span>{transform.rotate.x}º</span>
          </div>
          <div>
            <label>Rotate Y: </label>
            <input
              type="range"
              min="-180"
              max="180"
              value={transform.rotate.y}
              onChange={(e) => dispatchTransform({ type: 'rotateY', value: parseInt(e.target.value) })}
            />
            <span>{transform.rotate.y}º</span>
          </div>
          <div>
            <label>Rotate Z: </label>
            <input
              type="range"
              min="-180"
              max="180"
              value={transform.rotate.z}
              onChange={(e) => dispatchTransform({ type: 'rotateZ', value: parseInt(e.target.value) })}
            />
            <span>{transform.rotate.z}º</span>
          </div>
          <div>
            <label>Scale: </label>
            <input
              type="range"
              min="0.1"
              max="3"
              step="0.1"
              value={transform.scale}
              onChange={(e) => dispatchTransform({ type: 'scale', value: parseFloat(e.target.value) })}
            />
            <span>{transform.scale}x</span>
          </div>
        </div>
      </div>
      <div className="main">
        <canvas ref={canvas3DRef} width={viewport.u.max} height={viewport.v.max} style={{ border: '1px solid black' }} />
      </div>
    </div>
  );
};

export default Canvas;