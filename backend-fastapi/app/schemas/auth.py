from typing import Optional
from pydantic import BaseModel
from app.schemas.user import UserOut


class LoginRequest(BaseModel):
    personal_no: str
    password: str
    role_id: int


class LoginUserOut(UserOut):
    role_name: Optional[str] = None
    department_name: Optional[str] = None


class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: LoginUserOut
