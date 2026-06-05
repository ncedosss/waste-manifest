function WasteCheckboxGroup({ values, onChange }) {
  const theme = useTheme();
  const isMdOrLarger = useMediaQuery(theme.breakpoints.up('md'));

  const handleChange = (event) => {
    const { name, checked } = event.target;
    onChange({ ...values, [name]: checked });
  };

  return (
    <FormGroup
      row={isMdOrLarger} // horizontal if md+, vertical if smaller
      sx={{ justifyContent: isMdOrLarger ? 'center' : 'flex-start' }}
    >
      <FormControlLabel
        control={
          <Checkbox
            checked={values.hazardous}
            onChange={handleChange}
            name="hazardous"
          />
        }
        label="Hazardous"
      />
      <FormControlLabel
        control={
          <Checkbox
            checked={values.nonHazardous}
            onChange={handleChange}
            name="nonHazardous"
          />
        }
        label="Non-Hazardous"
      />
      <FormControlLabel
        control={
          <Checkbox
            checked={values.recyclable}
            onChange={handleChange}
            name="recyclable"
          />
        }
        label="Recyclable"
      />
    </FormGroup>
  );
}