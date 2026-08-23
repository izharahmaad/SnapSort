import firebase_admin
from fastapi import Header, HTTPException
from firebase_admin import auth, credentials

from .config import settings


if not firebase_admin._apps:
    service_account = credentials.Certificate(
        settings.firebase_service_account_path
    )

    firebase_admin.initialize_app(service_account)


def verify_firebase_user(
    authorization: str | None = Header(default=None),
) -> dict:
    if not authorization:
        raise HTTPException(
            status_code=401,
            detail="Authorization header is required.",
        )

    if not authorization.startswith("Bearer "):
        raise HTTPException(
            status_code=401,
            detail="Authorization must use Bearer token.",
        )

    token = authorization.removeprefix("Bearer ").strip()

    try:
        return auth.verify_id_token(token)
    except Exception as error:
        print("Firebase token verification error:", error)

        raise HTTPException(
            status_code=401,
            detail="Invalid or expired Firebase token.",
        )