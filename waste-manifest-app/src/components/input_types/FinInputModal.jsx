import React from 'react';
import { Close } from '@mui/icons-material';
import { Dialog, DialogTitle, IconButton, DialogContent, DialogContentText, DialogActions, Button } from '@mui/material';



const FinInputModal = ({open, content, id, handleClose}) => {

    const modalId = "modal-" + id;

    return (
        <Dialog maxWidth='xs' open={open} aria-labelledby={modalId} align={"center"}>
            <DialogActions sx={{position:"absolute", top:0, right:0}}>
                <IconButton size="small" aria-label="close" onClick={handleClose}>
                  <Close sx={{fontSize:"0.91em"}} />
                </IconButton>
            </DialogActions>
            {content.title &&
                <DialogTitle id={modalId}>
                    {content.title}
                </DialogTitle>
            }
            {content.text &&
                <DialogContent>
                    <DialogContentText>
                        <div dangerouslySetInnerHTML={{ __html: content.text }} />
                    </DialogContentText>
                </DialogContent>
            }
            {content.textObject &&
            <DialogContent>
                <DialogContentText>
                    {content.textObject}
                </DialogContentText>
            </DialogContent>
            }
            {
                typeof content.disableButton === "undefined" &&
                <DialogActions>
                    <Button
                        onClick={handleClose}
                        variant="contained"
                    >
                    {content.buttonText ? content.buttonText : "Got it"}
                    </Button>
                </DialogActions>
            }
        </Dialog>
    );
}


export default FinInputModal;
