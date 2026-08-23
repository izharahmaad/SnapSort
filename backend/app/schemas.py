from pydantic import BaseModel, Field


class AnalyzeRequest(BaseModel):
    imageBase64: str
    mimeType: str = "image/jpeg"


class AnalyzeResponse(BaseModel):
    itemName: str
    category: str
    confidence: str
    ecoScore: int = Field(
        ge=0,
        le=10,
    )
    disposalAdvice: str
    reuseIdea: str = ""
    warning: str = ""