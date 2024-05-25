import React, { useRef, useState } from 'react';
import './Canvas.css';
import { translate, rotateX, rotateY, rotateZ, scale } from '../utils/Transformations';

const Canvas = () => {
    const canvas2DRef = useRef(null);
    const canvas3DRef = useRef(null);
    const [profile, setProfile] = useState([]);
    const [slices, setSlices] = useState(30);
    const [transform, setTransform] = useState({ translate: { x: 0, y: 0, z: 0 }, rotate: { x: 0, y: 0, z: 0 }, scale: 1 });

  const handle2DCanvasClick = (e) => {
    const canvas = canvas2DRef.current;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const newProfile = [...profile, { x, y }];
    draw2DProfile(newProfile);
    setProfile(newProfile); // update state after drawing
  };

  const draw2DProfile = (profile) => {
    const canvas = canvas2DRef.current;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.beginPath();
    ctx.moveTo(profile[0].x, profile[0].y);
    profile.forEach(point => ctx.lineTo(point.x, point.y));
    ctx.closePath(); // close path before stroke
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

  const generate3DModel = () => {
    const canvas = canvas3DRef.current;
    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;
    ctx.clearRect(0, 0, width, height); // clear canvas before generating new model

    const model = generateVertices(profile, slices);

    // Full orthographic projection
    /* DRAW EDGES
    model.forEach((slice, i) => {
      ctx.beginPath();
      ctx.moveTo(slice[0].x + width / 2, height / 2 - slice[0].y - slice[0].z);
      slice.forEach(point => ctx.lineTo(point.x + width / 2, height / 2 - point.y - point.z));
      ctx.closePath();
      ctx.strokeStyle = 'white'
      ctx.stroke();
    });*/

    // Drawing faces
    drawFaces(ctx, model, width, height);
  };

  const drawFaces = (ctx, model, width, height) => {
    ctx.fillStyle = 'rgba(167, 202, 232, 0.5)'; // light white color with transparency

    for (let i = 0; i < model.length; i++) {
      const currentSlice = model[i];
      const nextSlice = model[(i + 1) % model.length];

      for (let j = 0; j < currentSlice.length - 1; j++) {
        const p0 = currentSlice[j];
        const p1 = currentSlice[j + 1];
        const p2 = nextSlice[j + 1];
        const p3 = nextSlice[j];

        ctx.beginPath();
        ctx.moveTo(p0.x + width / 2, height / 2 - p0.y - p0.z);
        ctx.lineTo(p1.x + width / 2, height / 2 - p1.y - p1.z);
        ctx.lineTo(p2.x + width / 2, height / 2 - p2.y - p2.z);
        ctx.lineTo(p3.x + width / 2, height / 2 - p3.y - p3.z);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
      }
    }
  };

  const translateModelToOriginAndApllyTansfornations = (model, centroid) => {
    return model.map(slice => {
      return slice.map(point => {

        // translate to origin
        let newPoint = translate(point, -centroid.x, -centroid.y, -centroid.z)

        // apply scale and rotations
        newPoint = rotateX(newPoint, transform.rotate.x);
        newPoint = rotateY(newPoint, transform.rotate.y);
        newPoint = rotateZ(newPoint, transform.rotate.z);
        newPoint = scale(newPoint, transform.scale);

        // translate back
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

        p = translate(p, transform.translate.x, transform.translate.y, transform.translate.z);

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
        <canvas
          ref={canvas2DRef}
          width="200"
          height="200"
          style={{ border: '1px solid black' }}
          onClick={handle2DCanvasClick}
        />
        <button onClick={generate3DModel}>Generate 3D Model</button>
        <label>Slices: </label>
        <input
          type="number"
          value={slices}
          onChange={handleSlicesChange}
          min="3"
          max="360"
        />
        <div>
        <h3>Transformations</h3>
        <div>
            <label>Translate X: </label>
            <input type="range" min="-100" max="100" value={transform.translate.x} onChange={(e) => setTransform({ ...transform, translate: { ...transform.translate, x: parseInt(e.target.value) } })} />
        </div>
        <div>
            <label>Translate Y: </label>
            <input type="range" min="-100" max="100" value={transform.translate.y} onChange={(e) => setTransform({ ...transform, translate: { ...transform.translate, y: parseInt(e.target.value) } })} />
        </div>
        <div>
            <label>Translate Z: </label>
            <input type="range" min="-100" max="100" value={transform.translate.z} onChange={(e) => setTransform({ ...transform, translate: { ...transform.translate, z: parseInt(e.target.value) } })} />
        </div>
        <div>
            <label>Rotate X: </label>
            <input type="range" min="-180" max="180" value={transform.rotate.x} onChange={(e) => setTransform({ ...transform, rotate: { ...transform.rotate, x: parseInt(e.target.value) } })} />
        </div>
        <div>
            <label>Rotate Y: </label>
            <input type="range" min="-180" max="180" value={transform.rotate.y} onChange={(e) => setTransform({ ...transform, rotate: { ...transform.rotate, y: parseInt(e.target.value) } })} />
        </div>
        <div>
            <label>Rotate Z: </label>
            <input type="range" min="-180" max="180" value={transform.rotate.z} onChange={(e) => setTransform({ ...transform, rotate: { ...transform.rotate, z: parseInt(e.target.value) } })} />
        </div>
        <div>
            <label>Scale: </label>
            <input type="range" min="0.1" max="3" step="0.1" value={transform.scale} onChange={(e) => setTransform({ ...transform, scale: parseFloat(e.target.value) })} />
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