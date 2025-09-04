import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import CssBaseline from '@mui/material/CssBaseline';
import { ThemeProvider } from '@mui/material/styles';
import theme from './theme/theme';

ReactDOM.render(



  <React.StrictMode>
    <ThemeProvider theme={theme}>
      {/* CssBaseline kickstart an elegant, consistent, and simple baseline to build upon. */}
      <CssBaseline />
      <App />
    </ThemeProvider>
  </React.StrictMode>,
  document.getElementById('root')
);

// const appQueueId = new URL(window.parent.location.href).searchParams.get("return");

//only send start if the URL does not contain the returned appQueueId (returned from TruId)
// if (!appQueueId) {

//   const appResult = 'Start';

//   // Function to send message to parent window
//   const message = { type: 'FC Pay', data: appResult };
//   window.parent.postMessage(message, '*');

//   console.log ('Post to Vue - ', appResult );
// }





// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
