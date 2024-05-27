import React, { useRef, useState } from 'react';
import './Canvas.css';
import { translate, rotateX, rotateY, rotateZ, scale } from '../utils/Transformations';
import { calculateNormal, isFaceVisible } from '../utils/Operations';

const Canvas = () => {
    const canvas2DRef = useRef(null);
    const canvas3DRef = useRef(null);
    const [profile, setProfile] = useState([]);
    const [slices, setSlices] = useState(30);
    const [transform, setTransform] = useState({ translate: { x: 0, y: 0, z: 0 }, rotate: { x: 0, y: 0, z: 0 }, scale: 1 });
    const [projectionType, setProjectionType] = useState('parallel');
    const VRP = { x: 0, y: 0, z: 700 };

    const [models, setModels] = useState([])
    const [selectedModelIndex, setSelectedModelIndex] = useState(null);

    const handleModelSelect = (index) => {
      setSelectedModelIndex(index);
      const selectedModel = models[index];
      setTransform(selectedModel.transform);
      setProfile(selectedModel.profile);
      draw2DProfile(selectedModel.profile);
    };

    const handle2DCanvasClick = (e) => {
    const canvas = canvas2DRef.current;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const newProfile = [...profile, { x, y }];
    draw2DProfile(newProfile);
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
      profile.forEach(point => ctx.lineTo(point.x, point.y));
    }
    ctx.closePath();
    ctx.stroke();
  };

  const calculateCentroid = (vertices) => {
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

  const updateSelectedModel = () => {
    if (selectedModelIndex !== null) {
      const updatedModels = [...models];
      const updatedModel = {
        ...updatedModels[selectedModelIndex],
        transform: transform
      };

      const centroid = calculateCentroid(updatedModel.vertices);
      updatedModel.vertices = translateModelToOriginAndApllyTansfornations(updatedModel.vertices, centroid);
      updatedModel.transform = { translate: { x: 0, y: 0, z: 0 }, rotate: { x: 0, y: 0, z: 0 }, scale: 1 }
      setTransform(updatedModel.transform)
      updatedModels[selectedModelIndex] = updatedModel;
      setModels(updatedModels);
      drawScene(updatedModels);
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
      drawFaces(ctx, model.vertices, width, height, model.transform);
    });
  };

  const generate3DModel = () => {
    const newModel = {
      vertices: generateVertices(profile, slices),
      transform: { translate: { x: 0, y: 0, z: 0 }, rotate: { x: 0, y: 0, z: 0 }, scale: 1 },
      profile: profile
    };

    const updatedModels = [...models, newModel];

    setModels(updatedModels);
    drawScene(updatedModels);
    startCreatingNewModel();
  };

  const projectPoint = (p, width, height) => {
    console.log(projectionType)
    if (projectionType === 'perspective') {
      const d = VRP.z;
      return {
        x: (p.x * d) / (d + p.z) + width / 2,
        y: height / 2 - (p.y * d) / (d + p.z)
      };
    } else { // parallel projection
      return {
        x: p.x + width / 2,
        y: height / 2 - p.y - p.z
      };
    }
  };

  const drawFaces = (ctx, model, width, height) => {
    ctx.fillStyle = 'rgba(167, 202, 232, 1)'; // light white color with transparency

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
          z: (p0.z + p1.z + p2.z + p3.z) / 4
        };

        const normal = calculateNormal(p0, p1, p2);

        if (/*isFaceVisible(centroid, normal, VRP)*/true) {
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
    }
};


  const translateModelToOriginAndApllyTansfornations = (model, centroid) => {
    return model.map(slice => {
      return slice.map(point => {

        point = translate(point, transform.translate.x, transform.translate.y, transform.translate.z);

        let newPoint = translate(point, -centroid.x, -centroid.y, -centroid.z)

        newPoint = rotateX(newPoint, transform.rotate.x);
        newPoint = rotateY(newPoint, transform.rotate.y);
        newPoint = rotateZ(newPoint, transform.rotate.z);
        newPoint = scale(newPoint, transform.scale);

        newPoint = translate(newPoint, centroid.x, centroid.y, centroid.z)

        return newPoint;
      });
    });
  };

  const generateVertices = (profile, slices) => {
    const vertices = [];
    const angleStep = (2 * Math.PI) / slices;

    for (let i = 0; i < slices; i++) {
      const angle = i * angleStep;
      const cos = Math.cos(angle);
      const sin = Math.sin(angle);

      const slice = profile.map(point => {
        let p = {
          x: point.x * cos,
          y: point.y,
          z: point.x * sin,
        };

        return p;
      });

      vertices.push(slice);
    }

    const centroid = calculateCentroid(vertices);
    const translatedVertices = translateModelToOriginAndApllyTansfornations(vertices, centroid);
    return translatedVertices;
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
        <select onChange={(e) =>
          e.target.value == '' ? startCreatingNewModel() : handleModelSelect(parseInt(e.target.value))
          }>
          <option value="">Create New Model</option>
          {models.map((model, index) => (
            <option key={index} value={index}>Model {index + 1}</option>
          ))}
        </select>
        <canvas
          ref={canvas2DRef}
          width="200"
          height="200"
          style={{ border: '1px solid black' }}
          onClick={handle2DCanvasClick}
        />
        {selectedModelIndex === null && <button onClick={generate3DModel}>Generate 3D Model</button>}
        {(selectedModelIndex || selectedModelIndex === 0) && <button onClick={updateSelectedModel}>Update Selected Model</button>}
        <label>Slices: </label>
        <input
          type="number"
          value={slices}
          onChange={handleSlicesChange}
          min="3"
          max="360"
        />
        <div>
          <label>Projection Type: </label>
          <select value={projectionType} onChange={(e) => {setProjectionType(e.target.value), drawScene(models)}}>
            <option value="parallel">Parallel</option>
            <option value="perspective">Perspective</option>
          </select>
        </div>
        <div>
        <h3>Transformations</h3>
        <div>
            <label>Translate X: </label>
            <input type="range" min="-100" max="100" value={transform.translate.x} onChange={(e) => setTransform({ ...transform, translate: { ...transform.translate, x: parseInt(e.target.value) } })} />
            <a>{transform.translate.x}</a>
        </div>
        <div>
            <label>Translate Y: </label>
            <input type="range" min="-100" max="100" value={transform.translate.y} onChange={(e) => setTransform({ ...transform, translate: { ...transform.translate, y: parseInt(e.target.value) } })} />
            <a>{transform.translate.y}</a>
        </div>
        <div>
            <label>Translate Z: </label>
            <input type="range" min="-100" max="100" value={transform.translate.z} onChange={(e) => setTransform({ ...transform, translate: { ...transform.translate, z: parseInt(e.target.value) } })} />
            <a>{transform.translate.z}</a>
        </div>
        <div>
            <label>Rotate X: </label>
            <input type="range" min="-180" max="180" value={transform.rotate.x} onChange={(e) => setTransform({ ...transform, rotate: { ...transform.rotate, x: parseInt(e.target.value) } })} />
            <a>{transform.rotate.x}º</a>
        </div>
        <div>
            <label>Rotate Y: </label>
            <input type="range" min="-180" max="180" value={transform.rotate.y} onChange={(e) => setTransform({ ...transform, rotate: { ...transform.rotate, y: parseInt(e.target.value) } })} />
            <a>{transform.rotate.y}º</a>
        </div>
        <div>
            <label>Rotate Z: </label>
            <input type="range" min="-180" max="180" value={transform.rotate.z} onChange={(e) => setTransform({ ...transform, rotate: { ...transform.rotate, z: parseInt(e.target.value) } })} />
            <a>{transform.rotate.z}º</a>
        </div>
        <div>
            <label>Scale: </label>
            <input type="range" min="0.1" max="3" step="0.1" value={transform.scale} onChange={(e) => setTransform({ ...transform, scale: parseFloat(e.target.value) })} />
            <a>{transform.scale}x</a>
        </div>
      </div>
      </div>
      <div className="main">
        <canvas
          ref={canvas3DRef}
          width="900"
          height="900"
          style={{ border: '1px solid black' }}
        />
      </div>
    </div>
  );
};


export default Canvas;