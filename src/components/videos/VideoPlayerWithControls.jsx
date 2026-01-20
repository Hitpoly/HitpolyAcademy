import React, { useState, useCallback, useEffect, forwardRef } from "react";
import { Box, IconButton, Slider, Typography } from "@mui/material";

import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import PauseIcon from '@mui/icons-material/Pause';
import VolumeUpIcon from '@mui/icons-material/VolumeUp';
import VolumeOffIcon from '@mui/icons-material/VolumeOff';
import FullscreenIcon from '@mui/icons-material/Fullscreen';
import YouTubeIcon from '@mui/icons-material/YouTube';
import Videopopup from "./Videopopup";

const VideoPlayerWithControls = forwardRef(({ videoUrl, onVideoCompleted }, ref) => {
  const [player, setPlayer] = useState(null);
  const [videoProgress, setVideoProgress] = useState(0);
  const [volume, setVolume] = useState(50);
  const [isPaused, setIsPaused] = useState(true);
  const [intervalId, setIntervalId] = useState(null);
  const [isYouTubePlayer, setIsYouTubePlayer] = useState(false);
  const [hasStartedPlaying, setHasStartedPlaying] = useState(false);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [isHovering, setIsHovering] = useState(false);

  const YT_PLAYING = 1;
  const YT_PAUSED = 2;
  const YT_ENDED = 0;

  // --- FUNCIONES DE UTILIDAD ---
  const formatTime = (seconds) => {
    if (isNaN(seconds) || seconds < 0) return "00:00";
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${String(minutes).padStart(2, '0')}:${String(remainingSeconds).padStart(2, '0')}`;
  };

  const stopProgressInterval = useCallback(() => {
    if (intervalId) {
      clearInterval(intervalId);
      setIntervalId(null);
    }
  }, [intervalId]);

  const startProgressInterval = useCallback((playerInstance, isYouTube) => {
    stopProgressInterval();
    const id = setInterval(() => {
      if (isYouTube) {
        if (playerInstance && typeof playerInstance.getCurrentTime === 'function') {
          const currentT = playerInstance.getCurrentTime();
          const dur = playerInstance.getDuration();
          if (dur > 0) {
            setCurrentTime(currentT);
            setVideoProgress((currentT / dur) * 100);
            if (currentT >= dur - 0.5) {
              onVideoCompleted();
              stopProgressInterval();
            }
          }
        }
      } else {
        if (playerInstance && playerInstance.duration > 0) {
          setCurrentTime(playerInstance.currentTime);
          setVideoProgress((playerInstance.currentTime / playerInstance.duration) * 100);
        }
      }
    }, 1000);
    setIntervalId(id);
  }, [onVideoCompleted, stopProgressInterval]);

  // --- HANDLERS ---
  const handleYouTubeStateChange = useCallback((state) => {
    console.log("📺 [PLAYER] YT State Change:", state);
    if (!player) return;

    if (state === YT_PLAYING) {
      setIsPaused(false);
      setHasStartedPlaying(true);
      startProgressInterval(player, true);
    } else if (state === YT_PAUSED || state === YT_ENDED) {
      setIsPaused(true);
      stopProgressInterval();
      if (state === YT_ENDED) onVideoCompleted();
    }
  }, [player, startProgressInterval, stopProgressInterval, onVideoCompleted]);

  const handlePlayerReady = useCallback((playerInstance) => {
    console.log("%c🎯 [PLAYER] Instancia lista", "color: #2ecc71; font-weight: bold;");
    setPlayer(playerInstance);
    
    const isYT = typeof playerInstance.playVideo === 'function';
    setIsYouTubePlayer(isYT);

    if (isYT) {
      // Handshake inicial silencioso para validar origen
      playerInstance.mute(); 
      playerInstance.playVideo();
      
      setTimeout(() => {
        playerInstance.pauseVideo();
        playerInstance.unMute();
        playerInstance.setVolume(volume);
        console.log("✅ Conexión con YouTube establecida con éxito");
      }, 600);

      const checkDur = setInterval(() => {
        if (playerInstance.getDuration && playerInstance.getDuration() > 0) {
          setDuration(playerInstance.getDuration());
          clearInterval(checkDur);
        }
      }, 500);
    } else {
      playerInstance.volume = volume / 100;
      playerInstance.onplay = () => {
        setIsPaused(false);
        setHasStartedPlaying(true);
        startProgressInterval(playerInstance, false);
      };
      playerInstance.onpause = () => setIsPaused(true);
      playerInstance.onended = () => onVideoCompleted();
      playerInstance.ondurationchange = () => setDuration(playerInstance.duration);
    }
  }, [volume, onVideoCompleted, startProgressInterval]);

  // --- ESTA ES LA FUNCIÓN ACTUALIZADA ---
  const handlePlayPause = useCallback(() => {
    if (!player) return;

    if (isYouTubePlayer) {
      const state = player.getPlayerState();
      
      if (state !== YT_PLAYING) {
        // 1. Asegurar que no esté muteado para que el navegador confíe en la acción
        player.unMute(); 
        player.setVolume(volume);
        
        // 2. Ejecutar Play
        player.playVideo();
        
        // 3. Forzar actualización de UI (el evento onStateChange hará el resto)
        setIsPaused(false);
        setHasStartedPlaying(true);
      } else {
        player.pauseVideo();
        setIsPaused(true);
      }
    } else {
      // Para video nativo (MP4)
      if (player.paused) {
        player.play().catch((err) => {
          console.warn("⚠️ Autoplay bloqueado por el navegador:", err);
        });
        setIsPaused(false);
        setHasStartedPlaying(true);
      } else {
        player.pause();
        setIsPaused(true);
      }
    }
  }, [player, isYouTubePlayer, volume]);

  const handleSeek = (event, newValue) => setVideoProgress(newValue);

  const handleSeekCommitted = (event, newValue) => {
    if (player) {
      const dur = isYouTubePlayer ? player.getDuration() : player.duration;
      if (dur > 0) {
        const timeToSeek = (newValue / 100) * dur;
        if (isYouTubePlayer) {
          player.seekTo(timeToSeek, true);
        } else {
          player.currentTime = timeToSeek;
        }
        setCurrentTime(timeToSeek);
      }
    }
  };

  const handleVolumeChange = (event, newValue) => {
    setVolume(newValue);
    if (player) {
      if (isYouTubePlayer) {
        player.setVolume(newValue);
        if (newValue > 0 && player.isMuted()) player.unMute();
      } else {
        player.volume = newValue / 100;
      }
    }
  };

  const handleMuteToggle = () => {
    if (!player) return;
    if (isYouTubePlayer) {
      if (player.isMuted()) {
        player.unMute();
        setVolume(50);
        player.setVolume(50);
      } else {
        player.mute();
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
  };

  const handleFullscreenToggle = () => {
    if (!ref.current) return;
    if (!document.fullscreenElement) {
      const req = ref.current.requestFullscreen || ref.current.webkitRequestFullscreen || ref.current.mozRequestFullScreen || ref.current.msRequestFullscreen;
      if (req) req.call(ref.current);
    } else {
      document.exitFullscreen();
    }
  };

  useEffect(() => {
    setVideoProgress(0);
    setCurrentTime(0);
    setIsPaused(true);
    setHasStartedPlaying(false);
    setDuration(0);
  }, [videoUrl]);

  useEffect(() => {
    return () => stopProgressInterval();
  }, [stopProgressInterval]);

  const showControls = !hasStartedPlaying || isPaused || isHovering;

  return (
    <Box 
      ref={ref} 
      sx={{ 
        position: 'relative', width: '100%', aspectRatio: '16/9', 
        bgcolor: 'black', overflow: 'hidden' 
      }}
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
    >
      <Videopopup
        videoUrl={videoUrl}
        onPlayerReady={handlePlayerReady}
        onYouTubeStateChange={handleYouTubeStateChange}
      />

      {/* Capa de clic central */}
      <Box
        sx={{
          position: 'absolute', inset: 0, zIndex: 2,
          display: 'flex', justifyContent: 'center', alignItems: 'center',
          opacity: showControls ? 1 : 0, transition: 'opacity 0.3s', cursor: 'pointer',
          pb: '60px' 
        }}
        onClick={handlePlayPause}
      >
        {isPaused && (
          <Box sx={{ bgcolor: 'rgba(0,0,0,0.6)', borderRadius: '50%', p: 2, pointerEvents: 'none' }}>
            {isYouTubePlayer ? <YouTubeIcon sx={{ fontSize: 80, color: 'white' }} /> : <PlayArrowIcon sx={{ fontSize: 80, color: 'white' }} />}
          </Box>
        )}
      </Box>

      {/* Barra de controles */}
      {player && (
        <Box
          sx={{
            position: 'absolute', bottom: 0, left: 0, right: 0, zIndex: 10,
            display: 'flex', alignItems: 'center', gap: 2, p: 2, color: 'white',
            background: 'linear-gradient(transparent, rgba(0,0,0,0.9))',
            opacity: showControls ? 1 : 0, transition: 'opacity 0.3s',
            pointerEvents: showControls ? 'auto' : 'none'
          }}
          onClick={(e) => e.stopPropagation()}
        >
          <IconButton onClick={handlePlayPause} color="inherit">
            {isPaused ? <PlayArrowIcon /> : <PauseIcon />}
          </IconButton>
          
          <Typography variant="body2" sx={{ minWidth: '85px', userSelect: 'none' }}>
            {formatTime(currentTime)} / {formatTime(duration)}
          </Typography>

          <Slider
            value={videoProgress}
            onChange={handleSeek}
            onChangeCommitted={handleSeekCommitted}
            size="small"
            sx={{ flexGrow: 1, color: 'white' }}
          />

          <IconButton onClick={handleMuteToggle} color="inherit">
            {volume === 0 ? <VolumeOffIcon /> : <VolumeUpIcon />}
          </IconButton>
          
          <Slider 
            value={volume} 
            onChange={handleVolumeChange} 
            size="small" 
            sx={{ width: 80, color: 'white' }} 
          />
          
          <IconButton onClick={handleFullscreenToggle} color="inherit">
            <FullscreenIcon />
          </IconButton>
        </Box>
      )}
    </Box>
  );
});

export default VideoPlayerWithControls;