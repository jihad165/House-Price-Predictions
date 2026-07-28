import logging
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.routes.prediction import router as prediction_router
from app.core.config import get_settings
from app.services.inference import inference_service
from app.utils.logging_config import setup_logging

settings = get_settings()
setup_logging(debug=settings.debug)
logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Load the model + locations list once, at startup, not per-request.
    logger.info("Starting up: loading model...")
    inference_service.load()
    logger.info("Model loaded, ready to serve requests.")
    yield
    logger.info("Shutting down.")


app = FastAPI(
    title=settings.app_name,
    version="1.0.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(prediction_router)
