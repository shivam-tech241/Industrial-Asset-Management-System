import enum
from sqlalchemy import Column, Integer, String, ForeignKey, Numeric, Date, DateTime, Enum as SQLEnum
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.database import Base


class AssetStatus(str, enum.Enum):
    ACTIVE = "Active"
    UNDER_MAINTENANCE = "Under Maintenance"
    FAULTY = "Faulty"
    RETIRED = "Retired"


class Asset(Base):
    __tablename__ = "assets"

    id = Column(Integer, primary_key=True, index=True)
    asset_tag = Column(String, unique=True, nullable=False, index=True)
    name = Column(String, nullable=False)
    category_id = Column(Integer, ForeignKey("asset_categories.id"), nullable=False)
    department_id = Column(Integer, ForeignKey("departments.id"), nullable=False)
    section_id = Column(Integer, ForeignKey("sections.id"), nullable=False)
    status = Column(SQLEnum(AssetStatus), nullable=False, default=AssetStatus.ACTIVE)
    purchase_date = Column(Date, nullable=True)
    cost = Column(Numeric(15, 2), nullable=True)
    vendor = Column(String, nullable=True)
    warranty_expiry = Column(Date, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    category = relationship("AssetCategory", backref="assets")
    department = relationship("Department", backref="assets")
    section = relationship("Section", backref="assets")
    maintenance_logs = relationship("MaintenanceLog", back_populates="asset", cascade="all, delete-orphan", passive_deletes=True)
    fault_reports = relationship("FaultReport", back_populates="asset", cascade="all, delete-orphan", passive_deletes=True)