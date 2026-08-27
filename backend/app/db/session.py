import os
import tempfile
import logging
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base
from app.core.config import settings

logger = logging.getLogger("karigar_ai.database")

# Primary Database Connection with Automatic Fallback
db_url = settings.DATABASE_URL
connect_args = {}

if db_url.startswith("sqlite"):
    connect_args["check_same_thread"] = False


def get_fallback_sqlite_url():
    tmp_dir = tempfile.gettempdir()
    db_path = os.path.join(tmp_dir, "karigarai.db")
    return f"sqlite:///{db_path}"


try:
    engine = create_engine(db_url, connect_args=connect_args)
    # Test connection
    with engine.connect() as conn:
        pass
    logger.info(f"Connected successfully to database target: {db_url.split('@')[-1] if '@' in db_url else db_url}")
except Exception as e:
    logger.warning(f"Could not connect to database '{db_url}': {e}. Falling back to writable SQLite database.")
    db_url = get_fallback_sqlite_url()
    engine = create_engine(db_url, connect_args={"check_same_thread": False})

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()


def get_db():
    """FastAPI Dependency for database sessions."""
    init_db()
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def init_db():
    """Initializes database tables."""
    try:
        Base.metadata.create_all(bind=engine)
    except Exception as e:
        logger.error(f"Database initialization error: {e}")

