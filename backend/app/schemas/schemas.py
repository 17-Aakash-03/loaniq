from pydantic import BaseModel, EmailStr
from typing import List, Optional

class MonthlyBehavior(BaseModel):
    recharge_amount:    float
    recharge_frequency: int
    electricity_paid:   bool
    grocery_spend:      float

class SocialReference(BaseModel):
    trust_score:       float
    relationship_type: str

class LoanApplicationRequest(BaseModel):
    # Original behavioral data
    monthly_behavior:   List[MonthlyBehavior]
    social_references:  List[SocialReference]
    location_stability: float
    months_at_address:  int

    # Personal Profile
    age:                int
    education_level:    str  # illiterate, primary, secondary, graduate, postgraduate
    employment_type:    str  # salaried, self_employed, daily_wage, unemployed, farmer
    marital_status:     str  # single, married, divorced, widowed
    dependents:         int
    work_experience:    int  # years

    # Financial Data
    monthly_income:     float
    monthly_expenditure:float
    monthly_savings:    float
    has_bank_account:   bool
    has_existing_loans: bool
    existing_loan_emi:  float
    num_existing_loans: int

    # Investment & Assets
    does_investment:    bool
    investment_type:    str   # fd, mutual_fund, gold, property, none
    investment_amount:  float
    owns_property:      bool
    owns_vehicle:       bool

    # Risk Behavior
    does_gambling:      bool
    gambling_frequency: str   # never, rarely, sometimes, regularly
    gambling_loss:      float
    alcohol_tobacco_spend: float

    # Digital Behavior
    has_smartphone:     bool
    uses_upi:           bool
    upi_transaction_amount: float
    has_insurance:      bool
    insurance_paid_on_time: bool

    # Housing
    housing_type:       str   # owned, rented, shared, homeless
    monthly_rent:       float

class UserRegister(BaseModel):
    name:             str
    email:            EmailStr
    password:         str
    telegram_chat_id: Optional[str] = None

class UserLogin(BaseModel):
    email:    EmailStr
    password: str

class TokenResponse(BaseModel):
    access_token: str
    token_type:   str
    user_name:    str
    user_role:    str