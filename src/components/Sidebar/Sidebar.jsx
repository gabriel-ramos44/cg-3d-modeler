import React, { useState } from 'react';
import '../Canvas.css';

const Sidebar = ({
  transform, dispatchTransform,
  VRP, setVRP, focalPoint, setFocalPoint,
  distance, setDistance, viewUp, setViewUp,
  window, handleWindowChange,
  viewport, handleViewportChange,
  lightSource, setLightSource,
  ambientLight, setAmbientLight,
  materials, handleMaterialChange,
  models, selectedModelIndex,
  handleColorChange,
  handleVector3Change,
  defaultMaterial
}) => {
  const [activeTab, setActiveTab] = useState('transformations');

  const handleTabChange = (tab) => {
    setActiveTab(tab);
  };

  return (
    <div className="Sidebar">
      <div className="tabs">
        <button onClick={() => handleTabChange('transformations')} className={activeTab === 'transformations' ? 'active' : ''}>
          Transformations
        </button>
        <button onClick={() => handleTabChange('camera')} className={activeTab === 'camera' ? 'active' : ''}>
          Camera
        </button>
        <button onClick={() => handleTabChange('lighting')} className={activeTab === 'lighting' ? 'active' : ''}>
          Lighting
        </button>
        <button onClick={() => handleTabChange('materials')} className={activeTab === 'materials' ? 'active' : ''}>
          Materials
        </button>
      </div>

      <div className="tab-content">

        {/* --- Transformations Tab --- */}
        {activeTab === 'transformations' && (
          <div className="transformations">
            <h2>Transformations</h2>
            <div className="input-group">
              <label>Scale:</label>
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
            <h3>Translate</h3>
            <div className="input-group">
              <label>X:</label>
              <input
                type="range"
                min="-100"
                max="100"
                value={transform.translate.x}
                onChange={(e) => dispatchTransform({ type: 'translateX', value: parseInt(e.target.value) })}
              />
              <span>{transform.translate.x}</span>
            </div>
            <div className="input-group">
              <label>Y:</label>
              <input
                type="range"
                min="-100"
                max="100"
                value={transform.translate.y}
                onChange={(e) => dispatchTransform({ type: 'translateY', value: parseInt(e.target.value) })}
              />
              <span>{transform.translate.y}</span>
            </div>
            <div className="input-group">
              <label>Z:</label>
              <input
                type="range"
                min="-100"
                max="100"
                value={transform.translate.z}
                onChange={(e) => dispatchTransform({ type: 'translateZ', value: parseInt(e.target.value) })}
              />
              <span>{transform.translate.z}</span>
            </div>
            <h3>Rotate</h3>
            <div className="input-group">
              <label>X:</label>
              <input
                type="range"
                min="-180"
                max="180"
                value={transform.rotate.x}
                onChange={(e) => dispatchTransform({ type: 'rotateX', value: parseInt(e.target.value) })}
              />
              <span>{transform.rotate.x}º</span>
            </div>
            <div className="input-group">
              <label>Y:</label>
              <input
                type="range"
                min="-180"
                max="180"
                value={transform.rotate.y}
                onChange={(e) => dispatchTransform({ type: 'rotateY', value: parseInt(e.target.value) })}
              />
              <span>{transform.rotate.y}º</span>
            </div>
            <div className="input-group">
              <label>Z:</label>
              <input
                type="range"
                min="-180"
                max="180"
                value={transform.rotate.z}
                onChange={(e) => dispatchTransform({ type: 'rotateZ', value: parseInt(e.target.value) })}
              />
              <span>{transform.rotate.z}º</span>
            </div>
          </div>
        )}

        {/* --- Camera Tab --- */}
        {activeTab === 'camera' && (
          <div className="camera">
            <h3>Camera</h3>
            <div>
              <h4>VRP</h4>
              <label>X:</label>
              <input type="number" value={VRP.x} onChange={(e) => handleVector3Change(setVRP, 'x', e.target.value)} />
              <label>Y:</label>
              <input type="number" value={VRP.y} onChange={(e) => handleVector3Change(setVRP, 'y', e.target.value)} />
              <label>Z:</label>
              <input type="number" value={VRP.z} onChange={(e) => handleVector3Change(setVRP, 'z', e.target.value)} />
            </div>
            <div>
              <h4>Focal Point</h4>
              <label>X:</label>
              <input type="number" value={focalPoint.x} onChange={(e) => handleVector3Change(setFocalPoint, 'x', e.target.value)} />
              <label>Y:</label>
              <input type="number" value={focalPoint.y} onChange={(e) => handleVector3Change(setFocalPoint, 'y', e.target.value)} />
              <label>Z:</label>
              <input type="number" value={focalPoint.z} onChange={(e) => handleVector3Change(setFocalPoint, 'z', e.target.value)} />
            </div>
            <div>
              <h4>Distance</h4>
              <input type="number" value={distance} onChange={(e) => setDistance(parseFloat(e.target.value))} />
            </div>
            <div>
              <h4>View Up</h4>
              <label>X:</label>
              <input type="number" value={viewUp.x} onChange={(e) => handleVector3Change(setViewUp, 'x', e.target.value)} />
              <label>Y:</label>
              <input type="number" value={viewUp.y} onChange={(e) => handleVector3Change(setViewUp, 'y', e.target.value)} />
              <label>Z:</label>
              <input type="number" value={viewUp.z} onChange={(e) => handleVector3Change(setViewUp, 'z', e.target.value)} />
            </div>

            <h3>Window</h3>
            <div>
              <h4>X</h4>
              <label>Min:</label>
              <input type="number" value={window.x.min} onChange={(e) => handleWindowChange('x', 'min', e.target.value)} />
              <label>Max:</label>
              <input type="number" value={window.x.max} onChange={(e) => handleWindowChange('x', 'max', e.target.value)} />
            </div>
            <div> {/* --- Y --- */}
              <h4>Y</h4>
              <label>Min:</label>
              <input type="number" value={window.y.min} onChange={(e) => handleWindowChange('y', 'min', e.target.value)} />
              <label>Max:</label>
              <input type="number" value={window.y.max} onChange={(e) => handleWindowChange('y', 'max', e.target.value)} />
            </div>
            <div> {/* --- Z --- */}
              <h4>Z</h4>
              <label>Min:</label>
              <input type="number" value={window.z.min} onChange={(e) => handleWindowChange('z', 'min', e.target.value)} />
              <label>Max:</label>
              <input type="number" value={window.z.max} onChange={(e) => handleWindowChange('z', 'max', e.target.value)} />
            </div>

            <h3>Viewport</h3>
            <div>
              <h4>U</h4>
              <label>Min:</label>
              <input type="number" value={viewport.u.min} onChange={(e) => handleViewportChange('u', 'min', e.target.value)} />
              <label>Max:</label>
              <input type="number" value={viewport.u.max} onChange={(e) => handleViewportChange('u', 'max', e.target.value)} />
            </div>
            <div> {/* --- V --- */}
              <h4>V</h4>
              <label>Min:</label>
              <input type="number" value={viewport.v.min} onChange={(e) => handleViewportChange('v', 'min', e.target.value)} />
              <label>Max:</label>
              <input type="number" value={viewport.v.max} onChange={(e) => handleViewportChange('v', 'max', e.target.value)} />
            </div>
          </div>
        )}

        {/* --- Lighting Tab --- */}
        {activeTab === 'lighting' && (
          <div className="lighting">
            <h3>Light Source</h3>
            <div>
              <label>X:</label>
              <input type="number" value={lightSource.position.x}
                    onChange={(e) => setLightSource(prev => ({ ...prev, position: { ...prev.position, x: parseInt(e.target.value) } }))} />
              <label>Y:</label>
              <input type="number" value={lightSource.position.y}
                    onChange={(e) => setLightSource(prev => ({ ...prev, position: { ...prev.position, y: parseInt(e.target.value) } }))} />
              <label>Z:</label>
              <input type="number" value={lightSource.position.z}
                    onChange={(e) => setLightSource(prev => ({ ...prev, position: { ...prev.position, z: parseInt(e.target.value) } }))} />
            </div>
            <div>
              <label>Intensity (R, G, B):</label>
              <input type="number" value={lightSource.intensity.r} onChange={(e) => handleColorChange(setLightSource, 'r', parseInt(e.target.value))} />
              <input type="number" value={lightSource.intensity.g} onChange={(e) => handleColorChange(setLightSource, 'g', parseInt(e.target.value))} />
              <input type="number" value={lightSource.intensity.b} onChange={(e) => handleColorChange(setLightSource, 'b', parseInt(e.target.value))} />
            </div>

            <h3>Ambient Light</h3>
            <div>
              <label>Intensity (R, G, B):</label>
              <input type="number" value={ambientLight.intensity.r} onChange={(e) => handleColorChange(setAmbientLight, 'r', parseInt(e.target.value))} />
              <input type="number" value={ambientLight.intensity.g} onChange={(e) => handleColorChange(setAmbientLight, 'g', parseInt(e.target.value))} />
              <input type="number" value={ambientLight.intensity.b} onChange={(e) => handleColorChange(setAmbientLight, 'b', parseInt(e.target.value))} />
            </div>
          </div>
        )}

        {/* --- Materials Tab --- */}
        {activeTab === 'materials' && (
          <div className="materials">
            {models.map((model, modelIndex) => (
              <div key={modelIndex}>
                <h3>Material for Model {modelIndex + 1}</h3>

                <div>
                  <label>Ka (R, G, B):</label>
                  <input type="number" min="0" max="1" step="0.1"
                        value={materials[modelIndex]?.Ka.r || defaultMaterial.Ka.r}
                        onChange={(e) => handleMaterialChange(modelIndex, 'Ka', 'r', parseFloat(e.target.value))} />
                  <input type="number" min="0" max="1" step="0.1"
                        value={materials[modelIndex]?.Ka.g || defaultMaterial.Ka.g}
                        onChange={(e) => handleMaterialChange(modelIndex, 'Ka', 'g', parseFloat(e.target.value))} />
                  <input type="number" min="0" max="1" step="0.1"
                        value={materials[modelIndex]?.Ka.b || defaultMaterial.Ka.b}
                        onChange={(e) => handleMaterialChange(modelIndex, 'Ka', 'b', parseFloat(e.target.value))} />
                </div>

                <div>
                  <label>Kd (R, G, B):</label>
                  <input type="number" min="0" max="1" step="0.1"
                        value={materials[modelIndex]?.Kd.r || defaultMaterial.Kd.r}
                        onChange={(e) => handleMaterialChange(modelIndex, 'Kd', 'r', parseFloat(e.target.value))} />
                  <input type="number" min="0" max="1" step="0.1"
                        value={materials[modelIndex]?.Kd.g || defaultMaterial.Kd.g}
                        onChange={(e) => handleMaterialChange(modelIndex, 'Kd', 'g', parseFloat(e.target.value))} />
                  <input type="number" min="0" max="1" step="0.1"
                        value={materials[modelIndex]?.Kd.b || defaultMaterial.Kd.b}
                        onChange={(e) => handleMaterialChange(modelIndex, 'Kd', 'b', parseFloat(e.target.value))} />
                </div>

                <div>
                  <label>Ks (R, G, B):</label>
                  <input type="number" min="0" max="1" step="0.1"
                        value={materials[modelIndex]?.Ks.r || defaultMaterial.Ks.r}
                        onChange={(e) => handleMaterialChange(modelIndex, 'Ks', 'r', parseFloat(e.target.value))} />
                  <input type="number" min="0" max="1" step="0.1"
                        value={materials[modelIndex]?.Ks.g || defaultMaterial.Ks.g}
                        onChange={(e) => handleMaterialChange(modelIndex, 'Ks', 'g', parseFloat(e.target.value))} />
                  <input type="number" min="0" max="1" step="0.1"
                        value={materials[modelIndex]?.Ks.b || defaultMaterial.Ks.b}
                        onChange={(e) => handleMaterialChange(modelIndex, 'Ks', 'b', parseFloat(e.target.value))} />
                </div>

                <div>
                  <label>Shininess:</label>
                  <input type="number" min="1" max="128" step="1"
                        value={materials[modelIndex]?.shininess || defaultMaterial.shininess}
                        onChange={(e) => handleMaterialChange(modelIndex, 'shininess', null, parseInt(e.target.value))} />
                </div>

              </div>
            ))}
          </div>
        )}

      </div>
    </div>
  );
};

export default Sidebar;