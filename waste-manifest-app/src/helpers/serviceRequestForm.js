/* =====================================================================
   serviceRequestForm.js
   One place that knows how a service_requests row maps onto the
   WasteVerificationForm shape, and back onto the verify payload.

   Both the review drawer and the print/email page use this, so the
   supervisor's screen and the customer's copy can never drift apart.
   ===================================================================== */

import { EMPTY_FORM } from "../components/WasteVerificationForm";

/* DB item_key  →  form key, for service_request_checklist_items */
const DB_KEY_MAP = {
  vehicle_reported:     "vehicleReported",
  waste_description:    "wasteDescription",
  packaging_safety:     "packagingSafety",
  visual_inspection:    "visualInspection",
  photos_taken:         "photosTaken",
  waste_accepted_check: "wasteAcceptedCheck",
};

/* form key  →  DB item_key, for the save payload */
export const FORM_KEY_MAP = Object.fromEntries(
  Object.entries(DB_KEY_MAP).map(([db, form]) => [form, db])
);

const dateOnly = (v) => (v ? String(v).split("T")[0] : "");
const yesNo = (v) => (v === true ? "Yes" : v === false ? "No" : "");

/** Build the five waste-stream rows, padding to a full five lines. */
function toStreams(rows) {
  const lines = Array.isArray(rows) ? rows : [];
  const byLine = new Map(
    lines
      .filter(Boolean)
      .map((r) => [Number(r.line_no) || 0, r])
  );

  return Array.from({ length: 5 }, (_, i) => {
    const row = byLine.get(i + 1) || lines[i] || {};
    return {
      description: row.description ?? "",
      volume: row.volume == null ? "" : String(row.volume),
    };
  });
}

/**
 * service_requests row (plus joined checklist_items and waste_streams)
 * → WasteVerificationForm data object.
 */
export function toFormData(sr) {
  if (!sr) return { ...EMPTY_FORM };

  const comments = { ...EMPTY_FORM.checklistComments };
  (sr.checklist_items || []).forEach((item) => {
    if (!item) return;
    const key = DB_KEY_MAP[item.item_key];
    if (key && item.comment) comments[key] = item.comment;
  });

  return {
    ...EMPTY_FORM,

    // ── Section A: the customer's declaration ──
    vehicleRegistration:   sr.vehicle_registration   || "",
    driverName:            sr.driver_name            || "",
    wasteStreams:          toStreams(sr.waste_streams),
    wasteType:             sr.waste_type             || "",
    wasteForm:             sr.waste_form             || "",
    disposalReason:        sr.disposal_reason        || "",
    deliveryOrCollection:  sr.delivery_or_collection || "",
    requestDate:           dateOnly(sr.request_date),
    eta:                   sr.eta_time || "",
    wirNumber:             sr.wir_number             || "",
    poReferenceNumber:     sr.po_reference_number    || "",
    msdsAttached:          sr.msds_attached == null
                             ? (sr.msds_document ? "Yes" : "")
                             : yesNo(sr.msds_attached),
    sampleRequired:        yesNo(sr.sample_required),
    compatibilityRequired: yesNo(sr.compatibility_required),
    specialInstructions:   sr.special_instructions   || "",
    generatorName:         sr.generator_name         || "",
    customerName:          sr.customer_name          || "",
    contactNumber:         sr.contact_number         || "",
    signature:             sr.signature              || "",
    declarationDate:       dateOnly(sr.declaration_date),

    // ── Section B: what the receiving point found ──
    vehicleReported:    sr.vehicle_reported_status  || "",
    wasteDescription:   sr.waste_description_status || "",
    packagingSafety:    sr.packaging_status         || "",
    visualInspection:   sr.visual_inspection_status || "",
    photosTaken:        sr.photos_taken_status      || "",
    wasteAcceptedCheck: sr.acceptance_check_status  || "",
    checklistComments:  comments,
    decision:           sr.decision                 || "",
    reason:             sr.decision_reason          || "",
    completedBy:        sr.completed_by             || "",
    designation:        sr.designation              || "",
    verifierSignature:  sr.verifier_signature       || "",
    verificationDate:   dateOnly(sr.verification_date) ||
                          new Date().toISOString().split("T")[0],
  };
}

/**
 * Form data → the body expected by
 * PUT /api/service-requests/:id/verify
 */
export function toVerifyPayload(f) {
  return {
    vehicleReported:    f.vehicleReported,
    wasteDescription:   f.wasteDescription,
    packagingSafety:    f.packagingSafety,
    visualInspection:   f.visualInspection,
    photosTaken:        f.photosTaken,
    wasteAcceptedCheck: f.wasteAcceptedCheck,
    decision:           f.decision,
    reason:             f.reason,
    completedBy:        f.completedBy,
    designation:        f.designation,
    signature:          f.verifierSignature,
    verificationDate:   f.verificationDate,
    verificationComments: f.reason,
    checklistComments:  f.checklistComments,
  };
}

/**
 * Section B is complete when every item is answered, every "No" carries a
 * comment, and the sign-off is filled. N/A needs no comment.
 */
export function officeMissing(f) {
  const keys = Object.keys(FORM_KEY_MAP);
  const out = [];

  if (keys.some((k) => !f[k])) out.push("all checklist items");

  const noWithoutComment = keys.filter(
    (k) => f[k] === "No" && !(f.checklistComments?.[k] || "").trim()
  );
  if (noWithoutComment.length) out.push("a comment on every No");

  if (!f.decision.trim())          out.push("decision");
  if (!f.reason.trim())            out.push("reason / ref");
  if (!f.completedBy.trim())       out.push("completed by");
  if (!f.verifierSignature.trim()) out.push("signature");
  if (!f.verificationDate.trim())  out.push("date");

  return out;
}
