from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError

from app.database import get_db
from app.models.department import Department
from app.models.user import User
from app.schemas.department import DepartmentCreate, DepartmentUpdate, DepartmentOut
from app.auth.dependencies import get_current_user, require_role

router = APIRouter(prefix="/departments", tags=["departments"])


@router.get("", response_model=List[DepartmentOut])
def get_departments(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return db.query(Department).all()


@router.get("/{id}", response_model=DepartmentOut)
def get_department(
    id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    dept = db.query(Department).filter(Department.id == id).first()
    if not dept:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Department not found",
        )
    return dept


@router.post("", response_model=DepartmentOut, status_code=status.HTTP_201_CREATED)
def create_department(
    department_data: DepartmentCreate,
    db: Session = Depends(get_db),
    current_admin: User = Depends(require_role("Admin")),
):
    existing = db.query(Department).filter(Department.name == department_data.name).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Department with this name already exists",
        )

    dept = Department(name=department_data.name)
    db.add(dept)
    db.commit()
    db.refresh(dept)
    return dept


@router.put("/{id}", response_model=DepartmentOut)
def update_department(
    id: int,
    department_data: DepartmentUpdate,
    db: Session = Depends(get_db),
    current_admin: User = Depends(require_role("Admin")),
):
    dept = db.query(Department).filter(Department.id == id).first()
    if not dept:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Department not found",
        )

    if department_data.name is not None:
        existing = db.query(Department).filter(
            Department.name == department_data.name,
            Department.id != id,
        ).first()
        if existing:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Department with this name already exists",
            )
        dept.name = department_data.name

    db.commit()
    db.refresh(dept)
    return dept


@router.delete("/{id}")
def delete_department(
    id: int,
    db: Session = Depends(get_db),
    current_admin: User = Depends(require_role("Admin")),
):
    dept = db.query(Department).filter(Department.id == id).first()
    if not dept:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Department not found",
        )

    try:
        db.delete(dept)
        db.commit()
    except IntegrityError:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot delete department: associated sections, assets, or users still exist",
        )
    return {"message": "Department deleted successfully"}
