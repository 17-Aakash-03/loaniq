import React, { useState } from 'react';
import axios from 'axios';

function App() {
  const [data, setData] = useState({ score: null, risk_tier: '', explanation: '' });

  const getPrediction = async () => {
    try {
      const response = await axios.post('http://127.0.0.1:8000/predict', {
        phone_recharge: 500,
        electricity_bill: 1000,
        grocery_spend: 2000,
        social_trust: 80
      });
      setData(response.data); // Store the whole result
    } catch (error) {
      alert("Error: Make sure your FastAPI server is running!");
    }
  };

  return (
    <div style={{ padding: '40px', fontFamily: 'Arial, sans-serif', maxWidth: '500px', margin: 'auto' }}>
      <h1>Loan Eligibility Score</h1>
      <button 
        onClick={getPrediction}
        style={{ padding: '10px 20px', fontSize: '16px', backgroundColor: '#007BFF', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' }}
      >
        Calculate My Score
      </button>

      {data.score !== null && (
        <div style={{ marginTop: '30px', border: '1px solid #ccc', padding: '20px', borderRadius: '10px' }}>
          <h2>Score: {data.score.toFixed(2)}</h2>
          <p><strong>Risk Tier:</strong> {data.risk_tier}</p>
          <p><strong>Why:</strong> {data.explanation}</p>
        </div>
      )}
    </div>
  );
}

export default App;