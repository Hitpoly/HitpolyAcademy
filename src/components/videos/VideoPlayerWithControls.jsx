import React, { useState, useCallback, useEffect, forwardRef, useRef } from "react";
import { Box, IconButton, Slider, Typography } from "@mui/material";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import PauseIcon from "@mui/icons-material/Pause";
import VolumeUpIcon from "@mui/icons-material/VolumeUp";
import VolumeOffIcon from "@mui/icons-material/VolumeOff";
import FullscreenIcon from "@mui/icons-material/Fullscreen";
import ReplayIcon from "@mui/icons-material/Replay";
import Videopopup from "./Videopopup";

const getYouTubeVideoId = (url) => {
  const regExp = /(?:youtube\.com\/.*[?&]v=|youtu\.be\/)([^"&?/ ]{11})/;
  const match = url?.match(regExp);
  return match ? match[1] : null;
};

const VideoPlayerWithControls = forwardRef(
  ({ videoUrl, onVideoCompleted }, ref) => {
    const isDragging = useRef(false);
    const intervalRef = useRef(null);
    const seekTimeoutRef = useRef(null);

    /* ================= PERSISTENCIA ================= */
    const getStorageKey = useCallback(() => `video_progress_${videoUrl}`, [videoUrl]);

    const saveProgress = useCallback((time) => {
      if (videoUrl && time > 0) {
        localStorage.setItem(getStorageKey(), time.toString());
      }
    }, [videoUrl, getStorageKey]);

    const getSavedProgress = useCallback(() => {
      if (videoUrl) {
        const saved = localStorage.getItem(getStorageKey());
        return saved ? parseFloat(saved) : 0;
      }
      return 0;
    }, [videoUrl, getStorageKey]);

    // Tiempo inicial memoizado para evitar re-cálculos constantes
    const initialTimeFromStorage = React.useMemo(() => {
      const saved = getSavedProgress();
      return (saved > 2) ? saved : 0;
    }, [videoUrl]); // eslint-disable-line react-hooks/exhaustive-deps

    const [player, setPlayer] = useState(null);
    const [isPaused, setIsPaused] = useState(true);
    const [volume, setVolume] = useState(100);
    const [duration, setDuration] = useState(0);
    const [currentTime, setCurrentTime] = useState(initialTimeFromStorage);
    const [progress, setProgress] = useState(0);
    const [hover, setHover] = useState(false);
    const [isCompleted, setIsCompleted] = useState(false);
    const [hasStarted, setHasStarted] = useState(false);
    const [isPlayerReady, setIsPlayerReady] = useState(false);

    /* ================= RESET ================= */
    // Reset completo cuando cambia el vídeo
    useEffect(() => {
      setHasStarted(false);
      setIsCompleted(false);
      setDuration(0);
      setIsPaused(true);
      setPlayer(null);
      setIsPlayerReady(false);
      
      const saved = getSavedProgress();
      const st = (saved > 2) ? saved : 0;
      setCurrentTime(st);
      setProgress(0);
    }, [videoUrl]); // eslint-disable-line react-hooks/exhaustive-deps

    /* ================= UTILS ================= */
    const formatTime = (s) => {
      if (!s || isNaN(s)) return "00:00";
      const m = Math.floor(s / 60);
      const sec = Math.floor(s % 60);
      return `${String(m).padStart(2, "0")}:${String(sec).padStart(2, "0")}`;
    };

    const startGlobalTimer = useCallback((p) => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      intervalRef.current = setInterval(() => {
        if (p && typeof p.getCurrentTime === 'function' && p.getIframe?.() && !isDragging.current) {
          const t = p.getCurrentTime();
          const d = p.getDuration();
          if (d > 0) {
            setCurrentTime(t);
            setDuration(d);
            setProgress((t / d) * 100);
            
            // Guardar progreso cada ~2 segundos
            if (Math.floor(t) % 2 === 0 && Math.floor(t) > 0) {
              // console.log(`[VideoProgress] Auto-save a los ${t}s`);
              saveProgress(t);
            }
          }
        }
      }, 150);
    }, [saveProgress]);

    /* ================= PLAYER HANDLERS ================= */
    const handlePlayerReady = useCallback((p) => {
      if (seekTimeoutRef.current) clearTimeout(seekTimeoutRef.current);
      setPlayer(p);
      setIsPlayerReady(true);
      if (p && typeof p.getDuration === 'function') {
        setDuration(p.getDuration() || 0);
        p.setVolume(volume);
        startGlobalTimer(p);
      }
    }, [volume, startGlobalTimer]);

    const handleYTState = useCallback((state) => {
      // if (player) console.log(`[VideoProgress] Cambio de Estado YouTube: ${state}`);

      if (state === 1) { // Playing
        // Si es la primera vez que arranca, saltamos al tiempo guardado
        if (!hasStarted) {
          const savedTime = getSavedProgress();
          if (savedTime > 2 && player && typeof player.seekTo === 'function') {
            player.seekTo(savedTime, true);
          }
          setHasStarted(true);
        }
        setIsPaused(false);
        setIsCompleted(false);
      } else if (state === 2) { // Paused
        setIsPaused(true);
      } else if (state === 0) { // Ended
        setIsPaused(true);
        setIsCompleted(true);
        setProgress(100);
        onVideoCompleted?.();
      }
    }, [player, hasStarted, getSavedProgress, onVideoCompleted]);

    /* ================= CONTROL ACTIONS ================= */
    const handlePlayPause = () => {
      if (!player) return;

      if (typeof player.playVideo !== 'function') return;

      try {
        if (isCompleted) {
          player.seekTo(0);
          player.playVideo();
          setIsCompleted(false);
        } else {
          // Intentar obtener el estado, si falla, asumimos que queremos reproducir
          let state = -1;
          try { state = player.getPlayerState(); } catch(e) {}
          
          if (state === 1) {
            player.pauseVideo();
          } else {
            player.playVideo();
            setHasStarted(true);
          }
        }
      } catch (error) {
        console.error("[VideoProgress] Error crítico en interacción:", error);
      }
    };

    const handleSliderChange = (event, newValue) => {
      isDragging.current = true;
      setProgress(newValue);
      if (duration > 0) {
        setCurrentTime((newValue / 100) * duration);
      }
    };

    const handleSeekCommit = (_, v) => {
      if (!player || typeof player.seekTo !== 'function') return;
      const t = (v / 100) * duration;
      player.seekTo(t, true);
      setTimeout(() => { isDragging.current = false; }, 600);
      if (v < 99) setIsCompleted(false);
    };

    const handleVolumeChange = (_, v) => {
      setVolume(v);
      if (player && typeof player.setVolume === 'function') {
        player.setVolume(v);
        if (v > 0 && player.isMuted?.()) player.unMute();
      }
    };

    useEffect(() => {
      return () => { 
        if (intervalRef.current) clearInterval(intervalRef.current); 
        if (seekTimeoutRef.current) clearTimeout(seekTimeoutRef.current);
      };
    }, []);

    const videoId = getYouTubeVideoId(videoUrl);
    const showControls = hasStarted && (isPaused || hover || isCompleted);

    return (
      <Box
        ref={ref}
        sx={{
          position: "relative",
          width: "100%",
          paddingTop: "56.25%",
          backgroundColor: "transparent",
          overflow: "hidden",
        }}
        onMouseEnter={() => setHover(true)}
        onMouseLeave={() => setHover(false)}
      >
        <Box sx={{ position: "absolute", inset: 0 }}>
          <Videopopup
            key={videoUrl}
            videoUrl={videoUrl}
            onPlayerReady={handlePlayerReady}
            onYouTubeStateChange={handleYTState}
            hasStarted={hasStarted}
            initialTime={initialTimeFromStorage}
          />

          {/* Portada y Botón de Play Clarito (Visual, deja pasar el primer clic nativo) */}
          {!hasStarted && (
            <Box
              sx={{
                position: "absolute",
                inset: 0,
                backgroundImage: videoId 
                  ? `url(https://img.youtube.com/vi/${videoId}/maxresdefault.jpg), url(https://img.youtube.com/vi/${videoId}/hqdefault.jpg)` 
                  : "none",
                backgroundSize: "cover",
                backgroundPosition: "center",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                zIndex: 15, // Por debajo del escudo para que el escudo decida el clic
                pointerEvents: "none", // El primer clic va a YouTube
              }}
            >
              <Box
                sx={{
                  width: 80,
                  height: 80,
                  backgroundColor: "rgba(255, 255, 255, 0.95)",
                  borderRadius: "50%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  boxShadow: "0 4px 20px rgba(0,0,0,0.4)",
                  transform: isPlayerReady ? "scale(1)" : "scale(0.9)",
                  transition: "transform 0.3s",
                  opacity: isPlayerReady ? 1 : 0.7,
                }}
              >
                <PlayArrowIcon sx={{ fontSize: 50, color: "#F21C63", ml: 0.5 }} />
              </Box>
            </Box>
          )}

          {/* Escudo invisible y área de Play/Pausa Universal (Inteligente) */}
          <Box
            sx={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              bottom: "80px", // Ajustado para liberar exactamente nuestra barra de 80px
              zIndex: 25,
              backgroundColor: "transparent",
              cursor: "pointer",
              // El primer clic va a YouTube (nativo), los siguientes a nosotros
              pointerEvents: hasStarted ? "auto" : "none",
            }}
            onClick={handlePlayPause}
          />

          {/* Área de interacción (invisible antes de iniciar para permitir clic nativo) */}
          <Box
            sx={{
              position: "absolute",
              bottom: 0,
              left: 0,
              right: 0,
              height: "60px",
              zIndex: 18,
              backgroundColor: "transparent",
              pointerEvents: hasStarted ? "auto" : "none",
            }}
          />

          {isCompleted && (
            <Box
              sx={{
                position: "absolute",
                inset: 0,
                backgroundColor: "rgba(0,0,0,0.85)",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                zIndex: 19,
                color: "white",
                cursor: "pointer"
              }}
              onClick={handlePlayPause}
            >
              <ReplayIcon sx={{ fontSize: 70, mb: 1 }} />
              <Typography variant="h6">Ver de nuevo</Typography>
            </Box>
          )}

          <Box
            sx={{
              position: "absolute",
              bottom: 0,
              left: 0,
              right: 0,
              zIndex: 20,
              p: 2,
              height: "80px", // Altura suficiente para tapar la barra de YouTube
              display: "flex",
              gap: 2,
              alignItems: "center",
              color: "#fff",
              backgroundColor: "#000", // Fondo sólido para tapar lo de abajo
              opacity: showControls ? 1 : 0,
              visibility: hasStarted ? "visible" : "hidden",
              transition: "opacity .3s, visibility .3s",
              pointerEvents: showControls ? "auto" : "none",
            }}
          >
            <IconButton onClick={handlePlayPause} color="inherit">
              {isCompleted ? <ReplayIcon sx={{ fontSize: 30 }} /> : 
               isPaused ? <PlayArrowIcon sx={{ fontSize: 30 }} /> : <PauseIcon sx={{ fontSize: 30 }} />}
            </IconButton>

            <Typography sx={{ minWidth: 85, fontSize: "0.85rem", fontVariantNumeric: "tabular-nums" }}>
              {formatTime(currentTime)} / {formatTime(duration)}
            </Typography>

            <Slider
              value={progress}
              onChange={handleSliderChange}
              onChangeCommitted={handleSeekCommit}
              sx={{ 
                flex: 1, 
                color: "#ff0000",
                '& .MuiSlider-thumb': { width: 14, height: 14 },
                '& .MuiSlider-rail': { opacity: 0.3 }
              }}
            />

            <IconButton onClick={() => {
               if (!player) return;
               if (player.isMuted()) { player.unMute(); setVolume(100); }
               else { player.mute(); setVolume(0); }
            }} color="inherit">
              {volume === 0 ? <VolumeOffIcon /> : <VolumeUpIcon />}
            </IconButton>

            <Slider
              value={volume}
              onChange={handleVolumeChange}
              sx={{ width: 80, color: "#fff" }}
            />

            <IconButton color="inherit" onClick={() => ref.current?.requestFullscreen()}>
              <FullscreenIcon />
            </IconButton>
          </Box>
        </Box>
      </Box>
    );
  }
);

export default VideoPlayerWithControls;