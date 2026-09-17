from app.schemas.role import RoleBase, RoleOut
from app.schemas.department import DepartmentBase, DepartmentCreate, DepartmentUpdate, DepartmentOut
from app.schemas.section import SectionBase, SectionCreate, SectionUpdate, SectionOut
from app.schemas.asset_category import AssetCategoryBase, AssetCategoryCreate, AssetCategoryUpdate, AssetCategoryOut
from app.schemas.user import UserBase, UserCreate, UserUpdate, UserOut
from app.schemas.asset import AssetStatus, AssetBase, AssetCreate, AssetUpdate, AssetOut
from app.schemas.maintenance_log import (
    MaintenanceStatus,
    MaintenanceLogBase,
    MaintenanceLogCreate,
    MaintenanceLogUpdate,
    MaintenanceLogOut,
)
from app.schemas.fault_report import (
    FaultSeverity,
    FaultStatus,
    FaultReportBase,
    FaultReportCreate,
    FaultReportStatusUpdate,
    FaultReportUpdate,
    FaultReportOut,
)
from app.schemas.auth import LoginRequest, Token, LoginUserOut

__all__ = [
    "RoleBase",
    "RoleOut",
    "DepartmentBase",
    "DepartmentCreate",
    "DepartmentUpdate",
    "DepartmentOut",
    "SectionBase",
    "SectionCreate",
    "SectionUpdate",
    "SectionOut",
    "AssetCategoryBase",
    "AssetCategoryCreate",
    "AssetCategoryUpdate",
    "AssetCategoryOut",
    "UserBase",
    "UserCreate",
    "UserUpdate",
    "UserOut",
    "AssetStatus",
    "AssetBase",
    "AssetCreate",
    "AssetUpdate",
    "AssetOut",
    "MaintenanceStatus",
    "MaintenanceLogBase",
    "MaintenanceLogCreate",
    "MaintenanceLogUpdate",
    "MaintenanceLogOut",
    "FaultSeverity",
    "FaultStatus",
    "FaultReportBase",
    "FaultReportCreate",
    "FaultReportStatusUpdate",
    "FaultReportUpdate",
    "FaultReportOut",
    "LoginRequest",
    "Token",
    "LoginUserOut",
]
