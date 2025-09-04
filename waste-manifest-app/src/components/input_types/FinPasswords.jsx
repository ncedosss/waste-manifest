import { useState } from 'react';
import { TextField, InputAdornment, Grid, IconButton } from '@mui/material';
import { Visibility, VisibilityOff } from '@mui/icons-material';
import Validation from '../../../helpers/fieldValidations';


function FinPasswords({helperText = "Please enter a password", validationMethod = "basic", name="password", callback, ...props}) {

  const [value, setValue] = useState("");
  const [valueConfirmed, setValueConfirmed] = useState("");
  const [error, setError] = useState(null);
  const [errorC, setErrorC] = useState(null);
  const [showPassword, setShowPassword] = useState(false);

  const Validate = function(e){
    if(props.required && !Validation(e.target.value, validationMethod) ){
        setError(true);
    }

    if( valueConfirmed !== "" && e.target.value !== valueConfirmed ){
      setErrorC(true);
    }


    DoCallBack(e);



  }

  const ValidateConfirmed = function(e){

    if(props.required && !Validation(e.target.value, validationMethod) ){
      setErrorC(true);
    }

    if(value !== "" && e.target.value !== value ){
      setErrorC(true);
    }

    DoCallBack(e);
  }


  const UpdateValueConfirmed = function(e){
    setValueConfirmed(e.target.value);

    ClearErrors();

    if(errorC === false && e.target.value.length < 1){
      setErrorC(null);
    }

    DoCallBack(e);
  }

  const UpdateValue = function(e){
    setValue(e.target.value);

    ClearErrors();

    if(error === false && e.target.value.length < 1){
      setError(null);
    }

    // DoCallBack(e);
    Validate(e);
  }

  const ClearErrors = () => {
    if(error){
      setError(false);
    }
    if(error === null){
      setError(false);

    }
    if(errorC){
      setErrorC(false);
    }
    if(errorC === null){
      setErrorC(false);
    }
  }

  const Unvalidate = function(e){
    e.preventDefault();
    setError(true);
    setErrorC(true);
    DoCallBack(e);
  }
  const handleClickShowPassword = () => {
    setShowPassword(!showPassword);
  };

  const handleMouseDownPassword = (event) => {
    event.preventDefault();
  };

  const ValidatePasswords = (e) => {
      if(e.target.value === ""){ //check if password is empty
        return false;
      }

      let compareTo = e.target.name === name ? valueConfirmed : value;

      if(e.target.value === compareTo){
        return true;
      }

      return false;

  }


  const DoCallBack = function(e){
    if(typeof callback === "function"){

      let errorState = ValidatePasswords(e);
      e.error = errorState;
      e.value = value;
      callback(e);
    }
  }


  return (
      <>
        <Grid item xs={12} sm={6}>
            <TextField
                {...props}
                name={name}
                error={error}
                helperText={error ? helperText : ''}
                onBlur={ Validate }
                onChange={ UpdateValue }
                onInput={ UpdateValue }
                onInvalid={ Unvalidate }
                value={value}
                type={showPassword ? 'text' : 'password'}
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
        </Grid>
        <Grid item xs={12} sm={6}>
            <TextField
                {...props}
                label="Confirm Password"
                name={name+"_confirm"}
                id={name+"_confirm"}
                error={errorC}
                helperText={errorC ? "Passwords must match" : ''}
                onBlur={ ValidateConfirmed }
                onChange={ UpdateValueConfirmed }
                onInput={ UpdateValueConfirmed }
                onInvalid={ Unvalidate }
                value={valueConfirmed}
                type={showPassword ? 'text' : 'password'}
                InputProps={{
                    endAdornment:
                        <InputAdornment position="end">
                          <IconButton
                            aria-label="toggle password visibility"
                            onClick={() => { setShowPassword(!showPassword) }}
                          //  onMouseDown={handleMouseDownPassword}
                            edge="end"
                          >
                            {showPassword ? <VisibilityOff /> : <Visibility />}
                          </IconButton>
                        </InputAdornment>

                }}
            />
        </Grid>
    </>

  );
}


export default FinPasswords;
