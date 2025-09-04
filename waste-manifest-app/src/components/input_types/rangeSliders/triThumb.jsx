import React from 'react';
import PropTypes from 'prop-types';
import { SliderThumb } from '@mui/material';
import { ReactComponent as ChevArrowRight } from '../../../../assets/img/chev-arrow-right.svg';
import { ReactComponent as ChevArrowLeft } from '../../../../assets/img/chev-arrow-left.svg';

function triThumb(props) {
    const { children, ...other } = props;
    return (
      <SliderThumb {...other}>
        {children}
       
          <ChevArrowLeft sx={{ my: 2 }} />
          <ChevArrowRight sx={{ my: 2 }} />
      </SliderThumb>
    );
  }
  
  triThumb.propTypes = {
    children: PropTypes.node,
  };
  
  export default triThumb;