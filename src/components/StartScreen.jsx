import { useState } from 'react';

const StartScreen = ({ onStart }) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div className="fixed inset-0 bg-black flex flex-col items-center justify-center p-4">
      <h1 className="text-4xl md:text-5xl font-bold text-purple-300 mb-8 text-center font-space">
        Bem Vindo!
      </h1>
      <p className="text-xl md:text-2xl text-purple-200 text-center max-w-2xl mb-12 font-space">
        Você está em uma missão espacial, clique em iniciar e começe a andar até encontrar a Lua!
      </p>
      <button
        onClick={onStart}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className={`
          px-8 py-4 text-xl font-bold rounded-full
          transition-all duration-300 transform
          ${isHovered 
            ? 'bg-purple-600 text-white scale-105 shadow-lg shadow-purple-500/50' 
            : 'bg-purple-400 text-purple-900'
          }
          font-space
        `}
      >
        Iniciar Missão
      </button>
    </div>
  );
};

export default StartScreen; 