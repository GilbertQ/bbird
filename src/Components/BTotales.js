import React, { useState, useEffect } from 'react';
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
  Box,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

const Input = styled('input')({
  display: 'none',
});

const BTotales = () => {
  const [csvData, setCsvData] = useState([]);
  const [summary, setSummary] = useState({ total: 0, valid: 0, invalid: 0 });
  const [showChart, setShowChart] = useState(false);
  const [chartData, setChartData] = useState(null);
  const [categoryChartData, setCategoryChartData] = useState(null);
  const [groupedData, setGroupedData] = useState({});

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
        .filter(line => line.trim() !== '')
        .map(line => {
          if (line.endsWith(',')) {
            line = line.slice(0, -1);
          }
          const values = line.split(',').map(value => value.trim());
          const isValidFormat = values.length === 4 && 
                                /^\d{4}\.\d{1,2}\.\d{1,2}$/.test(values[0]) && 
                                !isNaN(parseFloat(values[2]));
          values.push(isValidFormat ? 'Valid' : 'Invalid');
          
          if (isValidFormat) validCount++;
          else invalidCount++;

          return values;
        });

      // Sorting the data based on the last column (Valid Row Format)
      data.sort((a, b) => {
        const lastColA = a[a.length - 1];
        const lastColB = b[b.length - 1];
      
        if (lastColA !== lastColB) {
          return lastColA.localeCompare(lastColB); // Sort by last column
        } else {
          // Convert yyyy.mm.dd to yyyy-mm-dd for proper Date parsing
          const dateA = new Date(a[0].replace(/\./g, '-'));
          const dateB = new Date(b[0].replace(/\./g, '-'));
          return dateA - dateB; // Compare dates
        }
      });

      setCsvData([headers, ...data]);
      setSummary({
        total: data.length,
        valid: validCount,
        invalid: invalidCount,
      });
    };

    reader.readAsText(file);
  };

  useEffect(() => {
    if (csvData.length > 1) {
      // Group data by month
      const grouped = {};
      csvData.slice(1).forEach((row) => {
        const date = new Date(row[0].replace(/\./g, '-'));
        const month = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        if (!grouped[month]) grouped[month] = [];
        grouped[month].push(row);
      });
      setGroupedData(grouped);

      // Calculate monthly totals
      const monthlyTotals = {};
      csvData.slice(1).forEach((row) => {
        const date = new Date(row[0].replace(/\./g, '-'));
        const month = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        const price = parseFloat(row[2]);
        if (!isNaN(price)) {
          monthlyTotals[month] = (monthlyTotals[month] || 0) + price;
        }
      });

      // Create chart data for total by month
      const sortedMonths = Object.keys(monthlyTotals).sort();
      const chartData = {
        labels: sortedMonths,
        datasets: [
          {
            label: 'Total by Month',
            data: sortedMonths.map((month) => monthlyTotals[month]),
            borderColor: 'rgb(75, 192, 192)',
            tension: 0.1,
          },
        ],
      };
      setChartData(chartData);

      // Calculate category totals
      const categoryTotals = {};
      csvData.slice(1).forEach((row) => {
        const category = row[1];
        const price = parseFloat(row[2]);
        if (!isNaN(price)) {
          categoryTotals[category] = (categoryTotals[category] || 0) + price;
        }
      });

      // Sort categories by total in descending order
      const sortedCategories = Object.keys(categoryTotals).sort(
        (a, b) => categoryTotals[b] - categoryTotals[a]
      );

      // Create chart data for total by category
      const categoryChartData = {
        labels: sortedCategories,
        datasets: [
          {
            label: 'Total by Category',
            data: sortedCategories.map((category) => categoryTotals[category]),
            borderColor: 'rgb(54, 162, 235)',
            tension: 0.1,
          },
        ],
      };
      setCategoryChartData(categoryChartData);
    }
  }, [csvData]);

  return (
    <div>
      <label htmlFor="csv-upload">
        <Input accept=".csv" id="csv-upload" type="file" onChange={handleFileUpload} />
        <Button variant="contained" component="span">
          Upload CSV
        </Button>
      </label>

      {csvData.length > 0 && (
        <>
          <Box mt={2} mb={2}>
            <Typography>
              Total rows: {summary.total}, Total Valid rows: {summary.valid}, Total Invalid rows: {summary.invalid}
            </Typography>
          </Box>
          <Button
            variant="contained"
            onClick={() => setShowChart(!showChart)}
            style={{ marginBottom: '20px', marginRight: '20px' }}
          >
            {showChart ? 'Hide Charts' : 'Show Charts'}
          </Button>

          {showChart && chartData && categoryChartData && (
            <Box mb={2} style={{ display: 'flex', justifyContent: 'space-between' }}>
              <Box style={{ width: '48%', height: '400px' }}>
                <Line data={chartData} options={{ maintainAspectRatio: false }} />
              </Box>
              <Box style={{ width: '48%', height: '400px' }}>
                <Line data={categoryChartData} options={{ maintainAspectRatio: false }} />
              </Box>
            </Box>
          )}

          {Object.keys(groupedData).map((month) => (
            <div key={month}>
              <Typography variant="h6" mt={2}>{month}</Typography>
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
                    {groupedData[month].map((row, rowIndex) => (
                      <TableRow key={rowIndex}>
                        {row.map((cell, cellIndex) => (
                          <TableCell key={cellIndex}>{cell}</TableCell>
                        ))}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </div>
          ))}
        </>
      )}
    </div>
  );
};

export default BTotales;
