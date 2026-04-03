// Google Apps Script for saving form submissions to a Google Sheet using the Sheet ID
// 1. Create a new Google Sheet.
// 2. Go to Extensions -> Apps Script.
// 3. Paste this code and replace YOUR_SPREADSHEET_ID_HERE with the ID of your sheet (from the URL).
// 4. Click Deploy -> New Deployment -> Select "Web app".
// 5. Execute as: "Me"
// 6. Who has access: "Anyone".
// 7. Click Deploy, Authorize access, and copy the Web App URL!
// 8. Put the URL in your index.html script!

const SPREADSHEET_ID = '1I9PYgoSQPeeL9fGkgqcAqRRFwQi3ypKFl2518C8uJ1A';

function doPost(e) {
  // Lock to handle concurrent submissions correctly
  const lock = LockService.getScriptLock()
  lock.tryLock(10000);

  try {
    const doc = SpreadsheetApp.openById(SPREADSHEET_ID);
    const sheet = doc.getSheets()[0];

    // Add headers if the sheet is completely empty
    if (sheet.getLastRow() === 0) {
      sheet.appendRow(['Timestamp', 'Name', 'Phone', 'Type', 'PaymentPlan']);
    }

    const timestamp = new Date();
    // Parse fields safely (matching with HTML form inputs "name", "phone", "type", "payment")
    const name = e.parameter.name || '';
    const phone = e.parameter.phone || '';
    const type = e.parameter.type || '';
    const payment = e.parameter.payment || '';

    sheet.appendRow([timestamp, name, phone, type, payment]);

    // Return JSON Success Response (Fixes CORS issue)
    return ContentService
      .createTextOutput(JSON.stringify({ "result": "success", "row": sheet.getLastRow() }))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (error) {
    // Return Error Response cleanly
    return ContentService
      .createTextOutput(JSON.stringify({ "result": "error", "error": error.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  } finally {
    lock.releaseLock();
  }
}
