from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.asset import Asset, AssetStatus
from app.models.asset_category import AssetCategory
from app.models.department import Department
from app.models.section import Section
from app.models.user import User
from app.schemas.asset import AssetCreate, AssetUpdate, AssetOut
from app.auth.dependencies import get_current_user, require_role

router = APIRouter(prefix="/assets", tags=["assets"])


def validate_asset_references(
    db: Session,
    category_id: int,
    department_id: int,
    section_id: int,
):
    # 1. Verify category exists
    cat = db.query(AssetCategory).filter(AssetCategory.id == category_id).first()
    if not cat:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid category_id. Category does not exist.",
        )

    # 2. Verify department exists
    dept = db.query(Department).filter(Department.id == department_id).first()
    if not dept:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid department_id. Department does not exist.",
        )

    # 3. Verify section exists AND belongs to the given department
    sec = db.query(Section).filter(Section.id == section_id).first()
    if not sec:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid section_id. Section does not exist.",
        )
    if sec.department_id != department_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Section does not belong to the specified department",
        )


@router.get("", response_model=List[AssetOut])
def get_assets(
    department_id: Optional[int] = Query(None, description="Filter assets by department ID"),
    section_id: Optional[int] = Query(None, description="Filter assets by section ID"),
    status: Optional[AssetStatus] = Query(None, description="Filter assets by status"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    query = db.query(Asset)
    if department_id is not None:
        query = query.filter(Asset.department_id == department_id)
    if section_id is not None:
        query = query.filter(Asset.section_id == section_id)
    if status is not None:
        query = query.filter(Asset.status == status)
    return query.all()


@router.get("/{id}", response_model=AssetOut)
def get_asset(
    id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    asset = db.query(Asset).filter(Asset.id == id).first()
    if not asset:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Asset not found",
        )
    return asset


@router.post("", response_model=AssetOut, status_code=status.HTTP_201_CREATED)
def create_asset(
    asset_data: AssetCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role("Admin", "Technician")),
):
    # Check asset_tag uniqueness
    existing_tag = db.query(Asset).filter(Asset.asset_tag == asset_data.asset_tag).first()
    if existing_tag:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Asset tag is already registered",
        )

    # Validate category, department, and department-section relationship
    validate_asset_references(
        db=db,
        category_id=asset_data.category_id,
        department_id=asset_data.department_id,
        section_id=asset_data.section_id,
    )

    new_asset = Asset(
        asset_tag=asset_data.asset_tag,
        name=asset_data.name,
        category_id=asset_data.category_id,
        department_id=asset_data.department_id,
        section_id=asset_data.section_id,
        status=asset_data.status or AssetStatus.ACTIVE,
        purchase_date=asset_data.purchase_date,
        cost=asset_data.cost,
        vendor=asset_data.vendor,
        warranty_expiry=asset_data.warranty_expiry,
    )
    db.add(new_asset)
    db.commit()
    db.refresh(new_asset)
    return new_asset


@router.put("/{id}", response_model=AssetOut)
def update_asset(
    id: int,
    asset_data: AssetUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role("Admin", "Technician")),
):
    asset = db.query(Asset).filter(Asset.id == id).first()
    if not asset:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Asset not found",
        )

    # If asset_tag changed, verify uniqueness
    if asset_data.asset_tag is not None and asset_data.asset_tag != asset.asset_tag:
        existing = db.query(Asset).filter(
            Asset.asset_tag == asset_data.asset_tag,
            Asset.id != id,
        ).first()
        if existing:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Asset tag is already registered",
            )

    # Determine effective IDs for references
    effective_cat = asset_data.category_id if asset_data.category_id is not None else asset.category_id
    effective_dept = asset_data.department_id if asset_data.department_id is not None else asset.department_id
    effective_sec = asset_data.section_id if asset_data.section_id is not None else asset.section_id

    # Validate references and relationship
    validate_asset_references(
        db=db,
        category_id=effective_cat,
        department_id=effective_dept,
        section_id=effective_sec,
    )

    update_data = asset_data.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(asset, field, value)

    db.commit()
    db.refresh(asset)
    return asset


@router.delete("/{id}")
def delete_asset(
    id: int,
    db: Session = Depends(get_db),
    current_admin: User = Depends(require_role("Admin")),
):
    asset = db.query(Asset).filter(Asset.id == id).first()
    if not asset:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Asset not found",
        )

    db.delete(asset)
    db.commit()
    return {"message": "Asset deleted successfully"}
