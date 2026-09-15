/* =====================================================================
   WasteVerificationForm.jsx
   Faithful screen version of SOP0012/14-1 Rev 00.

   One component, three modes — so the customer, the operations
   supervisor and the emailed copy are all visibly the same document:

     mode="customer"  Section A editable, Section B locked (portal)
     mode="office"    Section A locked, Section B editable (tablet)
     mode="print"     everything locked, no buttons (email / PDF copy)

   No dependencies beyond React, so it drops into both the Vite portal
   and the Create-React-App admin build unchanged.

   Controlled component:
     data          object of form values (see EMPTY_FORM below)
     onChange      (patch) => void        shallow merge
     msdsFile      File | null
     onMsdsChange  (File | null) => void
     onSubmit      () => void            omit to hide the footer
     submitting    boolean
   ===================================================================== */

import { useMemo, useRef, useEffect } from "react";

export const EMPTY_FORM = {
  // ── Section A ──
  vehicleRegistration: "",
  driverName: "",
  wasteStreams: [
    { description: "", volume: "" },
    { description: "", volume: "" },
    { description: "", volume: "" },
    { description: "", volume: "" },
    { description: "", volume: "" },
  ],
  wasteType: "",              // Hazardous | Non-Hazardous | Recyclable
  wasteForm: "",              // Solid | Sludge | Liquid
  disposalReason: "",
  deliveryOrCollection: "",   // Delivery | Collection
  requestDate: "",
  eta: "",
  wirNumber: "",
  poReferenceNumber: "",
  msdsAttached: "",           // Yes | No
  sampleRequired: "",         // Yes | No
  compatibilityRequired: "",  // Yes | No
  specialInstructions: "",
  generatorName: "",
  customerName: "",
  contactNumber: "",
  signature: "",
  declarationDate: "",

  // ── Section B ──
  vehicleReported: "",        // Yes | No | N/A
  wasteDescription: "",
  packagingSafety: "",
  visualInspection: "",
  photosTaken: "",
  wasteAcceptedCheck: "",
  checklistComments: {
    vehicleReported: "",
    wasteDescription: "",
    packagingSafety: "",
    visualInspection: "",
    photosTaken: "",
    wasteAcceptedCheck: "",
  },
  decision: "",               // Accepted | Rejected | Hold for Review
  reason: "",
  completedBy: "",
  designation: "",
  verifierSignature: "",
  verificationDate: "",
};

const CHECKLIST_ROWS = [
  { key: "vehicleReported",    label: "Vehicle reported to the receiving point" },
  { key: "wasteDescription",   label: "Waste description matches approval" },
  { key: "packagingSafety",    label: "Packaging and safety compliant" },
  { key: "visualInspection",   label: "Visual inspection completed" },
  { key: "photosTaken",        label: "Photos taken" },
  { key: "wasteAcceptedCheck", label: "Waste accepted or rejected" },
];

