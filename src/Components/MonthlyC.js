import React, { useState } from 'react';
import { Box, Button, Typography } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import Papa from 'papaparse';

const MonthlyC = () => {
  const [data, setData] = useState([]);
  const theme = useTheme();

  const handleFileUpload = (event) => {
    const file = event.target.files[0];

    if (file) {
      Papa.parse(file, {
        complete: (result) => {
          const rawData = result.data.slice(1); // Skip the header
          
          const parsedData = rawData.reduce((acc, row) => {
            if (Array.isArray(row) && row.length >= 3) {
              const [date, category, price] = row;
              const month = date.substring(0, 7); // Extract YYYY-MM

              if (!acc[month]) acc[month] = {};
              if (!acc[month][category]) acc[month][category] = 0;
              acc[month][category] += parseFloat(price);

              return acc;
            } else {
              console.error("Invalid row format:", row);
              return acc;
            }
          }, {});

          // Transform the parsed data into a format suitable for the chart
          const chartData = Object.keys(parsedData).map((month) => {
            const categories = parsedData[month];
            return { month, ...categories };
          });

          setData(chartData);
        },
        header: true,
        skipEmptyLines: true,
      });
    }
  };

  return (
    <Box sx={{ p: 2 }}>
      <Typography variant="h6" gutterBottom>
        Upload CSV and View Monthly Totals by Category
      </Typography>
      <Button variant="contained" component="label">
        Upload CSV
        <input type="file" accept=".csv" hidden onChange={handleFileUpload} />
      </Button>
      {data.length > 0 && (
        <Box sx={{ mt: 4 }}>
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={data}>
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Legend />
              {Object.keys(data[0]).filter((key) => key !== 'month').map((key) => (
                <Bar key={key} dataKey={key} fill={theme.palette.primary.main} />
              ))}
            </BarChart>
          </ResponsiveContainer>
        </Box>
      )}
    </Box>
  );
};

export default MonthlyC;
