import { React, useState, useRef, useEffect } from 'react';
import { TextField, InputAdornment, Box} from '@mui/material';
import { ReactComponent as IconCorrect } from '../../assets/img/icon_correct.svg';
import { ReactComponent as IconError } from '../../assets/img/icon_error.svg';
import { ReactComponent as InfoIcon } from '../../assets/icons/info_solid.svg';
import FinInputModal from './FinInputModal';
import Validation from '../../helpers/fieldValidations';

function FinFieldAddress({helperText = "Please enter a value", validationMethod = "basic", currency="", modalContent = null, callback, ...props}) {

  const [value, setValue] = useState(props.value ? props.value : "");
  const [error, setError] = useState(null);
  const [openModal, setModalOpen] = useState(false);
  const [initialValue, setInitialValue]   = useState(props.value ? props.value : "");
  const [isFocused, setIsFocused] = useState(false);  

  //set length of fields
   let maxLengthField = 100;

   if(validationMethod === ("phone")){
    maxLengthField = 10;
   }
   else if(validationMethod === ("id")){
    maxLengthField = 13;
   } 
  useEffect(() => {
    setValue(props.value !== null && props.value !== undefined ? props.value : "");
    setInitialValue(props.value !== null && props.value !== undefined ? props.value : "");
  }, [props.value]);

  const Validate = function(e){
    if(props.required && !Validation(e.target.value, validationMethod) ){
      setError(true);
    }
    DoCallBack(e);
  }

  const UpdateValue = function(e){


    //if validation method contains currency
    if(validationMethod.includes("currency")){
      e.target.value = e.target.value.replace(/[^0-9]/g, '');

      e.target.value = Math.max(0, parseInt(e.target.value) ).toString().slice(0,6);
    }

    //accept numeric if validation method is phone
    if(validationMethod === ("phone")){
      e.target.value = e.target.value.replace(/[^0-9]/g, '');
     }

    //accept numeric if validation method contains currency
    if(validationMethod === ("id")){
      e.target.value = e.target.value.replace(/[^0-9]/g, '');      
    }

    //accept numeric if validation method contains currency
    if(validationMethod === ("number")){
      e.target.value = e.target.value.replace(/[^0-9]/g, '');      
    }


    setValue(e.target.value);
    if(error){
      if(Validation(e.target.value, validationMethod)){
        setError(false);
        DoCallBack(e, false);

      }
    }
    if(error === null && Validation(e.target.value, validationMethod)){
      setError(false);
      DoCallBack(e, false);

    }
    if(error === false && !Validation(e.target.value, validationMethod)){
      setError(null);
      DoCallBack(e, null);

    }
  }
  const Unvalidate = function(e){
    e.preventDefault();
    setError(true);
    DoCallBack(e);

  }

  const ToggleModal = function(e){
    e.preventDefault();
    setModalOpen(!openModal);
  }

  const DoCallBack = function(e, errorState = error){
    if(typeof callback === "function"){
      errorState = errorState === null ? true : errorState;
      e.error = errorState;
      e.value = value;
      callback(e);
    }
  }

  const FinInputModalTrigger = () => {
    return (
      <InputAdornment sx={{cursor:"pointer"}} position="end"><InfoIcon  onClick={ToggleModal} /></InputAdornment>
    );
  }

  const isPlaceholder = () => {
    return value === '' && !isFocused;  // Check if value is empty and not focused
};
 
  const handleFocus = () => {
    setIsFocused(true);
  };

  const handleBlur = () => {
    setIsFocused(false);
    Validate({ target: { value } }); // Optionally validate when field loses focus
  };

  return (
    <Box>
    <TextField
      {...props}
      error={error}
      helperText={error ? helperText : ''}
      // onBlur={ Validate }
      onBlur={handleBlur}  
      onFocus={handleFocus}  
      onChange={ UpdateValue }
      onInput={ UpdateValue }
      onPaste={ UpdateValue }
      onInvalid={ Unvalidate }
      onSubmit={ Validate }
      value={value}
      inputProps={{
        "data-hj-allow": true,
        maxLength : maxLengthField
      }}
      InputProps={{ 
        startAdornment: currency && value ? <InputAdornment position="start">{currency}</InputAdornment>: "",
        endAdornment: modalContent ? <FinInputModalTrigger /> : error === true ? <InputAdornment position="end"><IconError /></InputAdornment> : error === false ? <InputAdornment position="end"><IconCorrect /></InputAdornment> :  "",
      }}
      InputLabelProps={{
        style: { color: isPlaceholder() ? 'black' : (isFocused ? '#628100' : '#628100') }  // Adjust the label color on focus
      }}
      label={props.label}
 
    />
    {modalContent &&
      <FinInputModal handleClose={ToggleModal} content={modalContent} open={openModal} id={props.id ? props.id : ""} />
    }
    </Box>
  );
}


export default FinFieldAddress;
