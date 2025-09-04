import React from 'react';
import { Paper} from '@mui/material';

import Typography from '@mui/material/Typography';
import Grid from '@mui/material/Grid';
import Container from '@mui/material/Container';

export default function Footer({large}) {
  return (
<Container   sx={{ alignContent: 'center', position: "relative", minWidth: 'fit-content' }}>
  <Grid sx={{ gridColumn: 'span 12', textAlign: 'center' }}>
    <Paper mb={0}>
      <Grid sx={{ gridColumn: 'span 12' }} mb={2} mx="auto">
        <Typography variant="caption" component="p" color="#6E7184" sx={{ fontSize: '14px', fontFamily: 'DM Sans' }} >
          Material Cycle (Pty) Ltd
        </Typography>
      </Grid>
      <Grid sx={{ gridColumn: 'span 12' }} mb={0} mx="auto">
        <Typography variant="caption" component="p" color="#6E7184" sx={{ fontSize: '14px', fontFamily: 'DM Sans' }} >
          <strong>Phone:</strong> 087 702 8630&nbsp;&nbsp;&nbsp;&nbsp;     
          <strong>After Hours:</strong> 083 400 0821&nbsp;&nbsp;&nbsp;&nbsp;     
          <strong>Email:</strong> info@materialcycle.co.za&nbsp;&nbsp;&nbsp;&nbsp;     
          <strong>Reg. No.</strong> 2021/687354/07&nbsp;&nbsp;&nbsp;&nbsp;     
          <strong>VAT No.</strong> 444299560&nbsp;&nbsp;&nbsp;&nbsp;     
          <strong>IPWIS No.</strong> D18070-01                    
        </Typography>
      </Grid>
    </Paper>
  </Grid>
</Container>

  )}



 