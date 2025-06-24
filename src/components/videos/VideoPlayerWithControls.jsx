// src/components/videos/VideoPlayerWithControls.jsx
import React, { useState, useCallback, useEffect, useRef } from "react";
import { Box, IconButton, Slider, Typography } from "@mui/material";

// Importaciones directas a los iconos específicos
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import PauseIcon from '@mui/icons-material/Pause';
import VolumeUpIcon from '@mui/icons-material/VolumeUp';
import VolumeOffIcon from '@mui/icons-material/VolumeOff';
import FullscreenIcon from '@mui/icons-material/Fullscreen';
import FullscreenExitIcon from '@mui/icons-material/FullscreenExit';
import YouTubeIcon from '@mui/icons-material/YouTube'; // Nuevo: para el icono de YouTube

import Videopopup from "./Videopopup";

const VideoPlayerWithControls = ({ videoUrl, onVideoCompleted }) => {
  const [player, setPlayer] = useState(null);
  const [videoProgress, setVideoProgress] = useState(0);
  const [volume, setVolume] = useState(50);
  const [isPaused, setIsPaused] = useState(true);
  const [intervalId, setIntervalId] = useState(null);
  const [isYouTubePlayer, setIsYouTubePlayer] = useState(false);
  const [hasStartedPlaying, setHasStartedPlaying] = useState(false);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const playerContainerRef = useRef(null); // Ref para el contenedor del reproductor
  const [isHovering, setIsHovering] = useState(false); // Para mostrar/ocultar overlay

  const handlePlayerReady = useCallback((playerInstance) => {
    // console.log("🐛 VideoPlayerWithControls: Reproductor listo.", playerInstance);
    setPlayer(playerInstance);
    // Determinar si es un reproductor de YouTube basado en la existencia del método `playVideo`
    // (react-youtube's event.target tiene estos métodos)
    setIsYouTubePlayer(typeof playerInstance.playVideo === 'function');

    if (typeof playerInstance.playVideo === 'function') { // Es un reproductor de YouTube (react-youtube)
      // console.log("🐛 VideoPlayerWithControls: Es reproductor de YouTube (via react-youtube).");
      // Importante: La librería react-youtube maneja directamente los eventos si los pasas como props al <YouTube>
      // Pero si queremos centralizar la lógica aquí, debemos añadir listeners a la instancia del player.
      // Sin embargo, `react-youtube` no expone `addEventListener` de la misma manera que el iframe nativo.
      // La forma más robusta es usar los callbacks de props de <YouTube> en Videopopup, y que Videopopup notifique el estado.
      // Para simplificar, asumiremos que si es YouTube, controlamos el estado con `getCurrentTime` y `getDuration`
      // y la lógica de `onStateChange` la simulamos o la manejamos con los botones de play/pause.

      // Para los eventos de estado de YouTube, `react-youtube` los expone a través de props como `onStateChange`.
      // Como `Videopopup` es el que renderiza el <YouTube> real, necesitamos que nos pase estos eventos.
      // Sin embargo, mi enfoque anterior con `Videopopup` como "renderizador pasivo" significa que
      // no queremos que `Videopopup` reciba esos callbacks directamente.

      // Vuelvo a la idea de que `Videopopup` solo pasa el player, y aquí lo escuchamos.
      // Si `react-youtube` no expone `addEventListener` a su `event.target` de manera estándar,
      // la mejor práctica es pasar los callbacks (`onStateChange`, `onEnd`) directamente a `Videopopup`.
      // **Revertiré la simplificación anterior y hare que Videopopup reciba callbacks de estado**
      // **para YouTube para que `VideoPlayerWithControls` los gestione.**

      // Esto requiere que Videopopup pase más que solo onPlayerReady
      // Para esta solución y mantener la estructura, usaremos `setInterval` para actualizar el estado
      // y asumiremos que los métodos `playVideo()`, `pauseVideo()`, etc., funcionan.
      // La detección de fin de video para YouTube se hará por el progreso o por un callback.

      // Una solución más limpia sería que Videopopup tuviera props como `onYouTubeStateChange`
      // y `onYouTubeEnded` que luego VideoPlayerWithControls pasaría a sus propios manejadores.
      // Por ahora, para tu código actual, mantendremos la detección por `getCurrentTime()` y `getDuration()`
      // para el progreso, y la finalización se detectará si el progreso llega a 100%.

      // Obtener la duración de YouTube una vez que esté disponible
      const checkDurationYT = setInterval(() => {
        if (playerInstance.getDuration && playerInstance.getDuration() > 0) {
          setDuration(playerInstance.getDuration());
          clearInterval(checkDurationYT);
        }
      }, 100);

    } else { // Es un elemento <video> HTML nativo
      // console.log("🐛 VideoPlayerWithControls: Es reproductor HTML nativo.");
      playerInstance.volume = volume / 100;

      playerInstance.onplay = () => {
        setIsPaused(false);
        setHasStartedPlaying(true);
        startProgressInterval(playerInstance, false);
      };
      playerInstance.onpause = () => {
        setIsPaused(true);
        stopProgressInterval();
      };
      playerInstance.onended = () => {
        // console.log("🐛 VideoPlayerWithControls: Video HTML finalizado.");
        setIsPaused(true);
        setVideoProgress(100);
        setCurrentTime(duration);
        stopProgressInterval();
        onVideoCompleted(); // Notificar a VideoLayout
      };
      playerInstance.ontimeupdate = () => {
        if (playerInstance.duration > 0) {
          setCurrentTime(playerInstance.currentTime);
          setVideoProgress((playerInstance.currentTime / playerInstance.duration) * 100);
        }
      };
      playerInstance.ondurationchange = () => {
        setDuration(playerInstance.duration);
      };
      playerInstance.onvolumechange = () => {
        setVolume(playerInstance.volume * 100);
      };
      // Forzar la obtención de la duración si ya está cargado el video
      if (playerInstance.readyState >= 1) { // HAVE_METADATA o superior
        setDuration(playerInstance.duration);
      }
    }
  }, [volume, onVideoCompleted, duration]);


  const startProgressInterval = useCallback((playerInstance, isYouTube) => {
    stopProgressInterval();
    const id = setInterval(() => {
      if (isYouTube) {
        if (playerInstance.getCurrentTime && playerInstance.getDuration) {
          const currentT = playerInstance.getCurrentTime();
          const dur = playerInstance.getDuration();
          if (dur > 0) {
            setCurrentTime(currentT);
            setVideoProgress((currentT / dur) * 100);
            if (currentT >= dur && hasStartedPlaying) { // Si el video de YouTube termina
              // console.log("🐛 VideoPlayerWithControls: Video de YouTube finalizado (por progreso).");
              setIsPaused(true);
              setVideoProgress(100);
              setCurrentTime(duration);
              stopProgressInterval();
              onVideoCompleted();
            }
          }
        }
      } else {
        if (playerInstance.currentTime && playerInstance.duration) {
          const currentT = playerInstance.currentTime;
          const dur = playerInstance.duration;
          if (dur > 0) {
            setCurrentTime(currentT);
            setVideoProgress((currentT / dur) * 100);
          }
        }
      }
    }, 1000);
    setIntervalId(id);
  }, [hasStartedPlaying, duration, onVideoCompleted]); // Incluimos hasStartedPlaying y duration

  const stopProgressInterval = useCallback(() => {
    if (intervalId) {
      clearInterval(intervalId);
      setIntervalId(null);
    }
  }, [intervalId]);

  useEffect(() => {
    return () => {
      stopProgressInterval();
    };
  }, [stopProgressInterval]);

  // Si la URL del video cambia, reinicia el estado y el reproductor
  useEffect(() => {
    // console.log("🐛 VideoPlayerWithControls: videoUrl ha cambiado:", videoUrl);
    setVideoProgress(0);
    setCurrentTime(0);
    setIsPaused(true);
    setHasStartedPlaying(false);
    setDuration(0);
    setPlayer(null); // Limpiar el reproductor para que Videopopup lo re-inicialice
  }, [videoUrl]);


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
      setIsPaused(!isPaused); // Actualizar el estado de pausa
      setHasStartedPlaying(true); // Marca que la reproducción ya inició.
    }
  };

  const handleSeek = (event, newValue) => {
    if (player) {
      setVideoProgress(newValue); // Actualiza el slider inmediatamente para UX
      if (isYouTubePlayer) {
        if (player.getDuration) {
          const dur = player.getDuration();
          if (dur > 0) {
            const timeToSeek = (newValue / 100) * dur;
            player.seekTo(timeToSeek, true);
            setCurrentTime(timeToSeek); // Actualiza el tiempo actual
          }
        }
      } else {
        if (player.duration > 0) {
          const timeToSeek = (newValue / 100) * player.duration;
          player.currentTime = timeToSeek;
          setCurrentTime(timeToSeek); // Actualiza el tiempo actual
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
        if (player.isMuted()) {
          player.unMute();
          player.setVolume(50); // Restaurar a un volumen predeterminado
          setVolume(50);
        } else {
          player.mute();
          setVolume(0); // Establecer visualmente el volumen a 0
        }
      } else {
        if (player.volume === 0) {
          player.volume = 0.5;
          setVolume(50);
        } else {
          player.volume = 0;
          setVolume(0);
        }
      }
    }
  };

  const formatTime = (seconds) => {
    if (isNaN(seconds) || seconds < 0) return "00:00";
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${String(minutes).padStart(2, '0')}:${String(remainingSeconds).padStart(2, '0')}`;
  };

  const handleFullscreenToggle = () => {
    if (playerContainerRef.current) {
      if (document.fullscreenElement) {
        document.exitFullscreen();
      } else {
        playerContainerRef.current.requestFullscreen();
      }
    }
  };

  return (
    <Box ref={playerContainerRef}>
      <Box sx={{ paddingBottom: { xs: "20px", md: "30px 0px" }, position: 'relative' }}>
        <Videopopup
          videoUrl={videoUrl}
          onPlayerReady={handlePlayerReady}
        />

        {/* Overlay de control: solo visible cuando el video no ha empezado, pausado, o al pasar el mouse */}
        <Box
          sx={{
            position: 'absolute',
            inset: 0,
            zIndex: 2, // Por encima del video
            backgroundColor: 'transparent',
            cursor: 'pointer',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            bottom: "20px",
            opacity: (!hasStartedPlaying || isPaused || isHovering) ? 1 : 0,
            transition: 'opacity 0.3s ease-in-out',
          }}
          onContextMenu={(e) => e.preventDefault()}
          onMouseEnter={() => setIsHovering(true)}
          onMouseLeave={() => setIsHovering(false)}
          onClick={handlePlayPause}
        >
          {isYouTubePlayer && !hasStartedPlaying ? (
            <Box
              sx={{
                backgroundColor: 'rgba(0, 0, 0, 0.6)',
                borderRadius: '50%',
                padding: 1,
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                width: { xs: 80, sm: 100 },
                height: { xs: 80, sm: 100 },
              }}
            >
              <YouTubeIcon sx={{ fontSize: { xs: 70, sm: 82 }, color: 'white' }} />
            </Box>
          ) : (
            <IconButton
              sx={{
                backgroundColor: 'rgba(0, 0, 0, 0.6)',
                '&:hover': { backgroundColor: 'rgba(0, 0, 0, 0.8)' },
                padding: { xs: '12px', sm: '16px' }
              }}
              aria-label={isPaused ? "Reproducir video" : "Pausar video"}
            >
              {isPaused ?
                <PlayArrowIcon sx={{ fontSize: { xs: 50, sm: 70 }, color: 'white' }} />
                :
                <PauseIcon sx={{ fontSize: { xs: 50, sm: 70 }, color: 'white' }} />
              }
            </IconButton>
          )}
        </Box>
      </Box>

      {/* Controles de video personalizados */}
      {player && (
        <Box sx={{
          display: 'flex',
          alignItems: 'center',
          gap: { xs: 1, sm: 2 },
          mt: 2,
          flexWrap: 'wrap',
          justifyContent: 'center',
          px: { xs: 1, sm: 0 },
          backgroundColor: '#f5f5f5',
          borderRadius: '8px',
          p: 2,
          boxShadow: '0px 2px 5px rgba(0,0,0,0.05)'
        }}>
          <IconButton onClick={handlePlayPause} color="primary" size="large">
            {isPaused ? <PlayArrowIcon sx={{ fontSize: 40 }} /> : <PauseIcon sx={{ fontSize: 40 }} />}
          </IconButton>
          <Typography variant="body2" sx={{ minWidth: '45px', textAlign: 'center' }}>
            {formatTime(currentTime)}
          </Typography>
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
          <Typography variant="body2" sx={{ minWidth: '45px', textAlign: 'center' }}>
            {formatTime(duration)}
          </Typography>

          <IconButton onClick={handleMuteToggle} color="primary" size="small">
            {volume === 0 ? <VolumeOffIcon /> : <VolumeUpIcon />}
          </IconButton>
          <Slider
            value={volume}
            onChange={handleVolumeChange}
            aria-labelledby="volume-slider"
            orientation="horizontal"
            sx={{ width: { xs: 80, sm: 100 } }}
            size="small"
            color="primary"
          />
          <IconButton onClick={handleFullscreenToggle} color="primary" size="small">
            {document.fullscreenElement ? <FullscreenExitIcon /> : <FullscreenIcon />}
          </IconButton>
        </Box>
      )}
    </Box>
  );
};

export default VideoPlayerWithControls;