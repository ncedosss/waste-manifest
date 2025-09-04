import React from 'react';
import { Radio, RadioGroup, FormControlLabel, FormHelperText, FormControl, FormLabel, Box, Typography, TextField } from '@mui/material/';
import { useState } from 'react';
import AbsaLogo from '../../../assets/img/absa-logo.png';
import AfricanBankLogo from '../../../assets/img/african-bank-logo.png';
import BidvestLogo from '../../../assets/img/bidvest-logo.png';
import CapitecLogo from '../../../assets/img/capitec-logo.png';
import FnbLogo from '../../../assets/img/fnb-logo.png';
import NedbankLogo from '../../../assets/img/nedbank-logo.png';
import StandardBankLogo from '../../../assets/img/standard-bank-logo.png';
import FinFieldCurrency from '../../../components/forms/input_types/FinFieldCurrency';
// src\components\forms\input_types\FinFieldCurrency.jsx

export const FinRadiosWithInlineImage = ({
  label="",
  required=false,
  showTextBox=false,
  defaultValue="",
  accountNumber="",
  helperText = "Please select an option",
  setInputAccountNumber,
  onTextFieldChange,
  radioValues = [],
  ...props }) => {
    const [activeClass, setActive] = useState(defaultValue);
    const [error, setError] = useState(null);
    const [inputAccountNumber, setAccountNumber] = useState(accountNumber);


    const UpdateValue = function(e){
      setActive(e.target.value);
      
      if(error){
        setError(false);
      }
    }
    const Unvalidate = function(e){
      e.preventDefault();
      setError(true);
    }

    const handleAmountChange = (e) => {

      const floatValue = parseFloat(e.target.value);
  
      if (isNaN(floatValue)) {
        e.target.value = 0;
      }

      onTextFieldChange(floatValue);
      setAccountNumber(floatValue);
      setInputAccountNumber(floatValue);
    
    };

    function bankLogo(bankName) {
        let logoPath = '';
        switch(bankName){
          case 'ABSA':
            logoPath = AbsaLogo;
            return logoPath;
          case 'African Bank':
            logoPath = AfricanBankLogo;
            return logoPath;
          case 'Bidvest Bank':
            logoPath = BidvestLogo;
            return logoPath;
          case 'Capitec Bank':
            logoPath = CapitecLogo;
            return logoPath;
          case 'First National Bank':
            logoPath = FnbLogo;
            return logoPath;
          case 'Nedbank':
            logoPath = NedbankLogo;
            return logoPath;
          case 'Standard Bank':
            logoPath = StandardBankLogo;
            return logoPath;
          default:
            return '';
        }
    }
 
    const handleTextFieldChange = (e) => {
      const value = e.target.value;
      onTextFieldChange(value);
      setAccountNumber(value);
      setInputAccountNumber(value);
    };
    
    return (
    <FormControl
      error={error}
    >
      {label && <FormLabel>{label}</FormLabel> }
      <RadioGroup
       {...props}
       defaultValue={defaultValue} 
       sx={{
         width: "100%",
       }}
      >
        {radioValues.map((radioValue, index) =>

          <FormControlLabel
            {...radioValue.props}
            key={index}
            onClick={UpdateValue}
            value={radioValue.value}
            className={`radio-list-item with-image ${parseInt(activeClass) === radioValue.value ? "active" : ""}`}
            control={<Radio required={required} onInvalid={Unvalidate} />}
            label={

              <Box>
                  <Box
                    sx={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      width: '100%',
                      pt: parseInt(activeClass) == radioValue.value ? '8px': '0px',
                    }}
                  >

                    <Typography variant="body1" component="p" sx={{width: '100%'}}>
                      {radioValue.label}
                    </Typography>
                    {bankLogo(radioValue.label) &&
                      <Box
                        component="img"
                        sx={{
                          height: 25,
                          pr: '24px',
                        }}
                        alt={` ${radioValue.label} Icon` }
                        src={ bankLogo(radioValue.label) }
                      />
                    }
                  </Box>

                  {parseInt(activeClass) == radioValue.value && showTextBox &&
                      // <TextField
                      //   id="accountNumber"
                      //   name="accountNumber"
                      //   type='number'
                      //   label="Account Number"
                      //   autoFocus
                      //   placeholder=""
                      //   fullWidth
                      //   required
                      //   value={inputAccountNumber}
                      //   onChange={handleTextFieldChange}
                      // />
                      <FinFieldCurrency
                      required
                      id="accountNumber"
                      name="accountNumber"
                      validationMethod="number"
                      label="Account Number"
                      // helperText= {maxWalletAmountWording}
                      // placeholder="eg. 12 000"
                      value={inputAccountNumber}
                      autoFocus
                      onChange={handleAmountChange}
                      fullWidth
                      // maxAmount={products[0].max_ATD}
                      // minAmount={products[0].min_ATD}
                      // autoComplete="net-income"
                      // currency="R"
                      // modalContent={{ title: "PayJustNow wallet top up", text: "Enter the amount to top up your PayJustNow wallet" }}
                    />
                  }
              </Box>

            }
          />
        )}

      </RadioGroup>

      {error && <FormHelperText>{helperText}</FormHelperText> }
    </FormControl>

  );
}
 