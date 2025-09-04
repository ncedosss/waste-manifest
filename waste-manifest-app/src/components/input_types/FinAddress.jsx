import { React, useState } from 'react';
import { Paper, Grid, IconButton, Typography, Box, Button } from '@mui/material';
import { ReactComponent as Pencil } from '../../../assets/icons/pencil.svg';
import { ReactComponent as ArrowUpIcon } from '../../../assets/img/arrow_up.svg';
import FinFieldAddress from './FinFieldAddress';

function FinAddress({ title = "Postal Address", physical_address = "", suburb = "", postcode = "", city = "", ...props }) {
    const [open, setOpen] = useState(physical_address.length === 0 || suburb.length === 0 || postcode.length === 0 || city.length === 0);
    const [error, setError] = useState(false);
    const [physical_address_value, setPhysical_address_value] = useState(physical_address);
    const [suburb_value, setSuburb_value] = useState(suburb);
    const [postcode_value, setPostcode_value] = useState(postcode);
    const [city_value, setCity_value] = useState(city);

    const [oldFields, setOldFields] = useState({ physical_address: physical_address, suburb: suburb, postcode: postcode, city: city });

    const handleChange = (e, field) => {
        switch (field) {
            case "physical_address":
                setPhysical_address_value(e.target.value);
                break;
            case "suburb":
                setSuburb_value(e.target.value);
                break;
            case "postcode":
                setPostcode_value(e.target.value);
                break;
            case "city":
                setCity_value(e.target.value);
                break;
            default:
                break;
        }
    };


    const handleOpen = () => {
        setOldFields({ physical_address: physical_address_value, suburb: suburb_value, postcode: postcode_value, city: city_value });
        setOpen(true);
    };

    const handleCancel = () => {
        // loop old fields and set to state
        if (oldFields.physical_address.length > 0 && oldFields.suburb.length > 0 && oldFields.postcode.length > 0 && oldFields.city.length > 0) {
            setPhysical_address_value(oldFields.physical_address);
            setSuburb_value(oldFields.suburb);
            setPostcode_value(oldFields.postcode);
            setCity_value(oldFields.city);
            setOpen(false);
        }else{
            setError(true);
        }
    };

    const handleUpdate = () => {
        // if values are not empty
        if (physical_address_value.length > 0 && suburb_value.length > 0 && postcode_value.length > 0 && city_value.length > 0) {
            // set error to false
            setError(false);
            // set open to false
            setOpen(false);
        } else {
            // set error to true
            setError(true);
        }
    }




    return (
        <Paper>
            <Grid container spacing={1} textAlign="left">
                <Grid item xs={12} display="flex" justifyContent="space-between">
                    <Typography variant="h4">{title}</Typography>
                    {!open &&
                        <IconButton onClick={handleOpen}>
                        <Pencil />
                        </IconButton>
                    }
                    {open && //closed
                        <IconButton onClick={handleUpdate} sx={{fontSize: "12px"}}>
                         
                         <ArrowUpIcon />
                        </IconButton>
                    }
                </Grid>
                {!open &&
                    <Grid item xs={12}>
                    {
                        physical_address_value.length === 0 || suburb_value.length === 0 || postcode_value.length === 0 || city_value.length === 0 ? (
                             <Typography variant="body2">Add an address</Typography>
                        ) : (
                        <Typography variant="body2">{physical_address_value}, {suburb_value}, {postcode_value}, {city_value}</Typography>
                        )
                    }
                        <input type="hidden" value={physical_address_value} name="postalLine1" />
                        <input type="hidden" value={suburb_value} name="postalSuburb" />
                        <input type="hidden" value={postcode_value} name="postalCode" />
                        <input type="hidden" value={city_value} name="postalCity" />
                    </Grid>
                }
            </Grid>

        {open &&
            <Grid container spacing={3}>
                <Grid item xs={12} mt={3}>
                    <FinFieldAddress required label="Physical Address" name="postalLine1" value={physical_address_value} callback={(e) => handleChange(e,"physical_address")} />
                </Grid>
                <Grid item xs={12}>
                    <FinFieldAddress required label="Suburb" name="postalSuburb" value={suburb_value} callback={(e) => handleChange(e,"suburb")} />
                </Grid>
                <Grid item xs={12}>
                    <FinFieldAddress required label="Postcode" name="postalCode" value={postcode_value} callback={(e) => handleChange(e,"postcode")} />
                </Grid>
                <Grid item xs={12}>
                    <FinFieldAddress required label="City" name="postalCity" value={city_value} callback={(e) => handleChange(e,"city")} />
                </Grid>
                {error &&
                    <Grid item xs={12}>
                        <Box color="error.main" fontWeight="fontWeightBold" fontSize="h6.fontSize">
                            Please fill in all fields
                        </Box>
                    </Grid>
                }
                {/* <Grid item xs={12}>
                    <Button variant="contained" onClick={handleUpdate}>Update</Button>
                    <Button
                        color="inherit"
                        variant="text"
                        sx={{boxShadow: "none"}}
                        onClick={handleCancel}>
                        Cancel
                    </Button>
                </Grid> */}
            </Grid>
            }
        </Paper>
    );

}

export default FinAddress;


