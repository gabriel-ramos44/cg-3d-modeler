import React, { useRef, useState, useEffect, useReducer } from 'react';
import './Canvas.css';
import { translate, rotateX, rotateY, rotateZ, scale } from '../utils/Transformations';
import { calculateNormal, isFaceVisible, dotProduct, normalize } from '../utils/Operations';

const initialState = {
  translate: { x: 0, y: 0, z: 0 },
  rotate: { x: 0, y: 0, z: 0 },
  scale: 1
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
    default:
      return state;
  }
};

const Canvas = () => {
  const canvas2DRef = useRef(null);
  const canvas3DRef = useRef(null);
  const [profile, setProfile] = useState([]);
  const [slices, setSlices] = useState(30);
  const [transform, dispatchTransform] = useReducer(transformReducer, initialState);
  const [projectionType, setProjectionType] = useState('parallel');
  const VRP = { x: 0, y: 0, z: 700 };
  const lightDirection = { x: 0, y: 0, z: -1 };

  const [models, setModels] = useState([]);
  const [selectedModelIndex, setSelectedModelIndex] = useState(null);

  useEffect(() => {
    draw2DProfile(profile);
  }, [profile]);

  useEffect(() => {
    drawScene(models);
  }, [models, transform, projectionType]);

  const handleModelSelect = (index) => {
    setSelectedModelIndex(index);
    const selectedModel = models[index];
    dispatchTransform({ type: 'reset', value: selectedModel.transform });
    setProfile(selectedModel.profile);
  };

  const calculateLightIntensity = (normal) => {
    const normalizedNormal = normalize(normal);
    const normalizedLightDir = normalize(lightDirection);
    return Math.max(dotProduct(normalizedNormal, normalizedLightDir), 0);
  };

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

  const updateSelectedModel = () => {
    if (selectedModelIndex !== null) {
      const updatedModels = [...models];
      const updatedModel = {
        ...updatedModels[selectedModelIndex],
        transform,
      };

      const centroid = calculateCentroid(updatedModel.vertices);
      updatedModel.vertices = translateModelToOriginAndApplyTransformations(updatedModel.vertices, centroid);
      updatedModel.transform = initialState;
      dispatchTransform({ type: 'reset', value: initialState });
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

    const modelsWithCentroids = customModels.map((model) => {
      const centroid = calculateCentroid(model.vertices);
      return { ...model, centroid };
    });

    const sortedModels = modelsWithCentroids.sort((a, b) => b.centroid.z - a.centroid.z);

    sortedModels.forEach((model) => {
      drawFaces(ctx, model.vertices, width, height);
    });
  };

  const generate3DModel = () => {
    const newModel = {
      vertices: generateVertices(profile, slices),
      transform: initialState,
      profile,
    };

    const updatedModels = [...models, newModel];
    setModels(updatedModels);
    startCreatingNewModel();
  };

  const projectPoint = (p, width, height) => {
    if (projectionType === 'perspective') {
      const d = VRP.z;
      return {
        x: (p.x * d) / (d + p.z) + width / 2,
        y: height / 2 - (p.y * d) / (d + p.z),
      };
    } else {
      // parallel projection
      return {
        x: p.x + width / 2,
        y: height / 2 - p.y - p.z,
      };
    }
  };

  const drawFaces = (ctx, model, width, height) => {
    model.forEach((currentSlice, i) => {
      const nextSlice = model[(i + 1) % model.length];
      currentSlice.forEach((p0, j) => {
        if (j < currentSlice.length - 1) {
          const p1 = currentSlice[j + 1];
          const p2 = nextSlice[j + 1];
          const p3 = nextSlice[j];

          const centroid = {
            x: (p0.x + p1.x + p2.x + p3.x) / 4,
            y: (p0.y + p1.y + p2.y + p3.y) / 4,
            z: (p0.z + p1.z + p2.z + p3.z) / 4,
          };

          const normal = calculateNormal(p0, p1, p2);
          const intensity = calculateLightIntensity(normal);
          const shade = Math.floor(255 * intensity);
          ctx.fillStyle = `rgb(${shade}, ${shade}, ${shade})`;

          if (isFaceVisible(centroid, normal, VRP)) {
            const pp0 = projectPoint(p0, width, height);
            const pp1 = projectPoint(p1, width, height);
            const pp2 = projectPoint(p2, width, height);
            const pp3 = projectPoint(p3, width, height);

            ctx.beginPath();
            ctx.moveTo(pp0.x, pp0.y);
            ctx.lineTo(pp1.x, pp1.y);
            ctx.lineTo(pp2.x, pp2.y);
            ctx.lineTo(pp3.x, pp3.y);
            ctx.closePath();
            ctx.fill();
            ctx.stroke();
          }
        }
      });
    });
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
        <canvas ref={canvas3DRef} width="900" height="900" style={{ border: '1px solid black' }} />
      </div>
    </div>
  );
};

export default Canvas;
