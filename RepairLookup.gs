/**
 * BuildsByVic — Repair Status Lookup API
 *
 * SETUP:
 * 1. Open your Google Sheet.
 * 2. Go to Extensions > Apps Script.
 * 3. Delete any placeholder code and paste this whole file in.
 * 4. If your tab isn't named "Sheet1", update SHEET_NAME below to match.
 * 5. Click Deploy > New deployment.
 *    - Type: Web app
 *    - Execute as: Me
 *    - Who has access: Anyone
 * 6. Click Deploy, authorize when prompted, and copy the Web App URL.
 * 7. Paste that URL into track.html where it says PASTE_YOUR_APPS_SCRIPT_URL_HERE.
 *
 * This script NEVER exposes Customer Name, Phone, Email, Device, Issue, or
 * Notes to the website — only Status, Start Date, and Est. Completion are
 * ever returned, and only when both the ticket number AND the phone/email
 * match the same row.
 */

const SHEET_NAME = 'Sheet1'; // change if your tab has a different name

function doGet(e) {
  try {
    const params = e.parameter;
    const ticketInput = (params.ticket || '').toString().trim().toUpperCase();
    const contactInput = (params.contact || '').toString().trim().toLowerCase();

    if (!ticketInput || !contactInput) {
      return jsonOutput({ success: false, error: 'Missing ticket number or contact info.' });
    }

    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_NAME);
    if (!sheet) {
      return jsonOutput({ success: false, error: 'Server configuration error. Contact BuildsByVic directly.' });
    }

    const data = sheet.getDataRange().getValues();
    if (data.length < 2) {
      return jsonOutput({ success: false, error: 'No matching repair found.' });
    }

    const headers = data[0].map(h => String(h).trim());
    const col = {};
    headers.forEach((h, i) => { col[h] = i; });

    const required = ['Ticket Number', 'Phone', 'Email', 'Status', 'Start Date', 'Est. Completion'];
    for (const key of required) {
      if (!(key in col)) {
        return jsonOutput({ success: false, error: 'Server configuration error. Contact BuildsByVic directly.' });
      }
    }

    for (let i = 1; i < data.length; i++) {
      const row = data[i];
      const rowTicket = String(row[col['Ticket Number']]).trim().toUpperCase();

      if (rowTicket === ticketInput) {
        const rowPhoneDigits = String(row[col['Phone']] || '').replace(/\D/g, '');
        const rowEmail = String(row[col['Email']] || '').trim().toLowerCase();
        const inputDigits = contactInput.replace(/\D/g, '');

        const phoneMatches = rowPhoneDigits.length >= 7 && inputDigits.length >= 7 && rowPhoneDigits === inputDigits;
        const emailMatches = rowEmail.length > 0 && rowEmail === contactInput;

        if (phoneMatches || emailMatches) {
          return jsonOutput({
            success: true,
            status: row[col['Status']] || 'Not yet updated',
            startDate: formatDate(row[col['Start Date']]),
            estCompletion: formatDate(row[col['Est. Completion']])
          });
        }

        // Ticket exists but contact didn't match — stop looping, but DO NOT
        // reveal that the ticket exists. Fall through to the generic error
        // below so a stranger can't confirm a valid ticket number by guessing.
        break;
      }
    }

    return jsonOutput({
      success: false,
      error: 'No matching repair found. Double-check your ticket number and the phone or email you used at drop-off.'
    });

  } catch (err) {
    return jsonOutput({ success: false, error: 'Something went wrong. Please try again or contact BuildsByVic directly.' });
  }
}

function formatDate(value) {
  if (!value) return 'TBD';
  if (Object.prototype.toString.call(value) === '[object Date]') {
    return Utilities.formatDate(value, Session.getScriptTimeZone(), 'MMM d, yyyy');
  }
  return String(value);
}

function jsonOutput(obj) {
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}
