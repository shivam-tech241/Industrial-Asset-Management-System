import enum
from datetime import date, datetime
from decimal import Decimal
from typing import Optional
from pydantic import BaseModel, ConfigDict


class AssetStatus(str, enum.Enum):
    ACTIVE = "Active"
    UNDER_MAINTENANCE = "Under Maintenance"
    FAULTY = "Faulty"
    RETIRED = "Retired"


class AssetBase(BaseModel):
    asset_tag: str
    name: str
    category_id: int
    department_id: int
    section_id: int
    status: Optional[AssetStatus] = AssetStatus.ACTIVE
    purchase_date: Optional[date] = None
    cost: Optional[Decimal] = None
    vendor: Optional[str] = None
    warranty_expiry: Optional[date] = None


class AssetCreate(AssetBase):
    pass


class AssetUpdate(BaseModel):
    asset_tag: Optional[str] = None
    name: Optional[str] = None
    category_id: Optional[int] = None
    department_id: Optional[int] = None
    section_id: Optional[int] = None
    status: Optional[AssetStatus] = None
    purchase_date: Optional[date] = None
    cost: Optional[Decimal] = None
    vendor: Optional[str] = None
    warranty_expiry: Optional[date] = None


class AssetOut(AssetBase):
    id: int
    created_at: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True)
