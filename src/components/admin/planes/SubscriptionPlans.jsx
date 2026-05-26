import React from "react";
import styled from "@emotion/styled";
import { Box, Typography, Button } from "@mui/material";
import { useAuth } from "../../../context/AuthContext"; 
import { useNavigate } from "react-router-dom";

const fontFamily = "Inter"; 

const FullScreenOverlay = styled(Box)({

  width: "100%",
  height: "100%",
  backgroundColor: "rgba(0, 0, 0, 0.9)", 
  display: "flex",
  flexDirection: "column",
  justifyContent: "center",
  alignItems: "center",
  padding: "100px 0px"
});


const PlanCard = styled(Box)({
  backgroundColor: "#fff", 
  color: "#333", 
  padding: "30px",
  borderRadius: "10px",
  margin: "15px",
  textAlign: "center",
  width: "280px",
  minHeight: "350px",
  boxShadow: "0 8px 16px rgba(0,0,0,0.2)",
  display: "flex",
  flexDirection: "column",
  justifyContent: "space-between",
  transition: 'transform 0.3s ease-in-out',
  '&:hover': {
    transform: 'scale(1.03)',
  },
  '@media (max-width: 600px)': {
    width: "90%",
    margin: "10px 0",
  },
});

const PlanTitle = styled(Typography)({
  fontSize: 28,
  fontFamily,
  fontWeight: 700,
  color: "#F21D6B", 
  marginBottom: "15px",
});

const PlanPrice = styled(Typography)({
  fontSize: 38,
  fontFamily,
  fontWeight: 800,
  color: "#333", 
  marginBottom: "10px",
});

const PlanDescription = styled(Typography)({
  fontSize: 16,
  fontFamily,
  color: "#666", 
  marginBottom: "20px",
  flexGrow: 1,
});


const SubscribeButton = styled(Button)({
  backgroundColor: "#F21D6B", 
  color: "#fff",
  fontFamily,
  fontWeight: 600,
  marginTop: "auto",
  padding: '12px 24px',
  borderRadius: '8px',
  '&:hover': {
    backgroundColor: "#d81a5f",
  },
});


const LogoutInBannerButton = styled(Button)({
  backgroundColor: "transparent", 
  color: "#fff", 
  fontFamily,
  fontWeight: 600,
  marginTop: "20px", 
  border: "1px solid #fff",
  padding: '10px 20px',
  borderRadius: '8px',
  '&:hover': {
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    borderColor: "#fff",
  },
});

const SubscriptionPlans = () => {
  const { logout } = useAuth(); 
  const navigate = useNavigate();

  const plans = [
    { name: "Mensual", price: "$19.99", description: "Acceso ilimitado por un mes. ¡Ideal para empezar!" },
    { name: "Trimestral", price: "$49.99", description: "Acceso ilimitado por tres meses. ¡Ahorra un 15%!" },
    { name: "Semestral", price: "$89.99", description: "Acceso ilimitado por seis meses. ¡Ahorra un 25%!" },
    { name: "Anual", price: "$149.99", description: "Acceso ilimitado por un año completo. ¡El mejor ahorro!" },
  ];

  const handleSubscribe = (planName) => {
    alert(`¡Gracias por seleccionar el plan ${planName}! Aquí integrarías el proceso de pago.`);
    };

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <FullScreenOverlay>
      <Typography variant="h3" style={{ fontFamily, color: '#fff', fontSize: '4rem', marginBottom: '20px', textAlign: 'center' }}>
        ¡Tu acceso está limitado!
      </Typography>
      <Typography variant="h5" style={{ fontFamily, color: '#fff', marginBottom: '40px', textAlign: 'center', maxWidth: '800px' }}>
        Para desbloquear todo el contenido educativo de la academia y continuar tu camino hacia el éxito, elige uno de nuestros planes de acceso premium:
      </Typography>

      <Box display="flex" flexWrap="wrap" justifyContent="center" gap={3}>
        {plans.map((plan, index) => (
          <PlanCard key={index}>
            <PlanTitle>{plan.name}</PlanTitle>
            <PlanPrice>{plan.price}</PlanPrice>
            <PlanDescription>{plan.description}</PlanDescription>
            <SubscribeButton onClick={() => handleSubscribe(plan.name)}>
              Suscribirme
            </SubscribeButton>
          </PlanCard>
        ))}
      </Box>

      <Typography variant="body2" style={{ fontFamily, color: '#fff', marginTop: '40px', textAlign: 'center' }}>
        Esta ventana permanecerá abierta hasta que elijas un plan o cierres tu sesión.
      </Typography>
      
      <LogoutInBannerButton onClick={handleLogout}>
        Cerrar Sesión 🚪
      </LogoutInBannerButton>

    </FullScreenOverlay>
  );
};

export default SubscriptionPlans;