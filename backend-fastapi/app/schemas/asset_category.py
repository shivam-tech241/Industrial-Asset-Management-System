from typing import Optional
from pydantic import BaseModel, ConfigDict


class AssetCategoryBase(BaseModel):
    name: str


class AssetCategoryCreate(AssetCategoryBase):
    pass


class AssetCategoryUpdate(BaseModel):
    name: Optional[str] = None


class AssetCategoryOut(AssetCategoryBase):
    id: int

    model_config = ConfigDict(from_attributes=True)
