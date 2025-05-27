import { useEffect, useRef, useState } from 'react';
import SpaceGame from './SpaceGame';

const CameraPage = () => {
  const videoRef = useRef(null);
  const [stream, setStream] = useState(null);
  const mediaRecorderRef = useRef(null);
  const chunksRef = useRef([]);
  const [isIOS, setIsIOS] = useState(false);

  useEffect(() => {
    // Detectar se é um dispositivo iOS
    const isIOSDevice = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
    setIsIOS(isIOSDevice);

    const startCamera = async () => {
      try {
        const mediaStream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'environment' }, // Preferência para câmera traseira
          audio: false // Desativando o áudio
        });
        
        setStream(mediaStream);
        if (videoRef.current) {
          videoRef.current.srcObject = mediaStream;
        }

        // Iniciar gravação automaticamente
        startRecording(mediaStream);
      } catch (error) {
        console.error('Erro ao acessar a câmera:', error);
      }
    };

    startCamera();

    // Cleanup function
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  const saveVideo = async (blob) => {
    const url = URL.createObjectURL(blob);
    const fileName = `video-${new Date().toISOString()}.mp4`;
    
    try {
      if ('share' in navigator) {
        const file = new File([blob], fileName, { type: 'video/mp4' });
        await navigator.share({
          files: [file],
          title: 'Vídeo Gravado',
          text: 'Vídeo gravado do aplicativo'
        });
      } else {
        // Fallback para navegadores que não suportam Web Share API
        const a = document.createElement('a');
        a.href = url;
        a.download = fileName;
        a.click();
      }
    } catch (error) {
      console.error('Erro ao salvar o vídeo:', error);
      
      // Se falhar, tenta o método de download direto
      const a = document.createElement('a');
      a.href = url;
      a.download = fileName;
      a.click();
    } finally {
      URL.revokeObjectURL(url);
    }
  };

  const startRecording = (mediaStream) => {
    chunksRef.current = [];
    const mediaRecorder = new MediaRecorder(mediaStream, {
      mimeType: 'video/webm;codecs=vp9' // Usando codec VP9 para melhor qualidade sem áudio
    });
    mediaRecorderRef.current = mediaRecorder;

    mediaRecorder.ondataavailable = (e) => {
      if (e.data.size > 0) {
        chunksRef.current.push(e.data);
      }
    };

    mediaRecorder.onstop = async () => {
      const blob = new Blob(chunksRef.current, { type: 'video/webm' });
      await saveVideo(blob);
    };

    mediaRecorder.start();
  };

  const handleGameComplete = () => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
    }
  };

  return (
    <div className="fixed inset-0 w-full h-full bg-black">
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        className="w-full h-full object-cover"
      />
      <SpaceGame onGameComplete={handleGameComplete} />
      
      {/* Mensagem para iOS */}
      {isIOS && (
        <div className="absolute top-4 right-4 bg-black bg-opacity-75 text-white p-4 rounded-lg text-sm max-w-xs">
          <p>No iPhone, o vídeo será salvo automaticamente na galeria quando você completar a missão.</p>
        </div>
      )}
    </div>
  );
};

export default CameraPage; 