const css = `
.wvf {
  --line: #000;
  --band: #29abe2;
  --note: #e01b24;
  --lock: #f4f5f6;
  font-family: Arial, Helvetica, sans-serif;
  font-size: 11px;
  color: #000;
  background: #fff;
  max-width: 960px;
  margin: 0 auto;
  padding: 18px;
  line-height: 1.35;
}
.wvf table { width: 100%; border-collapse: collapse; table-layout: fixed; }
.wvf td, .wvf th {
  border: 1px solid var(--line);
  padding: 4px 6px;
  vertical-align: middle;
  text-align: left;
  font-weight: 400;
  word-break: break-word;
}
.wvf .band td {
  background: var(--band);
  font-weight: 700;
  text-align: center;
  letter-spacing: .2px;
}
.wvf .b { font-weight: 700; }
.wvf .c { text-align: center; }

/* header block */
.wvf-head td { height: 46px; }
.wvf-logo { width: 26%; }
.wvf-logo img { max-height: 34px; display: block; }
.wvf-wordmark {
  display: inline-flex;
  align-items: center;
  font-size: 17px;
  letter-spacing: -.3px;
  line-height: 1;
}
.wvf-wordmark .wm-material { color: #e8413a; padding: 3px 1px 3px 0; }
.wvf-wordmark .wm-cycle    { color: #000; background: #7fd4e8; padding: 3px 4px; }
.wvf-title { text-align: center; font-weight: 700; }
.wvf-title small { display: block; font-weight: 400; font-size: 10px; }
.wvf-meta { width: 27%; font-size: 10px; line-height: 1.6; }

.wvf-instruction { margin: 7px 0; font-size: 10.5px; }
.wvf-instruction b { font-weight: 700; }

/* inputs sit inside the ruled cells and carry no chrome of their own */
.wvf input[type=text], .wvf input[type=date], .wvf input[type=time],
.wvf input[type=tel], .wvf textarea {
  width: 100%;
  border: 0;
  padding: 2px 0;
  font: inherit;
  color: inherit;
  background: transparent;
  outline: none;
}
.wvf textarea { resize: vertical; min-height: 30px; }
.wvf input:focus-visible, .wvf textarea:focus-visible {
  outline: 2px solid var(--band);
  outline-offset: 1px;
}
.wvf [data-locked=true] { background: var(--lock); color: #333; }
.wvf [data-locked=true] input,
.wvf [data-locked=true] textarea { cursor: default; }

/* tick boxes */
.wvf-tick {
  display: inline-flex; align-items: center; gap: 6px;
  cursor: pointer; user-select: none;
}
.wvf-tick input { position: absolute; opacity: 0; width: 0; height: 0; }
.wvf-box {
  width: 11px; height: 11px; flex: 0 0 11px;
  border: 1px solid var(--line); background: #fff;
  display: inline-flex; align-items: center; justify-content: center;
  font-size: 10px; line-height: 1;
}
.wvf-tick input:checked + .wvf-box::after { content: "\\2715"; }
.wvf-tick input:focus-visible + .wvf-box { outline: 2px solid var(--band); outline-offset: 1px; }
.wvf-tick.off { cursor: default; }

.wvf-notes { margin: 8px 0 2px; color: var(--note); font-weight: 700; font-size: 10.5px; }
.wvf-notes span { display: block; font-weight: 400; }
.wvf-turnaround { color: var(--note); font-weight: 700; margin: 8px 0 12px; font-size: 10.5px; }

/* MSDS upload — the one control with no paper equivalent */
.wvf-msds {
  border: 1px dashed var(--line);
  padding: 9px 11px;
  margin: 0 0 14px;
  display: flex; align-items: center; gap: 12px; flex-wrap: wrap;
}
.wvf-msds label.file {
  border: 1px solid var(--line); background: #fff;
  padding: 4px 12px; cursor: pointer; font-size: 10.5px;
}
.wvf-msds label.file:hover { background: var(--lock); }
.wvf-msds .name { font-size: 10.5px; }
.wvf-msds .name.none { color: #666; }
.wvf-msds button {
  border: 0; background: none; color: var(--note);
  cursor: pointer; font: inherit; text-decoration: underline;
}
.wvf-msds a.file { text-decoration: none; color: inherit; }
.wvf-sig { display: flex; align-items: center; gap: 8px; }
.wvf-sig canvas {
  border: 1px solid var(--line); background: #fff;
  touch-action: none; cursor: crosshair;
}
.wvf-sig button {
  border: 0; background: none; color: var(--note);
  cursor: pointer; font: inherit; text-decoration: underline;
}
.wvf-sig-img { max-height: 60px; display: block; }
.wvf-sig-none { color: #666; font-style: italic; }
.wvf-staff {
  border: 0; border-bottom: 1px solid var(--line);
  background: transparent; font: inherit; color: inherit;
  padding: 1px 0; width: 55%;
}
.wvf-staff:focus-visible { outline: 2px solid var(--band); outline-offset: 1px; }

.wvf-sigdate { display: flex; align-items: center; gap: 8px; }
.wvf-sigdate span { white-space: nowrap; }

.wvf-foot { display: flex; justify-content: space-between; align-items: center; gap: 14px; margin-top: 14px; }
.wvf-foot .controlled { font-style: italic; font-size: 10px; }
.wvf-submit {
  border: 1px solid #1d7a3d; background: #1d7a3d; color: #fff;
  padding: 8px 22px; font: inherit; cursor: pointer;
}
.wvf-submit:disabled { background: #9bb7a4; border-color: #9bb7a4; cursor: not-allowed; }
.wvf-missing { color: var(--note); font-size: 10.5px; }

@media (max-width: 640px) {
  .wvf { padding: 10px; font-size: 12px; }
  .wvf td, .wvf th { padding: 6px; }
  .wvf-logo { width: 34%; }
  .wvf-meta { width: 32%; }
}
@media print {
  .wvf { padding: 0; max-width: none; }
  .wvf-msds, .wvf-submit, .wvf-missing { display: none; }
  .wvf [data-locked=true] { background: #fff; }
}
@media print {
  .wvf { padding: 0; max-width: none; }
  .wvf-msds, .wvf-submit, .wvf-missing, .wvf-sig button { display: none; }
  .wvf [data-locked=true] { background: #fff; }
}
`;

