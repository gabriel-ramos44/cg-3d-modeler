import { useState } from 'react'
import './App.css'
import Canvas from './components/Canvas';


function App() {
  return (
    <div className="App">
      <header className="App-header">
        <h2>3D Modeller</h2>
      </header>
        <Canvas />
    </div>
  )
}

export default App
