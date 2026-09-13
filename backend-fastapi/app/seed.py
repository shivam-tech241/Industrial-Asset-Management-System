from sqlalchemy.orm import Session
from app.models.role import Role


def seed_roles(db: Session):
    roles_to_seed = ["Admin", "Technician", "Viewer"]
    for role_name in roles_to_seed:
        existing_role = db.query(Role).filter(Role.role_name == role_name).first()
        if not existing_role:
            new_role = Role(role_name=role_name)
            db.add(new_role)
    db.commit()
