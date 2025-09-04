import React, { useState } from 'react';
import { Switch, Box, Typography } from '@mui/material/';

export const FinSwitch = ({ switchLabel = "AGREE", negativeLable = "", defaultChecked=true,  callback, ...props }) => {

  const [checked, setChecked] = useState(props.checked !== undefined ? props.checked : defaultChecked);



  const HandleChange = function(e){
    setChecked(e.target.checked);
    DoCallBack(e);
  }

  const DoCallBack = function (e) {
    if (typeof callback === "function") {
      e.value = e.target.checked;
      callback(e);
    }
  }

  return (
    <Box position="relative">
       {switchLabel &&
        <Box position="absolute" display="flex" top="50%" left="10px" sx={{  transform: 'translateY(-50%)', zIndex:1, pointerEvents:"none" }}>
          {checked ? <Typography sx={{pointerEvents:"none"}} variant="caption" color="background.default">{switchLabel}</Typography> : 
          <Typography sx={{pointerEvents:"none"}} variant="caption" backgroundColor="">{negativeLable}</Typography>}
        </Box>
      }
      <Switch
        {...props}
        onChange={HandleChange}
        checked={checked}
        // sx={{
        //   '& .MuiSwitch-thumb': {
        //     backgroundColor: '', // Change this to the desired color
        //   },
        //   '& .MuiSwitch-track': {
        //     backgroundColor: checked ? '#11543C' : '#C92323', // Change this to the desired track color
        //    // backgroundColor: '#11543C', // Change this to the desired track color green

        //    //negative colour - #C92323
        //   },
          sx={{
            '& .MuiSwitch-thumb': {
              backgroundColor: '', // Change this to the desired color
            },
            '& .MuiSwitch-track': {
              // backgroundColor: checked ? '#11543C' : '#C92323', // Change this to the desired track color
              backgroundColor: '#8E9191' , // Change this to the desired track color green
  

             //negative colour - #C92323
            },
            '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
              // backgroundColor: checked ? '#11543C' : '#C92323', // Change this to the desired track color
              backgroundColor: '#027E48' , // Change this to the desired track color green
  
              
             //negative colour - #C92323
            },
        }}
        inputProps={{
          name: props.name,

          'aria-label': props.label,
          'aria-labelledby': props.label,

        }
        }

      />

    </Box>
  );
}