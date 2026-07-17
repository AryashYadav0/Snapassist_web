import ExcelJS from 'exceljs';

export const readWorkbook = async (file) => {
  const arrayBuffer = await file.arrayBuffer();
  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.load(arrayBuffer);
  
  const sheets = [];
  workbook.eachSheet((worksheet, sheetId) => {
    // Extract basic information about the sheet
    const rowCount = worksheet.rowCount;
    // Let's assume the first row is headers for data mapping, or row 2.
    // In typical inventory sheets, headers are around row 1-3.
    // We will just expose the sheet names for now.
    sheets.push({
      id: sheetId,
      name: worksheet.name,
      rowCount: rowCount
    });
  });

  return { workbook, sheets, originalFile: file };
};

export const parseSheetData = (worksheet) => {
  if (!worksheet) return [];
  
  const data = [];
  let headers = [];
  let maxCol = 0;
  
  worksheet.eachRow((row, rowNumber) => {
    if (rowNumber === 1) {
      // Read headers — use includeEmpty so we capture all columns
      row.eachCell({ includeEmpty: true }, (cell, colNumber) => {
        headers[colNumber] = cell.text || `Col_${colNumber}`;
        if (colNumber > maxCol) maxCol = colNumber;
      });
    } else {
      let rowData = { _rowNumber: rowNumber };
      // Always iterate all header columns so no column is skipped when empty
      for (let colNumber = 1; colNumber <= maxCol; colNumber++) {
        const header = headers[colNumber] || `Col_${colNumber}`;
        const cell = row.getCell(colNumber);
        rowData[header] = cell.text ?? '';
      }
      data.push(rowData);
    }
  });
  
  return data;
};

export const updateWorkbook = async (workbook, sheetName, rowNumber, columnHeader, value) => {
  const worksheet = workbook.getWorksheet(sheetName);
  if (!worksheet) throw new Error("Worksheet not found");

  // Find column index for the header
  let targetCol = -1;
  const headerRow = worksheet.getRow(1);
  headerRow.eachCell((cell, colNumber) => {
    if (cell.text === columnHeader) {
      targetCol = colNumber;
    }
  });

  if (targetCol === -1) {
    throw new Error(`Column ${columnHeader} not found in sheet ${sheetName}`);
  }

  const row = worksheet.getRow(rowNumber);
  row.getCell(targetCol).value = value;
  row.commit();

  return workbook;
};

export const saveWorkbook = async (workbook, originalFilename) => {
  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
  
  // Create download link
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `updated_${originalFilename}`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  window.URL.revokeObjectURL(url);
};

/**
 * Creates and downloads a blank Excel template with all required inventory columns.
 * Opens directly in Excel when downloaded.
 */
export const createAndDownloadTemplate = async () => {
  const workbook = new ExcelJS.Workbook();
  workbook.creator = 'SnapAssist AI';
  workbook.created = new Date();

  const worksheet = workbook.addWorksheet('Inventory');

  // ✅ All required columns — including Model & Serial Number
  worksheet.columns = [
    { header: 'Store Code',    key: 'store_code',    width: 15 },
    { header: 'Store Name',    key: 'store_name',    width: 25 },
    { header: 'Location',      key: 'location',      width: 20 },
    { header: 'Model',         key: 'model',         width: 20 },
    { header: 'Serial Number', key: 'serial_number', width: 22 },
    { header: 'Status',        key: 'status',        width: 15 },
  ];

  // Style the header row — blue background, white bold text
  const headerRow = worksheet.getRow(1);
  headerRow.height = 28;
  headerRow.eachCell((cell) => {
    cell.font      = { bold: true, color: { argb: 'FFFFFFFF' }, size: 11 };
    cell.fill      = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF2563EB' } };
    cell.alignment = { vertical: 'middle', horizontal: 'center' };
    cell.border    = {
      top: { style: 'thin' }, bottom: { style: 'thin' },
      left: { style: 'thin' }, right: { style: 'thin' },
    };
  });

  // Add 20 empty data rows (ready to fill)
  for (let i = 0; i < 20; i++) {
    const row = worksheet.addRow({});
    row.eachCell({ includeEmpty: true }, (cell) => {
      cell.border = {
        top: { style: 'hair' }, bottom: { style: 'hair' },
        left: { style: 'hair' }, right: { style: 'hair' },
      };
    });
  }

  // Download as .xlsx — opens in Microsoft Excel / Google Sheets
  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'SnapAssist_Inventory_Template.xlsx';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  window.URL.revokeObjectURL(url);
};
