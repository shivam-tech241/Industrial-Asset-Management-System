from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.database import Base, engine, SessionLocal
from app.models import role, department, section, asset_category, user, asset, maintenance_log, fault_report
from app.seed import seed_roles
from app.routers.auth import router as auth_router, users_router
from app.routers.role import router as role_router
from app.routers.department import router as department_router
from app.routers.section import router as section_router
from app.routers.asset_category import router as asset_category_router
from app.routers.asset import router as asset_router
from app.routers.maintenance_log import router as maintenance_log_router
from app.routers.fault_report import router as fault_report_router

Base.metadata.create_all(bind=engine)

db = SessionLocal()
try:
    seed_roles(db)
finally:
    db.close()

app = FastAPI(title="Industrial Asset Management API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:3000",
        "http://127.0.0.1:3000",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_router)
app.include_router(users_router)
app.include_router(role_router)
app.include_router(department_router)
app.include_router(section_router)
app.include_router(asset_category_router)
app.include_router(asset_router)
app.include_router(maintenance_log_router)
app.include_router(fault_report_router)

@app.get("/")
def root():
    return {"status": "ok"}