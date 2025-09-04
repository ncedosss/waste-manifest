import { createTheme } from '@mui/material/styles';
import {pallet} from "./palette";
import {Typography} from './typography';
import { themeBorderRadius, themeColors,  themeShadows } from './globals';
import { ReactComponent as FinUncheckedRadio } from '../assets/img/radio_unchecked.svg';
import { ReactComponent as FinCheckedRadio } from '../assets/img/checked_icon.svg';
import { ReactComponent as FinCheckedBox } from '../assets/img/checked_icon.svg';
import { ReactComponent as FinUncheckedBox } from '../assets/img/unchecked_icon.svg';

const defaultTheme = createTheme();
const ThemeOptions = {
  breakpoints: {
    values: {
      xs: 0,
      xsm: 420,
      sm: 600,
      md: 900,
      lg: 1200,
      xl: 1536,
    },
  },
  palette:pallet,
  typography: Typography,
  shape:{
    borderRadius: themeBorderRadius
  },
  shadows:[
    ...defaultTheme.shadows.slice(0, 25),
    themeShadows.bigCard, //25
    themeShadows.button //26
  ]
  ,
  components: {
    MuiPaper:{
      defaultProps: {
        sx:{
          mb: 3,
          p: {
            xs:2,
            sm:3
          }
        },
        elevation:25
      }
    },
    MuiAppBar: {
      defaultProps:{
        elevation:0,
      },
      styleOverrides: {
        root: {
          padding: '0px',
          margin: '0px',
        },
        colorPrimary: {
          backgroundColor: themeColors.white,
          color: themeColors.primary,
          boxShadow: 0,
        }
      }
    },
    MuiLink: {
      defaultProps: {
        color: "success.main",
        underline: "none"
      }
    },
    MuiAlert: {
      styleOverrides: {
        root: {
          ".MuiAlert-icon": {
            alignItems: "center",
          }
        }
      }
    },
    MuiButton:{
      variants: [
        {
          props: { variant: 'tiny' },
          style: {
            minWidth: 105,
            borderRadius: "2em",
            padding: "0.13em 10px",
            fontSize: 12,
            fontFamily: 'DM Sans',
            fontWeight: 700,
           // textTransform: "uppercase",
            boxShadow: "unset"
          }
        },
        {
          props: { variant: 'tiny', color: 'green' },
          style: {
            backgroundColor: themeColors.lightBlue,
            color: "#FFF",
            "&:hover": {
              color: "#FFF",
              backgroundColor: themeColors.lightBlue
            }
          }
        },
        {
          props: { variant: 'outlined' },
          style: {
            color: "#000000",
            borderColor: themeColors.lightBlue,
            textTransform: 'none',
            "&:hover": {
              color: "#000000",
              backgroundColor: themeColors.white
            }
          }
        },        
        {
          props: { variant: 'contained' },
          style: {
            backgroundColor: themeColors.lightBlue,
            color: "#000000",
            textTransform: 'none',
            "&:hover": {
              color: "#000000",
              backgroundColor: themeColors.lightBlue
            }
          }
        },
        {
          props: { variant: 'containedBlack' },
          style: {
            backgroundColor: themeColors.black,
            color: "#FFF",
            textTransform: 'none',
            "&:hover": {
              color: "#FFF",
              backgroundColor: themeColors.black
            }
          }
        },        
        {
          props: { variant: 'tiny', color: 'pink' },
          style: {
            backgroundColor: themeColors.buttonPink,
            color: "#FFF",
            "&:hover": {
              color: "#FFF",
              backgroundColor: themeColors.buttonPink
            }
          }
        },        
        {
          props: { variant: 'tiny', color: 'grey' },
          style: {
            backgroundColor: themeColors.grey,
            color: "#FFF",
            "&:hover": {
              color: "#FFF",
              backgroundColor: themeColors.grey
            }
          }
        },
        {
          props: { variant: 'tiny', color: 'lightGreen' },
          style: {
            backgroundColor: themeColors.lightGreen,
            color: "#FFF",
            "&:hover": {
              color: "#FFF",
              backgroundColor: themeColors.lightGreen
            }
          }
        },
        {
          props: { variant: 'tiny', color: 'blue' },
          style: {
            backgroundColor: themeColors.lightBlue,
            color: "#FFF",
            "&:hover": {
              color: "#FFF",
              backgroundColor: themeColors.lightBlue
            }
          }
        },
        {
          props: { variant: 'tiny', color: 'lightGrey' },
          style: {
            backgroundColor: themeColors.lightGrey,
            color: "#62656A",
            "&:hover": {
              color: "#62656A",
              backgroundColor: themeColors.lightGrey
            }
          }
        },
        {
          props: { variant: 'tiny', color: 'purple' },
          style: {
            backgroundColor: themeColors.purple,
            color: "#FFF",
            "&:hover": {
              color: "#FFF",
              backgroundColor: themeColors.purple
            }
          }
        },
        {
          props: { variant: 'tiny', color: 'transparent' },
          style: {
            backgroundColor: themeColors.transparent,
            color: "#62656A",
            "&:hover": {
              color: "#62656A",
              backgroundColor: themeColors.transparent
            }
          }
        },
        {
          props: { variant: 'pill' },
          style: {
            minWidth: 88,
            borderRadius: "2em",
            padding: "3px 10px",
            fontSize: 16,
            fontFamily: 'DM Sans',
            fontWeight: 600,
            boxShadow: "unset",
            "&:hover": {
              backgroundColor: themeColors.transparent
            }
          }
        },
        {
          props: { variant: 'pill', color: 'selected' },
          style: {
            backgroundColor: themeColors.lightBlue,
            color: "#FFF",
            "&:hover": {
              color: "#FFF",
              backgroundColor: themeColors.lightBlue
            }
          }
        }
      ],
      defaultProps:{
        color: 'success',
        fullWidth: true,
      },
      styleOverrides: {
        root:{
          minWidth: "220px",
          padding: "0.819em 16px",
          fontWeight: 600,
          letterSpacing: "0.03em",
        //  textTransform: "uppercase",
          fontSize: 16,
          fontFamily: 'DM Sans',
          boxShadow: themeShadows.button,
        }
      }
    },
    MuiAutocomplete:{
      styleOverrides: {
        root: {
          ".MuiAutocomplete-popupIndicator,.MuiSvgIcon-root,.MuiCircularProgress-svg": {
            color: themeColors.primary,
          }
        },
      },
      defaultProps:{
        forcePopupIcon: true,
      }
    },
    MuiDialogTitle:{
      styleOverrides:{
        root:{
          ...Typography.h4,
        }
      }
    },
    MuiDialogContentText:{
      styleOverrides:{
        root:{
          ...Typography.body1
        }
      }
    },
    MuiInputLabel: {
      defaultProps:{
        required: false,
      },
      styleOverrides: {
        root: {
          color: themeColors.primary
        }
      },
    },
    MuiFilledInput:{
      styleOverrides: {
        root: {
          color: "#39404B",
          backgroundColor: "#F1F4F8",
          borderRadius: themeBorderRadius,
          "&.Mui-focused": {
            backgroundColor: "#ffffff",
            boxShadow: themeShadows.button
          },
        },
      },
      defaultProps:{
        disableUnderline: true,
      }
    },
    MuiTextField:{
      defaultProps:{
        variant: 'outlined'
      }
    },
    MuiSlider:{
      styleOverrides: {
        root: {
          ".MuiSlider-track": {
            color: themeColors.primary,
            height: 8,
            borderRadius: 10,
            border: "none",
            left: "-25px !important"
          },
          ".MuiSlider-rail": {
            color: themeColors.grey,
            width: 'calc(100% + 50px)',
            left: -25,
            height: 8,
            borderRadius: 10,
            opacity: 1
          },
          ".MuiSlider-thumb": {
            width: 52,
            height: 30,
            borderRadius: 26,
            backgroundColor: "#FFF",
            display: "flex",
            justifyContent: "space-between",
            padding: "0 10px",
            boxShadow: "0px 2px 6px rgba(0, 0, 0, 0.1), 0px 4px 12px rgba(11, 14, 26, 0.1)",
            '&:focus, &:hover, &.Mui-active, &.Mui-focusVisible': {
              boxShadow:
                '0 3px 1px rgba(0,0,0,0.1),0 4px 8px rgba(0,0,0,0.3),0 0 0 1px rgba(0,0,0,0.02)',
              // Reset on touch devices, it doesn't add specificity
              '@media (hover: none)': {
                boxShadow: '0 0px 1px rgba(0,0,0,0.1)',
              },
            },
            "&:before": {
              boxShadow: "none"
            },
            ".tri-line": {
              backgroundColor: themeColors.primary,
              width: 2,
              height: "100%",
              maxHeight: 16
            }
          }
        }
      },
    },
    MuiCheckbox:{
      defaultProps: {
        icon: <FinUncheckedBox />,
        checkedIcon: <FinCheckedBox />
      },
      styleOverrides: {
        root: {
          padding: 0,
          margin: 9,
          width: 22,
          height: 22,
          borderRadius: 4,
          "&.Mui-checked": {
            backgroundColor: themeColors.primary,
            color: themeColors.primary
            
          }
        }
      }
    },
    MuiRadio:{
      defaultProps:{
        icon: <FinUncheckedRadio />,
        checkedIcon: <FinCheckedRadio width={22} />
      },
      styleOverrides: {
        root: {
          margin: 9,
          padding: 0,
          width: 22,
          height: 22,
          borderRadius: "2em",
          "&.Mui-checked": {
            backgroundColor: themeColors.primary,
            color: themeColors.primary
          }
        }
      }
    },
    MuiFormControl:{
      styleOverrides: {
        root: {
            width: "100%",
          },
      }
    },
    MuiFormControlLabel:{
      styleOverrides: {
        root: {
          "&.radio-list-item": {
            border: `1px solid ${ themeColors.lightGrey }`,
            marginBottom: 5,
            borderRadius: 6,
            height: 54,
            width: "100%",
            alignItems: 'center',
          },
          "&.radio-list-item.with-image > .MuiFormControlLabel-label": {
            width: "100%",
          },
          "&.active": {
            backgroundColor: themeColors.lightGrey,
            alignItems: 'start',
            height: 'auto',
          }
        }
      }
    },
    MuiFormHelperText:{
      styleOverrides: {
        root: {
          color: '#B00C0C',
          marginTop: 5,
          fontSize: 14
        }
      }
    },
    MuiLinearProgress:{
      defaultProps:{
        color: 'success',
      },
      styleOverrides: {
        root: {
          height: 6,
          borderRadius: themeBorderRadius,
          "&.MuiLinearProgress-colorSuccess": {
            backgroundColor: themeColors.grey,
          }
        }
      }
    },
    MuiSwitch:{
      styleOverrides: {
        root: {
          width: 79,
          padding: 0,
          height: 32,
          ".MuiSwitch-switchBase": {
            padding: 0,
            height: 32
          },
          ".MuiSwitch-switchBase.Mui-checked": {
            transform: "translateX(47px)"
          },
          ".MuiSwitch-track": {
            height: 32,
            width: 79,
            opacity: 1,
            borderRadius: 34,
            backgroundColor: themeColors.lightGrey,
            color: themeColors.lightGrey,
            border: "1px solid",
            borderColor: themeColors.grey
          },
          ".MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track": {
            opacity: 1,
            borderColor: '#11543C'
          },
          ".MuiSwitch-thumb": {
            height: 28,
            width: 28,
            backgroundColor: themeColors.white
          },
          ".Mui-checked .MuiSwitch-thumb": {
            backgroundColor: themeColors.white
          },
          ".MuiSwitch-switchBase .MuiSwitch-thumb": {
            marginLeft: 2
          },
        }
      }
    },
  },
};
// A custom theme for this app
const theme = createTheme(ThemeOptions);

export default theme;
