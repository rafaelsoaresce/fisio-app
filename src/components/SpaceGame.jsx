import { useState, useEffect } from 'react';

const PLANET_COUNT = 5;
const PLANET_DISTANCE = 150; // pixels entre cada planeta
const PLANET_SPEED = 1; // pixels por frame
const CAPTURE_TIME = 5000; // 5 segundos em milissegundos
const PLANET_SPAWN_DELAY = 3000; // 3 segundos entre cada planeta

// Array com os nomes dos SVGs dos planetas
const PLANET_IMAGES = [
  'moon.svg',
  'mars.svg',
  'jupiter.svg',
  'saturn.svg',
  'uranus.svg'
];

const SpaceGame = () => {
  const [score, setScore] = useState(0);
  const [currentPlanet, setCurrentPlanet] = useState(0);
  const [planetPositions, setPlanetPositions] = useState(
    Array(PLANET_COUNT).fill(-PLANET_DISTANCE)
  );
  const [gameActive, setGameActive] = useState(true);
  const [capturing, setCapturing] = useState(false);
  const [captureProgress, setCaptureProgress] = useState(0);
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
            setCaptureProgress(0);
          }
          
          return newPos;
        });
        
        return newPositions;
      });
    };

    const gameLoop = setInterval(movePlanets, 16); // ~60fps
    return () => clearInterval(gameLoop);
  }, [currentPlanet, gameActive, capturing, activePlanets]);

  // Efeito para controlar o progresso da captura
  useEffect(() => {
    if (!capturing) return;

    const captureInterval = setInterval(() => {
      setCaptureProgress(prev => {
        const newProgress = prev + (100 / (CAPTURE_TIME / 100));

        if (newProgress >= 100) {
          setCapturing(false);
          if (currentPlanet < PLANET_COUNT - 1) {
            setCurrentPlanet(prev => prev + 1);
            setScore(prev => prev + 1);
          } else {
            setGameActive(false);
          }
          return 0;
        }
        return newProgress;
      });
    }, 100);

    return () => clearInterval(captureInterval);
  }, [capturing, currentPlanet]);

  const resetGame = () => {
    setScore(0);
    setCurrentPlanet(0);
    setPlanetPositions(Array(PLANET_COUNT).fill(-PLANET_DISTANCE));
    setGameActive(true);
    setCapturing(false);
    setCaptureProgress(0);
    setActivePlanets(0);
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center">
      {/* Score */}
      <div className="absolute top-4 left-4 text-white text-2xl font-bold z-10">
        Pontos: {score}/5
      </div>

      {/* Game Area */}
      <div className="relative w-full h-full overflow-hidden">
        {/* Planets */}
        {Array.from({ length: PLANET_COUNT }).map((_, index) => (
          <div
            key={index}
            className={`absolute w-24 h-24
              ${index <= currentPlanet ? 'opacity-100' : 'opacity-50'}`}
            style={{
              left: '50%',
              top: `calc(50% + ${planetPositions[index]}px)`,
              transform: 'translateX(-50%)',
              display: index < activePlanets ? 'block' : 'none'
            }}
          >
            <img
              src={`/${PLANET_IMAGES[index]}`}
              alt={`Planet ${index + 1}`}
              className="w-full h-full object-contain"
            />
            {capturing && index === currentPlanet && (
              <div className="absolute -bottom-6 left-0 right-0 h-2 bg-gray-700 rounded-full">
                <div 
                  className="h-full bg-green-500 rounded-full transition-all duration-100"
                  style={{ width: `${captureProgress}%` }}
                />
              </div>
            )}
          </div>
        ))}

        {/* Rocket */}
        <div
          className="absolute w-20 h-20"
          style={{
            left: '50%',
            top: '50%',
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