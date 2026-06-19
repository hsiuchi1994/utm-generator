// ============================================================
// UTM Generator — Google Apps Script Backend
// ============================================================

function doGet() {
  return HtmlService.createHtmlOutputFromFile('Index')
    .setTitle('UTM Generator | ataway')
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}

// ---------- Sheet helper ----------

function getSheet() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName('UTM History');
  if (!sheet) {
    sheet = ss.insertSheet('UTM History');
    var headers = ['生成日時', '作成者', 'Original URL', 'utm_source', 'utm_medium',
                   'utm_campaign', 'utm_content', 'utm_term', 'Generated URL', 'Short URL'];
    sheet.getRange(1, 1, 1, headers.length).setValues([headers])
         .setFontWeight('bold')
         .setBackground('#FFF3C4');
    sheet.setFrozenRows(1);
    sheet.setColumnWidth(9, 400);
    sheet.setColumnWidth(10, 200);
  }
  return sheet;
}

// ---------- Save ----------

function saveLink(data) {
  try {
    var sheet = getSheet();
    var ts = Utilities.formatDate(new Date(), 'Asia/Tokyo', 'yyyy/MM/dd HH:mm');
    sheet.appendRow([
      ts,
      data.creator  || '—',
      data.originalUrl,
      data.source,
      data.medium,
      data.campaign,
      data.content  || '',
      data.term     || '',
      data.generatedUrl,
      data.shortUrl || ''
    ]);
    return { success: true };
  } catch (e) {
    return { success: false, error: e.toString() };
  }
}

// ---------- Load history ----------

function getHistory() {
  try {
    var sheet = getSheet();
    var last = sheet.getLastRow();
    if (last <= 1) return [];
    var rows = sheet.getRange(2, 1, last - 1, 10).getValues();
    return rows.reverse().map(function(r) {
      return {
        timestamp:    r[0],
        creator:      r[1],
        originalUrl:  r[2],
        source:       r[3],
        medium:       r[4],
        campaign:     r[5],
        content:      r[6],
        term:         r[7],
        generatedUrl: r[8],
        shortUrl:     r[9]
      };
    });
  } catch (e) {
    return [];
  }
}

// ---------- URL shortener (TinyURL) ----------

function shortenUrl(url) {
  try {
    var res = UrlFetchApp.fetch(
      'https://tinyurl.com/api-create.php?url=' + encodeURIComponent(url),
      { muteHttpExceptions: true }
    );
    var short = res.getContentText().trim();
    if (short.startsWith('http')) return { success: true, shortUrl: short };
    return { success: false, error: 'Unexpected response: ' + short };
  } catch (e) {
    return { success: false, error: e.toString() };
  }
}
