from typing import List
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.role import Role
from app.schemas.role import RoleOut

router = APIRouter(prefix="/roles", tags=["roles"])


@router.get("", response_model=List[RoleOut])
def get_roles(db: Session = Depends(get_db)):
    return db.query(Role).all()
