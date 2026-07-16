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
  // Assuming row 1 is header
  let headers = [];
  
  worksheet.eachRow((row, rowNumber) => {
    if (rowNumber === 1) {
      row.eachCell((cell, colNumber) => {
        headers[colNumber] = cell.text;
      });
    } else {
      let rowData = { _rowNumber: rowNumber };
      row.eachCell((cell, colNumber) => {
        const header = headers[colNumber] || `Col_${colNumber}`;
        rowData[header] = cell.text;
      });
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
