import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useTheme } from '../context/ThemeContext';

const API = 'http://127.0.0.1:8000';

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

export default function Application() {
  const navigate = useNavigate();
  const theme = useTheme();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  useEffect(() => {
    const h = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', h);
    return () => window.removeEventListener('resize', h);
  }, []);

  const cyan = theme.cyan;
  const purple = theme.purple;
  const green = theme.green;
  const amber = theme.amber;
  const pink = theme.pink;

  const [personal, setPersonal] = useState({
    age: 30,
    education_level: 'secondary',
    employment_type: 'salaried',
    marital_status: 'married',
    dependents: 2,
    work_experience: 5,
  });

  const [financial, setFinancial] = useState({
    monthly_income: 15000,
    monthly_expenditure: 10000,
    monthly_savings: 2000,
    has_bank_account: 'yes',
    has_existing_loans: 'no',
    existing_loan_emi: 0,
    num_existing_loans: 0,
    does_exercise: 'sometimes',
  });

  const [investment, setInvestment] = useState({
    does_investment: 'no',
    investment_type: 'fd',
    investment_amount: 0,
    owns_property: 'no',
    owns_vehicle: 'no',
  });

  const [riskBehavior, setRiskBehavior] = useState({
    does_gambling: 'no',
    gambling_frequency: 'rarely',
    gambling_result: 'losing',
    gambling_loss: 0,
    alcohol_tobacco_spend: 0,
  });

  const [digital, setDigital] = useState({
    has_smartphone: 'yes',
    uses_upi: 'yes',
    upi_transaction_amount: 3000,
    has_insurance: 'no',
    insurance_paid_on_time: 'yes',
  });

  const [housing, setHousing] = useState({
    housing_type: 'rented',
    monthly_rent: 3000,
  });

  const [location, setLocation] = useState({
    location_stability: 70,
    months_at_address: 24,
  });

  const defaultMonth = {
    recharge_amount: 300,
    recharge_frequency: 2,
    electricity_paid: 'yes',
    grocery_spend: 3000,
  };

  const [monthlyBehavior, setMonthlyBehavior] = useState(
    Array(12).fill(null).map(() => ({ ...defaultMonth }))
  );

  const [references, setReferences] = useState([
    { trust_score: '0.7', relationship_type: 'guarantor' },
    { trust_score: '0.6', relationship_type: 'neighbor' },
  ]);

  const totalSteps = 6;

  const inputStyle = {
    width: '100%', padding: '10px 12px',
    background: theme.isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.04)',
    border: `1px solid ${theme.border}`,
    borderRadius: '4px', fontSize: '12px', color: theme.text,
    fontFamily: "'Courier New',monospace", outline: 'none',
    boxSizing: 'border-box',
  };

  const selectStyle = {
    ...inputStyle,
    cursor: 'pointer',
  };

  const optionStyle = {
    background: theme.isDark ? '#1e3a5f' : '#ffffff',
    color: theme.isDark ? '#ffffff' : '#000000',
    padding: '8px',
  };

  const labelStyle = {
    fontSize: '9px', letterSpacing: '1px', color: theme.textMuted,
    textTransform: 'uppercase', marginBottom: '4px', display: 'block',
  };

  const sectionStyle = {
    background: theme.bgCard, border: `1px solid ${theme.border}`,
    borderRadius: '4px', padding: '20px', marginBottom: '16px',
  };

  const Field = ({ label, children }) => (
    <div style={{ marginBottom: '14px' }}>
      <label style={labelStyle}>{label}</label>
      {children}
    </div>
  );

  const Grid = ({ children, cols = 2 }) => (
    <div style={{
      display: 'grid',
      gridTemplateColumns: isMobile ? '1fr' : `repeat(${cols}, 1fr)`,
      gap: '12px',
    }}>{children}</div>
  );

  const SectionTitle = ({ color, children }) => (
    <p style={{
      fontSize: '10px', color, marginBottom: '12px',
      fontWeight: '700', letterSpacing: '1px', textTransform: 'uppercase',
    }}>
      {children}
    </p>
  );

  const handleSubmit = async () => {
    setLoading(true);
    setError('');
    try {
      const token = localStorage.getItem('token');

      const payload = {
        monthly_behavior: monthlyBehavior.map(m => ({
          ...m,
          electricity_paid: m.electricity_paid === 'yes',
        })),
        social_references: references.map(r => ({
          ...r,
          trust_score: parseFloat(r.trust_score),
        })),
        location_stability: location.location_stability,
        months_at_address: location.months_at_address,
        age: personal.age,
        education_level: personal.education_level,
        employment_type: personal.employment_type,
        marital_status: personal.marital_status,
        dependents: personal.dependents,
        work_experience: personal.work_experience,
        monthly_income: financial.monthly_income,
        monthly_expenditure: financial.monthly_expenditure,
        monthly_savings: financial.monthly_savings,
        has_bank_account: financial.has_bank_account === 'yes',
        has_existing_loans: financial.has_existing_loans === 'yes',
        existing_loan_emi: financial.existing_loan_emi,
        num_existing_loans: financial.num_existing_loans,
        does_investment: investment.does_investment === 'yes',
        investment_type: investment.does_investment === 'yes' ? investment.investment_type : 'none',
        investment_amount: investment.investment_amount,
        owns_property: investment.owns_property === 'yes',
        owns_vehicle: investment.owns_vehicle === 'yes',
        does_gambling: riskBehavior.does_gambling === 'yes',
        gambling_frequency: riskBehavior.does_gambling === 'yes' ? riskBehavior.gambling_frequency : 'never',
        gambling_loss: riskBehavior.gambling_loss,
        alcohol_tobacco_spend: riskBehavior.alcohol_tobacco_spend,
        has_smartphone: digital.has_smartphone === 'yes',
        uses_upi: digital.uses_upi === 'yes',
        upi_transaction_amount: digital.upi_transaction_amount,
        has_insurance: digital.has_insurance === 'yes',
        insurance_paid_on_time: digital.insurance_paid_on_time === 'yes',
        housing_type: housing.housing_type,
        monthly_rent: housing.monthly_rent,
      };

      const res = await axios.post(`${API}/predict`, payload, {
        headers: { Authorization: `Bearer ${token}` },
      });
      navigate('/results', { state: { result: res.data } });
    } catch (e) {
      setError(e.response?.data?.detail || 'Submission failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const renderStep = () => {
    switch (step) {

      case 1: return (
        <div>
          <h3 style={{ color: cyan, marginBottom: '16px', fontSize: '13px', letterSpacing: '2px' }}>
            👤 PERSONAL PROFILE
          </h3>
          <div style={sectionStyle}>
            <Grid>
              <Field label="Age">
                <input type="number" style={inputStyle} value={personal.age}
                  onChange={e => setPersonal({ ...personal, age: +e.target.value })}
                  min={18} max={80} />
              </Field>

              <Field label="Work Experience (Years)">
                <input type="number" style={inputStyle} value={personal.work_experience}
                  onChange={e => setPersonal({ ...personal, work_experience: +e.target.value })}
                  min={0} max={50} />
              </Field>

              <Field label="Education Level">
                <select style={selectStyle} value={personal.education_level}
                  onChange={e => setPersonal({ ...personal, education_level: e.target.value })}>
                  <option style={optionStyle} value="illiterate">Illiterate — No formal education</option>
                  <option style={optionStyle} value="primary">Primary School (Class 1–5)</option>
                  <option style={optionStyle} value="secondary">Secondary School (Class 6–10)</option>
                  <option style={optionStyle} value="higher_secondary">Higher Secondary (Class 11–12)</option>
                  <option style={optionStyle} value="diploma">Diploma / ITI</option>
                  <option style={optionStyle} value="graduate">Graduate (B.A / B.Sc / B.Com / B.Tech)</option>
                  <option style={optionStyle} value="postgraduate">Post Graduate (M.A / M.Sc / MBA)</option>
                  <option style={optionStyle} value="phd">PhD / Doctorate</option>
                </select>
              </Field>

              <Field label="Employment Type">
                <select style={selectStyle} value={personal.employment_type}
                  onChange={e => setPersonal({ ...personal, employment_type: e.target.value })}>
                  <option style={optionStyle} value="salaried">Salaried — Government Job</option>
                  <option style={optionStyle} value="salaried_private">Salaried — Private Job</option>
                  <option style={optionStyle} value="self_employed">Self Employed — Business Owner</option>
                  <option style={optionStyle} value="freelancer">Freelancer / Consultant</option>
                  <option style={optionStyle} value="farmer">Farmer — Agriculture</option>
                  <option style={optionStyle} value="daily_wage">Daily Wage Worker</option>
                  <option style={optionStyle} value="street_vendor">Street Vendor / Small Trader</option>
                  <option style={optionStyle} value="student">Student</option>
                  <option style={optionStyle} value="homemaker">Homemaker</option>
                  <option style={optionStyle} value="retired">Retired</option>
                  <option style={optionStyle} value="unemployed">Unemployed</option>
                </select>
              </Field>

              <Field label="Marital Status">
                <select style={selectStyle} value={personal.marital_status}
                  onChange={e => setPersonal({ ...personal, marital_status: e.target.value })}>
                  <option style={optionStyle} value="single">Single — Never Married</option>
                  <option style={optionStyle} value="married">Married</option>
                  <option style={optionStyle} value="married_joint">Married — Joint Family</option>
                  <option style={optionStyle} value="divorced">Divorced</option>
                  <option style={optionStyle} value="separated">Separated</option>
                  <option style={optionStyle} value="widowed">Widowed</option>
                </select>
              </Field>

              <Field label="Number of Dependents">
                <input type="number" style={inputStyle} value={personal.dependents}
                  onChange={e => setPersonal({ ...personal, dependents: +e.target.value })}
                  min={0} max={15} />
              </Field>
            </Grid>
          </div>
        </div>
      );

      case 2: return (
        <div>
          <h3 style={{ color: green, marginBottom: '16px', fontSize: '13px', letterSpacing: '2px' }}>
            💰 FINANCIAL DATA
          </h3>
          <div style={sectionStyle}>
            <Grid>
              <Field label="Monthly Income (₹)">
                <input type="number" style={inputStyle} value={financial.monthly_income}
                  onChange={e => setFinancial({ ...financial, monthly_income: +e.target.value })}
                  min={0} />
              </Field>

              <Field label="Monthly Expenditure (₹)">
                <input type="number" style={inputStyle} value={financial.monthly_expenditure}
                  onChange={e => setFinancial({ ...financial, monthly_expenditure: +e.target.value })}
                  min={0} />
              </Field>

              <Field label="Monthly Savings (₹)">
                <input type="number" style={inputStyle} value={financial.monthly_savings}
                  onChange={e => setFinancial({ ...financial, monthly_savings: +e.target.value })}
                  min={0} />
              </Field>

              <Field label="Has Bank Account?">
                <select style={selectStyle} value={financial.has_bank_account}
                  onChange={e => setFinancial({ ...financial, has_bank_account: e.target.value })}>
                  <option style={optionStyle} value="yes">✅ Yes — I have a bank account</option>
                  <option style={optionStyle} value="no">❌ No — I don't have a bank account</option>
                </select>
              </Field>

              <Field label="Do You Exercise Regularly?">
                <select style={selectStyle} value={financial.does_exercise}
                  onChange={e => setFinancial({ ...financial, does_exercise: e.target.value })}>
                  <option style={optionStyle} value="yes">✅ Yes — Exercise daily</option>
                  <option style={optionStyle} value="sometimes">⚡ Sometimes — Few times a week</option>
                  <option style={optionStyle} value="rarely">😐 Rarely — Once a month</option>
                  <option style={optionStyle} value="no">❌ No — Never exercise</option>
                </select>
              </Field>

              <Field label="Has Existing Loans?">
                <select style={selectStyle} value={financial.has_existing_loans}
                  onChange={e => setFinancial({ ...financial, has_existing_loans: e.target.value })}>
                  <option style={optionStyle} value="no">❌ No — No existing loans</option>
                  <option style={optionStyle} value="yes">✅ Yes — I have existing loans</option>
                </select>
              </Field>

              {financial.has_existing_loans === 'yes' && <>
                <Field label="Number of Existing Loans">
                  <input type="number" style={inputStyle} value={financial.num_existing_loans}
                    onChange={e => setFinancial({ ...financial, num_existing_loans: +e.target.value })}
                    min={1} max={20} />
                </Field>
                <Field label="Total Monthly EMI (₹)">
                  <input type="number" style={inputStyle} value={financial.existing_loan_emi}
                    onChange={e => setFinancial({ ...financial, existing_loan_emi: +e.target.value })}
                    min={0} />
                </Field>
              </>}
            </Grid>
          </div>
        </div>
      );

      case 3: return (
        <div>
          <h3 style={{ color: amber, marginBottom: '16px', fontSize: '13px', letterSpacing: '2px' }}>
            📈 INVESTMENT & RISK BEHAVIOR
          </h3>
          <div style={sectionStyle}>
            <SectionTitle color={green}>📈 Investments & Assets</SectionTitle>
            <Grid>
              <Field label="Do You Invest Money?">
                <select style={selectStyle} value={investment.does_investment}
                  onChange={e => setInvestment({ ...investment, does_investment: e.target.value })}>
                  <option style={optionStyle} value="no">❌ No — I don't invest</option>
                  <option style={optionStyle} value="yes">✅ Yes — I invest regularly</option>
                </select>
              </Field>

              {investment.does_investment === 'yes' && <>
                <Field label="Investment Type">
                  <select style={selectStyle} value={investment.investment_type}
                    onChange={e => setInvestment({ ...investment, investment_type: e.target.value })}>
                    <option style={optionStyle} value="fd">Fixed Deposit (FD)</option>
                    <option style={optionStyle} value="mutual_fund">Mutual Fund / SIP</option>
                    <option style={optionStyle} value="gold">Gold / Jewellery</option>
                    <option style={optionStyle} value="stocks">Stocks / Shares</option>
                    <option style={optionStyle} value="ppf">PPF / EPF</option>
                    <option style={optionStyle} value="property">Property / Real Estate</option>
                    <option style={optionStyle} value="crypto">Cryptocurrency</option>
                    <option style={optionStyle} value="nsc">NSC / Post Office Schemes</option>
                  </select>
                </Field>
                <Field label="Monthly Investment Amount (₹)">
                  <input type="number" style={inputStyle} value={investment.investment_amount}
                    onChange={e => setInvestment({ ...investment, investment_amount: +e.target.value })}
                    min={0} />
                </Field>
              </>}

              <Field label="Do You Own Property / Land?">
                <select style={selectStyle} value={investment.owns_property}
                  onChange={e => setInvestment({ ...investment, owns_property: e.target.value })}>
                  <option style={optionStyle} value="no">❌ No — I don't own property</option>
                  <option style={optionStyle} value="yes">✅ Yes — I own property or land</option>
                </select>
              </Field>

              <Field label="Do You Own a Vehicle?">
                <select style={selectStyle} value={investment.owns_vehicle}
                  onChange={e => setInvestment({ ...investment, owns_vehicle: e.target.value })}>
                  <option style={optionStyle} value="no">❌ No — I don't own a vehicle</option>
                  <option style={optionStyle} value="yes">✅ Yes — I own a vehicle</option>
                </select>
              </Field>
            </Grid>

            <hr style={{ border: `1px solid ${theme.border}`, margin: '16px 0' }} />
            <SectionTitle color={pink}>⚠️ Risk Behavior</SectionTitle>
            <Grid>
              <Field label="Do You Gamble / Bet?">
                <select style={selectStyle} value={riskBehavior.does_gambling}
                  onChange={e => setRiskBehavior({ ...riskBehavior, does_gambling: e.target.value })}>
                  <option style={optionStyle} value="no">❌ No — I never gamble or bet</option>
                  <option style={optionStyle} value="yes">⚠️ Yes — I do gamble or bet</option>
                </select>
              </Field>

              {riskBehavior.does_gambling === 'yes' && <>
                <Field label="Gambling / Betting Frequency">
                  <select style={selectStyle} value={riskBehavior.gambling_frequency}
                    onChange={e => setRiskBehavior({ ...riskBehavior, gambling_frequency: e.target.value })}>
                    <option style={optionStyle} value="rarely">Rarely — Once or twice a year</option>
                    <option style={optionStyle} value="sometimes">Sometimes — Monthly</option>
                    <option style={optionStyle} value="regularly">Regularly — Weekly or more</option>
                  </select>
                </Field>

                <Field label="Are You Winning or Losing?">
                  <select style={selectStyle} value={riskBehavior.gambling_result}
                    onChange={e => setRiskBehavior({ ...riskBehavior, gambling_result: e.target.value })}>
                    <option style={optionStyle} value="winning">📈 Winning — Making profit</option>
                    <option style={optionStyle} value="breakeven">😐 Breaking Even — No profit no loss</option>
                    <option style={optionStyle} value="losing">📉 Losing Money</option>
                  </select>
                </Field>

                <Field label="Monthly Gambling Loss (₹)">
                  <input type="number" style={inputStyle} value={riskBehavior.gambling_loss}
                    onChange={e => setRiskBehavior({ ...riskBehavior, gambling_loss: +e.target.value })}
                    min={0} />
                </Field>
              </>}

              <Field label="Monthly Alcohol / Tobacco Spend (₹)">
                <input type="number" style={inputStyle} value={riskBehavior.alcohol_tobacco_spend}
                  onChange={e => setRiskBehavior({ ...riskBehavior, alcohol_tobacco_spend: +e.target.value })}
                  min={0} />
              </Field>
            </Grid>
          </div>
        </div>
      );

      case 4: return (
        <div>
          <h3 style={{ color: purple, marginBottom: '16px', fontSize: '13px', letterSpacing: '2px' }}>
            📱 DIGITAL & HOUSING
          </h3>
          <div style={sectionStyle}>
            <SectionTitle color={cyan}>📱 Digital Behavior</SectionTitle>
            <Grid>
              <Field label="Do You Have a Smartphone?">
                <select style={selectStyle} value={digital.has_smartphone}
                  onChange={e => setDigital({ ...digital, has_smartphone: e.target.value })}>
                  <option style={optionStyle} value="yes">✅ Yes — I have a smartphone</option>
                  <option style={optionStyle} value="no">❌ No — Basic phone or no phone</option>
                </select>
              </Field>

              <Field label="Do You Use UPI Payments?">
                <select style={selectStyle} value={digital.uses_upi}
                  onChange={e => setDigital({ ...digital, uses_upi: e.target.value })}>
                  <option style={optionStyle} value="yes">✅ Yes — GPay / PhonePe / Paytm</option>
                  <option style={optionStyle} value="no">❌ No — I don't use UPI</option>
                </select>
              </Field>

              {digital.uses_upi === 'yes' && (
                <Field label="Monthly UPI Transaction Amount (₹)">
                  <input type="number" style={inputStyle} value={digital.upi_transaction_amount}
                    onChange={e => setDigital({ ...digital, upi_transaction_amount: +e.target.value })}
                    min={0} />
                </Field>
              )}

              <Field label="Do You Have Insurance?">
                <select style={selectStyle} value={digital.has_insurance}
                  onChange={e => setDigital({ ...digital, has_insurance: e.target.value })}>
                  <option style={optionStyle} value="no">❌ No — I don't have insurance</option>
                  <option style={optionStyle} value="yes">✅ Yes — I have insurance</option>
                </select>
              </Field>

              {digital.has_insurance === 'yes' && (
                <Field label="Insurance Premium Paid On Time?">
                  <select style={selectStyle} value={digital.insurance_paid_on_time}
                    onChange={e => setDigital({ ...digital, insurance_paid_on_time: e.target.value })}>
                    <option style={optionStyle} value="yes">✅ Yes — Always paid on time</option>
                    <option style={optionStyle} value="no">❌ No — Sometimes missed</option>
                  </select>
                </Field>
              )}
            </Grid>

            <hr style={{ border: `1px solid ${theme.border}`, margin: '16px 0' }} />
            <SectionTitle color={amber}>🏠 Housing & Location</SectionTitle>
            <Grid>
              <Field label="Housing Type">
                <select style={selectStyle} value={housing.housing_type}
                  onChange={e => setHousing({ ...housing, housing_type: e.target.value })}>
                  <option style={optionStyle} value="owned">🏠 Own House — Self Owned</option>
                  <option style={optionStyle} value="owned_family">🏠 Family House — Parents / Relatives</option>
                  <option style={optionStyle} value="rented">🏢 Rented House / Flat</option>
                  <option style={optionStyle} value="rented_room">🛏️ Rented Single Room</option>
                  <option style={optionStyle} value="shared">👥 Shared Accommodation</option>
                  <option style={optionStyle} value="company">🏭 Company / Employer Provided</option>
                  <option style={optionStyle} value="government">🏛️ Government Provided Housing</option>
                  <option style={optionStyle} value="homeless">⚠️ No Fixed Address</option>
                </select>
              </Field>

              {(housing.housing_type === 'rented' || housing.housing_type === 'rented_room') && (
                <Field label="Monthly Rent (₹)">
                  <input type="number" style={inputStyle} value={housing.monthly_rent}
                    onChange={e => setHousing({ ...housing, monthly_rent: +e.target.value })}
                    min={0} />
                </Field>
              )}

              <Field label="Location Stability Score (0–100)">
                <input type="number" style={inputStyle} value={location.location_stability}
                  onChange={e => setLocation({ ...location, location_stability: +e.target.value })}
                  min={0} max={100} />
              </Field>

              <Field label="Months at Current Address">
                <input type="number" style={inputStyle} value={location.months_at_address}
                  onChange={e => setLocation({ ...location, months_at_address: +e.target.value })}
                  min={0} />
              </Field>
            </Grid>
          </div>
        </div>
      );

      case 5: return (
        <div>
          <h3 style={{ color: green, marginBottom: '8px', fontSize: '13px', letterSpacing: '2px' }}>
            📅 MONTHLY BEHAVIOR (12 MONTHS)
          </h3>
          <p style={{ fontSize: '10px', color: theme.textMuted, marginBottom: '16px' }}>
            January = oldest month, December = most recent month.
          </p>

          {monthlyBehavior.map((m, i) => (
            <div key={i} style={{
              ...sectionStyle, marginBottom: '8px',
              borderLeft: `3px solid ${i === 11 ? green : i >= 9 ? cyan : theme.border}`,
            }}>
              <p style={{
                fontSize: '10px', marginBottom: '10px', fontWeight: '700',
                color: i === 11 ? green : i >= 9 ? cyan : theme.textMuted,
              }}>
                📅 {MONTH_NAMES[i]}
                {i === 11 && (
                  <span style={{
                    marginLeft: '8px', fontSize: '8px', color: green,
                    background: `${green}20`, padding: '2px 6px', borderRadius: '2px',
                  }}>MOST RECENT</span>
                )}
              </p>
              <Grid cols={isMobile ? 1 : 4}>
                <Field label="Recharge Amount (₹)">
                  <input type="number" style={inputStyle} value={m.recharge_amount}
                    onChange={e => {
                      const u = [...monthlyBehavior];
                      u[i] = { ...u[i], recharge_amount: +e.target.value };
                      setMonthlyBehavior(u);
                    }} min={0} />
                </Field>
                <Field label="Recharge Frequency">
                  <select style={selectStyle} value={m.recharge_frequency}
                    onChange={e => {
                      const u = [...monthlyBehavior];
                      u[i] = { ...u[i], recharge_frequency: +e.target.value };
                      setMonthlyBehavior(u);
                    }}>
                    <option style={optionStyle} value={1}>1x — Once a month</option>
                    <option style={optionStyle} value={2}>2x — Twice a month</option>
                    <option style={optionStyle} value={3}>3x — Three times</option>
                    <option style={optionStyle} value={4}>4x — Weekly or more</option>
                  </select>
                </Field>
                <Field label="Electricity Bill Paid?">
                  <select style={selectStyle} value={m.electricity_paid}
                    onChange={e => {
                      const u = [...monthlyBehavior];
                      u[i] = { ...u[i], electricity_paid: e.target.value };
                      setMonthlyBehavior(u);
                    }}>
                    <option style={optionStyle} value="yes">✅ Yes — Paid</option>
                    <option style={optionStyle} value="no">❌ No — Not Paid</option>
                  </select>
                </Field>
                <Field label="Grocery Spend (₹)">
                  <input type="number" style={inputStyle} value={m.grocery_spend}
                    onChange={e => {
                      const u = [...monthlyBehavior];
                      u[i] = { ...u[i], grocery_spend: +e.target.value };
                      setMonthlyBehavior(u);
                    }} min={0} />
                </Field>
              </Grid>
            </div>
          ))}

          <button
            onClick={() => setMonthlyBehavior(Array(12).fill(null).map(() => ({ ...defaultMonth })))}
            style={{
              padding: '8px 16px', background: 'transparent',
              border: `1px solid ${amber}40`, borderRadius: '4px',
              fontSize: '10px', color: amber, cursor: 'pointer',
              fontFamily: "'Courier New',monospace", marginTop: '8px',
            }}>
            🔄 RESET ALL MONTHS TO DEFAULT
          </button>
        </div>
      );

      case 6: return (
        <div>
          <h3 style={{ color: purple, marginBottom: '8px', fontSize: '13px', letterSpacing: '2px' }}>
            🤝 SOCIAL REFERENCES
          </h3>
          <p style={{ fontSize: '10px', color: theme.textMuted, marginBottom: '16px' }}>
            Add people who can vouch for you — minimum 1, maximum 3.
          </p>

          {references.map((r, i) => (
            <div key={i} style={{
              ...sectionStyle, marginBottom: '8px',
              borderLeft: `3px solid ${purple}`,
            }}>
              <p style={{
                fontSize: '10px', color: purple, marginBottom: '12px',
                fontWeight: '700', letterSpacing: '1px',
              }}>
                👤 Reference {i + 1}
              </p>
              <Grid>
                <Field label="Relationship Type">
                  <select style={selectStyle} value={r.relationship_type}
                    onChange={e => {
                      const updated = [...references];
                      updated[i] = { ...updated[i], relationship_type: e.target.value };
                      setReferences(updated);
                    }}>
                    <option style={optionStyle} value="guarantor">🔒 Guarantor — Will take responsibility</option>
                    <option style={optionStyle} value="employer">💼 Employer — My boss or manager</option>
                    <option style={optionStyle} value="neighbor">🏘️ Neighbor — Lives near me</option>
                    <option style={optionStyle} value="friend">👫 Friend — Personal friend</option>
                    <option style={optionStyle} value="relative">👨‍👩‍👧 Relative — Family member</option>
                    <option style={optionStyle} value="colleague">🏢 Colleague — Work colleague</option>
                    <option style={optionStyle} value="teacher">📚 Teacher / Professor</option>
                    <option style={optionStyle} value="doctor">🩺 Doctor / Healthcare</option>
                    <option style={optionStyle} value="community_leader">🌟 Community Leader / Sarpanch</option>
                  </select>
                </Field>

                <Field label="How Trustworthy Are They?">
                  <select style={selectStyle} value={r.trust_score}
                    onChange={e => {
                      const updated = [...references];
                      updated[i] = { ...updated[i], trust_score: e.target.value };
                      setReferences(updated);
                    }}>
                    <option style={optionStyle} value="1.0">⭐⭐⭐⭐⭐ Excellent (1.0)</option>
                    <option style={optionStyle} value="0.9">⭐⭐⭐⭐⭐ Very Good (0.9)</option>
                    <option style={optionStyle} value="0.8">⭐⭐⭐⭐ Good (0.8)</option>
                    <option style={optionStyle} value="0.7">⭐⭐⭐⭐ Above Average (0.7)</option>
                    <option style={optionStyle} value="0.6">⭐⭐⭐ Average (0.6)</option>
                    <option style={optionStyle} value="0.5">⭐⭐⭐ Below Average (0.5)</option>
                    <option style={optionStyle} value="0.4">⭐⭐ Low (0.4)</option>
                    <option style={optionStyle} value="0.3">⭐ Very Low (0.3)</option>
                    <option style={optionStyle} value="0.2">⭐ Poor (0.2)</option>
                    <option style={optionStyle} value="0.1">❌ Very Poor (0.1)</option>
                  </select>
                </Field>
              </Grid>

              {references.length > 1 && (
                <button
                  onClick={() => setReferences(references.filter((_, idx) => idx !== i))}
                  style={{
                    padding: '4px 12px', background: 'transparent',
                    border: `1px solid ${pink}40`, borderRadius: '2px',
                    fontSize: '9px', color: pink, cursor: 'pointer',
                    fontFamily: "'Courier New',monospace", marginTop: '8px',
                  }}>
                  🗑️ REMOVE
                </button>
              )}
            </div>
          ))}

          {references.length < 3 && (
            <button
              onClick={() => setReferences([
                ...references,
                { trust_score: '0.6', relationship_type: 'friend' },
              ])}
              style={{
                padding: '10px 20px', background: 'transparent',
                border: `1px solid ${green}40`, borderRadius: '4px',
                fontSize: '10px', color: green, cursor: 'pointer',
                fontFamily: "'Courier New',monospace",
              }}>
              + ADD ANOTHER REFERENCE
            </button>
          )}
        </div>
      );

      default: return null;
    }
  };

  return (
    <div style={{
      minHeight: '100vh', background: theme.bg,
      fontFamily: "'Courier New',monospace",
      padding: isMobile ? '16px' : '40px 20px',
    }}>
      <div style={{ maxWidth: '820px', margin: '0 auto' }}>

        <div style={{ marginBottom: '24px' }}>
          <h1 style={{
            fontSize: isMobile ? '16px' : '20px', fontWeight: '900',
            color: cyan, letterSpacing: '3px', textTransform: 'uppercase',
            margin: '0 0 6px',
          }}>
            ⚡ LOANIQ CREDIT ANALYSIS
          </h1>
          <p style={{ fontSize: '10px', color: theme.textMuted, margin: 0 }}>
            Step {step} of {totalSteps} — Complete all steps to get your AI credit score
          </p>
        </div>

        <div style={{
          height: '6px', background: theme.border,
          borderRadius: '3px', marginBottom: '12px',
        }}>
          <div style={{
            height: '100%',
            width: `${(step / totalSteps) * 100}%`,
            background: `linear-gradient(90deg, ${cyan}, ${purple})`,
            borderRadius: '3px', transition: 'width 0.4s ease',
            boxShadow: `0 0 8px ${cyan}60`,
          }} />
        </div>

        <div style={{
          display: 'flex', justifyContent: 'space-between',
          marginBottom: '24px', flexWrap: 'wrap', gap: '4px',
        }}>
          {[
            { label: 'Personal', icon: '👤' },
            { label: 'Financial', icon: '💰' },
            { label: 'Investment', icon: '📈' },
            { label: 'Digital', icon: '📱' },
            { label: 'Monthly', icon: '📅' },
            { label: 'References', icon: '🤝' },
          ].map((s, i) => (
            <span key={i}
              style={{
                fontSize: '9px',
                color: i + 1 === step ? cyan : i + 1 < step ? green : theme.textMuted,
                fontWeight: i + 1 === step ? '700' : 'normal',
                cursor: i + 1 < step ? 'pointer' : 'default',
              }}
              onClick={() => { if (i + 1 < step) setStep(i + 1); }}>
              {s.icon} {s.label}
            </span>
          ))}
        </div>

        {renderStep()}

        {error && (
          <div style={{
            padding: '10px 14px',
            background: 'rgba(255,45,155,0.1)',
            border: `1px solid ${pink}40`,
            borderRadius: '4px', fontSize: '11px',
            color: pink, marginBottom: '16px',
          }}>
            ⚠️ {error}
          </div>
        )}

        <div style={{
          display: 'flex', gap: '12px',
          justifyContent: 'space-between', marginTop: '20px',
        }}>
          {step > 1 ? (
            <button onClick={() => setStep(step - 1)} style={{
              padding: '12px 24px', background: 'transparent',
              border: `1px solid ${theme.border}`, borderRadius: '4px',
              fontSize: '11px', color: theme.textMuted, cursor: 'pointer',
              fontFamily: "'Courier New',monospace", letterSpacing: '2px',
            }}>
              ← BACK
            </button>
          ) : <div />}

          {step < totalSteps ? (
            <button onClick={() => setStep(step + 1)} style={{
              padding: '12px 32px',
              background: `linear-gradient(135deg, ${cyan}20, ${purple}10)`,
              border: `1px solid ${cyan}40`, borderRadius: '4px',
              fontSize: '11px', color: cyan, cursor: 'pointer',
              fontFamily: "'Courier New',monospace", letterSpacing: '2px',
            }}>
              NEXT →
            </button>
          ) : (
            <button onClick={handleSubmit} disabled={loading} style={{
              padding: '12px 32px',
              background: loading
                ? 'transparent'
                : `linear-gradient(135deg, ${green}30, ${cyan}10)`,
              border: `1px solid ${green}40`, borderRadius: '4px',
              fontSize: '11px', color: green,
              cursor: loading ? 'not-allowed' : 'pointer',
              fontFamily: "'Courier New',monospace", letterSpacing: '2px',
            }}>
              {loading ? '⏳ ANALYZING...' : '⚡ GET CREDIT SCORE'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}