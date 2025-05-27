import { useState, useEffect } from 'react';

const PLANET_COUNT = 5;
const PLANET_DISTANCE = 150; // pixels entre cada planeta
const PLANET_SPEED = 1; // pixels por frame
const CAPTURE_TIME = 3000; // 5 segundos em milissegundos
const PLANET_SPAWN_DELAY = 3000; // 7 segundos entre cada planeta

// Array com os nomes dos SVGs dos planetas (Lua por último)
const PLANET_IMAGES = [
  'mars.svg',
  'jupiter.svg',
  'saturn.svg',
  'uranus.svg',
  'moon.svg'
];

const SpaceGame = ({ onGameComplete }) => {
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
  }, [gameActive, currentPlanet, capturing, activePlanets]);

  // Efeito para controlar o tempo de captura
  useEffect(() => {
    if (!capturing) return;

    const captureTimeout = setTimeout(() => {
      setCapturing(false);
      if (currentPlanet < PLANET_COUNT - 1) {
        setCurrentPlanet(prev => prev + 1);
      } else {
        setGameActive(false);
        onGameComplete?.(); // Chama a função quando o jogo termina
      }
    }, CAPTURE_TIME);

    return () => clearTimeout(captureTimeout);
  }, [capturing, currentPlanet, onGameComplete]);

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
      <div className="absolute top-4 left-4 text-purple-300 text-2xl font-bold z-10 font-space">
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
          <div className="absolute inset-0 bg-black bg-opacity-90 flex items-center justify-center">
            <div className="text-center text-purple-300 p-8 rounded-lg">
              <h2 className="text-4xl md:text-5xl font-bold mb-8 font-space">
                Missão Concluída!
              </h2>
              <p className="text-xl md:text-2xl text-purple-200 mb-12 font-space">
                Você chegou à Lua! Parabéns por completar sua jornada espacial!
              </p>
              <button
                onClick={resetGame}
                className="px-8 py-4 text-xl font-bold rounded-full bg-purple-400 text-purple-900 hover:bg-purple-600 hover:text-white transition-all duration-300 transform hover:scale-105 hover:shadow-lg hover:shadow-purple-500/50 font-space"
              >
                Nova Missão
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SpaceGame; 