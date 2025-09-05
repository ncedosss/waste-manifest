import React, { useEffect, useState } from 'react';
import createSigSDK  from '../assets/libraries/signature-sdk.js';
import {
  Typography,
  Button,
  Grid,
  Box,
  Container,
  CircularProgress,
  Autocomplete,
  TextField,
  Checkbox,
  FormControlLabel,
  useTheme,
  useMediaQuery,
  FormGroup,
  Snackbar,
  Alert,
  Switch,
} from '@mui/material';
import {
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import Header from './Header';
import { useNavigate } from 'react-router-dom';
import AddIcon from '@mui/icons-material/Add';
import WasteItemModal from './WasteItemModal';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import { useParams } from 'react-router-dom';
import FinFieldAddress from './input_types/FinFieldAddress';
import FinField from './input_types/FinField';
import { styled } from '@mui/material/styles';
import { SearchDropDown } from './input_types/SearchDropDown.jsx';

const API_URL = `${process.env.REACT_APP_API_URL}/api`;
//const API_URL = 'http://localhost:4000/api';//laptop
//const API_URL = 'http://192.168.18.232:4000/api';//phone

export default function CreatePage({ user, onLogout, onHome }) {
    const [successMessage, setSuccessMessage] = useState('');
    const [sigObj, setSigObj] = useState();
    const [sigSDK, setSigSDK] = useState();
    const [signature, setSignature] = useState();
    
    const [warningMessage, setWarningMessage] = useState('');
    const [entities, setEntities] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isSaveForLater, setIsSaveForLater] = useState(false);
    const [editingIndex, setEditingIndex] = useState(null);
    const navigate = useNavigate();
    const [showStamp, setShowStamp] = useState(false);
    const [signed, setSigned] = useState(false);
    const { id: manifestId } = useParams();
    const [referenceNo, setReferenceNo] = useState({
      reference_no: ''
    });
    const [disposalEmail, setDisposalEmail] = useState({
      disposal_email: ''
    });
    const [referenceNoError, setReferenceNoError] = useState(true);
    const [disposalEmailError, setDisposalEmailError] = useState(true);
    const [generator, setGenerator] = useState({
      name: '',
      address: '',
      contact_person: '',
      contact_no: '',
      email: '',
      ipwis_no: '',
    });
    const [generatorErrors, setGeneratorErrors] = useState({
      name: true,
      address: true,
      contact_person: true,
      contact_no: true,
      email: true,
      ipwis_no: true
    });
    const [transporter, setTransporter] = useState({
      name: '',
      address: '',
      contact_person: '',
      contact_no: '',
      email: '',
      ipwis_no: '',
    });
    const [transporterErrors, setTransporterErrors] = useState({
      name: true,
      address: true,
      contact_person: true,
      contact_no: true,
      email: true,
      ipwis_no: true
    });
    const [wasteTypes, setWasteTypes] = useState({
      hazardous: false,
      nonHazardous: false,
      recyclable: false,
    });
    const [wasteForms, setWasteForms] = useState({
      solid: false,
      sludge: false,
      liquid: false,
    });
    const [activities, setActivities] = useState({
      donation: false,
      reuse: false,
      sorting: false,
      recycling: false,
      treatment: false,
      storage: false,
      additionalComment: ''
    });
    const [wasteItems, setWasteItems] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [newWasteItem, setNewWasteItem] = useState({
      description: '',
      packaging: '',
      volume: '',
      weight: '',
    });
    const [declaration, setDeclaration] = useState({
      name: '',
      date: ''
    });
    const [disposal, setDisposal] = useState({
      facility: '',
      contact_no: '',
      email: '',
      date: '',
    });
    const [validSections, setValidSections] = useState({
      transporter: false,
      generator: false,
      waste: false,
      declaration: false,
      activity: false,
      disposal: false,
      referenceNo: false
    });
    const [validSectionsExceptDescription, setValidSectionsExceptDescription] = useState({
      transporter: false,
      generator: false,
      declaration: false,
      activity: false,
      disposal: false,
      signed: false,
      referenceNo: false
    });
    const [sendEmail, setSendEmail] = useState({
      generator: false,
      disposal: false
    });
    const types = [
      { 'id': 1, 'name': 'Transporter' },
      { 'id': 2, 'name': 'Generator' }
    ];

    useEffect(() => {
        setLoading(true);
        const fetchData = async () => {
        const token = localStorage.getItem('token');
        try {
            const res = await fetch(`${API_URL}/entities`, {
            headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error('Failed to fetch manifests');
            const data = await res.json();
            setEntities(data);
        } catch(error) {
            console.error('Error occured: ', error);
            localStorage.removeItem('token');
            setEntities([]);
        } finally{
            setLoading(false);
        }
    };

    fetchData();
    },[]);

  const getSignature = async () => {
    setLoading(true);
    try {

    const res = await fetch("http://localhost:5000/signature", { method: "POST" });
    // const data = await response.json();

      // const res = await fetch(`${API_URL}/signature`, {});

      if (!res.ok) {
        throw new Error(`Failed to fetch signature: ${res.status} ${res.statusText}`);
      }
      try {
        const image = await res.json();
        setSignature(image.image.data || "");
        setSigned(true);
      } catch (jsonErr) {
        console.log(jsonErr);
        setSignature('');
        setSigned(true);
        throw new Error("Invalid JSON response from server");
      }
    } catch (error) {
      console.error("Error occurred:", error);
      setSignature("");
      setSigned(false);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setValidSections({
      transporter: isTransporterValid(),
      generator: isGeneratorValid(),
      waste: isWasteValid(),
      wasteForm: isWasteFormValid(),
      declaration: isDeclarationValid(),
      activity: isActivityValid(),
      disposal: isDisposalValid(),
      referenceNo: isRefenceNoValid(),
      disposalEmail: isDisposalEmailErrorValid()
    });
  }, [transporter, generator, wasteTypes, wasteForms, wasteItems, declaration, activities, disposal, signed, referenceNo, disposalEmail]);

  useEffect(() => {
    setValidSectionsExceptDescription({
      transporter: isTransporterValid(),
      generator: isGeneratorValid(),
      declaration: isDeclarationValid(),
      activity: isActivityValid(),
      disposal: isDisposalValid(),
      referenceNo: isRefenceNoValid(),
      disposalEmail: isDisposalEmailErrorValid()
    });
  }, [transporter, generator, wasteTypes, wasteForms, wasteItems, declaration, activities, disposal, signed, referenceNo, disposalEmail]);

  useEffect(() => {
    const token = localStorage.getItem('token');

    const fetchManifest = async () => {
      if (!manifestId) return;

      setLoading(true);
      try {
        const res = await fetch(`${API_URL}/manifests/${manifestId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!res.ok) throw new Error('Failed to fetch manifest');
        const data = await res.json();
        const manifestInfo = data[0];

        setReferenceNo({
          reference_no: manifestInfo.reference_no
        });
        if(manifestInfo.reference_no){setReferenceNoError(false)}
        // Map fetched manifest to state structure
        setGenerator({
          name: manifestInfo.generator
        });
        setTransporter({
          name: manifestInfo.transporter
        });
        setWasteTypes({
          hazardous: manifestInfo?.waste_type?.toLowerCase()?.includes('hazardous'),
          nonHazardous: manifestInfo.waste_type?.toLowerCase().includes('nonhazardous'),
          recyclable: manifestInfo.waste_type?.toLowerCase().includes('recyclable'),
        });
        setWasteForms({
          solid: manifestInfo.waste_form?.toLowerCase().includes('solid'),
          sludge: manifestInfo.waste_form?.toLowerCase().includes('sludge'),
          liquid: manifestInfo.waste_form?.toLowerCase().includes('liquid'),
        });
        setWasteItems(
          data.map(item => ({
            description: item.description,
            packaging: item.packaging,
            volume: item.volume_l,
            weight: item.weight_kg,
          }))
        );
        setActivities({
          donation: manifestInfo.process?.toLowerCase().includes('donation'),
          reuse: manifestInfo.process?.toLowerCase().includes('reuse'),
          sorting: manifestInfo.process?.toLowerCase().includes('sorting'),
          recycling: manifestInfo.process?.toLowerCase().includes('recycling'),
          treatment: manifestInfo.process?.toLowerCase().includes('treatment'),
          storage: manifestInfo.process?.toLowerCase().includes('storage'),
          additionalComment: manifestInfo.comments || '',
        });
        setDisposal({
          facility: manifestInfo.final_disposal || '',
          contact_no: manifestInfo.disposal_contact_no || '',
          email: manifestInfo.disposal_email || '',
          date: manifestInfo.actual_disposal_date || '',
        });
        if(manifestInfo.disposal_email){setDisposalEmailError(false)}
        // Set declaration optionally
        setDeclaration({
          type: manifestInfo.type || '',
          name: manifestInfo.declaration_name || '',
          date: formatDateToDDMMYYYY(manifestInfo.declaration_date) || ''
        });
        if(manifestInfo.signature){
          setSignature(manifestInfo.signature);
          setSigned(true);
        }

      } catch (err) {
        console.error('Error loading manifest for editing:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchManifest();
  }, [manifestId]);

  function formatDateToDDMMYYYY(dateString) {
    if (!dateString) return "";
    const d = new Date(dateString);
    const day = String(d.getUTCDate()).padStart(2, "0");
    const month = String(d.getUTCMonth() + 1).padStart(2, "0");
    const year = d.getUTCFullYear();
    return `${year}-${month}-${day}`;
  }

  const handleSelect = (value, type) => {
    const match = entities.find(e => e.type === type && e.name === value);

    if (match) {
      const newData = {
        name: match.name,
        address: match.address,
        contact_person: match.contact_person,
        contact_no: match.contact_no,
        email: match.email,
        ipwis_no: match.ipwis_no,
      };
      type === 'generator' ? setGenerator(newData) : setTransporter(newData);
      type === 'generator' ? setGeneratorErrors({
        name: false,
        address: false,
        contact_person: false,
        contact_no: false,
        email: false,
        ipwis_no: false
      }) :
      setTransporterErrors({
        name: false,
        address: false,
        contact_person: false,
        contact_no: false,
        email: false,
        ipwis_no: false
      });
    } else {
      // reset other fields, just set name
      const newData = { name: value, address: '', contact_no: '', ipwis_no: '' };
      type === 'generator' ? setGenerator(newData) : setTransporter(newData);
      type === 'generator' ? setGeneratorErrors({
        name: false,
        address: true,
        contact_person: true,
        contact_no: true,
        email: true,
        ipwis_no: false
      }) :
      setTransporterErrors({
        name: false,
        address: true,
        contact_person: true,
        contact_no: true,
        email: true,
        ipwis_no: false
      });
    }
  };

  const saveEntityIfNew = async (type, entityState, setEntityState) => {
    const exists = entities.some(
      (e) => e.type === type && e.name.toLowerCase() === entityState.name.toLowerCase()
    );

    if (!exists && entityState.name.trim() !== '') {
      const token = localStorage.getItem('token');
      try {
        const res = await fetch(`${API_URL}/entities`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ ...entityState, type }),
        });

        if (!res.ok) throw new Error('Failed to save entity');
        const newEntity = await res.json();

        setEntities((prev) => [...prev, newEntity]);
        setEntityState(newEntity);
      } catch (err) {
        console.error(`Failed to save ${type}:`, err);
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSaveForLater(false);
    const token = localStorage.getItem('token');
    try {
      await saveEntityIfNew('generator', generator, setGenerator);
      await saveEntityIfNew('transporter', transporter, setTransporter);

      // Save manifest only after entities are confirmed
      const result = await saveManifest();
      await sendManifestEmail(result.manifest.id, token);
      if (result) {
        manifestId ? navigate('/manifestsedit') :  navigate('/manifests', {state: {successMessage: `Manifest ${result.manifest.manifest_no} created successfully and email has been sent.`}});
      }
    } catch (err) {
      console.error('Submission failed:', err);
    }
  };

  const saveForLater = async () => {
    setIsSaveForLater(true);
    const token = localStorage.getItem('token');
    try {
      await saveEntityIfNew('generator', generator, setGenerator);
      await saveEntityIfNew('transporter', transporter, setTransporter);

      // Save manifest only after entities are confirmed
      const result = await saveManifest(true);
      await sendManifestEmail(result.manifest.id, token);

      if (result) {
        manifestId ? navigate('/manifestsedit') :  navigate('/manifests', {state: {successMessage: `Manifest ${result.manifest.manifest_no} created successfully and email has been sent.`}});
      }
    } catch (err) {
      console.error('Submission failed:', err);
    }
  };

  const sendManifestEmail = async (manifestId, token) => {
    try {
      const url = `${API_URL}/manifest/${manifestId}/send-email`;
      const res = await fetch(url, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ showStamp, signature, sendEmail })
      });
      if (!res.ok) throw new Error('Failed to send manifest email');
    } catch (error) {
      console.error('Error sending manifest email:', error);
      throw error;
    }
  };

  const saveManifest = async (saveForLater = false) => {
    const token = localStorage.getItem('token');
    const manifestPayload = {
      generator: generator.name,
      transporter: transporter.name,
      waste_type: Object.entries(wasteTypes)
                  .filter(([key, value]) => value === true)
                  .map(([key]) => key.charAt(0).toUpperCase() + key.slice(1)),
      waste_form: Object.entries(wasteForms)
                  .filter(([key, value]) => value === true)
                  .map(([key]) => key.charAt(0).toUpperCase() + key.slice(1)),
      wasteItems: wasteItems,
      process: Object.entries(activities)
        .filter(([key, value]) => value === true && key !== 'additionalComment')
        .map(([key]) => key.charAt(0).toUpperCase() + key.slice(1)),
      type: declaration.type,
      declaration_name: declaration.name,
      declaration_date: declaration.date,
      final_disposal: disposal.facility,
      contact_no: disposal.contact_no,
      isStamped: showStamp,
      date: disposal.date,
      comments: activities.additionalComment,
      reference_no: referenceNo.reference_no,
      disposal_email: disposal.email,
      signature: signature,
      saveForLater: saveForLater
    };
  setLoading(true);
    try {
      const url = manifestId ? `${API_URL}/manifests/${manifestId}` : `${API_URL}/manifest`;
      const method = manifestId ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(manifestPayload),
      });


      const savedManifest = await res.json();
      if (!res.ok){
        if(res.status === 409){
          setWarningMessage(savedManifest.error);
          throw new Error(savedManifest.error);
        }
      }
      return savedManifest;
    } catch (err) {
      console.error('Error saving manifest:', err);
    } finally {
      setLoading(false);
    }
  };
  const handleFieldChange = (field, label) => (e) => {
    if(label === 'Transporter' && field !== 'ipwis_no'){
      setTransporter((prev) => ({ ...prev, [field]: e.value }));
      setTransporterErrors((prev) => ({ ...prev, [field]: e.error }));
    }else if(field !== 'ipwis_no'){
      setGenerator((prev) => ({ ...prev, [field]: e.value }));
      setGeneratorErrors((prev) => ({ ...prev, [field]: e.error }));
    }
  };
  const handleDisposalFieldChange = (field) => (e) => {
    if(field !== 'email'){
    setDisposal((prev) => ({ ...prev, [field]: e.value }));
    setDisposalEmailError(e.error);
    }
  };  
  const handleReferenceNoFieldChange = (field) => (e) => {
    setReferenceNo((prev) => ({ ...prev, [field]: e.value }));
    setReferenceNoError(e.error);
  }; 

  const isTransporterValid = () =>
    Object.values(transporterErrors).every(err => err === false);

  const isGeneratorValid = () =>
    Object.values(generatorErrors).every(err => err === false);

  const isRefenceNoValid = () =>
     Boolean(!referenceNoError);
  const isDisposalEmailErrorValid = () =>
     Boolean(!disposalEmailError);
  const isWasteValid = () =>
    Object.values(wasteTypes).some(Boolean) && wasteItems.length > 0;

  const isWasteFormValid = () =>
    Object.values(wasteForms).some(Boolean) && wasteItems.length > 0;

  const isDeclarationValid = () =>
    Boolean(declaration.type && declaration.name && declaration.date);

  const isActivityValid = () =>
    Object.values(activities).some(Boolean);

  const isDisposalValid = () =>
    Boolean(disposal.facility && disposal.contact_no && disposal.date);

  const GreenSwitch = styled(Switch)(({ theme }) => ({
    '& .MuiSwitch-switchBase.Mui-checked': {
      color: theme.palette.success.main, 
    },
    '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
      backgroundColor: theme.palette.success.main, 
    },
  }));


  const renderEntityFields = (label, state, setState, type) => {
    const options = entities
      .filter(e => e.type === type)
      .map(e => e.name);
    return (
      <Accordion sx={{ width: '100%'}}>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Box sx={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', px: 1 }}>
          <Typography variant="h4" sx={{ fontWeight: 600 }}>
            {label}
          </Typography>
          {type === 'transporter' && (
            validSections.transporter ? (
            <CheckCircleIcon color="success" />
          ) : (
            <CancelIcon color="error" />
          ))}
          {type === 'generator' && (
            validSections.generator ? (
            <CheckCircleIcon color="success" />
          ) : (
            <CancelIcon color="error" />
          ))}
        </Box>
        </AccordionSummary>
        <AccordionDetails>
          <Autocomplete
            freeSolo
            options={options}
            value={state.name}
            callback={(_, value) => handleSelect(value ?? '', type)}
            onInputChange={(_, value) => handleSelect(value, type)}
            renderInput={(params) => (
              <TextField {...params} label={`${label} Name`} variant="outlined" fullWidth />
            )}
          />
          <FinFieldAddress
            id='Address'
            variant='outlined'
            label='Address'
            helperText='Please enter a valid address'
            value={state.address}
            callback={handleFieldChange("address", label)}
            sx={{ mt: 2 }}
            multiline
            required
          />
          <FinField
            id='Contact'
            fullWidth
            placeholder='eg. John'
            helperText='Please enter a valid contact person'
            label='Contact Person'
            validationMethod='text'
            value={state.contact_person}
            callback={handleFieldChange("contact_person", label)}
            sx={{ mt: 2 }}
          />
          <FinField
            id='ContactNo'
            fullWidth
            required
            placeholder='eg. 0730000000'
            helperText='Please enter a valid contact number'
            label='Contact No'
            validationMethod='phone'
            autoComplete='mobile-number'
            value={state.contact_no}
            callback={handleFieldChange("contact_no", label)}
            sx={{ mt: 2 }}
          />
          <FinField
            id='Email'
            fullWidth
            required
            placeholder='eg. test@email.com'
            helperText='Please enter a valid email address'
            label='Email'
            validationMethod='email'
            value={state.email}
            callback={handleFieldChange("email", label)}
            sx={{ mt: 2 }}
          />
          <FinField
            id='IPWISNo'
            fullWidth
            label='IPWIS No'
            value={state.ipwis_no}
            callback={handleFieldChange("ipwis_no", label)}
            sx={{ mt: 2 }}
          />
          {type === 'generator' &&
            <FormControlLabel
              control={
                <GreenSwitch
                  checked={sendEmail.generator}
                  onChange={(e) =>
                    setSendEmail(prev => ({ ...prev, generator: e.target.checked }))
                  }
                />
              }
              label="Send Email?"
              labelPlacement="start"
              sx={{ mt: 2, ml: 0, '& .MuiFormControlLabel-label': {
                      mr: 2,
                    }, 
                  }}
            />
          }
        </AccordionDetails>
      </Accordion>
    );
  };
  const renderWasteDescription  = () => {
    return (
      <Accordion sx={{ width: '100%'}}>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
        <Box sx={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', px: 1 }}>
          <Typography variant="h4" sx={{ fontWeight: 600 }}>
            Waste Description
          </Typography>
          {validSections.waste && validSections.wasteForm ? (
            <CheckCircleIcon color="success" />
          ) : (
            <CancelIcon color="error" />
          )}
        </Box>
        </AccordionSummary>
        <AccordionDetails>
          {/* Label for Waste Types checkboxes */}
          <Box sx={{ width: '100%', textAlign: 'center'}}>
          <Typography variant="h4" sx={{ fontWeight: 'medium' }}>
            Waste Types
          </Typography>
          </Box>
          <WasteCheckboxGroup values={wasteTypes} onChange={setWasteTypes}/>
          <Box sx={{ width: '100%', textAlign: 'center', mt: 2  }}>
          <Typography variant="h4" sx={{ fontWeight: 'medium' }}>
            Waste Forms
          </Typography>
          </Box>
          <WasteFormCheckboxGroup values={wasteForms} onChange={setWasteForms}/>
          <Box sx={{ mt: 3, mb: 2, display: 'flex', justifyContent: 'flex-end' }}>
            <Button
              variant="outlined"
              startIcon={<AddIcon />}
              onClick={() => setIsModalOpen(true)}
            >
              Add Waste Item
            </Button>
          </Box>
            {/* Table Header */}
            <Grid container sx={{ backgroundColor: '#f0f0f0', fontWeight: 'bold', borderBottom: '1px solid #ccc' }}>
              <Grid item xs={6} sx={{ borderRight: '1px solid #ccc', p: 1, minWidth: 280, textAlign: 'center', fontSize: '0.875rem' }}>
                Description
              </Grid>
              <Grid item xs={6} sx={{ borderRight: '1px solid #ccc', p: 1, minWidth: 110, textAlign: 'center', fontSize: '0.875rem' }}>
                Packaging
              </Grid>
              {['Volume (L)', 'Weight (kg)'].map((header, idx) => (
                <Grid
                  item
                  key={idx}
                  xs={2}
                  sx={{
                    borderRight: idx !== 2 && header === 'Volume (L)' ? '1px solid #ccc' : 'none',
                    p: 1,
                    minWidth: 130,
                    textAlign: 'center',
                    fontSize: '0.875rem',
                  }}
                >
                  {header}
                </Grid>
              ))}
            </Grid>

            {wasteItems.length === 0 ? (
              <Typography sx={{ p: 2, textAlign: 'center' }} color="text.secondary">
                No waste items added yet.
              </Typography>
            ) : (
              wasteItems.map((item, index) => (
                <Grid
                  container
                  key={index}
                  sx={{
                    borderBottom: index !== wasteItems.length - 1 ? '1px solid #ccc' : 'none',
                    backgroundColor: index % 2 === 0 ? 'white' : '#fafafa',
                    alignItems: 'center',
                  }}
                >
                  <Grid item xs={6} sx={{ borderRight: '1px solid #ccc', p: 1, textAlign: 'left',maxWidth: 280, minWidth: 280, flexShrink: 1}}>
                    <Box sx={{ whiteSpace: 'normal', wordBreak: 'break-word', overflowWrap: 'break-word' }}>
                    {item.description}
                    </Box>
                  </Grid>
                  <Grid item xs={2} sx={{ borderRight: '1px solid #ccc', p: 1, textAlign: 'center',maxWidth: 110, minWidth: 110 }}>
                    <Box sx={{ whiteSpace: 'normal', wordBreak: 'break-word', overflowWrap: 'break-word' }}>
                    {item.packaging}
                    </Box>
                  </Grid>
                  <Grid item xs={2} sx={{ borderRight: '1px solid #ccc', p: 1, textAlign: 'center', maxWidth: 130, minWidth: 130 }}>
                    {item.volume}
                  </Grid>
                  <Grid item xs={2} sx={{ p: 1, textAlign: 'center',maxWidth: 80, minWidth: 80 }}>
                    {item.weight}
                  </Grid>
                  <Grid item xs={1} sx={{ p: 1, minWidth: 0, textAlign: 'center',maxWidth: 40, minWidth: 40  }}>
                    <Button
                      size="small"
                      onClick={() => {
                        setNewWasteItem(item);
                        setEditingIndex(index);
                        setIsModalOpen(true);
                      }}
                      sx={{ minWidth: 0, padding: '4px', marginRight: 1 }}
                      aria-label="edit"
                    >
                      <EditIcon fontSize="small" />
                    </Button>
                    <Button
                      size="small"
                      color="error"
                      onClick={() => {
                        setWasteItems((prev) => prev.filter((_, i) => i !== index));
                        // Clear edit if currently editing this item
                        if (editingIndex === index) {
                          setEditingIndex(null);
                          setNewWasteItem({ description: '', packaging: '', volume: '', weight: '' });
                        }
                      }}
                      sx={{ minWidth: 0, padding: '4px' }}
                      aria-label="delete"
                    >
                      <DeleteIcon fontSize="small" />
                    </Button>
                  </Grid>
                </Grid>
              ))
            )}
          {/* Modal */}
        <WasteItemModal
          open={isModalOpen}
          onClose={() => {
            setIsModalOpen(false);
            setEditingIndex(null); 
            setNewWasteItem({ description: '', packaging: '', volume: '', weight: '' });
          }}
          data={newWasteItem}
          setData={setNewWasteItem}
          isEditing={editingIndex !== null}
          onSave={(item) => {
            if (editingIndex !== null) {
              // update existing item
              setWasteItems((prev) =>
                prev.map((w, i) => (i === editingIndex ? item : w))
              );
            } else {
              // add new item
              console.log(item);
              setWasteItems((prev) => [...prev, item]);
            }

            // reset modal state
            setNewWasteItem({ description: '', packaging: '', volume: '', weight: '' });
            setEditingIndex(null);
            setIsModalOpen(false);
          }}
        />
        </AccordionDetails>
      </Accordion>
    );
  };
  const renderDeclaration  = () => {
    return (
  <Accordion sx={{ width: '100%'}}>
    <AccordionSummary expandIcon={<ExpandMoreIcon />}>
      <Box sx={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', px: 1 }}>
        <Typography variant="h4" sx={{ fontWeight: 600 }}>
          Transporter/Generator Declaration
        </Typography>
          {validSections.declaration ? (
            <CheckCircleIcon color="success" />
          ) : (
            <CancelIcon color="error" />
          )}
      </Box>
    </AccordionSummary>
    <AccordionDetails>
      <Typography sx={{ mb: 1 }}>
        I hereby declare that all the waste is fully and accurately described, packed, marked, and labelled according to all applicable legislation.
      </Typography>
      <SearchDropDown
        id="type"
        name="typeId"
        validationMethod="basic"
        label="Transporter/Generator"
        helperText="Please select an option"
        freeSolo={false}
        required
        options={types}
        value={types.find(t => t.name === declaration.type) || null}
        onChange={(e, value) => setDeclaration({ ...declaration, type: value?.name })}
      />
      <TextField
        label="Name"
        fullWidth
        value={declaration.name}
        onChange={(e) => setDeclaration({ ...declaration, name: e.target.value })}
        sx={{ mb: 2, mt: 2 }}
      />
      <TextField
        label="Date"
        type="date"
        fullWidth
        InputLabelProps={{ shrink: true }}
        value={declaration.date}
        onChange={(e) => setDeclaration({ ...declaration, date: e.target.value })}
        onClick={(e) => e.target.showPicker?.()}
        sx={{ mb: 2 }}
      />
      <Box onClick={getSignature} sx={{ border: '1px dashed grey', height: 120, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'gray', fontStyle: 'italic' }}>
        <div id={'signaturePad'}>{signature ? <img id='sig_image' src={signature} alt='Signature' style={{ display: 'block', margin: 'auto' }}></img> : 'Click to sign'}</div>
      </Box>
    </AccordionDetails>
  </Accordion>
    );
  };
  const renderManagementActivity  = () => {
    return (
      <Accordion sx={{ width: '100%'}}>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
        <Box sx={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', px: 1 }}>
          <Typography variant="h4" sx={{ fontWeight: 600 }}>
            Management Activity
          </Typography>
          {validSections.activity ? (
            <CheckCircleIcon color="success" />
          ) : (
            <CancelIcon color="error" />
          )}
        </Box>
        </AccordionSummary>
        <AccordionDetails>
          <ManagementActivityCheckGroup values={activities} onChange={setActivities}/>
          <TextField
            label="Additional Comments"
            fullWidth
            multiline
            rows={4}
            value={activities.additionalComment}
            onChange={(e) => setActivities({ ...activities, additionalComment: e.target.value })}
            sx={{ mb: 2 }}
          />
          <FormControlLabel
            control={
              <GreenSwitch
                checked={showStamp}
                onChange={(e) => setShowStamp(e.target.checked)}
              />
            }
            label="With Stamp?"
            labelPlacement="start"
            sx={{ mb: 2, ml: 0, '& .MuiFormControlLabel-label': {
                    mr: 2,
                  }, 
                }}
          />
        </AccordionDetails>
      </Accordion>
    );
  };
  const renderFinalDisposal  = () => {
    return (
  <Accordion sx={{ width: '100%'}}>
    <AccordionSummary expandIcon={<ExpandMoreIcon />}>
      <Box sx={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', px: 1 }}>
        <Typography variant="h4" sx={{ fontWeight: 600 }}>
          Final Disposal
        </Typography>
          {validSections.disposal ? (
            <CheckCircleIcon color="success" />
          ) : (
            <CancelIcon color="error" />
          )}
      </Box>
    </AccordionSummary>
    <AccordionDetails>
      <TextField
        label="Facility"
        fullWidth
        value={disposal.facility}
        onChange={(e) => setDisposal({ ...disposal, facility: e.target.value })}
      />
      <FinField
        id='ContactNo'
        fullWidth
        required
        placeholder='eg. 073256222'
        helperText='Please enter a valid contact number'
        label='Contact No'
        validationMethod='phone'
        autoComplete='mobile-number'
        value={disposal.contact_no}
        callback={handleDisposalFieldChange("contact_no")}
        sx={{ mt: 2 }}
      />
      <FinField
        id='Email'
        fullWidth
        placeholder='eg. test@email.com'
        label='Email'
        value={disposal.email}
        callback={handleDisposalFieldChange("email")}
        sx={{ mt: 2 }}
      />
      <TextField
        label="Date"
        type="date"
        fullWidth
        InputLabelProps={{ shrink: true }}
        value={disposal.date ? disposal.date.split("T")[0] : ""}
        onChange={(e) => setDisposal({ ...disposal, date: e.target.value })}
        onClick={(e) => e.target.showPicker?.()}
        sx={{ mb: 2, mt: 2 }}
      />
      <FormControlLabel
        control={
          <GreenSwitch
            checked={sendEmail.disposal}
            onChange={(e) =>
              setSendEmail(prev => ({ ...prev, disposal: e.target.checked }))
            }
          />
        }
        label="Send Email?"
        labelPlacement="start"
        sx={{ mb: 2, ml: 0, '& .MuiFormControlLabel-label': {
                mr: 2,
              }, 
            }}
      />
    </AccordionDetails>
  </Accordion>
    );
  };
  return (
    <>
    <Snackbar
        open={!!successMessage}
        autoHideDuration={5000}
        onClose={() => setSuccessMessage('')}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
        >
        <Alert
            severity="success"
            variant="filled"
            onClose={() => setSuccessMessage('')}
            sx={{
            width: '100%',
            fontWeight: 'bold',
            fontSize: '1rem',
            }}
        >
            {successMessage}
        </Alert>
    </Snackbar>
    <Snackbar
        open={!!warningMessage}
        autoHideDuration={5000}
        onClose={() => setWarningMessage('')}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
        >
        <Alert
            severity="warning"
            variant="filled"
            onClose={() => setWarningMessage('')}
            sx={{
            width: '100%',
            fontWeight: 'bold',
            fontSize: '1rem',
            }}
        >
            {warningMessage}
        </Alert>
    </Snackbar>
      {loading && (
        <Box
          sx={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100vw',
            height: '100vh',
            bgcolor: 'rgba(0, 0, 0, 0.3)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1300,
          }}
        >
          <CircularProgress size={80} thickness={5} />
        </Box>
      )}

      {/* Header */}
      <Header user={user} onLogout={onLogout} onHome={onHome} />

      <Box sx={{ py: 8, mt: -4, textAlign: 'center', bgcolor: '#f5f5f5' }}>
        <Container maxWidth="md">
          <Typography variant="h3" gutterBottom>
            Waste Manifests
          </Typography>
          <Typography variant="h6" color="text.secondary" paragraph>
            Create manifests.
          </Typography>
        </Container>
      </Box>

      <Box
        sx={{
          minHeight: '100vh',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          px: 2,
          mt: 2,
        }}
      >
        <Box
          sx={{
            width: { xs: '100%', md: 600, lg: 800 },
            bgcolor: 'background.paper',
            p: 4,
            borderRadius: 2,
            boxShadow: 3,
          }}
        >
          <form onSubmit={handleSubmit}>
            <Grid container justifyContent="center">
              <Grid item xs={12} md={6} sx={{ mb: 3 }}>
                <FinField
                  id='Reference No.'
                  fullWidth
                  required
                  placeholder='eg. B01'
                  helperText='Please enter a valid reference number'
                  label='Reference No.'
                  validationMethod='text'
                  value={referenceNo.reference_no}
                  callback={handleReferenceNoFieldChange("reference_no")}
                  sx={{ mt: 2 }}
                />
              </Grid>
                {renderEntityFields('Transporter', transporter, setTransporter, 'transporter')}
                {renderEntityFields('Generator', generator, setGenerator, 'generator')}
                {renderWasteDescription()}
                {renderDeclaration()}
                {renderManagementActivity()}
                {renderFinalDisposal()}

              {/* Action Buttons */}
            <Grid
              container
              spacing={2}
              sx={{ mt: 3 }}
              direction={{ xs: 'column', md: 'row' }}
              width="100%"
              justifyContent={{ xs: 'stretch', md: 'space-between' }}
            >
              <Grid item xs={12} md={6}>
                <Button variant="outlined" type="button" onClick={() => navigate(-1)} fullWidth>
                  Cancel
                </Button>
              </Grid>
              <Grid item xs={12} md={6}>
                <Button variant="outlined" type="button" disabled={!Object.values(validSectionsExceptDescription).every(Boolean)} onClick={() => {
                  saveForLater();
                }} fullWidth>
                  Save for later
                </Button>
              </Grid>
              <Grid item xs={12} md={6}>
                <Button variant="contained" type="submit" fullWidth disabled={!Object.values(validSections).every(Boolean)}>
                  {manifestId ? 'Update' : 'Submit'}
                </Button>
              </Grid>
              </Grid>
            </Grid>
          </form>
        </Box>
      </Box>
    </>
  );
}
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
function WasteFormCheckboxGroup({ values, onChange }) {
  const theme = useTheme();
  const isMdOrLarger = useMediaQuery(theme.breakpoints.up('md'));

  const handleChange = (event) => {
    const { name, checked } = event.target;
    onChange({ ...values, [name]: checked });
  };

  return (
    <FormGroup
      row={isMdOrLarger}
      sx={{ justifyContent: isMdOrLarger ? 'center' : 'flex-start' }}
    >
      <FormControlLabel
        control={
          <Checkbox
            checked={values.solid}
            onChange={handleChange}
            name="solid"
          />
        }
        label="Solid"
      />
      <FormControlLabel
        control={
          <Checkbox
            checked={values.sludge}
            onChange={handleChange}
            name="sludge"
          />
        }
        label="Sludge"
      />
      <FormControlLabel
        control={
          <Checkbox
            checked={values.liquid}
            onChange={handleChange}
            name="liquid"
          />
        }
        label="Liquid"
      />
    </FormGroup>
  );
}
function ManagementActivityCheckGroup({ values, onChange }) {
  const theme = useTheme();
  const isMdOrLarger = useMediaQuery(theme.breakpoints.up('md'));

  const handleChange = (event) => {
    const { name, checked } = event.target;
    onChange({ ...values, [name]: checked });
  };

  return (
    <FormGroup
      row={isMdOrLarger}
      sx={{ justifyContent: isMdOrLarger ? 'center' : 'flex-start' }}
    >
      <FormControlLabel
        control={
          <Checkbox
            checked={values.donation}
            onChange={handleChange}
            name="donation"
          />
        }
        label="Donation"
      />
      <FormControlLabel
        control={
          <Checkbox
            checked={values.reuse}
            onChange={handleChange}
            name="reuse"
          />
        }
        label="Reuse"
      />
      <FormControlLabel
        control={
          <Checkbox
            checked={values.sorting}
            onChange={handleChange}
            name="sorting"
          />
        }
        label="Sorting"
      />
      <FormControlLabel
        control={
          <Checkbox
            checked={values.recycling}
            onChange={handleChange}
            name="recycling"
          />
        }
        label="Recycling"
      />
      <FormControlLabel
        control={
          <Checkbox
            checked={values.treatment}
            onChange={handleChange}
            name="treatment"
          />
        }
        label="Treatment"
      />
      <FormControlLabel
        control={
          <Checkbox
            checked={values.storage}
            onChange={handleChange}
            name="storage"
          />
        }
        label="Storage"
      />
    </FormGroup>
  );
}