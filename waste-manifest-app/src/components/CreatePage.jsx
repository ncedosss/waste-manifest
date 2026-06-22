import React, { useEffect, useState, useRef } from 'react';
import createSigSDK from '../assets/libraries/signature-sdk.js';
import { useNavigate, useParams } from 'react-router-dom';
import Header from './Header';
import { injectSharedStyles } from './sharedStyles';
import { LoadingOverlay, Toast, Accordion, AutocompleteInput, Toggle, CheckboxChip } from './components.jsx';
import { WasteCheckboxGroup, WasteFormCheckboxGroup, ManagementActivityCheckGroup } from './WasteCheckboxGroup.jsx';
import WasteItemModal from './WasteItemModal.jsx';
import FinFieldAddress from './input_types/FinFieldAddress';
import FinField from './input_types/FinField';
import { SearchDropDown } from './input_types/SearchDropDown.jsx';

const API_URL = `${process.env.REACT_APP_API_URL}/api`;

const isTouchDevice = () => 'ontouchstart' in window || navigator.maxTouchPoints > 0;
const isMobileOrTablet = () => /android|ipad|iphone|tablet/i.test(navigator.userAgent);

function CanvasSignature({ onSave, onCancel }) {
  const canvasRef = useRef(null);
  const ctxRef    = useRef(null);
  const drawing   = useRef(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    canvas.width  = canvas.offsetWidth;
    canvas.height = 200;
    const ctx = canvas.getContext('2d');
    ctx.strokeStyle = '#1C1C1E'; ctx.lineWidth = 2; ctx.lineCap = 'round';
    ctxRef.current = ctx;
  }, []);

  const getPos = (e) => {
    const rect  = canvasRef.current.getBoundingClientRect();
    const touch = e.touches?.[0];
    return { x: (touch ? touch.clientX : e.clientX) - rect.left, y: (touch ? touch.clientY : e.clientY) - rect.top };
  };

  const start = (e) => { drawing.current = true; const { x, y } = getPos(e); ctxRef.current.beginPath(); ctxRef.current.moveTo(x, y); };
  const draw  = (e) => { if (!drawing.current) return; e.preventDefault(); const { x, y } = getPos(e); ctxRef.current.lineTo(x, y); ctxRef.current.stroke(); };
  const end   = () => { drawing.current = false; };
  const clear = () => ctxRef.current.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
  const save  = () => onSave(canvasRef.current.toDataURL('image/png'));

  return (
    <div>
      <canvas
        ref={canvasRef}
        style={{ width: '100%', border: '1.5px solid var(--border)', borderRadius: '10px', touchAction: 'none', background: '#fff' }}
        onMouseDown={start} onMouseMove={draw} onMouseUp={end} onMouseLeave={end}
        onTouchStart={start} onTouchMove={draw} onTouchEnd={end}
      />
      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '12px' }}>
        <button className="btn btn-outline" type="button" onClick={clear}>Clear</button>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button className="btn btn-outline" type="button" onClick={onCancel}>Cancel</button>
          <button className="btn btn-primary" type="button" onClick={save}>Save Signature</button>
        </div>
      </div>
    </div>
  );
}

