import enum
from datetime import date
from decimal import Decimal
from typing import Optional
from pydantic import BaseModel, ConfigDict


class MaintenanceStatus(str, enum.Enum):
    COMPLETED = "Completed"
    PENDING = "Pending"
    IN_PROGRESS = "In Progress"


class MaintenanceLogBase(BaseModel):
    asset_id: int
    performed_by: int
    date: Optional[date] = None
    description: Optional[str] = None
    cost: Optional[Decimal] = Decimal("0.00")
    status: Optional[MaintenanceStatus] = MaintenanceStatus.PENDING
    next_due_date: Optional[date] = None


class MaintenanceLogCreate(MaintenanceLogBase):
    pass


class MaintenanceLogUpdate(BaseModel):
    asset_id: Optional[int] = None
    performed_by: Optional[int] = None
    date: Optional[date] = None
    description: Optional[str] = None
    cost: Optional[Decimal] = None
    status: Optional[MaintenanceStatus] = None
    next_due_date: Optional[date] = None


class MaintenanceLogOut(MaintenanceLogBase):
    id: int
    date: Optional[date] = None
    status: MaintenanceStatus

    model_config = ConfigDict(from_attributes=True)
