from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.user import User
from app.models.role import Role
from app.models.department import Department
from app.schemas.auth import LoginRequest, Token
from app.schemas.user import UserCreate, UserOut
from app.auth.security import verify_password, hash_password, create_access_token
from app.auth.dependencies import require_role

router = APIRouter(prefix="/auth", tags=["auth"])
users_router = APIRouter(prefix="/users", tags=["users"])


@router.post("/login", response_model=Token)
def login(credentials: LoginRequest, db: Session = Depends(get_db)):
    generic_error = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Invalid credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )

    user = db.query(User).filter(User.personal_no == credentials.personal_no).first()
    if not user:
        raise generic_error

    if not verify_password(credentials.password, user.password_hash):
        raise generic_error

    if user.role_id != credentials.role_id:
        raise generic_error

    role_name = user.role.role_name if user.role else None
    department_name = user.department.name if user.department else None

    token_payload = {
        "sub": str(user.id),
        "role": role_name,
        "department_id": user.department_id,
    }
    access_token = create_access_token(token_payload)

    user_response = {
        "id": user.id,
        "personal_no": user.personal_no,
        "name": user.name,
        "email": user.email,
        "role_id": user.role_id,
        "department_id": user.department_id,
        "role_name": role_name,
        "department_name": department_name,
        "created_at": user.created_at,
    }

    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": user_response,
    }


@users_router.post("", response_model=UserOut, status_code=status.HTTP_201_CREATED)
def create_user(
    user_data: UserCreate,
    db: Session = Depends(get_db),
    current_admin: User = Depends(require_role("Admin")),
):
    # Check if personal_no is already taken
    existing_personal = db.query(User).filter(User.personal_no == user_data.personal_no).first()
    if existing_personal:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Personal number is already registered",
        )

    # Check if email is already taken (if email provided)
    if user_data.email:
        existing_email = db.query(User).filter(User.email == user_data.email).first()
        if existing_email:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Email is already registered",
            )

    # Verify role exists
    role = db.query(Role).filter(Role.id == user_data.role_id).first()
    if not role:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid role_id. Role does not exist.",
        )

    # Verify department exists
    dept = db.query(Department).filter(Department.id == user_data.department_id).first()
    if not dept:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid department_id. Department does not exist.",
        )

    # Hash password and create user
    hashed_password = hash_password(user_data.password)
    new_user = User(
        personal_no=user_data.personal_no,
        name=user_data.name,
        email=user_data.email,
        password_hash=hashed_password,
        role_id=user_data.role_id,
        department_id=user_data.department_id,
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    return new_user
