import React from 'react';
import FormGroup from '@mui/material/FormGroup';
import FormControlLabel from '@mui/material/FormControlLabel';
import Checkbox from '@mui/material/Checkbox';

export const FinCheckbox = ({ checkLabel="", checkValues=[ { label: "Default Label", value: "default_value" } ], ...props }) => {
 
  return (
    <FormGroup>

        {
          checkValues.map((checkValue, index) => 
          
          <FormControlLabel key={index} value={ checkValue.value } control={<Checkbox />} label={ checkValue.label } />

        )}
        
    </FormGroup>
  );
}