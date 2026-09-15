from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.maintenance_log import MaintenanceLog, MaintenanceStatus
from app.models.asset import Asset
from app.models.user import User
from app.schemas.maintenance_log import (
    MaintenanceLogCreate,
    MaintenanceLogUpdate,
    MaintenanceLogOut,
)
from app.auth.dependencies import get_current_user, require_role

router = APIRouter(prefix="/maintenance-logs", tags=["maintenance-logs"])


@router.get("", response_model=List[MaintenanceLogOut])
def get_maintenance_logs(
    asset_id: Optional[int] = Query(None, description="Filter logs by asset ID"),
    performed_by: Optional[int] = Query(None, description="Filter logs by user ID who performed maintenance"),
    status: Optional[MaintenanceStatus] = Query(None, description="Filter logs by status"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    query = db.query(MaintenanceLog)
    if asset_id is not None:
        query = query.filter(MaintenanceLog.asset_id == asset_id)
    if performed_by is not None:
        query = query.filter(MaintenanceLog.performed_by == performed_by)
    if status is not None:
        query = query.filter(MaintenanceLog.status == status)
    return query.all()


@router.get("/{id}", response_model=MaintenanceLogOut)
def get_maintenance_log(
    id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    log = db.query(MaintenanceLog).filter(MaintenanceLog.id == id).first()
    if not log:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Maintenance log not found",
        )
    return log


@router.post("", response_model=MaintenanceLogOut, status_code=status.HTTP_201_CREATED)
def create_maintenance_log(
    log_data: MaintenanceLogCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role("Admin", "Technician")),
):
    # Verify asset_id exists (404 if not)
    asset = db.query(Asset).filter(Asset.id == log_data.asset_id).first()
    if not asset:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Asset not found",
        )

    # Verify performed_by refers to an existing user (404 if not)
    performer = db.query(User).filter(User.id == log_data.performed_by).first()
    if not performer:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User (performer) not found",
        )

    new_log = MaintenanceLog(
        asset_id=log_data.asset_id,
        performed_by=log_data.performed_by,
        date=log_data.date,
        description=log_data.description,
        cost=log_data.cost,
        status=log_data.status or MaintenanceStatus.PENDING,
        next_due_date=log_data.next_due_date,
    )
    db.add(new_log)
    db.commit()
    db.refresh(new_log)
    return new_log


@router.put("/{id}", response_model=MaintenanceLogOut)
def update_maintenance_log(
    id: int,
    log_data: MaintenanceLogUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role("Admin", "Technician")),
):
    log = db.query(MaintenanceLog).filter(MaintenanceLog.id == id).first()
    if not log:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Maintenance log not found",
        )

    if log_data.asset_id is not None:
        asset = db.query(Asset).filter(Asset.id == log_data.asset_id).first()
        if not asset:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Asset not found",
            )
        log.asset_id = log_data.asset_id

    if log_data.performed_by is not None:
        performer = db.query(User).filter(User.id == log_data.performed_by).first()
        if not performer:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User (performer) not found",
            )
        log.performed_by = log_data.performed_by

    update_data = log_data.model_dump(exclude_unset=True, exclude={"asset_id", "performed_by"})
    for field, value in update_data.items():
        setattr(log, field, value)

    db.commit()
    db.refresh(log)
    return log


@router.delete("/{id}")
def delete_maintenance_log(
    id: int,
    db: Session = Depends(get_db),
    current_admin: User = Depends(require_role("Admin")),
):
    log = db.query(MaintenanceLog).filter(MaintenanceLog.id == id).first()
    if not log:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Maintenance log not found",
        )

    db.delete(log)
    db.commit()
    return {"message": "Maintenance log deleted successfully"}
