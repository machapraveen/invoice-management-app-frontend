import React, { useState, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { 
  Typography, 
  Container, 
  Paper, 
  Table, 
  TableBody, 
  TableCell, 
  TableContainer, 
  TableHead, 
  TableRow,
  CircularProgress,
  Button,
  Grid,
  Divider
} from '@mui/material';
import { Share, Print } from '@mui/icons-material';
import { getInvoice } from '../services/api';
import './InvoiceStyles.css';

// Helper function to convert number to words
function numberToWords(num) {
  const ones = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine'];
  const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];
  const teens = ['Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];

  function convertLessThanOneThousand(n) {
    if (n >= 100) {
      return ones[Math.floor(n / 100)] + ' Hundred ' + convertLessThanOneThousand(n % 100);
    }
    if (n >= 20) {
      return tens[Math.floor(n / 10)] + ' ' + ones[n % 10];
    }
    if (n >= 10) {
      return teens[n - 10];
    }
    return ones[n];
  }

  if (num === 0) return 'Zero';

  let result = '';
  if (num >= 10000000) {
    result += convertLessThanOneThousand(Math.floor(num / 10000000)) + ' Crore ';
    num %= 10000000;
  }
  if (num >= 100000) {
    result += convertLessThanOneThousand(Math.floor(num / 100000)) + ' Lakh ';
    num %= 100000;
  }
  if (num >= 1000) {
    result += convertLessThanOneThousand(Math.floor(num / 1000)) + ' Thousand ';
    num %= 1000;
  }
  if (num > 0) {
    result += convertLessThanOneThousand(num);
  }

  return result.trim() + ' Rupees Only';
}

function formatDate(dateString) {
  const options = { year: 'numeric', month: 'short', day: 'numeric' };
  return new Date(dateString).toLocaleDateString('en-IN', options);
}

function InvoiceGenerator() {
  const [invoice, setInvoice] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { id } = useParams();

  const fetchInvoice = useCallback(async () => {
    try {
      setLoading(true);
      const response = await getInvoice(id);
      setInvoice(response.data);
    } catch (err) {
      console.error('Failed to fetch invoice', err);
      setError('Failed to fetch invoice. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchInvoice();
  }, [fetchInvoice]);

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Invoice',
          text: `Invoice ${invoice._id}`,
          url: window.location.href
        });
      } catch (err) {
        console.error('Error sharing:', err);
      }
    } else {
      alert('Web Share API not supported in your browser');
    }
  };

  const handlePrint = () => {
    window.print();
  };

  if (loading) return <CircularProgress className="loading-spinner" />;
  if (error) return <Typography color="error">{error}</Typography>;
  if (!invoice) return <Typography>No invoice data available.</Typography>;

  return (
    <Container maxWidth={false} className="invoice-container">
      <Paper className="invoice-paper">
        <div className="invoice-content">
          <div className="invoice-header">
            <div className="company-info">
              <Typography variant="h5">VIJAYA LAKSHMI ENTERPRISES</Typography>
              <Typography variant="body2">KAJULURU ROAD, GOLLAPALEM - 533468</Typography>
              <Typography variant="body2">GSTIN: 37AHXPT8957F1Z6</Typography>
              <Typography variant="body2">TIN: 37871892603</Typography>
            </div>
            <div className="invoice-info">
              <Typography variant="h6">TAX INVOICE</Typography>
              <Typography variant="body2">Invoice No: {invoice._id}</Typography>
              <Typography variant="body2">Date: {formatDate(invoice.date)}</Typography>
            </div>
          </div>

          <Divider className="section-divider" />

          <div className="buyer-details">
            <Typography variant="subtitle1">Buyer Details:</Typography>
            <Typography variant="body2">{invoice.buyerName || 'N/A'}</Typography>
            <Typography variant="body2">{invoice.buyerAddress || 'N/A'}</Typography>
          </div>

          <TableContainer className="invoice-table-container">
            <Table size="small" aria-label="invoice items table">
              <TableHead>
                <TableRow>
                  <TableCell>Description</TableCell>
                  <TableCell>HSN</TableCell>
                  <TableCell>Unit</TableCell>
                  <TableCell>Qty</TableCell>
                  <TableCell>Batch</TableCell>
                  <TableCell>Mfg Date</TableCell>
                  <TableCell>Exp Date</TableCell>
                  <TableCell>Rate</TableCell>
                  <TableCell>CGST %</TableCell>
                  <TableCell>CGST Amt</TableCell>
                  <TableCell>SGST %</TableCell>
                  <TableCell>SGST Amt</TableCell>
                  <TableCell>Amount</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {invoice.items.map((item, index) => (
                  <TableRow key={index}>
                    <TableCell>{item.name}</TableCell>
                    <TableCell>{item.hsnCode}</TableCell>
                    <TableCell>{item.unit}</TableCell>
                    <TableCell>{item.quantity}</TableCell>
                    <TableCell>{item.batch || '-'}</TableCell>
                    <TableCell>{item.mfgDate ? formatDate(item.mfgDate) : '-'}</TableCell>
                    <TableCell>{item.expDate ? formatDate(item.expDate) : '-'}</TableCell>
                    <TableCell>₹{item.rate.toFixed(2)}</TableCell>
                    <TableCell>{item.cgstPercentage}%</TableCell>
                    <TableCell>₹{item.cgstAmount.toFixed(2)}</TableCell>
                    <TableCell>{item.sgstPercentage}%</TableCell>
                    <TableCell>₹{item.sgstAmount.toFixed(2)}</TableCell>
                    <TableCell>₹{item.total.toFixed(2)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>

          <div className="invoice-summary">
            <div className="amount-in-words">
              <Typography variant="body2">Amount in words: {numberToWords(Math.round(invoice.total))}</Typography>
            </div>
            <div className="totals">
              <Grid container spacing={1}>
                <Grid item xs={6}><Typography variant="body2">Subtotal:</Typography></Grid>
                <Grid item xs={6}><Typography variant="body2" align="right">₹{invoice.subtotal.toFixed(2)}</Typography></Grid>
                <Grid item xs={6}><Typography variant="body2">CGST:</Typography></Grid>
                <Grid item xs={6}><Typography variant="body2" align="right">₹{invoice.cgst.toFixed(2)}</Typography></Grid>
                <Grid item xs={6}><Typography variant="body2">SGST:</Typography></Grid>
                <Grid item xs={6}><Typography variant="body2" align="right">₹{invoice.sgst.toFixed(2)}</Typography></Grid>
                <Grid item xs={6}><Typography variant="subtitle1">Grand Total:</Typography></Grid>
                <Grid item xs={6}><Typography variant="subtitle1" align="right">₹{invoice.total.toFixed(2)}</Typography></Grid>
              </Grid>
            </div>
          </div>

          <Divider className="section-divider" />

          <div className="terms-conditions">
            <Typography variant="subtitle2">Terms & Conditions:</Typography>
            <Typography variant="body2">1. Goods once sold will not be taken back.</Typography>
            <Typography variant="body2">2. E. & O.E.</Typography>
          </div>
        </div>
      </Paper>
      
      <div className="no-print action-buttons">
        <Button variant="contained" startIcon={<Share />} onClick={handleShare}>Share</Button>
        <Button variant="contained" startIcon={<Print />} onClick={handlePrint}>Print</Button>
      </div>
    </Container>
  );
}

export default InvoiceGenerator;