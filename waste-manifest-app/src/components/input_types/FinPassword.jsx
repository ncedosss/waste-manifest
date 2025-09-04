import { useState } from 'react';
import { TextField, InputAdornment, IconButton } from '@mui/material';
import { Visibility, VisibilityOff } from '@mui/icons-material';
import Validation from '../../../helpers/fieldValidations';

function FinPassword({helperText = "Please enter a value", validationMethod = "basic", name="password", callback, ...props}) {

  const [value, setValue] = useState("");
  const [error, setError] = useState(null);
  const [showPassword, setShowPassword] = useState(false);

  const Validate = function(e){
    if(props.required && !Validation(e.target.value, validationMethod) ){
      setError(true);
    }
    DoCallBack(e);

  }

  const UpdateValue = function(e){
    setValue(e.target.value);
    if(error){
      setError(false);
    }
    if(error === null && e.target.value.length > 0){
      setError(false);
    }
    if(error === false && e.target.value.length < 1){
      setError(null);
    }
    DoCallBack(e);

  }
  const Unvalidate = function(e){
    e.preventDefault();
    setError(true);
    DoCallBack(e);
  }

  const handleClickShowPassword = () => {
    setShowPassword(!showPassword);
  };

  const handleMouseDownPassword = (event) => {
    event.preventDefault();
  };

  const DoCallBack = function(e){
    if(typeof callback === "function"){
      let errorState = error === null ? true : error;
      e.error = errorState;
      e.value = value;
      callback(e);
    }
  }

  return (
    <TextField
        {...props}
        name={name}
        error={error}
        helperText={error ? helperText : ''}
        onBlur={ Validate }
        onChange={ UpdateValue }
        onInvalid={ Unvalidate }
        value={value}
        type={showPassword ? 'text' : 'password'}
        inputProps={{
          "data-hj-allow": true,
        }}
        InputProps={{
            endAdornment:
                <InputAdornment position="end">
                  <IconButton
                    aria-label="toggle password visibility"
                    onClick={handleClickShowPassword}
                    onMouseDown={handleMouseDownPassword}
                    edge="end"
                  >
                    {showPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>

        }}
    />

  );
}


export default FinPassword;
