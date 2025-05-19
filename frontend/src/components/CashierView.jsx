import React, { useState } from 'react';
import axios from 'axios';

const styles = {
  container: {
    background: 'linear-gradient(to right, #4CAF50, #2E7D32)',
    color: 'white',
    padding: '40px 20px',
    borderRadius: '10px',
    textAlign: 'center',
    maxWidth: '600px',
    margin: '40px auto',
    boxShadow: '0 8px 16px rgba(0, 0, 0, 0.3)',
    fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
  },
  title: {
    fontSize: '2rem',
    marginBottom: '30px',
  },
  input: {
    padding: '12px',
    borderRadius: '6px',
    border: 'none',
    fontSize: '16px',
    width: 'calc(100% - 24px)',
    maxWidth: '300px',
    marginBottom: '20px',
  },
  button: {
    backgroundColor: '#2E7D32',
    color: 'white',
    border: 'none',
    padding: '12px 24px',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '16px',
    transition: 'background-color 0.3s ease',
    marginLeft: '10px',
  },
  bill: {
    marginTop: '30px',
    background: 'rgba(255, 255, 255, 0.15)',
    padding: '20px',
    borderRadius: '8px',
    color: 'white',
    textAlign: 'left',
    fontFamily: 'monospace',
    whiteSpace: 'pre-wrap',
  },
  billTitle: {
    marginBottom: '10px',
    fontSize: '1.5rem',
  },
  error: {
    color: '#FFCDD2',
    marginTop: '20px',
  }
};

const CashierView = () => {
  const [code, setCode] = useState('');
  const [bill, setBill] = useState('');
  const [error, setError] = useState('');

  const fetchBill = () => {
    setError('');
    setBill('');
    if (!code.trim()) {
      setError("Please enter a valid code.");
      return;
    }

    axios.get(`/api/get-bill/${code.trim()}`)
      .then((res) => {
        setBill(res.data.bill || JSON.stringify(res.data, null, 2));
      })
      .catch(() => {
        setError("❌ Bill not found or invalid code.");
      });
  };

  return (
    <div style={styles.container}>
      <h1 style={styles.title}> Cashier Panel</h1>
      <input
        type="text"
        placeholder="Enter unique code"
        value={code}
        onChange={(e) => setCode(e.target.value)}
        style={styles.input}
      />
      <button onClick={fetchBill} style={styles.button}>
        Get Bill
      </button>

      {error && <div style={styles.error}>{error}</div>}

      {bill && (
        <div style={styles.bill}>
          <h2 style={styles.billTitle}>Customer Bill</h2>
          <pre>{bill}</pre>
        </div>
      )}
    </div>
  );
};

export default CashierView;