from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError

from app.database import get_db
from app.models.asset_category import AssetCategory
from app.models.user import User
from app.schemas.asset_category import (
    AssetCategoryCreate,
    AssetCategoryUpdate,
    AssetCategoryOut,
)
from app.auth.dependencies import get_current_user, require_role

router = APIRouter(prefix="/asset-categories", tags=["asset-categories"])


@router.get("", response_model=List[AssetCategoryOut])
def get_asset_categories(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return db.query(AssetCategory).all()


@router.get("/{id}", response_model=AssetCategoryOut)
def get_asset_category(
    id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    category = db.query(AssetCategory).filter(AssetCategory.id == id).first()
    if not category:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Asset category not found",
        )
    return category


@router.post("", response_model=AssetCategoryOut, status_code=status.HTTP_201_CREATED)
def create_asset_category(
    category_data: AssetCategoryCreate,
    db: Session = Depends(get_db),
    current_admin: User = Depends(require_role("Admin")),
):
    existing = db.query(AssetCategory).filter(AssetCategory.name == category_data.name).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Asset category with this name already exists",
        )

    category = AssetCategory(name=category_data.name)
    db.add(category)
    db.commit()
    db.refresh(category)
    return category


@router.put("/{id}", response_model=AssetCategoryOut)
def update_asset_category(
    id: int,
    category_data: AssetCategoryUpdate,
    db: Session = Depends(get_db),
    current_admin: User = Depends(require_role("Admin")),
):
    category = db.query(AssetCategory).filter(AssetCategory.id == id).first()
    if not category:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Asset category not found",
        )

    if category_data.name is not None:
        existing = db.query(AssetCategory).filter(
            AssetCategory.name == category_data.name,
            AssetCategory.id != id,
        ).first()
        if existing:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Asset category with this name already exists",
            )
        category.name = category_data.name

    db.commit()
    db.refresh(category)
    return category


@router.delete("/{id}")
def delete_asset_category(
    id: int,
    db: Session = Depends(get_db),
    current_admin: User = Depends(require_role("Admin")),
):
    category = db.query(AssetCategory).filter(AssetCategory.id == id).first()
    if not category:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Asset category not found",
        )

    try:
        db.delete(category)
        db.commit()
    except IntegrityError:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot delete asset category: associated assets still exist",
        )
    return {"message": "Asset category deleted successfully"}
