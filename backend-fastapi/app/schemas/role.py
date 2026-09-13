from pydantic import BaseModel, ConfigDict


class RoleBase(BaseModel):
    role_name: str


class RoleOut(RoleBase):
    id: int

    model_config = ConfigDict(from_attributes=True)
