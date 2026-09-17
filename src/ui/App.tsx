import { useState } from 'react'
import './App.css'

function App() {
  const [count, setCount] = useState(0)

  return (
    <>
      <div className="app">
        <header className="topbar">File Edit Image Filters</header>
        <aside className="left-panel">Tools</aside>
        <main className="canvas-area">Canvas</main>
        <aside className="right-panel">Layers</aside>
      </div>
    </>
  )
}

export default App
