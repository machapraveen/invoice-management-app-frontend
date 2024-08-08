// frontend/src/components/Dashboard.js
import React, { useState, useEffect } from 'react';
import { Typography, Container, Grid, Paper } from '@mui/material';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { getSalesData, getTopProducts } from '../services/api';

function Dashboard() {
  const [salesData, setSalesData] = useState([]);
  const [topProducts, setTopProducts] = useState([]);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const salesResponse = await getSalesData();
      const productsResponse = await getTopProducts();
      setSalesData(salesResponse.data);
      setTopProducts(productsResponse.data);
    } catch (error) {
      console.error('Failed to fetch dashboard data', error);
    }
  };

  return (
    <Container maxWidth="lg">
      <Typography variant="h4" gutterBottom>Dashboard</Typography>
      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <Paper style={{ padding: '20px' }}>
            <Typography variant="h6" gutterBottom>Monthly Sales</Typography>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={salesData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="_id" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="sales" fill="#8884d8" />
              </BarChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>
        <Grid item xs={12} md={4}>
          <Paper style={{ padding: '20px' }}>
            <Typography variant="h6" gutterBottom>Top Selling Products</Typography>
            {topProducts.map((product, index) => (
              <Typography key={index}>{product.name}: {product.unitsSold} units</Typography>
            ))}
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
}

export default Dashboard;
