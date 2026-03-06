import os
from pydantic_settings import BaseSettings



class Settings(BaseSettings):
    API_V1_STR: str = "/api/v1"
    TARGET_COUNT: int = int(os.getenv("TARGET_COUNT", 190))


settings = Settings()
