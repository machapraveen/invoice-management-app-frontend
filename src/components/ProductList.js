import React, { useState, useEffect } from 'react';
import { 
  Typography, 
  Container, 
  TextField, 
  Button, 
  Table, 
  TableBody, 
  TableCell, 
  TableContainer, 
  TableHead, 
  TableRow, 
  Paper,
  Snackbar,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from '@mui/material';
import { getProducts, addProduct, updateProduct } from '../services/api';

function ProductList() {
  const [products, setProducts] = useState([]);
  const [newProduct, setNewProduct] = useState({
    name: '',
    hsnCode: '',
    unit: '',
    rate: '',
    stock: '',
    batch: '',
    mfgDate: '',
    expDate: '',
    cgstPercentage: '',
    sgstPercentage: ''
  });
  const [editingProduct, setEditingProduct] = useState(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    fetchProducts();
  }, []);

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toISOString().split('T')[0]; // Format: YYYY-MM-DD
  };

  const fetchProducts = async () => {
    try {
      const response = await getProducts();
      setProducts(response.data);
    } catch (error) {
      console.error('Failed to fetch products', error);
      setError('Failed to fetch products. Please try again.');
    }
  };

  const handleInputChange = (e, isEditForm = false) => {
    const { name, value } = e.target;
    const updatedProduct = isEditForm ? { ...editingProduct } : { ...newProduct };
    updatedProduct[name] = name === 'mfgDate' || name === 'expDate' ? formatDate(value) : value;
    if (isEditForm) {
      setEditingProduct(updatedProduct);
    } else {
      setNewProduct(updatedProduct);
    }
  };

  const validateProduct = (product) => {
    const requiredFields = ['name', 'hsnCode', 'unit', 'rate', 'stock'];
    for (let field of requiredFields) {
      if (!product[field]) {
        setError(`${field.charAt(0).toUpperCase() + field.slice(1)} is required.`);
        return false;
      }
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const productToSave = editingProduct || newProduct;
    
    if (!validateProduct(productToSave)) {
      return;
    }

    try {
      if (editingProduct) {
        await updateProduct(editingProduct._id, editingProduct);
        setSuccess('Product updated successfully.');
        setIsEditDialogOpen(false);
      } else {
        await addProduct(productToSave);
        setNewProduct({
          name: '',
          hsnCode: '',
          unit: '',
          rate: '',
          stock: '',
          batch: '',
          mfgDate: '',
          expDate: '',
          cgstPercentage: '',
          sgstPercentage: ''
        });
        setSuccess('Product added successfully.');
      }
      fetchProducts();
    } catch (error) {
      console.error('Failed to save product', error);
      if (error.error) {
        setError(error.error);
      } else if (error.details) {
        setError(`Validation failed: ${error.details.join(', ')}`);
      } else {
        setError('An unexpected error occurred. Please try again.');
      }
    }
  };

  const handleEdit = (product) => {
    setEditingProduct({ ...product });
    setIsEditDialogOpen(true);
  };

  const handleCloseEditDialog = () => {
    setEditingProduct(null);
    setIsEditDialogOpen(false);
  };

  const handleCloseSnackbar = () => {
    setError('');
    setSuccess('');
  };

  const renderProductForm = (product, isEditForm = false) => (
    <form onSubmit={handleSubmit}>
      <TextField
        label="Name (Description of Goods)"
        name="name"
        value={product.name}
        onChange={(e) => handleInputChange(e, isEditForm)}
        required
        fullWidth
        margin="normal"
      />
      <TextField
        label="HSN Code"
        name="hsnCode"
        value={product.hsnCode}
        onChange={(e) => handleInputChange(e, isEditForm)}
        required
        fullWidth
        margin="normal"
      />
      <TextField
        label="Unit"
        name="unit"
        value={product.unit}
        onChange={(e) => handleInputChange(e, isEditForm)}
        required
        fullWidth
        margin="normal"
      />
      <TextField
        label="Rate"
        name="rate"
        type="number"
        value={product.rate}
        onChange={(e) => handleInputChange(e, isEditForm)}
        required
        fullWidth
        margin="normal"
        inputProps={{ min: "0", step: "0.01" }}
      />
      <TextField
        label="Stock"
        name="stock"
        type="number"
        value={product.stock}
        onChange={(e) => handleInputChange(e, isEditForm)}
        required
        fullWidth
        margin="normal"
        inputProps={{ min: "0" }}
      />
      <TextField
        label="Batch"
        name="batch"
        value={product.batch}
        onChange={(e) => handleInputChange(e, isEditForm)}
        fullWidth
        margin="normal"
      />
      <TextField
        label="Mfg Date"
        name="mfgDate"
        type="date"
        value={product.mfgDate}
        onChange={(e) => handleInputChange(e, isEditForm)}
        fullWidth
        margin="normal"
        InputLabelProps={{ shrink: true }}
      />
      <TextField
        label="Exp Date"
        name="expDate"
        type="date"
        value={product.expDate}
        onChange={(e) => handleInputChange(e, isEditForm)}
        fullWidth
        margin="normal"
        InputLabelProps={{ shrink: true }}
      />
      <TextField
        label="CGST %"
        name="cgstPercentage"
        type="number"
        value={product.cgstPercentage}
        onChange={(e) => handleInputChange(e, isEditForm)}
        fullWidth
        margin="normal"
        inputProps={{ min: "0", max: "100", step: "0.01" }}
      />
      <TextField
        label="SGST %"
        name="sgstPercentage"
        type="number"
        value={product.sgstPercentage}
        onChange={(e) => handleInputChange(e, isEditForm)}
        fullWidth
        margin="normal"
        inputProps={{ min: "0", max: "100", step: "0.01" }}
      />
      {!isEditForm && (
        <Button type="submit" variant="contained" color="primary">
          Add Product
        </Button>
      )}
    </form>
  );

  return (
    <Container maxWidth="lg">
      <Typography variant="h4" gutterBottom>Manage Products</Typography>
      {renderProductForm(newProduct)}

      <TableContainer component={Paper} style={{ marginTop: '20px' }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Name (Description of Goods)</TableCell>
              <TableCell>HSN Code</TableCell>
              <TableCell>Unit</TableCell>
              <TableCell>Rate</TableCell>
              <TableCell>Stock</TableCell>
              <TableCell>Batch</TableCell>
              <TableCell>Mfg Date</TableCell>
              <TableCell>Exp Date</TableCell>
              <TableCell>CGST %</TableCell>
              <TableCell>SGST %</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {products.map((product) => (
              <TableRow key={product._id}>
                <TableCell>{product.name}</TableCell>
                <TableCell>{product.hsnCode}</TableCell>
                <TableCell>{product.unit}</TableCell>
                <TableCell>{product.rate}</TableCell>
                <TableCell>{product.stock}</TableCell>
                <TableCell>{product.batch || '-'}</TableCell>
                <TableCell>{formatDate(product.mfgDate) || '-'}</TableCell>
                <TableCell>{formatDate(product.expDate) || '-'}</TableCell>
                <TableCell>{product.cgstPercentage}</TableCell>
                <TableCell>{product.sgstPercentage}</TableCell>
                <TableCell>
                  <Button variant="contained" color="primary" onClick={() => handleEdit(product)}>
                    Edit
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={isEditDialogOpen} onClose={handleCloseEditDialog}>
        <DialogTitle>Edit Product</DialogTitle>
        <DialogContent>
          {editingProduct && renderProductForm(editingProduct, true)}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseEditDialog} color="secondary">
            Cancel
          </Button>
          <Button onClick={handleSubmit} variant="contained" color="primary">
            Save Changes
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar open={Boolean(error)} autoHideDuration={6000} onClose={handleCloseSnackbar}>
        <Alert onClose={handleCloseSnackbar} severity="error">
          {error}
        </Alert>
      </Snackbar>
      <Snackbar open={Boolean(success)} autoHideDuration={6000} onClose={handleCloseSnackbar}>
        <Alert onClose={handleCloseSnackbar} severity="success">
          {success}
        </Alert>
      </Snackbar>
    </Container>
  );
}

export default ProductList;
