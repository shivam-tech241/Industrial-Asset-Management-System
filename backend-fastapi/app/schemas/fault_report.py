import enum
from datetime import datetime
from typing import Optional
from pydantic import BaseModel, ConfigDict


class FaultSeverity(str, enum.Enum):
    LOW = "Low"
    MEDIUM = "Medium"
    HIGH = "High"
    CRITICAL = "Critical"


class FaultStatus(str, enum.Enum):
    OPEN = "Open"
    IN_PROGRESS = "In Progress"
    RESOLVED = "Resolved"


class FaultReportBase(BaseModel):
    asset_id: int
    reported_by: int
    description: str
    severity: Optional[FaultSeverity] = FaultSeverity.MEDIUM
    photo_path: Optional[str] = None


class FaultReportCreate(FaultReportBase):
    reported_by: Optional[int] = None


class FaultReportStatusUpdate(BaseModel):
    status: FaultStatus


class FaultReportUpdate(BaseModel):
    description: Optional[str] = None
    severity: Optional[FaultSeverity] = None
    status: Optional[FaultStatus] = None
    photo_path: Optional[str] = None
    resolved_at: Optional[datetime] = None


class FaultReportOut(FaultReportBase):
    id: int
    status: FaultStatus
    reported_at: Optional[datetime] = None
    resolved_at: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True)
