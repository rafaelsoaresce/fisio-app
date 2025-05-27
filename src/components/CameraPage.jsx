import { useEffect, useRef, useState } from 'react';
import SpaceGame from './SpaceGame';

const CameraPage = () => {
  const videoRef = useRef(null);
  const [stream, setStream] = useState(null);
  const mediaRecorderRef = useRef(null);
  const chunksRef = useRef([]);

  useEffect(() => {
    const startCamera = async () => {
      try {
        const mediaStream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'environment' }, // Preferência para câmera traseira
          audio: false
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

  const startRecording = (mediaStream) => {
    chunksRef.current = [];
    const mediaRecorder = new MediaRecorder(mediaStream);
    mediaRecorderRef.current = mediaRecorder;

    mediaRecorder.ondataavailable = (e) => {
      if (e.data.size > 0) {
        chunksRef.current.push(e.data);
      }
    };

    mediaRecorder.onstop = async () => {
      const blob = new Blob(chunksRef.current, { type: 'video/mp4' });
      const url = URL.createObjectURL(blob);
      
      // Criar um link para download
      const a = document.createElement('a');
      a.href = url;
      a.download = `video-${new Date().toISOString()}.mp4`;
      
      // Em dispositivos móveis, tentar salvar na galeria
      if ('share' in navigator) {
        try {
          const file = new File([blob], a.download, { type: 'video/mp4' });
          await navigator.share({
            files: [file],
            title: 'Vídeo Gravado',
            text: 'Vídeo gravado do aplicativo'
          });
        } catch (error) {
          console.error('Erro ao compartilhar:', error);
          // Fallback para download normal
          a.click();
        }
      } else {
        // Fallback para navegadores que não suportam Web Share API
        a.click();
      }

      URL.revokeObjectURL(url);
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
        className="w-full h-full object-cover"
      />
      <SpaceGame onGameComplete={handleGameComplete} />
    </div>
  );
};

export default CameraPage; 