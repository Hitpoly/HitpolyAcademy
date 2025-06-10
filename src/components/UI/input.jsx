import React, { useState } from "react";
import { Field } from "formik";
import styled from "@emotion/styled";
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import { IconButton, Typography, Box } from "@mui/material";

const BG_INPUT = "rgb(239,239,239)";

const TextInput = styled(Field)`
  padding-left: 16px;
  width: 100%;
  background: #FFF;
  padding-right: 16px;
  border: 0;
  outline: none;
  height: 48px;
  color: rgb(80, 80, 80);
  font-family: Inter;

  &:-webkit-autofill {
    -webkit-box-shadow: 0 0 0px 1000px ${BG_INPUT} inset;
    background-color: ${BG_INPUT}!important;
  }
`;

const Error = styled(Typography)({
  color: "red",
  fontSize: 12,
  margin: 0,
  marginTop: 5,
  marginLeft: 5,
  textAlign: "left",
  letterSpacing: 2,
  fontFamily: "Inter",
});

const ContainerInput = styled.div({
  display: 'flex',
  flexDirection: 'row',
  alignItems: 'center',
  padding: 4,
  borderRadius: '8px',
  background: BG_INPUT,
});

const ViewPassword = styled(VisibilityIcon)({});

const OcultPassword = styled(VisibilityOffIcon)({});

const Input = ({
  name,
  label,
  error,
  touched,
  placeholder,
  type,
  as,
  rows,
  cols,
  children,
}) => {
  const [isPassword, setIsPassword] = useState(type === 'password'); // Simplificado la inicialización

  return (
    <Box sx={{ marginBottom: '16px' }}>
      {label && (
        <Box sx={{ width: '100%', marginBottom: '8px' }}>
          <Typography
            style={{
              fontWeight: 700,
              color: '#3D3D3D',
              width: "100%",
              fontSize: "16px",
              textAlign: "left",
            }}
          >
            {label}
          </Typography>
        </Box>
      )}
      <Box sx={{ width: '100%' }}>
        <ContainerInput
          style={{
            borderColor: error && touched ? "red" : undefined,
          }}
        >
          <TextInput
            style={{
              backgroundColor: 'transparent',
              fontSize: 14,
              resize: 'none'
            }}
            name={name}
            placeholder={placeholder}
            type={type === 'password' ? (isPassword ? 'password' : 'text') : type}
            as={as || null}
            rows={rows}
            cols={cols}
          >
            {children}
          </TextInput>
          {type === 'password' ? (
            <IconButton onClick={() => setIsPassword(!isPassword)}>
              {isPassword ? <ViewPassword /> : <OcultPassword />}
            </IconButton>
          ) : null}
        </ContainerInput>
      </Box>
      <Box sx={{ width: '100%' }}>
        {error && touched ? <Error>{error}</Error> : null}
      </Box>
    </Box>
  );
};

export default Input;
