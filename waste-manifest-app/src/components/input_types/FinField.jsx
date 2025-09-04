import React,{ useEffect, useState } from 'react';
import { TextField, InputAdornment, Box, Typography } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import { ReactComponent as IconCorrect } from '../../assets/img/icon_correct.svg';
import { ReactComponent as IconError } from '../../assets/img/icon_error.svg';
import InfoIcon from '../../assets/img/info-dark-blue.png';
import Validation from '../../helpers/fieldValidations';
import { formatCurrencyNoCents } from '../../helpers/formatting';
import FinInputReasonModal from './FinInputReasonModal';
import FinInputModal from './FinInputModal';


function FinField({ onOtherExpensesEditClick, helperText = "Please enter a value", validationMethod = "basic", currency = "", modalContent = null, showEdit = false, callback, ...props }) {

  const [value, setValue] = useState(props.value ? props.value : "");
  const [error, setError] = useState(null);
  const isDisabled = props?.disabled ?? false;
  const [openModal, setModalOpen] = useState(false);
  const [initialValue, setInitialValue]   = useState(props.value ? props.value : "");
  const [isFocused, setIsFocused] = useState(false); 
  const [openReasonModal, setOpenReasonModal] = useState(false);

  //set length of fields
  let maxLengthField = 100;

  if (validationMethod === ("phone")) {
    maxLengthField = 10;
  }
  else if (validationMethod === ("id")) {
    maxLengthField = 13;
  }
  useEffect(() => {
    setValue(props.value !== null && props.value !== undefined ? props.value : "");
    setInitialValue(props.value !== null && props.value !== undefined ? props.value : "");
  }, [props.value]);



  const Validate = function (e) {
    let number = String(e?.target?.value).replace(/\s/g, '').replace(/,/g, '');
    if (props.required && !Validation(number, validationMethod)) {
      setError(true);
    }
    DoCallBack(e);
  }

  const UpdateValue = function (e) {

    //if validation method contains currency
    if (validationMethod.includes("currency")) {
      e.target.value = String(e?.target?.value).replace(/[^0-9]/g, '');

      e.target.value = Math.max(0, parseInt(e.target.value)).toString().slice(0, 6);

    }

    //accept numeric if validation method is phone
    if (validationMethod === ("phone")) {
      e.target.value = String(e?.target?.value).replace(/[^0-9]/g, '');
    }

    //accept numeric if validation method contains currency
    if (validationMethod === ("id")) {
      e.target.value = String(e?.target?.value).replace(/[^0-9]/g, '');
    }

    //accept numeric if validation method contains currency
    if (validationMethod === ("number")) {
      e.target.value = String(e?.target?.value).replace(/[^0-9]/g, '');
    }


    // setInitialValue(e.target.value);
    setValue(e.target.value);
    setInitialValue(formatCurrencyNoCents(Math.max(0, parseInt(e.target.value)).toString().slice(0, 6)));

    if (error) {
      if (Validation(e.target.value, validationMethod)) {
        setError(false);
        DoCallBack(e, false);

      }
    }
    if (error === null && Validation(e.target.value, validationMethod)) {
      setError(false);
      DoCallBack(e, false);

    }
    if (error === false && !Validation(e.target.value, validationMethod)) {
      setError(null);
      DoCallBack(e, null);

    }
  }
  const Unvalidate = function (e) {
    e.preventDefault();
    setError(true);
    DoCallBack(e);

  }

  const ToggleModal = function (e) {
    e.preventDefault();
    setModalOpen(!openModal);
    setOpenReasonModal(false);
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

  const DoCallBack = function (e, errorState = error) {
    if (typeof callback === "function") {

      let number = String(e?.target?.value).replace(/\s/g, '').replace(/,/g, '');

      errorState = errorState === null ? true : errorState;
      e.error = errorState;
      // e.value = value;
      e.value = number;

      callback(e);
    }
  }

  const FinInputModalTrigger = () => {
    return (

      <InputAdornment sx={{ cursor: "pointer" }} position="end">
        <Box sx={{
          borderRadius: '24px',
          ml: '24px',
        }}>

    {/* Information icon and edit icon*/}
    {!showEdit &&
      <Box
     component="img"
     onClick={ToggleModal}
     src= {InfoIcon}
     alt='info icon'
     />
    }
    {showEdit && props.id === 'bureauExpenses' &&
      <InputAdornment position="end">
        <Typography onClick={() => {
          if (props.onBureauEditClick) {
            props.onBureauEditClick();
          } else if (props.handleBureauIndividualEdit) {
            console.log(props);
            props.handleBureauIndividualEdit({
              label: props.label,
              value: props.value,
              groupName: props.groupName,
              bureauAccountNo: props.bureauAccountNo,
              youPayAmt: props.youPayAmt,
            });
          }
        }}
          variant="body2"
          sx={{ fontSize: 12, fontWeight: 'bold', color: '#628100' }}
        >
          Update
        </Typography>
      </InputAdornment>
    }

    {showEdit && props.id !== 'bureauExpenses' &&
      <EditIcon titleAccess="Edit" onClick={() => {
        if (props.onBureauEditClick) {
          props.onBureauEditClick();
        } else if (props.handleBureauIndividualEdit) {
          console.log(props);
          props.handleBureauIndividualEdit({
            label: props.label,
            value: props.value,
            groupName: props.groupName,
              bureauAccountNo: props.bureauAccountNo,
              youPayAmt: props.youPayAmt,
          });
        } else {
          onOtherExpensesEditClick();
        }
      }} sx={{ fontSize: 20, cursor: 'pointer' }} />}
     </Box>
     </InputAdornment>
    );
  }

  return (
    <Box display="flex" alignItems="center">
    <Box display="flex" flexDirection="column" flex={1}>
    <TextField
      {...props}
      error={error}
      helperText={error ? helperText : ''}
      //onBlur={ Validate }
      onBlur={(e) => {
        handleBlur();
      }}  // Trigger handleBlur on blur event
      onFocus={handleFocus} // Trigger handleFocus on focus event
      onChange={ UpdateValue }
      onInput={ UpdateValue }
      onPaste={ UpdateValue }
      onInvalid={ Unvalidate }
      onSubmit={ Validate }
      value={value}
      disabled = {isDisabled}
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
   // inputRef={inputRef} // Assign the ref to the TextField
  
    />
      </Box>
      {modalContent &&
        <FinInputModal handleClose={ToggleModal} content={modalContent} open={openModal} id={props.id ? props.id : ""} />
      }
      {openReasonModal &&
        <FinInputReasonModal handleClose={ToggleModal} open={openReasonModal} id={props.id ? props.id : ""} />
      }
    </Box>
  );
}


export default FinField;
