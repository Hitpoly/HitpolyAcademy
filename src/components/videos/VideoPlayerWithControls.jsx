import React, { useState, useCallback, useEffect, forwardRef, useRef } from "react";
import { Box, IconButton, Slider, Typography } from "@mui/material";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import PauseIcon from "@mui/icons-material/Pause";
import VolumeUpIcon from "@mui/icons-material/VolumeUp";
import VolumeOffIcon from "@mui/icons-material/VolumeOff";
import FullscreenIcon from "@mui/icons-material/Fullscreen";
import ReplayIcon from "@mui/icons-material/Replay";
import Videopopup from "./Videopopup";

const VideoPlayerWithControls = forwardRef(
  ({ videoUrl, onVideoCompleted }, ref) => {
    const [player, setPlayer] = useState(null);
    const [isPaused, setIsPaused] = useState(true);
    const [volume, setVolume] = useState(100);
    const [progress, setProgress] = useState(0);
    const [duration, setDuration] = useState(0);
    const [currentTime, setCurrentTime] = useState(0);
    const [hover, setHover] = useState(false);
    const [isCompleted, setIsCompleted] = useState(false);
    const [hasStarted, setHasStarted] = useState(false);
    
    const isDragging = useRef(false);
    const intervalRef = useRef(null);

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
        if (p && typeof p.getCurrentTime === 'function' && !isDragging.current) {
          const t = p.getCurrentTime();
          const d = p.getDuration();
          if (d > 0) {
            setCurrentTime(t);
            setDuration(d);
            setProgress((t / d) * 100);
          }
        }
      }, 150);
    }, []);

    /* ================= PLAYER HANDLERS ================= */
    const handlePlayerReady = useCallback((p) => {
      setPlayer(p);
      setDuration(p.getDuration?.() || 0);
      p.setVolume(volume);
      startGlobalTimer(p);
    }, [volume, startGlobalTimer]);

    const handleYTState = useCallback((state) => {
      if (!player) return;
      if (state === 1) { // Playing
        setIsPaused(false);
        setIsCompleted(false);
        setHasStarted(true);
      } else if (state === 2 || state === -1) { // Paused / Unstarted
        setIsPaused(true);
      } else if (state === 0) { // Ended
        setIsPaused(true);
        setIsCompleted(true);
        setProgress(100);
        onVideoCompleted?.();
      }
    }, [player, onVideoCompleted]);

    /* ================= CONTROL ACTIONS ================= */
    const handlePlayPause = () => {
      if (!player) return;
      if (isCompleted) {
        player.seekTo(0);
        player.playVideo();
        setIsCompleted(false);
      } else {
        const state = player.getPlayerState();
        state === 1 ? player.pauseVideo() : player.playVideo();
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
      if (!player) return;
      const t = (v / 100) * duration;
      player.seekTo(t, true);
      setTimeout(() => { isDragging.current = false; }, 600);
      if (v < 99) setIsCompleted(false);
    };

    const handleVolumeChange = (_, v) => {
      setVolume(v);
      if (player) {
        player.setVolume(v);
        if (v > 0 && player.isMuted()) player.unMute();
      }
    };

    useEffect(() => {
      return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
    }, []);

    const showControls = hasStarted && (isPaused || hover || isCompleted);

    return (
      <Box
        ref={ref}
        sx={{
          position: "relative",
          width: "100%",
          paddingTop: "56.25%",
          backgroundColor: "black",
          overflow: "hidden",
        }}
        onMouseEnter={() => setHover(true)}
        onMouseLeave={() => setHover(false)}
      >
        <Box sx={{ position: "absolute", inset: 0 }}>
          <Videopopup
            videoUrl={videoUrl}
            onPlayerReady={handlePlayerReady}
            onYouTubeStateChange={handleYTState}
          />

          {/* 🚫 CAPA PROTECTORA INFERIOR (Siempre presente) */}
          {/* Esta capa bloquea los clics en el logo de YouTube y botones nativos */}
          <Box
            sx={{
              position: "absolute",
              bottom: 0,
              left: 0,
              right: 0,
              height: "60px", // Altura suficiente para cubrir el logo de YouTube
              zIndex: 18, // Superior al video, inferior a los controles
              backgroundColor: "transparent",
              pointerEvents: "auto", // Captura los clics para que no lleguen al iframe
            }}
          />

          {/* 🌑 CAPA FINAL */}
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

          {/* 🎛️ BARRA DE CONTROLES */}
          <Box
            sx={{
              position: "absolute",
              bottom: 0,
              left: 0,
              right: 0,
              zIndex: 20, // Nivel más alto
              p: 2,
              display: "flex",
              gap: 2,
              alignItems: "center",
              color: "#fff",
              background: "linear-gradient(transparent, rgba(0,0,0,.9))",
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