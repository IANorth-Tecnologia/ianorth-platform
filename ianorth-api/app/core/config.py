from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    API_V1_STR: str = "/api/v1"
    REDIS_HOST: str = "localhost"
    REDIS_HOST: str = 6379

    class Config:
        env_file = ".env"
        extra = "ignore"

settings = Settings()
