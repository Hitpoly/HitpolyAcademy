import React, { useState } from "react";
import VideoLayout from "./layout";
import { Box } from "@mui/material";

const activities = [
  {
    title: "1. Introducción al Programa Master Full",
    videoUrl: "https://www.youtube.com/embed/3m9hoUv5Q6g?autoplay=1",
    resources: [
      {
        name: "Guía PDF",
        description: "Descarga la guía de introducción",
        url: "/guide1.pdf",
      },
      {
        name: "Artículo",
        description: "Lee el artículo de bienvenida",
        url: "/article1.pdf",
      },
    ],
    progressPanels: [
      {
        id: "panel1",
        title: "¿Qué es un Setter de Elite?",
        content:
          "Un Setter de Elite no es solo alguien que agenda citas. Es un profesional que filtra, detecta y conecta con personas que realmente pueden comprar. Su función es encontrar oportunidades comerciales valiosas y ponerlas sobre la mesa para que el área de ventas haga lo suyo. No se trata de llenar la agenda con reuniones vacías.",
      },
      {
        id: "pane2",
        title: "Mentalidad del Setter de Elite",
        content:
          "Un verdadero Setter de Elite no se rinde con un “no”, ni se frustra con un rechazo. Tiene una mentalidad fuerte, enfocada en el largo plazo y en los resultados. Sabe que cada intento lo acerca más al sí correcto y que cada conversación es una oportunidad para aprender, mejorar y crecer.",
      },
      {
        id: "pane3",
        title: "¿Por qué las empresas necesitan Setters de Elite?",
        content:
          "Las empresas no quieren perder el tiempo hablando con personas que no están listas para comprar. Necesitan setters que no solo generen reuniones, sino que conecten con prospectos calificados, con intención real de compra.",
      },
    ],
  },
  {
    title: "2. Algunas recomendaciones clave",
    videoUrl: "https://www.youtube.com/embed/qiU-E3J_ITQ?autoplay=1",
    resources: [
      {
        name: "Guía PDF",
        description: "Desarrollo de habilidades clave",
        url: "/guide2.pdf",
      },
      {
        name: "Video",
        description: "Ver el video sobre técnicas avanzadas",
        url: "/advanced-video.mp4",
      },
    ],
    progressPanels: [
      {
        id: "panel1",
        title: "Técnicas Avanzadas",
        content: "Cómo mejorar tus habilidades en ventas",
      },
      {
        id: "pane2",
        title: "Práctica",
        content: "Ejercicios para aplicar las técnicas",
      },
    ],
  },
  {
    title: "3. Domina tus demonios internos",
    videoUrl: "https://www.youtube.com/embed/gHgCtWwfFz4?autoplay=1",
    resources: [
      {
        name: "Guía PDF",
        description: "Estrategias para cerrar ventas efectivas",
        url: "/closing-guide.pdf",
      },
      {
        name: "Plantilla",
        description: "Plantilla de cierre de ventas",
        url: "/closing-template.pdf",
      },
    ],
    progressPanels: [
      {
        id: "panel1",
        title: "Estrategias de Cierre",
        content: "Técnicas para cerrar ventas con éxito",
      },
      {
        id: "pane2",
        title: "Práctica",
        content: "Aplicación de estrategias de cierre",
      },
    ],
  },
  {
    title: "4. Superar obstáculos y persistir hasta morir",
    videoUrl: "https://www.youtube.com/embed/pGGceGqmqYU?autoplay=1",
    resources: [
      {
        name: "PDF",
        description: "Mejora tu comunicación efectiva",
        url: "/communication-guide.pdf",
      },
      {
        name: "Webinar",
        description: "Accede al webinar sobre estrategias de comunicación",
        url: "/webinar1.mp4",
      },
    ],
    progressPanels: [
      {
        id: "panel1",
        title: "Estrategias Efectivas",
        content: "Técnicas para comunicarte de manera efectiva",
      },
      {
        id: "pane2",
        title: "Aplicación Práctica",
        content: "Cómo aplicar lo aprendido en situaciones reales",
      },
    ],
  },
  {
    title: "5. Entendiendo el verdadero juego del setteo",
    videoUrl: "https://www.youtube.com/embed/1IIQtgoI1nE?autoplay=1",
    resources: [
      {
        name: "Guía PDF",
        description: "Entiende la psicología detrás de una compra",
        url: "/buyer-psychology-guide.pdf",
      },
      {
        name: "Estudio de Caso",
        description: "Estudio de caso sobre la psicología del comprador",
        url: "/case-study.pdf",
      },
    ],
    progressPanels: [
      {
        id: "panel1",
        title: "Comportamiento del Comprador",
        content: "Factores que influyen en las decisiones de compra",
      },
      {
        id: "pane2",
        title: "Técnicas Psicológicas",
        content: "Uso de técnicas psicológicas para influir en la compra",
      },
    ],
  },
];

const PasosIniciales = () => {
  const [currentVideoIndex, setCurrentVideoIndex] = useState(0);

  return (
    <Box>
      <VideoLayout
        videoUrl={activities[currentVideoIndex].videoUrl}
        titulo={activities[currentVideoIndex].title}
        resources={activities[currentVideoIndex].resources}
        activities={activities}
        onNextPage={() => console.log("Siguiente página")}
      />
    </Box>
  );
};

export default PasosIniciales;
