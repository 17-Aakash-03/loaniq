from pydantic import BaseModel, EmailStr
from typing import List, Optional

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
    token_type:   str = "bearer"
    user_name:    str
    user_role:    str = "user"

class MonthlyBehavior(BaseModel):
    recharge_amount:    float
    recharge_frequency: float
    electricity_paid:   float
    grocery_spend:      float

class SocialReference(BaseModel):
    relationship_type: str
    trust_score:       float

class LoanApplicationRequest(BaseModel):
    monthly_behavior:   List[MonthlyBehavior]
    location_stability: float
    months_at_address:  float
    social_references:  List[SocialReference]