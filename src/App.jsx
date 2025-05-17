import { useState } from 'react'
import CameraPage from './components/CameraPage'
import StartScreen from './components/StartScreen'
import './App.css'

function App() {
  const [gameStarted, setGameStarted] = useState(false);

  return (
    <div className="App">
      {!gameStarted ? (
        <StartScreen onStart={() => setGameStarted(true)} />
      ) : (
        <CameraPage />
      )}
    </div>
  )
}

export default App
