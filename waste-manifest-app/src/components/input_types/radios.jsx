import React from 'react';
import { Radio, RadioGroup, FormControlLabel, FormHelperText, FormControl, FormLabel, Grid, Typography } from '@mui/material/';
import { useState } from 'react';
import FinField from './FinField';
import { SearchDropDown } from './SearchDropDown';

export const FinRadios = ({
  label = "",
  required = false,
  defaultValue = "",
  helperText = "Please select an option",
  radioValues = [],
  ...props }) => {
  const [activeClass, setActive] = useState(defaultValue);
  const [selectedRadio, setSelectedRadio] = useState('');
  const [error, setError] = useState(null);
  const UpdateValue = function (value, label) {
    setActive(value);
    setSelectedRadio(label);
    if (error) {
      setError(false);
    }
  }
  const Unvalidate = function (e) {
    e.preventDefault();
    setError(true);
  }
  // const relationship = [
  //   { 'id': 1, 'name': 'Spouse' },
  //   { 'id': 2, 'name': 'Brother' },
  //   { 'id': 3, 'name': 'Mother' },
  //   { 'id': 4, 'name': `Uncle` },
  //   { 'id': 5, 'name': `Friend` }
  // ];

  return (
    <FormControl
      error={error}
    >
      {label && <FormLabel>{label}</FormLabel>}
      <RadioGroup
        {...props}
        defaultValue={defaultValue}
      >
        {radioValues.map((radioValue, index) =>
          <>
            <FormControlLabel
              {...radioValue.props}
              key={index}
              onClick={() => UpdateValue(radioValue.value, radioValue.label)}
              value={radioValue.label}
              control={<Radio
                required={required}
                onInvalid={Unvalidate} />}
              label={radioValue.label}
            />
            {/* {selectedRadio === radioValue.label && radioValue.label === 'No, I share the repayment' && (
              <>
                <Grid item xs={12} sm={12} textAlign={"left"}>
                  <Typography variant="h4" gutterBottom>Who do you share the repayment with?</Typography>
                </Grid>
                <Grid container spacing={3} px={2} textAlign={"left"}>
                  <Grid item xs={12} sm={12}>
                    <FinField
                      id="amountYouPayField"
                      name="amountYouPayField"
                      label={'Enter the amount you pay'}
                      helperText="Enter the amount you pay"
                      currency="R"
                      fullWidth
                      value={null}
                    />
                  </Grid>
                  <Grid item xs={12} sm={12}>
                    <SearchDropDown
                      id="relationshipId"
                      name="relationshipId"
                      validationMethod="basic"
                      label="Relationship"
                      freeSolo={false}
                      required
                      options={relationship}
                    />
                  </Grid>
                </Grid>
              </>
            )} */}
            {/* {selectedRadio === radioValue.label && radioValue.label === 'No, the price above is incorrect' && (
              <Grid container spacing={3} px={2} textAlign={"center"}>
                <Grid item xs={12} sm={12}>
                  <FinField
                    id="correctAmountYouPayField"
                    name="correctAmountYouPayField"
                    label={'Enter the correct amount you pay'}
                    helperText="Enter the correct amount you pay"
                    currency="R"
                    fullWidth
                    value={null}
                  />
                </Grid>
              </Grid>
            )} */}
          </>
        )}
      </RadioGroup>
      {error && <FormHelperText>{helperText}</FormHelperText>}
    </FormControl>
  );
}       