/* ── signature pad: draws to canvas, stores a base64 PNG data URL ── */
function SignaturePad({ value, onChange, locked }) {
  const ref = useRef(null);
  const drawing = useRef(false);

  // Repaint an existing signature when the form loads
  useEffect(() => {
    const c = ref.current;
    if (!c) return;
    const ctx = c.getContext("2d");
    ctx.clearRect(0, 0, c.width, c.height);
    if (value?.startsWith("data:image")) {
      const img = new Image();
      img.onload = () => ctx.drawImage(img, 0, 0, c.width, c.height);
      img.src = value;
    }
  }, [value]);

  if (locked) {
    return value?.startsWith("data:image")
      ? <img src={value} alt="Signature" className="wvf-sig-img" />
      : <span className="wvf-sig-none">{value || "Not signed"}</span>;
  }

  const pos = (e) => {
    const r = ref.current.getBoundingClientRect();
    return { x: e.clientX - r.left, y: e.clientY - r.top };
  };

  const start = (e) => {
    e.preventDefault();
    drawing.current = true;
    const ctx = ref.current.getContext("2d");
    ctx.lineWidth = 1.8;
    ctx.lineCap = "round";
    ctx.strokeStyle = "#000";
    const { x, y } = pos(e);
    ctx.beginPath();
    ctx.moveTo(x, y);
  };

  const move = (e) => {
    if (!drawing.current) return;
    e.preventDefault();
    const { x, y } = pos(e);
    const ctx = ref.current.getContext("2d");
    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const end = () => {
    if (!drawing.current) return;
    drawing.current = false;
    onChange(ref.current.toDataURL("image/png"));
  };

  const clear = () => {
    const c = ref.current;
    c.getContext("2d").clearRect(0, 0, c.width, c.height);
    onChange("");
  };

  return (
    <div className="wvf-sig">
      <canvas
        ref={ref}
        width={320}
        height={70}
        onPointerDown={start}
        onPointerMove={move}
        onPointerUp={end}
        onPointerLeave={end}
      />
      <button type="button" onClick={clear}>Clear</button>
    </div>
  );
}

/* ── tick box: renders as a paper checkbox, behaves as a radio ── */
function Tick({ label, name, value, current, onPick, locked }) {
  const checked = current === value;
  return (
    <label className={`wvf-tick${locked ? " off" : ""}`}>
      <input
        type="radio"
        name={name}
        checked={checked}
        disabled={locked}
        onChange={() => onPick(value)}
      />
      <span className="wvf-box" aria-hidden="true" />
      {label}
    </label>
  );
}

export default function WasteVerificationForm({
  mode = "customer",
  data,
  onChange,
  msdsFile = null,
  onMsdsChange,
  onSubmit,
  submitting = false,
  staffMap = null,      // { "Name": "Designation" } → picks title automatically
  msdsUrl = null,       // link to the attached MSDS in office / print mode
}) {
  const f = { ...EMPTY_FORM, ...data };
  const lockA = mode !== "customer";
  const lockB = mode !== "office";

  const set = (key) => (e) => onChange({ [key]: e.target.value });
  const pick = (key) => (value) => onChange({ [key]: value });

  const setStream = (i, key) => (e) => {
    const next = f.wasteStreams.map((row, idx) =>
      idx === i ? { ...row, [key]: e.target.value } : row
    );
    onChange({ wasteStreams: next });
  };

  const setComment = (key) => (e) =>
    onChange({ checklistComments: { ...f.checklistComments, [key]: e.target.value } });

  /* Section A is complete when the fields the paper form treats as
     mandatory are filled and at least one waste stream line is used. */
  const missing = useMemo(() => {
    if (mode !== "customer") return [];
    const need = [
      ["vehicleRegistration", "Vehicle registration"],
      ["driverName", "Driver name"],
      ["wasteType", "Waste type"],
      ["wasteForm", "Waste form"],
      ["disposalReason", "Reason for disposal"],
      ["deliveryOrCollection", "Delivery or collection"],
      ["requestDate", "Date"],
      ["eta", "ETA"],
      ["generatorName", "Generator name"],
      ["customerName", "Customer name"],
      ["contactNumber", "Customer contact no"],
      ["signature", "Customer signature"],
      ["declarationDate", "Signature date"],
    ].filter(([k]) => !String(f[k] ?? "").trim()).map(([, l]) => l);

    const hasStream = f.wasteStreams.some(
      (r) => r.description.trim() || r.volume.trim()
    );
    if (!hasStream) need.push("At least one waste stream line");
    return need;
  }, [f, mode]);

  const A = { "data-locked": lockA || undefined };
  const B = { "data-locked": lockB || undefined };

  return (
    <div className="wvf">
      <style>{css}</style>

      {/* ─────────── Document header ─────────── */}
      <table>
        <tbody>
          <tr className="wvf-head">
            <td className="wvf-logo">
              <div className="wvf-wordmark">
                <span className="wm-material">material</span><span className="wm-cycle">cycle</span>
              </div>
            </td>
            <td className="wvf-title">
              WASTE VERIFICATION FORM
              <small>Waste arrival verification and receiving point control</small>
            </td>
            <td className="wvf-meta">
              Form No: SOP0012/14-1<br />
              Revision: 00<br />
              Date issued: 20/05/26
            </td>
          </tr>
        </tbody>
      </table>

      <p className="wvf-instruction">
        <b>Instruction:</b> Complete all relevant fields clearly. Office
        verification must be completed before acceptance or rejection is
        confirmed.
      </p>

      {/* ─────────── SECTION A ─────────── */}
      <table>
        <colgroup>
          <col style={{ width: "48%" }} />
          <col style={{ width: "17%" }} />
          <col style={{ width: "17%" }} />
          <col style={{ width: "18%" }} />
        </colgroup>
        <tbody>
          <tr className="band">
            <td colSpan={4} style={{ textAlign: "left" }}>
              SECTION A: FOR CUSTOMER TO COMPLETE
            </td>
          </tr>

          <tr>
            <td>Vehicle Registration Number:</td>
            <td colSpan={3} {...A}>
              <input type="text" value={f.vehicleRegistration}
                onChange={set("vehicleRegistration")} readOnly={lockA} />
            </td>
          </tr>

          <tr>
            <td>Driver: Name and Surname:</td>
            <td colSpan={3} {...A}>
              <input type="text" value={f.driverName}
                onChange={set("driverName")} readOnly={lockA} />
            </td>
          </tr>

          <tr>
            <td className="b">Waste Stream</td>
            <td className="b" colSpan={3}>Volume</td>
          </tr>

          {f.wasteStreams.map((row, i) => (
            <tr key={i}>
              <td {...A}>
                {i + 1}.{" "}
                <input type="text" style={{ width: "92%" }}
                  value={row.description}
                  onChange={setStream(i, "description")} readOnly={lockA} />
              </td>
              <td colSpan={3} {...A}>
                <input type="text" value={row.volume}
                  onChange={setStream(i, "volume")} readOnly={lockA} />
              </td>
            </tr>
          ))}

          <tr>
            <td>Waste Type</td>
            <td><Tick label="Hazardous" name="wasteType" value="Hazardous"
                  current={f.wasteType} onPick={pick("wasteType")} locked={lockA} /></td>
            <td><Tick label="Non-Hazardous" name="wasteType" value="NonHazardous"
                  current={f.wasteType} onPick={pick("wasteType")} locked={lockA} /></td>
            <td><Tick label="Recyclable" name="wasteType" value="Recyclable"
                  current={f.wasteType} onPick={pick("wasteType")} locked={lockA} /></td>
          </tr>

          <tr>
            <td>Waste Form</td>
            <td><Tick label="Solid" name="wasteForm" value="Solid"
                  current={f.wasteForm} onPick={pick("wasteForm")} locked={lockA} /></td>
            <td><Tick label="Sludge" name="wasteForm" value="Sludge"
                  current={f.wasteForm} onPick={pick("wasteForm")} locked={lockA} /></td>
            <td><Tick label="Liquid" name="wasteForm" value="Liquid"
                  current={f.wasteForm} onPick={pick("wasteForm")} locked={lockA} /></td>
          </tr>

          <tr>
            <td>
              Reason for Disposal:<br />
              (used, contaminated, expired)
            </td>
            <td colSpan={3} {...A}>
              <input type="text" value={f.disposalReason}
                onChange={set("disposalReason")} readOnly={lockA} />
            </td>
          </tr>

          <tr>
            <td>Delivery or Collection:</td>
            <td colSpan={2}>
              <Tick label="Delivery" name="deliveryOrCollection" value="Delivery"
                current={f.deliveryOrCollection} onPick={pick("deliveryOrCollection")} locked={lockA} />
            </td>
            <td>
              <Tick label="Collection" name="deliveryOrCollection" value="Collection"
                current={f.deliveryOrCollection} onPick={pick("deliveryOrCollection")} locked={lockA} />
            </td>
          </tr>

          <tr>
            <td>Date:</td>
            <td colSpan={3} {...A}>
              <input type="date" value={f.requestDate}
                onChange={set("requestDate")} readOnly={lockA} />
            </td>
          </tr>

          <tr>
            <td>Estimated Time of Arrival (ETA):</td>
            <td colSpan={3} {...A}>
              <input type="time" value={f.eta}
                onChange={set("eta")} readOnly={lockA} />
            </td>
          </tr>

          <tr>
            <td>WIR Number:</td>
            <td colSpan={3} {...A}>
              <input type="text" value={f.wirNumber}
                onChange={set("wirNumber")} readOnly={lockA} />
            </td>
          </tr>

          <tr>
            <td>PO/ Reference Number:</td>
            <td colSpan={3} {...A}>
              <input type="text" value={f.poReferenceNumber}
                onChange={set("poReferenceNumber")} readOnly={lockA} />
            </td>
          </tr>

          {[
            ["MSDS Attached:", "msdsAttached"],
            ["Sample Required:", "sampleRequired"],
            ["Compatibility Instruction Required:", "compatibilityRequired"],
          ].map(([label, key]) => (
            <tr key={key}>
              <td>{label}</td>
              <td colSpan={2}>
                <Tick label="Yes" name={key} value="Yes"
                  current={f[key]} onPick={pick(key)} locked={lockA} />
              </td>
              <td>
                <Tick label="No" name={key} value="No"
                  current={f[key]} onPick={pick(key)} locked={lockA} />
              </td>
            </tr>
          ))}

          <tr>
            <td>Special Instructions:</td>
            <td colSpan={3} {...A}>
              <textarea rows={2} value={f.specialInstructions}
                onChange={set("specialInstructions")} readOnly={lockA} />
            </td>
          </tr>

          <tr>
            <td>Generator Name:</td>
            <td colSpan={3} {...A}>
              <input type="text" value={f.generatorName}
                onChange={set("generatorName")} readOnly={lockA} />
            </td>
          </tr>

          <tr>
            <td>Customer Name:</td>
            <td colSpan={3} {...A}>
              <input type="text" value={f.customerName}
                onChange={set("customerName")} readOnly={lockA} />
            </td>
          </tr>

          <tr>
            <td>Customer Contact No:</td>
            <td colSpan={3} {...A}>
              <input type="tel" value={f.contactNumber}
                onChange={set("contactNumber")} readOnly={lockA}
                placeholder={lockA ? "" : "0731234567"} />
            </td>
          </tr>

          <tr>
            <td {...A}>
              Customer Signature:
              <SignaturePad value={f.signature}
                onChange={(v) => onChange({ signature: v })} locked={lockA} />
            </td>
            <td colSpan={3} {...A}>
              <div className="wvf-sigdate">
                <span>Date:</span>
                <input type="date" value={f.declarationDate}
                  onChange={set("declarationDate")} readOnly={lockA} />
              </div>
            </td>
          </tr>
        </tbody>
      </table>

      <p className="wvf-notes">
        ATTACH MATERIAL SAFETY DATA SHEET FOR WASTE STREAM
        <span>
          (Should this not be provided, additional costs for research and
          identification may be incurred)
        </span>
      </p>

      {/* MSDS: uploadable by the customer, viewable by the office */}
      {mode !== "customer" && (
        <div className="wvf-msds">
          {msdsUrl ? (
            <a className="file" href={msdsUrl} target="_blank" rel="noopener noreferrer">
              View attached MSDS
            </a>
          ) : (
            <span className="name none">No MSDS attached</span>
          )}
        </div>
      )}

      {mode === "customer" && (
        <div className="wvf-msds">
          <label className="file">
            Choose MSDS file
            <input
              type="file"
              accept=".pdf,.doc,.docx,image/*"
              style={{ display: "none" }}
              onChange={(e) => onMsdsChange?.(e.target.files?.[0] ?? null)}
            />
          </label>
          {msdsFile ? (
            <>
              <span className="name">{msdsFile.name}</span>
              <button type="button" onClick={() => onMsdsChange?.(null)}>
                Remove
              </button>
            </>
          ) : (
            <span className="name none">No file attached</span>
          )}
        </div>
      )}

      <p className="wvf-turnaround">7 DAYS TURNAROUND TIME FOR QUOTATION</p>

      {/* ─────────── SECTION B ─────────── */}
      <table>
        <colgroup>
          <col style={{ width: "26%" }} />
          <col style={{ width: "10%" }} />
          <col style={{ width: "10%" }} />
          <col style={{ width: "10%" }} />
          <col style={{ width: "44%" }} />
        </colgroup>
        <tbody>
          <tr className="band">
            <td colSpan={5}>SECTION B: FOR OFFICE USE ONLY</td>
          </tr>

          <tr>
            <td>Verification Item</td>
            <td className="c">Yes</td>
            <td className="c">No</td>
            <td className="c">N/A</td>
            <td>Comments / Reference</td>
          </tr>

          {CHECKLIST_ROWS.map(({ key, label }) => (
            <tr key={key}>
              <td>{label}</td>
              {["Yes", "No", "N/A"].map((opt) => (
                <td key={opt} className="c">
                  <Tick label="" name={key} value={opt}
                    current={f[key]} onPick={pick(key)} locked={lockB} />
                </td>
              ))}
              <td {...B}>
                <input type="text"
                  value={f.checklistComments[key] || ""}
                  onChange={setComment(key)} readOnly={lockB} />
              </td>
            </tr>
          ))}

          <tr>
            <td>Decision:</td>
            <td colSpan={2}>
              <Tick label="Accepted" name="decision" value="Accepted"
                current={f.decision} onPick={pick("decision")} locked={lockB} />
            </td>
            <td>
              <Tick label="Rejected" name="decision" value="Rejected"
                current={f.decision} onPick={pick("decision")} locked={lockB} />
            </td>
            <td>
              <Tick label="Hold for Review" name="decision" value="Hold for Review"
                current={f.decision} onPick={pick("decision")} locked={lockB} />
            </td>
          </tr>

          <tr>
            <td>Reason / Ref:</td>
            <td colSpan={4} {...B}>
              <input type="text" value={f.reason}
                onChange={set("reason")} readOnly={lockB} />
            </td>
          </tr>

          <tr>
            <td {...B}>
              Completed by:{" "}
              {staffMap && !lockB ? (
                <select
                  className="wvf-staff"
                  value={f.completedBy}
                  onChange={(e) =>
                    onChange({
                      completedBy: e.target.value,
                      designation: staffMap[e.target.value] || "",
                    })
                  }
                >
                  <option value="">Select</option>
                  {Object.keys(staffMap).map((name) => (
                    <option key={name} value={name}>{name}</option>
                  ))}
                </select>
              ) : (
                <input type="text" style={{ width: "55%" }}
                  value={f.completedBy} onChange={set("completedBy")} readOnly={lockB} />
              )}
            </td>
            <td colSpan={4} data-locked="true">
              {/* Designation is derived from the staff list so titles stay correct */}
              Designation:{" "}
              <input type="text" style={{ width: "70%" }}
                value={f.designation} readOnly />
            </td>
          </tr>

          <tr>
            <td colSpan={3} {...B}>
              Signature:
              <SignaturePad value={f.verifierSignature}
                onChange={(v) => onChange({ verifierSignature: v })} locked={lockB} />
            </td>
            <td colSpan={2} {...B}>
              <div className="wvf-sigdate">
                <span>Date:</span>
                <input type="date" value={f.verificationDate}
                  onChange={set("verificationDate")} readOnly={lockB} />
              </div>
            </td>
          </tr>
        </tbody>
      </table>

      <div className="wvf-foot">
        <span className="controlled">
          Controlled document: retain with arrival verification records and
          supporting evidence, where applicable.
        </span>

        {onSubmit && (
          <div style={{ textAlign: "right" }}>
            {missing.length > 0 && (
              <div className="wvf-missing">
                Still needed: {missing.join(", ")}
              </div>
            )}
            <button
              type="button"
              className="wvf-submit"
              disabled={submitting || missing.length > 0}
              onClick={onSubmit}
            >
              {submitting
                ? "Saving\u2026"
                : mode === "office"
                ? "Save verification"
                : "Submit form"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
