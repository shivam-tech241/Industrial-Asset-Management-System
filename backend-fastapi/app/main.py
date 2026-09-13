from fastapi import FastAPI
from app.database import Base, engine, SessionLocal
from app.models import role, department, section, asset_category, user, asset, maintenance_log, fault_report
from app.seed import seed_roles
from app.routers.auth import router as auth_router, users_router

Base.metadata.create_all(bind=engine)

db = SessionLocal()
try:
    seed_roles(db)
finally:
    db.close()

app = FastAPI()

app.include_router(auth_router)
app.include_router(users_router)

@app.get("/")
def root():
    return {"status": "ok"}