import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Typography, 
  Container, 
  TextField, 
  Button, 
  Select, 
  MenuItem, 
  Table, 
  TableBody, 
  TableCell, 
  TableContainer, 
  TableHead, 
  TableRow, 
  Paper 
} from '@mui/material';
import { getProducts, createInvoice } from '../services/api';

function CustomerOrder() {
  const [products, setProducts] = useState([]);
  const [order, setOrder] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState('');
  const [quantity, setQuantity] = useState(1);
  const navigate = useNavigate();

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const response = await getProducts();
      setProducts(response.data);
    } catch (error) {
      console.error('Failed to fetch products', error);
    }
  };

  const handleAddToOrder = () => {
    const product = products.find(p => p._id === selectedProduct);
    if (product && product.stock >= quantity) {
      const orderItem = {
        product: product._id,
        name: product.name,
        hsnCode: product.hsnCode,
        unit: product.unit,
        quantity,
        rate: product.rate,
        batch: product.batch,
        mfgDate: product.mfgDate,
        expDate: product.expDate,
        cgstPercentage: product.cgstPercentage,
        sgstPercentage: product.sgstPercentage,
        total: product.rate * quantity,
        cgstAmount: (product.rate * quantity * product.cgstPercentage) / 100,
        sgstAmount: (product.rate * quantity * product.sgstPercentage) / 100,
      };
      setOrder([...order, orderItem]);
      setSelectedProduct('');
      setQuantity(1);
    } else {
      alert('Not enough stock');
    }
  };

  const handleGenerateInvoice = async () => {
    try {
      const response = await createInvoice({ items: order });
      navigate(`/invoice/${response.data._id}`);
    } catch (error) {
      console.error('Failed to generate invoice', error);
    }
  };

  return (
    <Container maxWidth="lg">
      <Typography variant="h4" gutterBottom>Create Order</Typography>
      <div style={{ marginBottom: '20px' }}>
        <Select
          value={selectedProduct}
          onChange={(e) => setSelectedProduct(e.target.value)}
          style={{ marginRight: '10px' }}
        >
          <MenuItem value="">Select a product</MenuItem>
          {products.map((product) => (
            <MenuItem key={product._id} value={product._id}>{product.name} (Stock: {product.stock})</MenuItem>
          ))}
        </Select>
        <TextField
          type="number"
          value={quantity}
          onChange={(e) => setQuantity(parseInt(e.target.value))}
          inputProps={{ min: 1 }}
          style={{ marginRight: '10px' }}
        />
        <Button onClick={handleAddToOrder} variant="contained" color="primary">
          Add to Order
        </Button>
      </div>
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Product</TableCell>
              <TableCell>HSN Code</TableCell>
              <TableCell>Unit</TableCell>
              <TableCell>Quantity</TableCell>
              <TableCell>Rate</TableCell>
              <TableCell>Batch</TableCell>
              <TableCell>Mfg Date</TableCell>
              <TableCell>Exp Date</TableCell>
              <TableCell>CGST %</TableCell>
              <TableCell>SGST %</TableCell>
              <TableCell>Total</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {order.map((item, index) => (
              <TableRow key={index}>
                <TableCell>{item.name}</TableCell>
                <TableCell>{item.hsnCode}</TableCell>
                <TableCell>{item.unit}</TableCell>
                <TableCell>{item.quantity}</TableCell>
                <TableCell>₹{item.rate}</TableCell>
                <TableCell>{item.batch || 'N/A'}</TableCell>
                <TableCell>{item.mfgDate || 'N/A'}</TableCell>
                <TableCell>{item.expDate || 'N/A'}</TableCell>
                <TableCell>{item.cgstPercentage}%</TableCell>
                <TableCell>{item.sgstPercentage}%</TableCell>
                <TableCell>₹{item.total.toFixed(2)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      <Button
        onClick={handleGenerateInvoice}
        variant="contained"
        color="primary"
        style={{ marginTop: '20px' }}
        disabled={order.length === 0}
      >
        Generate Invoice
      </Button>
    </Container>
  );
}

export default CustomerOrder;