export default function CreatePage({ user, onLogout, onHome }) {
  injectSharedStyles();
  const navigate     = useNavigate();
  const { id: manifestId, receiptId } = useParams();
  // receiptId is set when editing a draft receipt (/manifest-receipt/:receiptId/edit)
  // In that case we load from manifest_receipts and on submit create the full manifest

  const [successMessage, setSuccessMessage] = useState('');
  const [warningMessage, setWarningMessage] = useState('');
  const [loading, setLoading]               = useState(true);
  const [entities, setEntities]             = useState([]);
  const [facilities, setFacilities]         = useState([]);
  const [isSaveForLater, setIsSaveForLater] = useState(false);
  const [editingIndex, setEditingIndex]     = useState(null);
  const [isModalOpen, setIsModalOpen]       = useState(false);
  const [showStamp, setShowStamp]           = useState(false);
  const [signed, setSigned]                 = useState(false);
  const [signature, setSignature]           = useState();
  const [openCanvas, setOpenCanvas]         = useState(false);
  const [useCanvasSignature, setUseCanvasSignature] = useState(false);

  const [referenceNo, setReferenceNo]             = useState({ reference_no: '' });
  const [referenceNoError, setReferenceNoError]   = useState(true);
  const emptyEntity = { name: '', address: '', contact_person: '', contact_no: '', email: '', ipwis_no: '' };
  const allFalse    = { name: true, address: true, contact_person: true, contact_no: true, email: true, ipwis_no: true };

  const [generator, setGenerator]           = useState({ ...emptyEntity });
  const [generatorErrors, setGeneratorErrors] = useState({ ...allFalse });
  const [transporter, setTransporter]       = useState({ ...emptyEntity });
  const [transporterErrors, setTransporterErrors] = useState({ ...allFalse });

  const [wasteTypes, setWasteTypes] = useState({ hazardous: false, nonHazardous: false, recyclable: false });
  const [wasteForms, setWasteForms] = useState({ solid: false, sludge: false, liquid: false });
  const [wasteItems, setWasteItems] = useState([]);
  const [newWasteItem, setNewWasteItem] = useState({ description: '', packaging: '', volume: '', weight: '' });

  const [activities, setActivities] = useState({
    donation: false, reuse: false, sorting: false, recycling: false,
    treatment: false, storage: false, landfill: false, additionalComment: ''
  });

  const [declaration, setDeclaration] = useState({ type: '', name: '', date: '' });
  const [disposal, setDisposal]       = useState({ facility: '', contact_no: '', email: '', date: '' });
  const [sendEmail, setSendEmail]     = useState({ generator: false, disposal: false });

  const types = [{ id: 1, name: 'Transporter' }, { id: 2, name: 'Generator' }];

  // Validation
  const isTransporterValid   = () => Object.values(transporterErrors).every(e => e === false);
  const isGeneratorValid     = () => Object.values(generatorErrors).every(e => e === false);
  const isRefenceNoValid     = () => Boolean(!referenceNoError);
  const isWasteValid         = () => Object.values(wasteTypes).some(Boolean) && wasteItems.length > 0;
  const isWasteFormValid     = () => Object.values(wasteForms).some(Boolean) && wasteItems.length > 0;
  const isDeclarationValid   = () => Boolean(declaration.type && declaration.name && declaration.date);
  const isActivityValid      = () => Object.values(activities).some(Boolean);
  const isDisposalValid      = () => Boolean(disposal.facility && disposal.contact_no && disposal.date);

  const validSectionsDraft = {
    transporter: isTransporterValid(), generator: isGeneratorValid(),
    declaration: isDeclarationValid(), activity: isActivityValid(),
    disposal: isDisposalValid(), referenceNo: isRefenceNoValid()
  };

  const validSections = {
    transporter: isTransporterValid(), generator: isGeneratorValid(),
    waste: isWasteValid(), wasteForm: isWasteFormValid(),
    declaration: isDeclarationValid(), activity: isActivityValid(),
    disposal: isDisposalValid(), referenceNo: isRefenceNoValid()
  };


  useEffect(() => {
    if (isTouchDevice() && isMobileOrTablet()) setUseCanvasSignature(true);
  }, []);

  useEffect(() => { fetchEntities(); }, []);
  useEffect(() => { fetchFacilities(); }, []);

  const fetchEntities = async () => {
    setLoading(true);
    const token = localStorage.getItem('token');
    try {
      const res = await fetch(`${API_URL}/entities`, { headers: { Authorization: `Bearer ${token}` } });
      if (res.status === 401) { onLogout(); return; }
      if (!res.ok) throw new Error();
      setEntities(await res.json());
    } catch { localStorage.removeItem('token'); setEntities([]); }
    finally { setLoading(false); }
  };

  const fetchFacilities = async () => {
    setLoading(true);
    const token = localStorage.getItem('token');
    try {
      const res = await fetch(`${API_URL}/facilities`, { headers: { Authorization: `Bearer ${token}` } });
      if (res.status === 401) { onLogout(); return; }
      if (!res.ok) throw new Error();
      setFacilities(await res.json());
    } catch { localStorage.removeItem('token'); setFacilities([]); }
    finally { setLoading(false); }
  };

  // Load draft receipt for completing into a manifest
  useEffect(() => {
    if (!receiptId) return;
    const load = async () => {
      setLoading(true);
      const token = localStorage.getItem('token');
      try {
        const res = await fetch(`${API_URL}/manifest-receipts/${receiptId}`, { headers: { Authorization: `Bearer ${token}` } });
        if (res.status === 401) { onLogout(); return; }
        if (!res.ok) throw new Error();
        const rows = await res.json();
        // Response is an array (same as manifests/:id), take first row
        const data = Array.isArray(rows) ? rows[0] : rows;
        if (!data) throw new Error('No data returned');

        // Pre-populate form from the receipt
        setReferenceNo({ reference_no: data.reference_no || '' });
        if (data.reference_no) setReferenceNoError(false);

        // Look up full entity details from the already-loaded entities list
        // so Address, Contact No etc auto-populate just like manifest edit does
        const noErr = { name: false, address: false, contact_person: false, contact_no: false, email: false, ipwis_no: false };
        const partErr = { name: false, address: true, contact_person: true, contact_no: true, email: true, ipwis_no: false };

        const genEntity = entities.find(e => e.type === 'generator' && e.name === data.generator);
        if (genEntity) {
          setGenerator({ name: genEntity.name, address: genEntity.address, contact_person: genEntity.contact_person, contact_no: genEntity.contact_no, email: genEntity.email, ipwis_no: genEntity.ipwis_no });
          setGeneratorErrors(noErr);
        } else {
          setGenerator({ name: data.generator || '', address: '', contact_person: '', contact_no: '', email: '', ipwis_no: '' });
          setGeneratorErrors(data.generator ? partErr : noErr);
        }

        const transEntity = entities.find(e => e.type === 'transporter' && e.name === data.transporter);
        if (transEntity) {
          setTransporter({ name: transEntity.name, address: transEntity.address, contact_person: transEntity.contact_person, contact_no: transEntity.contact_no, email: transEntity.email, ipwis_no: transEntity.ipwis_no });
          setTransporterErrors(noErr);
        } else {
          setTransporter({ name: data.transporter || '', address: '', contact_person: '', contact_no: '', email: '', ipwis_no: '' });
          setTransporterErrors(data.transporter ? partErr : noErr);
        }
        setWasteTypes({
          hazardous:    parseWasteArray(data.waste_type).includes('hazardous'),
          nonHazardous: parseWasteArray(data.waste_type).includes('nonhazardous'),
          recyclable:   parseWasteArray(data.waste_type).includes('recyclable'),
        });
        setWasteForms({
          solid:  (data.waste_form || '').toLowerCase().includes('solid'),
          sludge: (data.waste_form || '').toLowerCase().includes('sludge'),
          liquid: (data.waste_form || '').toLowerCase().includes('liquid'),
        });
        setWasteItems(rows
          .filter(item => item.description || item.packaging || item.volume_l || item.weight_kg)
          .map(item => ({
            description: item.description || '',
            packaging:   item.packaging   || '',
            volume:      item.volume_l    || '',
            weight:      item.weight_kg   || '',
          }))
        );
        setActivities(prev => ({
          ...prev,
          donation:  (data.process || '').toLowerCase().includes('donation'),
          reuse:     (data.process || '').toLowerCase().includes('reuse'),
          sorting:   (data.process || '').toLowerCase().includes('sorting'),
          recycling: (data.process || '').toLowerCase().includes('recycling'),
          treatment: (data.process || '').toLowerCase().includes('treatment'),
          storage:   (data.process || '').toLowerCase().includes('storage'),
          landfill:  (data.process || '').toLowerCase().includes('landfill'),
          additionalComment: data.comments || '',
        }));
        setDisposal({
          facility:   data.final_disposal || '',
          contact_no: data.disposal_contact_no || '',
          email:      data.disposal_email || '',
          date:       data.actual_disposal_date ? formatDate(data.actual_disposal_date) : '',
        });
        setDeclaration({
          type: data.type || '',
          name: data.declaration_name || '',
          date: data.declaration_date ? formatDate(data.declaration_date) : '',
        });
        if (data.signature) { setSignature(data.signature); setSigned(true); }
      } catch (err) { console.error(err); }
      finally { setLoading(false); }
    };
    load();
  }, [receiptId, entities]); // re-run when entities loads so entity lookup finds the match

  const parseWasteArray = (val) => {
    if (!val) return [];
    // Strip PostgreSQL array notation: {"NonHazardous"} → NonHazardous
    return val
      .replace(/^\{/, '')   // remove leading {
      .replace(/\}$/, '')   // remove trailing }
      .split(',')
      .map(s => s.replace(/"/g, '').trim().toLowerCase());
  };

  // Load existing manifest for editing
  useEffect(() => {
    if (!manifestId) return;
    const load = async () => {
      setLoading(true);
      const token = localStorage.getItem('token');
      try {
        const res = await fetch(`${API_URL}/manifests/${manifestId}`, { headers: { Authorization: `Bearer ${token}` } });
        if (res.status === 401) { onLogout(); return; }
        if (!res.ok) throw new Error();
        const data = await res.json();
        const m = data[0];
        setReferenceNo({ reference_no: m.reference_no });
        if (m.reference_no) setReferenceNoError(false);

        const noErr   = { name: false, address: false, contact_person: false, contact_no: false, email: false, ipwis_no: false };
        const partErr = { name: false, address: true,  contact_person: true,  contact_no: true,  email: true,  ipwis_no: false };

        const genEntity = entities.find(e => e.type === 'generator' && e.name === m.generator);
        if (genEntity) {
          setGenerator({ name: genEntity.name, address: genEntity.address, contact_person: genEntity.contact_person, contact_no: genEntity.contact_no, email: genEntity.email, ipwis_no: genEntity.ipwis_no });
          setGeneratorErrors(noErr);
        } else {
          setGenerator({ name: m.generator || '', address: '', contact_person: '', contact_no: '', email: '', ipwis_no: '' });
          setGeneratorErrors(m.generator ? partErr : noErr);
        }

        const transEntity = entities.find(e => e.type === 'transporter' && e.name === m.transporter);
        if (transEntity) {
          setTransporter({ name: transEntity.name, address: transEntity.address, contact_person: transEntity.contact_person, contact_no: transEntity.contact_no, email: transEntity.email, ipwis_no: transEntity.ipwis_no });
          setTransporterErrors(noErr);
        } else {
          setTransporter({ name: m.transporter || '', address: '', contact_person: '', contact_no: '', email: '', ipwis_no: '' });
          setTransporterErrors(m.transporter ? partErr : noErr);
        }
        setWasteTypes({
          hazardous:    (data.waste_type || '').toLowerCase().split(',').map(s => s.trim()).includes('hazardous'),
          nonHazardous: (data.waste_type || '').toLowerCase().split(',').map(s => s.trim()).includes('nonhazardous'),
          recyclable:   (data.waste_type || '').toLowerCase().split(',').map(s => s.trim()).includes('recyclable'),
        });
        setWasteForms({
          solid:  m.waste_form?.toLowerCase()?.includes('solid'),
          sludge: m.waste_form?.toLowerCase()?.includes('sludge'),
          liquid: m.waste_form?.toLowerCase()?.includes('liquid'),
        });
        setWasteItems(data
          .filter(item => item.description || item.packaging || item.volume_l || item.weight_kg)
          .map(item => ({
            description: item.description || '',
            packaging:   item.packaging   || '',
            volume:      item.volume_l    || '',
            weight:      item.weight_kg   || '',
          }))
        );
        setActivities({
          donation: m.process?.toLowerCase()?.includes('donation'), reuse: m.process?.toLowerCase()?.includes('reuse'),
          sorting: m.process?.toLowerCase()?.includes('sorting'),   recycling: m.process?.toLowerCase()?.includes('recycling'),
          treatment: m.process?.toLowerCase()?.includes('treatment'), storage: m.process?.toLowerCase()?.includes('storage'),
          landfill: m.process?.toLowerCase()?.includes('landfill'), additionalComment: m.comments || '',
        });
        setDisposal({ facility: m.final_disposal || '', contact_no: m.disposal_contact_no || '', email: m.disposal_email || '', date: m.actual_disposal_date || '' });
        setDeclaration({ type: m.type || '', name: m.declaration_name || '', date: formatDate(m.declaration_date) || '' });
        if (m.signature) { setSignature(m.signature); setSigned(true); }
      } catch (err) { console.error(err); }
      finally { setLoading(false); }
    };
    load();
  }, [manifestId, entities]); // re-run when entities loads so entity lookup finds the match

  const formatDate = (d) => {
    if (!d) return '';
    const dt = new Date(d);
    return `${dt.getUTCFullYear()}-${String(dt.getUTCMonth()+1).padStart(2,'0')}-${String(dt.getUTCDate()).padStart(2,'0')}`;
  };

  const getSignature = async () => {
    if (useCanvasSignature) { setOpenCanvas(true); return; }
    setLoading(true);
    try {
      const res = await fetch('http://localhost:5000/signature', { method: 'POST' });
      if (!res.ok) throw new Error();
      const image = await res.json();
      setSignature(image.image.data || '');
      setSigned(true);
    } catch { setSignature(''); setSigned(false); }
    finally { setLoading(false); }
  };

  const handleSelect = (value, type) => {
    const match = entities.find(e => e.type === type && e.name === value);
    const noErr = { name: false, address: false, contact_person: false, contact_no: false, email: false, ipwis_no: false };
    const partErr = { name: false, address: true, contact_person: true, contact_no: true, email: true, ipwis_no: false };
    if (match) {
      const d = { name: match.name, address: match.address, contact_person: match.contact_person, contact_no: match.contact_no, email: match.email, ipwis_no: match.ipwis_no };
      if (type === 'generator') { setGenerator(d); setGeneratorErrors(noErr); }
      else { setTransporter(d); setTransporterErrors(noErr); }
    } else {
      const d = { name: value, address: '', contact_no: '', ipwis_no: '' };
      if (type === 'generator') { setGenerator(d); setGeneratorErrors(noErr); }
      else { setTransporter(d); setTransporterErrors(noErr); }
    }
  };

  const handleFacilitySelect = (value) => {
    const f = facilities.find(f => f.name === value);
    if (f) setDisposal({ facility: f.name, contact_no: f.contact_no, email: f.email, date: disposal.date || '' });
    else setDisposal(prev => ({ ...prev, facility: value, contact_no: '', email: '', date: '' }));
  };

  const handleFieldChange = (field, label) => (e) => {
    if (label === 'Transporter' && field !== 'ipwis_no') {
      setTransporter(prev => ({ ...prev, [field]: e.value }));
      setTransporterErrors(prev => ({ ...prev, [field]: e.error }));
    } else if (field !== 'ipwis_no') {
      setGenerator(prev => ({ ...prev, [field]: e.value }));
      setGeneratorErrors(prev => ({ ...prev, [field]: e.error }));
    }
  };

  const handleDisposalFieldChange = (field) => (e) => {
    if (field !== 'date') setDisposal(prev => ({ ...prev, [field]: e.value }));
  };

  const handleReferenceNoFieldChange = (field) => (e) => {
    setReferenceNo(prev => ({ ...prev, [field]: e.value }));
    setReferenceNoError(e.error);
  };

  const saveEntityIfNew = async (type, entityState) => {
    const exists = entities.some(e => e.type === type && e.name.toLowerCase() === entityState.name.toLowerCase());
    if (!exists && entityState.name.trim() !== '') {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_URL}/entities`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ ...entityState, type }),
      });
      if (res.status === 401) { onLogout(); return; }
      if (!res.ok) throw new Error();
      const newEntity = await res.json();
      setEntities(prev => [...prev, newEntity]);
    }
  };

  const saveManifest = async (saveForLater = false) => {
    setLoading(true);
    const token = localStorage.getItem('token');
    const payload = {
      generator: generator.name, transporter: transporter.name,
      waste_type: Object.entries(wasteTypes).filter(([,v]) => v).map(([k]) => k.charAt(0).toUpperCase() + k.slice(1)),
      waste_form: Object.entries(wasteForms).filter(([,v]) => v).map(([k]) => k.charAt(0).toUpperCase() + k.slice(1)),
      wasteItems, process: Object.entries(activities).filter(([k,v]) => v === true && k !== 'additionalComment').map(([k]) => k.charAt(0).toUpperCase() + k.slice(1)),
      type: declaration.type, declaration_name: declaration.name, declaration_date: declaration.date,
      final_disposal: disposal.facility, contact_no: disposal.contact_no, isStamped: showStamp,
      date: disposal.date, comments: activities.additionalComment, reference_no: referenceNo.reference_no,
      disposal_email: disposal.email, signature, saveForLater,
    };
    try {
      // When completing a receipt draft, always POST (creates new manifest)
      const url = (manifestId && !receiptId) ? `${API_URL}/manifests/${manifestId}` : `${API_URL}/manifest`;
      const res = await fetch(url, {
        method: (manifestId && !receiptId) ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(payload),
      });
      if (res.status === 401) { onLogout(); return; }
      const saved = await res.json();
      if (!res.ok) { if (res.status === 409) { setWarningMessage(saved.error); throw new Error(saved.error); } }
      return saved;
    } catch (err) { console.error(err); throw err; }
    finally { setLoading(false); }
  };

  const sendManifestEmail = async (mid, token) => {
    const res = await fetch(`${API_URL}/manifest/${mid}/send-email`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ showStamp, signature, sendEmail }),
    });
    if (res.status === 401) { onLogout(); return; }
    if (!res.ok) throw new Error('Failed to send email');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    try {
      await saveEntityIfNew('generator', generator);
      await saveEntityIfNew('transporter', transporter);
      const result = await saveManifest();
      await sendManifestEmail(result.manifest.id, token);
      if (result) {
        if (receiptId || !manifestId) {
          navigate('/manifests', { state: { successMessage: `Manifest ${result.manifest.manifest_no} created successfully. A receipt has also been generated.` } });
        } else {
          navigate('/manifestsedit');
        }
      }
    } catch (err) { console.error(err); }
  };


  const saveDraft = async () => {
    const token = localStorage.getItem('token');
    try {
      await saveEntityIfNew('generator', generator);
      await saveEntityIfNew('transporter', transporter);
      const result = await saveManifest(true);
      if (result) {
        manifestId
          ? navigate('/manifestsedit')
          : navigate('/manifests', { state: { successMessage: `Draft receipt saved. You can complete the manifest later.` } });
      }
    } catch (err) { console.error(err); }
  };

  // Entity section renderer
  const renderEntitySection = (label, state, setState, type, errors, setErrors) => {
    const options = entities.filter(e => e.type === type).map(e => e.name);
    const isValid = type === 'transporter' ? isTransporterValid() : isGeneratorValid();
    return (
      <Accordion number={type === 'transporter' ? '1' : '2'} title={label} valid={isValid}>
        <AutocompleteInput
          label={`${label} Name`}
          value={state.name}
          options={[...new Set(options)]}
          onChange={(v) => handleSelect(v, type)}
        />
        <FinFieldAddress
          id={`Address-${type}`} variant="outlined" label="Address"
          helperText="Please enter a valid address" value={state.address}
          callback={handleFieldChange('address', label)} multiline required
        />
        <FinField
          id={`Contact-${type}`} fullWidth placeholder="eg. John"
          helperText="Please enter a valid contact person" label="Contact Person"
          validationMethod="text" value={state.contact_person}
          callback={handleFieldChange('contact_person', label)}
        />
        <FinField
          id={`ContactNo-${type}`} fullWidth required placeholder="eg. 0730000000"
          helperText="Please enter a valid contact number" label="Contact No"
          validationMethod="phone" autoComplete="mobile-number" value={state.contact_no}
          callback={handleFieldChange('contact_no', label)}
        />
        <FinField
          id={`Email-${type}`} fullWidth required placeholder="eg. test@email.com"
          helperText="Please enter a valid email address" label="Email"
          validationMethod="email" value={state.email} callback={handleFieldChange('email', label)}
        />
        <FinField
          id={`IPWISNo-${type}`} fullWidth label="IPWIS No" value={state.ipwis_no}
          callback={handleFieldChange('ipwis_no', label)}
        />
        {type === 'generator' && (
          <Toggle checked={sendEmail.generator} onChange={v => setSendEmail(p => ({ ...p, generator: v }))} label="Send Email to Generator?" labelPlacement="start" />
        )}
      </Accordion>
    );
  };

  const facilityOptions = facilities.map(f => f.name);

  return (
    <>
      <LoadingOverlay visible={loading} />
      <Toast message={successMessage} onClose={() => setSuccessMessage('')} />
      <Toast message={warningMessage} type="warning" onClose={() => setWarningMessage('')} />
      <Header user={user} onLogout={onLogout} onHome={onHome} />

      <div className="page-hero">
        <div className="page-hero-eyebrow">{receiptId ? 'Complete Draft' : manifestId ? 'Edit Manifest' : 'New Manifest'}</div>
        <h1 className="page-hero-title">Waste Manifest</h1>
        <p className="page-hero-sub">
          {receiptId
            ? 'Complete the remaining sections to convert this draft receipt into a full manifest.'
            : manifestId
            ? 'Update the details of this manifest.'
            : 'Complete all sections to create a new waste manifest.'}
        </p>
      </div>

      <div className="app-container" style={{ maxWidth: 800 }}>
        <form onSubmit={handleSubmit}>

          {/* Reference No */}
          <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '14px', padding: '20px 22px', marginBottom: '10px' }}>
            <FinField
              id="Reference No." fullWidth required placeholder="eg. B01"
              helperText="Please enter a valid reference number" label="Reference No."
              validationMethod="text" value={referenceNo.reference_no}
              callback={handleReferenceNoFieldChange('reference_no')}
            />
          </div>

          {/* Entity sections */}
          {renderEntitySection('Transporter', transporter, setTransporter, 'transporter', transporterErrors, setTransporterErrors)}
          {renderEntitySection('Generator', generator, setGenerator, 'generator', generatorErrors, setGeneratorErrors)}

          {/* Waste Description */}
          <Accordion number="3" title="Waste Description" valid={isWasteValid() && isWasteFormValid()}>
            <div>
              <div style={{ fontSize: '11px', fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--text4)', marginBottom: '8px' }}>Waste Types</div>
              <WasteCheckboxGroup values={wasteTypes} onChange={setWasteTypes} />
            </div>
            <div>
              <div style={{ fontSize: '11px', fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--text4)', marginBottom: '8px' }}>Waste Forms</div>
              <WasteFormCheckboxGroup values={wasteForms} onChange={setWasteForms} />
            </div>

            {/* Waste Items Table */}
            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <button type="button" className="btn btn-outline" onClick={() => { setNewWasteItem({ description: '', packaging: '', volume: '', weight: '' }); setEditingIndex(null); setIsModalOpen(true); }}>
                <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path d="M12 5v14M5 12h14"/></svg>
                Add Waste Item
              </button>
            </div>

            <div className="wi-table-wrap">
              <table className="wi-table">
                <thead>
                  <tr>
                    <th style={{ textAlign: 'left' }}>Description</th>
                    <th>Packaging</th>
                    <th>Volume (L)</th>
                    <th>Weight (kg)</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {wasteItems.length === 0 ? (
                    <tr><td colSpan={5} style={{ padding: '24px', textAlign: 'center', color: 'var(--text4)', fontStyle: 'italic', fontSize: '13px' }}>No waste items added yet.</td></tr>
                  ) : wasteItems.map((item, idx) => (
                    <tr key={idx}>
                      <td style={{ textAlign: 'left', wordBreak: 'break-word', maxWidth: 220 }}>{item.description}</td>
                      <td>{item.packaging}</td>
                      <td>{item.volume}</td>
                      <td>{item.weight}</td>
                      <td>
                        <div style={{ display: 'flex', gap: '5px', justifyContent: 'center' }}>
                          <button type="button" className="btn-icon" onClick={() => { setNewWasteItem(item); setEditingIndex(idx); setIsModalOpen(true); }}>
                            <svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                              <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/>
                            </svg>
                          </button>
                          <button type="button" className="btn-icon danger" onClick={() => { setWasteItems(prev => prev.filter((_, i) => i !== idx)); if (editingIndex === idx) { setEditingIndex(null); setNewWasteItem({ description: '', packaging: '', volume: '', weight: '' }); } }}>
                            <svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                              <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6"/><path d="M10 11v6M14 11v6"/>
                            </svg>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Accordion>

          {/* Declaration */}
          <Accordion number="4" title="Transporter/Generator Declaration" valid={isDeclarationValid()}>
            <p style={{ fontSize: '13px', color: 'var(--text3)', lineHeight: '1.55' }}>
              I hereby declare that all the waste is fully and accurately described, packed, marked, and labelled according to all applicable legislation.
            </p>
            <SearchDropDown
              id="type" name="typeId" validationMethod="basic" label="Transporter/Generator"
              helperText="Please select an option" freeSolo={false} required options={types}
              value={types.find(t => t.name === declaration.type) || null}
              onChange={(e, value) => setDeclaration({ ...declaration, type: value?.name })}
            />
            <div className="field-wrap">
              <label className="field-label">Name</label>
              <input className="field-input" value={declaration.name} onChange={e => setDeclaration({ ...declaration, name: e.target.value })} />
            </div>
            <div className="field-wrap">
              <label className="field-label">Date</label>
              <input type="date" className="field-input" value={declaration.date} onChange={e => setDeclaration({ ...declaration, date: e.target.value })} onClick={e => e.target.showPicker?.()} />
            </div>

            {/* Signature pad */}
            <div>
              <div style={{ fontSize: '11px', fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--text4)', marginBottom: '8px' }}>Signature</div>
              <div
                className={`sig-box ${signed ? 'signed' : ''}`}
                onClick={getSignature}
                id="signaturePad"
              >
                {signature
                  ? <img src={signature} alt="Signature" style={{ maxHeight: '90px', display: 'block', margin: 'auto' }} />
                  : <span className="sig-box-placeholder">Click to sign</span>
                }
              </div>
            </div>
          </Accordion>

          {/* Management Activity */}
          <Accordion number="5" title="Management Activity" valid={isActivityValid()}>
            <ManagementActivityCheckGroup values={activities} onChange={setActivities} />
            <div className="field-wrap">
              <label className="field-label">Additional Comments</label>
              <textarea
                className="field-textarea"
                rows={4}
                value={activities.additionalComment}
                onChange={e => setActivities({ ...activities, additionalComment: e.target.value })}
              />
            </div>
            <Toggle checked={showStamp} onChange={setShowStamp} label="Include Stamp?" labelPlacement="start" />
          </Accordion>

          {/* Final Disposal */}
          <Accordion number="6" title="Final Disposal" valid={isDisposalValid()}>
            <AutocompleteInput
              label="Facility"
              value={disposal.facility}
              options={[...new Set(facilityOptions)]}
              onChange={handleFacilitySelect}
            />
            <FinField
              id="DisposalContactNo" fullWidth required placeholder="eg. 073256222"
              helperText="Please enter a valid contact number" label="Contact No"
              validationMethod="phone" autoComplete="mobile-number"
              value={disposal.contact_no} callback={handleDisposalFieldChange('contact_no')}
            />
            <FinField
              id="DisposalEmail" fullWidth placeholder="eg. test@email.com" label="Email"
              value={disposal.email} callback={handleDisposalFieldChange('email')}
            />
            <div className="field-wrap">
              <label className="field-label">Date</label>
              <input
                type="date" className="field-input"
                value={disposal.date ? disposal.date.split('T')[0] : ''}
                onChange={e => setDisposal({ ...disposal, date: e.target.value })}
                onClick={e => e.target.showPicker?.()}
              />
            </div>
            <Toggle checked={sendEmail.disposal} onChange={v => setSendEmail(p => ({ ...p, disposal: v }))} label="Send Email to Disposal?" labelPlacement="start" />
          </Accordion>

          {/* Action Buttons */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 2fr', gap: '12px', marginTop: '24px' }}>
            <button type="button" className="btn btn-outline" onClick={() => navigate(-1)}>Cancel</button>
            <button
              type="button" className="btn btn-outline"
              disabled={!Object.values(validSectionsDraft).every(Boolean)}
              onClick={saveDraft}
              title="Save a receipt now and finish the manifest later"
            >
              <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" style={{ marginRight: 4, verticalAlign: 'middle' }}>
                <path d="M19 21H5a2 2 0 01-2-2V5a2 2 0 012-2h11l5 5v11a2 2 0 01-2 2z"/><path d="M17 21v-8H7v8M7 3v5h8"/>
              </svg>
              Save as Receipt
            </button>
            <button
              type="submit" className="btn btn-primary"
              disabled={!Object.values(validSections).every(Boolean)}
            >
              {receiptId ? 'Create Manifest from Draft' : manifestId ? 'Update Manifest' : 'Create Manifest'}
            </button>
          </div>

        </form>
      </div>

      {/* Canvas Signature Modal */}
      {openCanvas && (
        <div className="modal-overlay" onClick={() => setOpenCanvas(false)}>
          <div className="modal-panel" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <span className="modal-title">Sign with your finger</span>
              <button className="modal-close" onClick={() => setOpenCanvas(false)}>
                <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path d="M18 6L6 18M6 6l12 12"/></svg>
              </button>
            </div>
            <div className="modal-body">
              <CanvasSignature
                onSave={(img) => { setSignature(img); setSigned(true); setOpenCanvas(false); }}
                onCancel={() => setOpenCanvas(false)}
              />
            </div>
          </div>
        </div>
      )}

      {/* Waste Item Modal */}
      <WasteItemModal
        open={isModalOpen}
        onClose={() => { setIsModalOpen(false); setEditingIndex(null); setNewWasteItem({ description: '', packaging: '', volume: '', weight: '' }); }}
        data={newWasteItem}
        setData={setNewWasteItem}
        isEditing={editingIndex !== null}
        onSave={(item) => {
          if (editingIndex !== null) setWasteItems(prev => prev.map((w, i) => i === editingIndex ? item : w));
          else setWasteItems(prev => [...prev, item]);
          setNewWasteItem({ description: '', packaging: '', volume: '', weight: '' });
          setEditingIndex(null);
          setIsModalOpen(false);
        }}
      />
    </>
  );
}
