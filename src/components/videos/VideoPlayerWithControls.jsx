// src/components/videos/VideoPlayerWithControls.jsx
// (Ajusta la ruta si lo guardas en otro lugar)

import React, { useState, useCallback, useEffect } from "react";
import { Box, IconButton, Slider } from "@mui/material";

// ¡CAMBIO AQUÍ! Importaciones directas a los iconos específicos
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import PauseIcon from '@mui/icons-material/Pause';
import VolumeUpIcon from '@mui/icons-material/VolumeUp';
import VolumeOffIcon from '@mui/icons-material/VolumeOff';

import Videopopup from "./Videopopup"; // Asegúrate de que esta ruta sea correcta

const VideoPlayerWithControls = ({ videoUrl }) => {
  const [player, setPlayer] = useState(null);
  const [videoProgress, setVideoProgress] = useState(0);
  const [volume, setVolume] = useState(50);
  const [isPaused, setIsPaused] = useState(true);
  const [intervalId, setIntervalId] = useState(null);
  const [isYouTubePlayer, setIsYouTubePlayer] = useState(false); // Nuevo estado para diferenciar el tipo de reproductor

  const handlePlayerReady = useCallback((playerInstance) => {
    setPlayer(playerInstance);
    // console.log("Reproductor listo:", playerInstance); // Para depuración

    // Determina si es un reproductor de YouTube (tiene métodos como playVideo)
    setIsYouTubePlayer(!!playerInstance.playVideo);

    if (playerInstance.playVideo) { // Es un reproductor de YouTube
      playerInstance.addEventListener('onStateChange', (event) => {
        // console.log("Estado de YouTube:", event.data); // Para depuración
        if (event.data === 1) { // Reproduciendo
          setIsPaused(false);
          startProgressInterval(playerInstance, true);
        } else if (event.data === 2 || event.data === 0) { // Pausado o Finalizado
          setIsPaused(true);
          stopProgressInterval();
          if (event.data === 0) { // Si el video termina, el progreso es 100%
              setVideoProgress(100);
          }
        }
      });
    } else { // Es un elemento <video> HTML nativo
        // console.log("Video HTML listo:", playerInstance); // Para depuración
        playerInstance.volume = volume / 100; // Establece el volumen inicial para el video HTML

        playerInstance.onplay = () => {
            setIsPaused(false);
            startProgressInterval(playerInstance, false);
        };
        playerInstance.onpause = () => {
            setIsPaused(true);
            stopProgressInterval();
        };
        playerInstance.onended = () => {
            setIsPaused(true);
            setVideoProgress(100);
            stopProgressInterval();
        };
        playerInstance.ontimeupdate = () => {
            if (playerInstance.duration > 0) {
                setVideoProgress((playerInstance.currentTime / playerInstance.duration) * 100);
            }
        };
        playerInstance.onvolumechange = () => {
            setVolume(playerInstance.volume * 100);
        };
    }
  }, [volume]); // Incluye 'volume' en las dependencias para que el volumen inicial del video HTML se establezca correctamente

  // Función para iniciar la actualización del progreso
  const startProgressInterval = useCallback((playerInstance, isYouTube) => {
    stopProgressInterval(); // Asegura que solo haya un intervalo activo
    const id = setInterval(() => {
        if (isYouTube) {
            if (playerInstance.getCurrentTime && playerInstance.getDuration) {
                const currentTime = playerInstance.getCurrentTime();
                const duration = playerInstance.getDuration();
                if (duration > 0) {
                    setVideoProgress((currentTime / duration) * 100);
                }
            }
        } else {
            if (playerInstance.currentTime && playerInstance.duration) {
                const currentTime = playerInstance.currentTime;
                const duration = playerInstance.duration;
                if (duration > 0) {
                    setVideoProgress((currentTime / duration) * 100);
                }
            }
        }
    }, 1000); // Actualiza cada segundo
    setIntervalId(id);
  }, []);

  // Función para detener la actualización del progreso
  const stopProgressInterval = useCallback(() => {
    if (intervalId) {
      clearInterval(intervalId);
      setIntervalId(null);
    }
  }, [intervalId]);

  // Limpiar el intervalo cuando el componente se desmonte
  useEffect(() => {
    return () => {
      stopProgressInterval();
    };
  }, [stopProgressInterval]); // Dependencia del useCallback para limpiar correctamente

  // Funciones para controlar el video
  const handlePlayPause = () => {
    if (player) {
      if (isYouTubePlayer) {
        if (isPaused) {
          player.playVideo();
        } else {
          player.pauseVideo();
        }
      } else {
        if (isPaused) {
          player.play();
        } else {
          player.pause();
        }
      }
    }
  };

  const handleSeek = (event, newValue) => {
    if (player) {
      if (isYouTubePlayer) {
        if (player.getDuration) {
          const duration = player.getDuration();
          if (duration > 0) {
            const timeToSeek = (newValue / 100) * duration;
            player.seekTo(timeToSeek, true); // true para "allowSeekAhead"
            setVideoProgress(newValue); // Actualiza el progreso inmediatamente al arrastrar
          }
        }
      } else {
        if (player.duration > 0) {
          const timeToSeek = (newValue / 100) * player.duration;
          player.currentTime = timeToSeek;
          setVideoProgress(newValue);
        }
      }
    }
  };

  const handleVolumeChange = (event, newValue) => {
    if (player) {
      if (isYouTubePlayer) {
        player.setVolume(newValue);
      } else {
        player.volume = newValue / 100;
      }
      setVolume(newValue);
    }
  };

  const handleMuteToggle = () => {
    if (player) {
      if (isYouTubePlayer) {
        if (volume === 0) {
          player.setVolume(50); // Restaura un volumen por defecto
          setVolume(50);
        } else {
          player.setVolume(0);
          setVolume(0);
        }
      } else {
        if (player.volume === 0) { // Si el volumen actual es 0 (silenciado)
          player.volume = 0.5; // Restaura a un 50%
          setVolume(50);
        } else {
          player.volume = 0; // Silencia
          setVolume(0);
        }
      }
    }
  };

  return (
    <Box>
      {/* Contenedor del reproductor de video */}
      <Box sx={{ paddingBottom: { xs: "20px", md: "30px 0px" } }}>
        <Videopopup videoUrl={videoUrl} onPlayerReady={handlePlayerReady} /> 
      </Box>

      {/* Controles de video personalizados */}
      {player && ( // Muestra los controles solo si el reproductor está listo
        <Box sx={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: { xs: 1, sm: 2 }, // Espacio entre controles
          mt: 2, 
          flexWrap: 'wrap', // Permite que los controles se envuelvan en pantallas pequeñas
          justifyContent: 'center',
          px: { xs: 1, sm: 0 } // Padding horizontal para pantallas pequeñas
        }}>
          <IconButton onClick={handlePlayPause} color="primary" size="large">
            {isPaused ? <PlayArrowIcon sx={{ fontSize: 40 }} /> : <PauseIcon sx={{ fontSize: 40 }} />}
          </IconButton>
          <Box sx={{ flexGrow: 1, maxWidth: { xs: 'calc(100% - 150px)', sm: '60%' } }}>
              <Slider 
                  value={videoProgress} 
                  onChange={handleSeek} 
                  aria-labelledby="video-progress-slider"
                  size="small"
                  color="primary"
                  sx={{ 
                      '& .MuiSlider-thumb': {
                          width: 16,
                          height: 16,
                      },
                  }}
              />
          </Box>
          <IconButton onClick={handleMuteToggle} color="primary" size="small">
              {volume === 0 ? <VolumeOffIcon /> : <VolumeUpIcon />}
          </IconButton>
          <Slider 
              value={volume} 
              onChange={handleVolumeChange} 
              aria-labelledby="volume-slider"
              orientation="horizontal"
              sx={{ width: { xs: 80, sm: 100 } }} // Ancho ajustable para volumen
              size="small"
              color="primary"
          />
        </Box>
      )}
    </Box>
  );
};

export default VideoPlayerWithControls;