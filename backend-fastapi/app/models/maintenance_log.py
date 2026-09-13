import enum
from sqlalchemy.sql import func
from sqlalchemy import Column, Integer, String, ForeignKey, Numeric, Date, Text, Enum as SQLEnum
from sqlalchemy.orm import relationship
from app.database import Base


class MaintenanceStatus(str, enum.Enum):
    COMPLETED = "Completed"
    PENDING = "Pending"
    IN_PROGRESS = "In Progress"


class MaintenanceLog(Base):
    __tablename__ = "maintenance_logs"

    id = Column(Integer, primary_key=True, index=True)
    asset_id = Column(Integer, ForeignKey("assets.id", ondelete="CASCADE"), nullable=False)
    performed_by = Column(Integer, ForeignKey("users.id"), nullable=False)
    date = Column(Date, nullable=False, server_default=func.current_date())
    description = Column(Text, nullable=True)
    cost = Column(Numeric(15, 2), nullable=True, default=0.00)
    status = Column(SQLEnum(MaintenanceStatus), nullable=False, default=MaintenanceStatus.PENDING)
    next_due_date = Column(Date, nullable=True)

    asset = relationship("Asset", back_populates="maintenance_logs")
    performer = relationship("User", backref="maintenance_logs")