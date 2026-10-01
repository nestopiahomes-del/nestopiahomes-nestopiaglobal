/**
 * Nestopia Homes lead capture endpoint.
 * Create/bind this script to a Google Sheet and deploy as a Web App.
 *
 * Required sheet headers:
 * Timestamp | Name | Email | Phone | Role | Consent | Brand | Currency | Strategy | Location |
 * Property Type | Bedrooms | Bathrooms | Guests | Gross Annual | Net Annual |
 * Monthly Profit | Return | AirROI Revenue | AirROI ADR | AirROI Occupancy | Report Filename | User Agent
 */
const SHEET_NAME = "Leads";

function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents || "{}");
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const sheet = ss.getSheetByName(SHEET_NAME) || ss.insertSheet(SHEET_NAME);

    if (sheet.getLastRow() === 0) {
      sheet.appendRow([
        "Timestamp","Name","Email","Phone","Role","Consent","Brand","Currency","Strategy","Location",
        "Property Type","Bedrooms","Bathrooms","Guests","Gross Annual","Net Annual",
        "Monthly Profit","Return","AirROI Revenue","AirROI ADR","AirROI Occupancy","Report Filename","User Agent"
      ]);
    }

    sheet.appendRow([
      new Date(),
      data.name || "",
      data.email || "",
      data.phone || "",
      data.role || "",
      data.consent ? "Yes" : "No",
      data.brand || "",
      data.currency || "",
      data.strategy || "",
      data.location || "",
      data.propertyType || "",
      data.bedrooms || "",
      data.bathrooms || "",
      data.guests || "",
      data.grossAnnual || "",
      data.netAnnual || "",
      data.monthlyProfit || "",
      data.returnMetric || "",
      data.airRoiRevenue || "",
      data.airRoiAdr || "",
      data.airRoiOccupancy || "",
      data.reportFilename || "",
      data.userAgent || e.parameter.userAgent || ""
    ]);

    return ContentService
      .createTextOutput(JSON.stringify({ok:true}))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService
      .createTextOutput(JSON.stringify({ok:false,error:String(err)}))
      .setMimeType(ContentService.MimeType.JSON);
  }
}
