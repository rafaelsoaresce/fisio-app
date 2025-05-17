import { useState, useEffect } from 'react';

const PLANET_COUNT = 5;
const PLANET_DISTANCE = 150; // pixels entre cada planeta
const PLANET_SPEED = 1; // pixels por frame
const CAPTURE_TIME = 5000; // 5 segundos em milissegundos
const PLANET_SPAWN_DELAY = 7000; // 7 segundos entre cada planeta

// Array com os nomes dos SVGs dos planetas
const PLANET_IMAGES = [
  'moon.svg',
  'mars.svg',
  'jupiter.svg',
  'saturn.svg',
  'uranus.svg'
];

const SpaceGame = () => {
  const [currentPlanet, setCurrentPlanet] = useState(0);
  const [planetPositions, setPlanetPositions] = useState(
    Array(PLANET_COUNT).fill(-PLANET_DISTANCE)
  );
  const [gameActive, setGameActive] = useState(true);
  const [capturing, setCapturing] = useState(false);
  const [activePlanets, setActivePlanets] = useState(0);

  // Efeito para spawnar planetas gradualmente
  useEffect(() => {
    if (!gameActive || activePlanets >= PLANET_COUNT) return;

    const spawnPlanet = () => {
      setActivePlanets(prev => prev + 1);
    };

    const spawnInterval = setInterval(spawnPlanet, PLANET_SPAWN_DELAY);
    return () => clearInterval(spawnInterval);
  }, [gameActive, activePlanets]);

  // Efeito para mover os planetas
  useEffect(() => {
    if (!gameActive) return;

    const movePlanets = () => {
      setPlanetPositions(prev => {
        const newPositions = prev.map((pos, index) => {
          // Só move planetas que já foram spawnados
          if (index >= activePlanets) return pos;
          
          const newPos = pos + PLANET_SPEED;
          
          // Verifica se o planeta chegou na posição do foguete
          if (Math.abs(newPos) < 10 && index === currentPlanet && !capturing) {
            setCapturing(true);
          }
          
          return newPos;
        });
        
        return newPositions;
      });
    };

    const gameLoop = setInterval(movePlanets, 16); // ~60fps
    return () => clearInterval(gameLoop);
  }, [currentPlanet, gameActive, capturing, activePlanets]);

  // Efeito para controlar o tempo de captura
  useEffect(() => {
    if (!capturing) return;

    const captureTimeout = setTimeout(() => {
      setCapturing(false);
      if (currentPlanet < PLANET_COUNT - 1) {
        setCurrentPlanet(prev => prev + 1);
      } else {
        setGameActive(false);
      }
    }, CAPTURE_TIME);

    return () => clearTimeout(captureTimeout);
  }, [capturing, currentPlanet]);

  const resetGame = () => {
    setCurrentPlanet(0);
    setPlanetPositions(Array(PLANET_COUNT).fill(-PLANET_DISTANCE));
    setGameActive(true);
    setCapturing(false);
    setActivePlanets(0);
  };

  // Função para calcular a opacidade baseada na posição do planeta
  const calculateOpacity = (position, index) => {
    if (index > currentPlanet) return 0.5; // Planetas não visitados
    if (index < currentPlanet) return 1; // Planetas já visitados
    
    // Para o planeta atual, calcula a opacidade baseada na posição
    const maxDistance = window.innerHeight / 2; // Distância máxima para o efeito
    const distance = Math.abs(position);
    const opacity = Math.max(0.5, 1 - (distance / maxDistance));
    return opacity;
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center">
      {/* Progresso */}
      <div className="absolute top-4 left-4 text-white text-2xl font-bold z-10">
        {currentPlanet + 1}/{PLANET_COUNT}
      </div>

      {/* Game Area */}
      <div className="relative w-full h-full overflow-hidden">
        {/* Planets */}
        {Array.from({ length: PLANET_COUNT }).map((_, index) => (
          <div
            key={index}
            className="absolute w-20 h-20"
            style={{
              left: '50%',
              top: `calc(50% + ${planetPositions[index]}px)`,
              transform: 'translateX(-50%)',
              display: index < activePlanets ? 'block' : 'none',
              opacity: calculateOpacity(planetPositions[index], index),
              transition: 'opacity 0.1s ease-in-out'
            }}
          >
            <img
              src={`/${PLANET_IMAGES[index]}`}
              alt={`Planet ${index + 1}`}
              className="w-full h-full object-contain"
            />
          </div>
        ))}

        {/* Rocket */}
        <div
          className="absolute w-20 h-20"
          style={{
            left: '50%',
            top: 'calc(80% - 50px)',
            transform: 'translate(-50%, -50%)'
          }}
        >
          <img
            src="/rocket.svg"
            alt="Rocket"
            className="w-full h-full"
          />
        </div>

        {/* Game Over Screen */}
        {!gameActive && (
          <div className="absolute inset-0 bg-black bg-opacity-75 flex items-center justify-center">
            <div className="text-center text-white">
              <h2 className="text-3xl font-bold mb-4">Parabéns!</h2>
              <p className="text-xl mb-4">Você completou todos os {PLANET_COUNT} planetas!</p>
              <button
                onClick={resetGame}
                className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded"
              >
                Jogar Novamente
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SpaceGame; 