import React, { useState } from 'react';
import Autocomplete from '@mui/material/Autocomplete';
import CircularProgress from '@mui/material/CircularProgress';
import TextField from '@mui/material/TextField';
import { Paper, Box  } from '@mui/material';
import { styled } from '@mui/material/styles';
import { ReactComponent as CustomArrowDown } from '../../assets/img/drop_down_arrow_down.svg';
import { ReactComponent as CustomArrowUp } from '../../assets/img/drop_down_arrow_up.svg';



const CustomPaper = (props) => {
  return (
    <Paper {...props} sx={{padding:0}} />
  );
};

// Create a styled container for the SVG
const StyledArrowContainer = styled(Box)({
    position: 'absolute',
    top: '50%',
    right: '8px',
    transform: 'translateY(-50%)',
    width: '24px',
    height: '24px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer', // Keep the pointer cursor
    '&:hover': {
      // Add styles on hover
      '& svg': {
        // Target the SVG inside
        fill: 'blue', // Example: Change the fill color on hover
        transform: 'scale(1.1)', // Example: Slightly scale up the SVG
        transition: 'fill 0.15s, transform 0.15s', // Add smooth transitions
      },
    },
  });

export const SearchDropDown = (props) => {
    const [open, setOpen] = useState(false);
    const [error, setError] = useState(false);
    const [value, setValue] = useState(props.value ? props.value : '');
    const [inputLength, setInputLength] = useState(0); // Track input length

    const Validate = function(e){
        if(props.required && e.target.value.length < 1 ){
          setError(true);
        }
        DoCallBack(e);
    }

    const UpdateValue = function(e, value){
        let v = typeof e.target.value !== "undefined" ? e.target.value : value !== null ? value : "";
        setValue(v);

        if(error){
          setError(false);
        }
        if(error === null && v.length > 0){
          setError(false);
        }
        if(error === false && v.length < 1){
          setError(null);
        }
        setInputLength(v.length); // Update input length
        DoCallBack(e);
    }

    const Unvalidate = function(e){
        e.preventDefault();
        setError(true);
        DoCallBack(e);
    }

    const DoCallBack = function(e){
        if(typeof props.callback === "function"){
          let errorState = error === null ? true : error;
          props.callback({event: e, value: value, error: errorState});
        }
    }

    let data = props.options;
    data = data.map(({ key, ...rest }) => rest);
    // Remove duplicate items from array - data
    if(data){
      
        data = data.filter(function(elem, index, self) {
            return index === self.findIndex(function(t) {
                return (
                    t.name === elem.name
                );
            });
        });

        if(props.sort ?? false ){
            // Sort the data array alphabetically by the `name` property
            data.sort((a, b) => a.name.localeCompare(b.name));
        }
        data = data.map(({ key, ...rest }) => rest);
    }

    const helperText = props.helperText ? props.helperText : "Please enter a value";

    return (
        <Autocomplete
            id={props.id}
            freeSolo={typeof props.freeSolo !== "undefined" ? props.freeSolo : true}
            open={open && (props.typeToSearch ? inputLength >= 3 : true)}
            onOpen={() => {
                setOpen(true);
            }}
            onClose={() => {
                setOpen(false);
            }}
            isOptionEqualToValue={(option, value) => option.name === value.id}
            getOptionLabel={(option) => option.name}
            options={data ? data : []}
            defaultValue={typeof props.defaultValue !== "undefined" ? props.defaultValue : null}
            onChange={(e, value) => { 
              UpdateValue(e, value);
              if (typeof props.onChange === 'function') {
                props.onChange(e, value); //allow external onChange handling
              } 
            }}
            PaperComponent={CustomPaper}
            renderInput={(params) => (
                <TextField
                    {...params}
                    fullWidth  
                    // label={props.label}
                    label={
                      <span style={{ color: '#628100' }}>{props.label}</span> 
                  }
                    name={props.name}
                    required={props.required}
                    helperText={error ? helperText : ''}
                    autoComplete={props.autoComplete}
                    onBlur={ Validate }
                    onChange={ UpdateValue }
                    onInvalid={ Unvalidate }
                    inputProps={{
                        ...params.inputProps,
                        className: "data-hj-allow",
                        sx: {
                            boxSizing: 'border-box',
                            height: '35px',    
                            textOverflow: 'ellipsis',
                            
                        },
                    }}
                    InputProps={{
                        ...params.InputProps,
                        endAdornment: (
                            props.hideArrow === 'true' ? ''
                            : <React.Fragment>
                                {data === null && open ? <CircularProgress color="inherit" size={20} sx={{position:"relative", top:"-12px"}} /> : null}
                                {/* {params.InputProps.endAdornment} */}
                                <StyledArrowContainer 
                                     onClick={() => {
                                        if (!open) {
                                          setOpen(true); 
                                        } else {
                                          setOpen(false);
                                        }
                                      }}
                                >
                                  {open ? <CustomArrowUp /> : <CustomArrowDown />}
                                </StyledArrowContainer>
                              </React.Fragment>
                        ),
                    }}
                  data-cy={`searchDropDown`}
                />
            )}
            renderOption={(props, option) => {
              // MUI's internal `props` contains a `key`, which React doesn't like being spread
              const { key, ...rest } = props;
              return (
                <li key={option.id || option.name} {...rest}>
                  {option.name}
                </li>
              );
            }}
        />
    );
};
