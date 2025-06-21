// src/components/videos/VideoPlayerWithControls.jsx
// (Ajusta la ruta si lo guardas en otro lugar)

import React, { useState, useCallback, useEffect } from "react";
import { Box, IconButton, Slider } from "@mui/material";

// Importaciones directas a los iconos específicos
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
  const [isYouTubePlayer, setIsYouTubePlayer] = useState(false);
  // Estado para saber si el video se ha reproducido al menos una vez.
  const [hasStartedPlaying, setHasStartedPlaying] = useState(false); 

  const handlePlayerReady = useCallback((playerInstance) => {
    setPlayer(playerInstance);
    setIsYouTubePlayer(!!playerInstance.playVideo);

    if (playerInstance.playVideo) { // Es un reproductor de YouTube
      playerInstance.addEventListener('onStateChange', (event) => {
        if (event.data === 1) { // Reproduciendo
          setIsPaused(false);
          setHasStartedPlaying(true); // Marca que ya empezó a reproducir
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
      playerInstance.volume = volume / 100;

      playerInstance.onplay = () => {
        setIsPaused(false);
        setHasStartedPlaying(true); // Marca que ya empezó a reproducir
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
  }, [volume]);

  const startProgressInterval = useCallback((playerInstance, isYouTube) => {
    stopProgressInterval();
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
    }, 1000);
    setIntervalId(id);
  }, []);

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
      setIsPaused(!isPaused);
      setHasStartedPlaying(true); // Marca que ya empezó a reproducir en cualquier interacción de play/pause
    }
  };

  const handleSeek = (event, newValue) => {
    if (player) {
      if (isYouTubePlayer) {
        if (player.getDuration) {
          const duration = player.getDuration();
          if (duration > 0) {
            const timeToSeek = (newValue / 100) * duration;
            player.seekTo(timeToSeek, true);
            setVideoProgress(newValue);
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
          player.setVolume(50);
          setVolume(50);
        } else {
          player.setVolume(0);
          setVolume(0);
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

  return (
    <Box>
      <Box sx={{ paddingBottom: { xs: "20px", md: "30px 0px" } }}>
        <Videopopup
          videoUrl={videoUrl}
          onPlayerReady={handlePlayerReady}
          isPlaying={!isPaused}
          onPlayPause={handlePlayPause}
          hasStartedPlaying={hasStartedPlaying}
        />
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
          px: { xs: 1, sm: 0 }
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
            sx={{ width: { xs: 80, sm: 100 } }}
            size="small"
            color="primary"
          />
        </Box>
      )}
    </Box>
  );
};

export default VideoPlayerWithControls;