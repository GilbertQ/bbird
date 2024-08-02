import React, { useState } from 'react';
import { 
  Button, 
  Table, 
  TableBody, 
  TableCell, 
  TableContainer, 
  TableHead, 
  TableRow, 
  Paper, 
  Typography,
  Box
} from '@mui/material';
import { styled } from '@mui/material/styles';

const Input = styled('input')({
  display: 'none',
});

const ValidB = () => {
    const [csvData, setCsvData] = useState([]);
    const [summary, setSummary] = useState({ total: 0, valid: 0, invalid: 0 });
  
    const handleFileUpload = (event) => {
      const file = event.target.files[0];
      const reader = new FileReader();
  
      reader.onload = (e) => {
        const content = e.target.result;
        const lines = content.split('\n');
        const headers = lines[0].split(',').map(header => header.trim());
        headers.push('Valid Row Format');
  
        let validCount = 0;
        let invalidCount = 0;
  
        const data = lines.slice(1)
          .filter(line => line.trim() !== '') // Filter out empty lines
          .map(line => {
            const values = line.split(',').map(value => value.trim());
            const isValidFormat = values.length === 4 && 
                                  /^\d{4}\.\d{1,2}\.\d{1,2}$/.test(values[0]) && 
                                  !isNaN(parseFloat(values[2]));
            values.push(isValidFormat ? 'Valid' : 'Invalid');
            
            if (isValidFormat) validCount++;
            else invalidCount++;
  
            return values;
          });
  
        setCsvData([headers, ...data]);
        setSummary({
          total: data.length,
          valid: validCount,
          invalid: invalidCount
        });
      };

    reader.readAsText(file);
  };

  return (
    <div>
      <label htmlFor="csv-upload">
        <Input
          accept=".csv"
          id="csv-upload"
          type="file"
          onChange={handleFileUpload}
        />
        <Button variant="contained" component="span">
          Upload CSV
        </Button>
      </label>

      {csvData.length > 0 && (
        <>
          <Box mt={2} mb={2}>
            <Typography>
              Total rows: {summary.total}, 
              Total Valid rows: {summary.valid}, 
              Total Invalid rows: {summary.invalid}
            </Typography>
          </Box>
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  {csvData[0].map((header, index) => (
                    <TableCell key={index}>{header}</TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {csvData.slice(1).map((row, rowIndex) => (
                  <TableRow key={rowIndex}>
                    {row.map((cell, cellIndex) => (
                      <TableCell key={cellIndex}>{cell}</TableCell>
                    ))}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </>
      )}
    </div>
  );
};

export default ValidB;