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
  Modal,
  MenuItem,
  Select,
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
  const [showModal, setShowModal] = useState(false);
  const [monthYear, setMonthYear] = useState('');
  const [category, setCategory] = useState('');
  const [chartData, setChartData] = useState(null);

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    const reader = new FileReader();

    reader.onload = (e) => {
      const content = e.target.result;
      const lines = content.split('\n');
      const headers = lines[0].split(',').map((header) => header.trim());
      
      const data = lines.slice(1).filter((line) => line.trim() !== '').map((line) => {
        if (line.endsWith(',')) {
          line = line.slice(0, -1);
        }
        return line.split(',').map((value) => value.trim());
      });

      setCsvData([headers, ...data]);
    };

    reader.readAsText(file);
  };

  const handleGenerateChart = () => {
    if (!csvData.length) return;

    const filteredData = csvData.slice(1).filter((row) => {
      const date = new Date(row[0].replace(/\./g, '-'));
      const month = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;

      return (
        (!monthYear || monthYear === month) &&
        (!category || category === row[1])
      );
    });

    const groupedByX = {};
    filteredData.forEach((row) => {
      const date = new Date(row[0].replace(/\./g, '-'));
      const x = monthYear ? date.getDate() : date.getMonth() + 1;
      const value = parseFloat(row[2]);
      if (!isNaN(value)) {
        groupedByX[x] = (groupedByX[x] || 0) + value;
      }
    });

    const sortedKeys = Object.keys(groupedByX).sort((a, b) => a - b);
    const chartData = {
      labels: sortedKeys,
      datasets: [
        {
          label: 'Total',
          data: sortedKeys.map((key) => groupedByX[key]),
          borderColor: 'rgb(75, 192, 192)',
          tension: 0.1,
        },
      ],
    };

    setChartData(chartData);
    setShowModal(false);
  };

  const uniqueMonthYears = Array.from(
    new Set(
      csvData.slice(1).map((row) => {
        const date = new Date(row[0].replace(/\./g, '-'));
        return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      })
    )
  );

  const uniqueCategories = Array.from(new Set(csvData.slice(1).map((row) => row[1])));

  return (
    <div>
      <label htmlFor="csv-upload">
        <Input accept=".csv" id="csv-upload" type="file" onChange={handleFileUpload} />
        <Button variant="contained" component="span">
          Upload CSV
        </Button>
      </label>

      <Button
        variant="contained"
        style={{ margin: '20px' }}
        onClick={() => setShowModal(true)}
      >
        Select Filters
      </Button>

      {chartData && (
        <Box mt={4} style={{ width: '80%', margin: '0 auto' }}>
          <Line data={chartData} options={{ maintainAspectRatio: false }} />
        </Box>
      )}

      <Modal open={showModal} onClose={() => setShowModal(false)}>
        <Box
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: 400,
            backgroundColor: 'white',
            padding: '20px',
            boxShadow: 24,
          }}
        >
          <Typography variant="h6" mb={2}>
            Select Filters
          </Typography>

          <Typography>Month-Year:</Typography>
          <Select
            fullWidth
            value={monthYear}
            onChange={(e) => setMonthYear(e.target.value)}
            displayEmpty
          >
            <MenuItem value="">All</MenuItem>
            {uniqueMonthYears.map((my) => (
              <MenuItem key={my} value={my}>
                {my}
              </MenuItem>
            ))}
          </Select>

          <Typography mt={2}>Category:</Typography>
          <Select
            fullWidth
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            displayEmpty
          >
            <MenuItem value="">All</MenuItem>
            {uniqueCategories.map((cat) => (
              <MenuItem key={cat} value={cat}>
                {cat}
              </MenuItem>
            ))}
          </Select>

          <Button
            variant="contained"
            style={{ marginTop: '20px' }}
            onClick={handleGenerateChart}
          >
            Generate Chart
          </Button>
        </Box>
      </Modal>
    </div>
  );
};

export default BTotales;
