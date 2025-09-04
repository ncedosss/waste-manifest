import { IconButton, Stack, Slider, Box, Typography } from '@mui/material';
import RemoveRoundedIcon from '@mui/icons-material/RemoveRounded';
import AddRoundedIcon from '@mui/icons-material/AddRounded';
import triThumb from './triThumb';

const FinSteppedSlider = ({ min = 1, max = 12, handlePrevButton, handleNextButton, ...props }) => {


  return (
    <Box width="100%" spacing={2} sx={{ position: 'relative' }}>
      <Stack spacing={4} direction="row" sx={{ mb: 1 }} alignItems="center">
          <IconButton color="darkGrey" size="small" onClick={handlePrevButton} edge="start" sx={{background:"#fff", border: "1px solid #F1F4F8", padding: "2px"}}>
              <RemoveRoundedIcon fontSize="small"/>
          </IconButton>
            <Slider
                  {...props}
                  min={min}
                  max={max}
                  components={{ Thumb: triThumb }}
                  aria-labelledby="scrubber"
                />
              <IconButton color="darkGrey" size="small" onClick={handleNextButton} edge="end" sx={{background:"#fff", border: "1px solid #F1F4F8", padding: "2px"}}>
                <AddRoundedIcon fontSize="small"  />
              </IconButton>
      </Stack>
      <Stack spacing={2} px={3} direction="row"  justifyContent="space-between">
        <Typography variant="body2">{min}</Typography>
        <Typography variant="body2">{max}</Typography>
      </Stack>
    </Box>
  );
}
export default FinSteppedSlider;