import base64
import json
import re

from google import genai
from google.genai import types

from .prompts import SYSTEM_PROMPT
from .schemas import AnalyzeResponse


GEMINI_MODEL = "gemini-3.6-flash"


def parse_json_response(text: str) -> dict:
    cleaned = text.strip()

    cleaned = re.sub(
        r"^```json\s*",
        "",
        cleaned,
        flags=re.IGNORECASE,
    )

    cleaned = re.sub(
        r"\s*```$",
        "",
        cleaned,
        flags=re.IGNORECASE,
    )

    try:
        parsed = json.loads(cleaned)
    except json.JSONDecodeError as error:
        raise ValueError(
            "Gemini returned invalid JSON."
        ) from error

    if not isinstance(parsed, dict):
        raise ValueError(
            "Gemini response must be a JSON object."
        )

    return parsed


def analyze_item(
    image_base64: str,
    mime_type: str = "image/jpeg",
) -> AnalyzeResponse:
    if not image_base64:
        raise ValueError(
            "Image Base64 data is missing."
        )

    try:
        image_bytes = base64.b64decode(
            image_base64,
            validate=True,
        )
    except Exception as error:
        raise ValueError(
            "Invalid Base64 image data."
        ) from error

    if not image_bytes:
        raise ValueError(
            "The decoded image is empty."
        )

    if len(image_bytes) > 15 * 1024 * 1024:
        raise ValueError(
            "Image is too large. Please choose a smaller image."
        )

    from .config import settings

    client = genai.Client(
        api_key=settings.gemini_api_key
    )

    response = client.models.generate_content(
        model=GEMINI_MODEL,
        contents=[
            types.Part.from_text(
                text=SYSTEM_PROMPT
            ),
            types.Part.from_bytes(
                data=image_bytes,
                mime_type=mime_type,
            ),
        ],
        config=types.GenerateContentConfig(
            temperature=0.2,
            response_mime_type="application/json",
        ),
    )

    response_text = response.text or ""

    if not response_text.strip():
        raise ValueError(
            "Gemini returned an empty response."
        )

    response_data = parse_json_response(
        response_text
    )

    return AnalyzeResponse.model_validate(
        response_data
    )