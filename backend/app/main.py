from fastapi import Depends, FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware

from .firebase_auth import verify_firebase_user
from .gemini_service import analyze_item
from .schemas import AnalyzeRequest, AnalyzeResponse


app = FastAPI(
    title="SnapSort API",
    version="1.0.0",
)


app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health")
def health():
    return {
        "status": "ok",
        "service": "snapsort-api",
    }


@app.post(
    "/api/v1/scans/analyze",
    response_model=AnalyzeResponse,
)
def analyze_scan(
    request: AnalyzeRequest,
    firebase_user: dict = Depends(verify_firebase_user),
):
    try:
        result = analyze_item(
            request.imageBase64,
            request.mimeType,
        )

        return result

    except ValueError as error:
        raise HTTPException(
            status_code=400,
            detail=str(error),
        ) from error

    except Exception as error:
        print("Unexpected analysis error:", error)

        raise HTTPException(
            status_code=502,
            detail="Image analysis is temporarily unavailable.",
        ) from error