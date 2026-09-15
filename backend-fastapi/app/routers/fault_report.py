from datetime import datetime, timezone
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.fault_report import FaultReport, FaultSeverity, FaultStatus
from app.models.asset import Asset
from app.models.user import User
from app.schemas.fault_report import (
    FaultReportCreate,
    FaultReportStatusUpdate,
    FaultReportUpdate,
    FaultReportOut,
)
from app.auth.dependencies import get_current_user, require_role

router = APIRouter(prefix="/fault-reports", tags=["fault-reports"])


@router.get("", response_model=List[FaultReportOut])
def get_fault_reports(
    asset_id: Optional[int] = Query(None, description="Filter reports by asset ID"),
    reported_by: Optional[int] = Query(None, description="Filter reports by reporter user ID"),
    status: Optional[FaultStatus] = Query(None, description="Filter reports by status"),
    severity: Optional[FaultSeverity] = Query(None, description="Filter reports by severity"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    query = db.query(FaultReport)
    if asset_id is not None:
        query = query.filter(FaultReport.asset_id == asset_id)
    if reported_by is not None:
        query = query.filter(FaultReport.reported_by == reported_by)
    if status is not None:
        query = query.filter(FaultReport.status == status)
    if severity is not None:
        query = query.filter(FaultReport.severity == severity)
    return query.all()


@router.get("/{id}", response_model=FaultReportOut)
def get_fault_report(
    id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    report = db.query(FaultReport).filter(FaultReport.id == id).first()
    if not report:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Fault report not found",
        )
    return report


@router.post("", response_model=FaultReportOut, status_code=status.HTTP_201_CREATED)
def create_fault_report(
    report_data: FaultReportCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role("Admin", "Technician")),
):
    # Verify asset_id exists (404 if not)
    asset = db.query(Asset).filter(Asset.id == report_data.asset_id).first()
    if not asset:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Asset not found",
        )

    # Always enforce status = Open and reported_by = current_user.id
    new_report = FaultReport(
        asset_id=report_data.asset_id,
        reported_by=current_user.id,
        description=report_data.description,
        severity=report_data.severity or FaultSeverity.MEDIUM,
        status=FaultStatus.OPEN,
        photo_path=report_data.photo_path,
    )
    db.add(new_report)
    db.commit()
    db.refresh(new_report)
    return new_report


@router.put("/{id}", response_model=FaultReportOut)
def update_fault_report(
    id: int,
    report_data: FaultReportUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role("Admin", "Technician")),
):
    report = db.query(FaultReport).filter(FaultReport.id == id).first()
    if not report:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Fault report not found",
        )

    # General field updates only: description, severity, photo_path
    if report_data.description is not None:
        report.description = report_data.description
    if report_data.severity is not None:
        report.severity = report_data.severity
    if report_data.photo_path is not None:
        report.photo_path = report_data.photo_path

    db.commit()
    db.refresh(report)
    return report


@router.patch("/{id}/status", response_model=FaultReportOut)
def update_fault_report_status(
    id: int,
    status_data: FaultReportStatusUpdate,
    db: Session = Depends(get_db),
    current_admin: User = Depends(require_role("Admin")),
):
    report = db.query(FaultReport).filter(FaultReport.id == id).first()
    if not report:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Fault report not found",
        )

    report.status = status_data.status
    if status_data.status == FaultStatus.RESOLVED:
        report.resolved_at = datetime.now(timezone.utc)
    else:
        report.resolved_at = None

    db.commit()
    db.refresh(report)
    return report


@router.delete("/{id}")
def delete_fault_report(
    id: int,
    db: Session = Depends(get_db),
    current_admin: User = Depends(require_role("Admin")),
):
    report = db.query(FaultReport).filter(FaultReport.id == id).first()
    if not report:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Fault report not found",
        )

    db.delete(report)
    db.commit()
    return {"message": "Fault report deleted successfully"}
