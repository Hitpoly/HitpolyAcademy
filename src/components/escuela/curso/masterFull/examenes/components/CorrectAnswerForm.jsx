import React from 'react';
import {
  FormControl,
  FormLabel,
  RadioGroup,
  FormControlLabel,
  Radio
} from '@mui/material';

const CorrectAnswerForm = ({ options, correctAnswer, onCorrectAnswerChange }) => {
  return (
    <FormControl component="fieldset">
      <FormLabel component="legend">Respuesta Correcta</FormLabel>
      <RadioGroup
        row
        value={correctAnswer}
        onChange={onCorrectAnswerChange}
      >
        {options.map((option) => (
          <FormControlLabel
            key={option.opcion}
            value={option.opcion}
            control={<Radio />}
            label={option.opcion}
            disabled={!option.texto}
          />
        ))}
      </RadioGroup>
    </FormControl>
  );
};

export default CorrectAnswerForm;