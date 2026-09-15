from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.section import Section
from app.models.department import Department
from app.models.user import User
from app.schemas.section import SectionCreate, SectionUpdate, SectionOut
from app.auth.dependencies import get_current_user, require_role

router = APIRouter(prefix="/sections", tags=["sections"])


@router.get("", response_model=List[SectionOut])
def get_sections(
    department_id: Optional[int] = Query(None, description="Filter sections by department ID"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    query = db.query(Section)
    if department_id is not None:
        query = query.filter(Section.department_id == department_id)
    return query.all()


@router.get("/{id}", response_model=SectionOut)
def get_section(
    id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    section = db.query(Section).filter(Section.id == id).first()
    if not section:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Section not found",
        )
    return section


@router.post("", response_model=SectionOut, status_code=status.HTTP_201_CREATED)
def create_section(
    section_data: SectionCreate,
    db: Session = Depends(get_db),
    current_admin: User = Depends(require_role("Admin")),
):
    # Verify department_id actually exists (404 if not)
    dept = db.query(Department).filter(Department.id == section_data.department_id).first()
    if not dept:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Department not found",
        )

    section = Section(
        name=section_data.name,
        department_id=section_data.department_id,
    )
    db.add(section)
    db.commit()
    db.refresh(section)
    return section


@router.put("/{id}", response_model=SectionOut)
def update_section(
    id: int,
    section_data: SectionUpdate,
    db: Session = Depends(get_db),
    current_admin: User = Depends(require_role("Admin")),
):
    section = db.query(Section).filter(Section.id == id).first()
    if not section:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Section not found",
        )

    if section_data.department_id is not None:
        dept = db.query(Department).filter(Department.id == section_data.department_id).first()
        if not dept:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Department not found",
            )
        section.department_id = section_data.department_id

    if section_data.name is not None:
        section.name = section_data.name

    db.commit()
    db.refresh(section)
    return section


@router.delete("/{id}")
def delete_section(
    id: int,
    db: Session = Depends(get_db),
    current_admin: User = Depends(require_role("Admin")),
):
    section = db.query(Section).filter(Section.id == id).first()
    if not section:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Section not found",
        )

    db.delete(section)
    db.commit()
    return {"message": "Section deleted successfully"}
