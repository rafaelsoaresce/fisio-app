import { useState, useRef, useEffect } from 'react';

const VideoRecorder = () => {
  const [isRecording, setIsRecording] = useState(false);
  const [stream, setStream] = useState(null);
  const videoRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const chunksRef = useRef([]);

  useEffect(() => {
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [stream]);

  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true
      });
      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
    } catch (error) {
      console.error('Erro ao acessar a câmera:', error);
    }
  };

  const startRecording = () => {
    if (!stream) return;

    chunksRef.current = [];
    const mediaRecorder = new MediaRecorder(stream);
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
    setIsRecording(true);
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  return (
    <div className="flex flex-col items-center gap-4 p-4">
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        className="w-full max-w-md rounded-lg shadow-lg"
      />
      
      <div className="flex gap-4">
        {!stream ? (
          <button
            onClick={startCamera}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
          >
            Iniciar Câmera
          </button>
        ) : (
          <>
            {!isRecording ? (
              <button
                onClick={startRecording}
                className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
              >
                Iniciar Gravação
              </button>
            ) : (
              <button
                onClick={stopRecording}
                className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600"
              >
                Parar Gravação
              </button>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default VideoRecorder; 