# Google Sheets Generation

Use the gspread library with a service account or OAuth credentials. Requires the Google Sheets API and Google Drive API enabled.

Setup: Check if a Google Sheets integration is available via Replit integrations first. If not, the user needs to provide a service account JSON key.

```python
import gspread
from google.oauth2.service_account import Credentials

scopes = [
    "https://www.googleapis.com/auth/spreadsheets",
    "https://www.googleapis.com/auth/drive",
]
creds = Credentials.from_service_account_file("service_account.json", scopes=scopes)
gc = gspread.authorize(creds)

sh = gc.create("Sales Report Q1")
ws = sh.sheet1
ws.update_title("Revenue")

ws.update("A1:D1", [["Product", "Units", "Price", "Revenue"]])
data = [["Widget", 120, 9.99], ["Gadget", 80, 14.50], ["Gizmo", 200, 4.25]]
ws.update(f"A2:C{len(data)+1}", data)

for i in range(2, len(data) + 2):
    ws.update_acell(f"D{i}", f"=B{i}*C{i}")

ws.format("A1:D1", {
    "backgroundColor": {"red": 0.18, "green": 0.33, "blue": 0.59},
    "textFormat": {"bold": True, "foregroundColor": {"red": 1, "green": 1, "blue": 1}},
    "horizontalAlignment": "CENTER"
})
ws.format(f"C2:D{len(data)+1}", {"numberFormat": {"type": "CURRENCY", "pattern": "$#,##0.00"}})
ws.freeze(rows=1)

sh.share("user@example.com", perm_type="user", role="writer")
print(f"Spreadsheet URL: {sh.url}")
```

Batch updates (faster for large writes):

```python
ws.batch_update([
    {"range": "A1:D1", "values": [headers]},
    {"range": f"A2:C{len(data)+1}", "values": data},
])
```

## Google Sheets gotchas

- API rate limits: 60 requests/min per user, 300 requests/min per project. Batch writes to stay under.
- `update()` overwrites — it does not append. Use `append_rows()` to add to the end.
- Formulas work the same as Excel (US-English function names).
- Charts must be created via the Sheets API v4 `batchUpdate` with `addChart` request — gspread does not have a chart helper.
- Conditional formatting requires `gspread.utils` or raw API calls.

## Alternative — upload .xlsx to Google Drive

```python
from googleapiclient.discovery import build
from googleapiclient.http import MediaFileUpload

drive = build("drive", "v3", credentials=creds)
file_metadata = {"name": "Report", "mimeType": "application/vnd.google-apps.spreadsheet"}
media = MediaFileUpload("report.xlsx",
    mimetype="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet")
file = drive.files().create(body=file_metadata, media_body=media,
    fields="id,webViewLink").execute()
print(f"Google Sheets URL: {file['webViewLink']}")
```
