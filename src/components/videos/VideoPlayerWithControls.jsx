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

  // Constantes de estado del reproductor de YouTube
  const YT_PLAYING = 1;
  const YT_PAUSED = 2;
  const YT_ENDED = 0;
  const YT_BUFFERING = 3;

  const startProgressInterval = useCallback((playerInstance, isYouTube) => {
    stopProgressInterval(); // Asegurarse de limpiar cualquier intervalo anterior
    const id = setInterval(() => {
      if (isYouTube) {
        if (playerInstance && typeof playerInstance.getCurrentTime === 'function' && typeof playerInstance.getDuration === 'function') {
          const currentT = playerInstance.getCurrentTime();
          const dur = playerInstance.getDuration();
          if (dur > 0 && currentT !== null && currentT !== undefined) {
            setCurrentTime(currentT);
            setVideoProgress((currentT / dur) * 100);

            // Añadir lógica para detectar el final del video de YouTube por progreso
            // Solo si el video ya ha empezado a reproducirse y está casi al final
            // Usamos player?.getPlayerState() para asegurar que no falle si el player no tiene el método
            if (currentT >= dur - 0.5 && dur > 0 && player?.getPlayerState() !== YT_ENDED) {
                // console.log("🐛 VideoPlayerWithControls: Video de YouTube finalizado (por progreso, después de seek).");
                setIsPaused(true);
                setVideoProgress(100);
                setCurrentTime(duration);
                stopProgressInterval();
                onVideoCompleted();
            }
          }
        }
      } else {
        if (playerInstance && playerInstance.currentTime !== null && playerInstance.duration !== null && playerInstance.duration > 0) {
          setCurrentTime(playerInstance.currentTime);
          setVideoProgress((playerInstance.currentTime / playerInstance.duration) * 100);
        }
      }
    }, 1000); // Actualiza cada segundo
    setIntervalId(id);
  }, [duration, onVideoCompleted, player]); // Añadir 'player' como dependencia para acceder a player.getPlayerState()

  const stopProgressInterval = useCallback(() => {
    if (intervalId) {
      clearInterval(intervalId);
      setIntervalId(null);
    }
  }, [intervalId]);

  // Nuevo manejador para los cambios de estado de YouTube
  const handleYouTubeStateChange = useCallback((state) => {
    // console.log("🐛 YouTube State Changed:", state);
    if (!player) return; // Asegúrate de que el player esté disponible

    switch (state) {
      case YT_PLAYING:
        setIsPaused(false);
        setHasStartedPlaying(true);
        startProgressInterval(player, true);
        if (player.getDuration() > 0) {
          setDuration(player.getDuration());
        }
        break;
      case YT_PAUSED:
        setIsPaused(true);
        stopProgressInterval();
        break;
      case YT_ENDED:
        // console.log("🐛 VideoPlayerWithControls: Video de YouTube finalizado (por estado).");
        setIsPaused(true);
        setVideoProgress(100);
        setCurrentTime(duration); // Asegurarse de que el tiempo final sea la duración total
        stopProgressInterval();
        onVideoCompleted();
        break;
      case YT_BUFFERING:
        // Opcional: Puedes mostrar un indicador de buffering o detener el intervalo si lo prefieres
        // Actualmente, el intervalo sigue corriendo si estaba reproduciéndose, ya que el buffering es temporal.
        break;
      default:
        break;
    }
  }, [player, startProgressInterval, stopProgressInterval, onVideoCompleted, duration]);


  const handlePlayerReady = useCallback((playerInstance) => {
    // console.log("🐛 VideoPlayerWithControls: Reproductor listo.", playerInstance);
    setPlayer(playerInstance);
    // Determinar si es un reproductor de YouTube basado en la existencia del método `playVideo`
    // (react-youtube's event.target tiene estos métodos)
    setIsYouTubePlayer(typeof playerInstance.playVideo === 'function');

    if (typeof playerInstance.playVideo === 'function') { // Es un reproductor de YouTube (react-youtube)
      // console.log("🐛 VideoPlayerWithControls: Es reproductor de YouTube (via react-youtube).");
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
  }, [volume, onVideoCompleted, duration, startProgressInterval, stopProgressInterval]);


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
    }
  };

  const handleSeek = (event, newValue) => {
    // Solo actualiza el slider visualmente mientras el usuario arrastra
    setVideoProgress(newValue);
  };

  const handleSeekCommitted = (event, newValue) => {
    if (player) {
      if (isYouTubePlayer) {
        if (player.getDuration) {
          const dur = player.getDuration();
          if (dur > 0) {
            const timeToSeek = (newValue / 100) * dur;
            player.seekTo(timeToSeek, true);
            setCurrentTime(timeToSeek);
            // Si el video estaba reproduciéndose, reinicia el intervalo de progreso
            // Esto es crucial para que la barra siga avanzando después de un seek.
            if (!isPaused) {
                startProgressInterval(player, true);
            }
          }
        }
      } else { // Es un elemento <video> HTML nativo
        if (player.duration > 0) {
          const timeToSeek = (newValue / 100) * player.duration;
          player.currentTime = timeToSeek;
          setCurrentTime(timeToSeek);
          // Si el video estaba reproduciéndose, reinicia el intervalo de progreso
          if (!isPaused) {
            startProgressInterval(player, false);
          }
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
          onYouTubeStateChange={handleYouTubeStateChange}
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
              onChangeCommitted={handleSeekCommitted}
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