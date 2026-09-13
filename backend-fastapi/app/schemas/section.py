from typing import Optional
from pydantic import BaseModel, ConfigDict


class SectionBase(BaseModel):
    name: str
    department_id: int


class SectionCreate(SectionBase):
    pass


class SectionUpdate(BaseModel):
    name: Optional[str] = None
    department_id: Optional[int] = None


class SectionOut(SectionBase):
    id: int

    model_config = ConfigDict(from_attributes=True)
