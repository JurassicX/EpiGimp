import { useState } from 'react'
import './App.css'

function App() {
  const [count, setCount] = useState(0)

  return (
    <>
      <div className="app">
        <header className="topbar">File Edit Image Filters</header>
        <aside className="left-panel">
          tool
          <div className="editor">
            <div className="toolbar">
              <div className="toolbar-item">
                <input type="file" id="imageFileInput"></input>
              </div>
              <div className="toolbar-item">
                <label className="tool-label" for="brightness">brightness</label>
                <input className="tool-input" type="range" id="brightness" min="0" max="200"></input>
              </div>
              <div className="toolbar-item">
                <label className="tool-label" for="saturation">saturation</label>
                <input className="tool-input" type="range" id="saturation" min="0" max="200"></input>
              </div>
              <div className="toolbar-item">
                <label className="tool-label" for="blur">blur</label>
                <input className="tool-input" type="range" id="blur" min="0" max="25"></input>
              </div>
              <div className="toolbar-item">
                <label className="tool-label" for="inversion">inversion</label>
                <input className="tool-input" type="range" id="inversion" min="0" max="100"></input>
              </div>
            </div>
          </div>
        </aside>
        <main className="canvas-area">
          <canvas id="canvas" className="checkerboard" width={800} height={600} />
        </main>
        <aside className="right-panel">Layers</aside>
      </div>
    </>
  )
}

export default App
