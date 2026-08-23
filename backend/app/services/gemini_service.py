import asyncio
import base64
import json
import re
from typing import Any

from google import genai
from google.genai import types

from ..config import settings


client = genai.Client(
    api_key=settings.gemini_api_key
)


def _extract_json(text: str) -> dict[str, Any]:
    cleaned = text.strip()

    cleaned = re.sub(
        r"^```json\s*|\s*```$",
        "",
        cleaned,
        flags=re.IGNORECASE,
    ).strip()

    try:
        parsed = json.loads(cleaned)
    except json.JSONDecodeError:
        match = re.search(
            r"\{.*\}",
            cleaned,
            flags=re.DOTALL,
        )

        if not match:
            raise ValueError(
                "Gemini returned invalid JSON."
            )

        parsed = json.loads(match.group(0))

    if not isinstance(parsed, dict):
        raise ValueError(
            "Gemini response was not a JSON object."
        )

    return parsed


def _normalise_result(
    value: dict[str, Any],
) -> dict[str, Any]:
    allowed_categories = {
        "recycle",
        "compost",
        "trash",
        "reuse",
        "hazardous",
    }

    allowed_confidence = {
        "low",
        "medium",
        "high",
    }

    category = str(
        value.get("category", "trash")
    ).strip().lower()

    if category not in allowed_categories:
        category = "trash"

    confidence = str(
        value.get("confidence", "medium")
    ).strip().lower()

    if confidence not in allowed_confidence:
        confidence = "medium"

    try:
        eco_score = int(value.get("ecoScore", 5))
    except (TypeError, ValueError):
        eco_score = 5

    eco_score = max(0, min(10, eco_score))

    return {
        "itemName": str(
            value.get("itemName", "Unknown item")
        ).strip()
        or "Unknown item",
        "category": category,
        "confidence": confidence,
        "ecoScore": eco_score,
        "disposalAdvice": str(
            value.get(
                "disposalAdvice",
                "Follow your local disposal guidance.",
            )
        ).strip(),
        "reuseIdea": str(
            value.get("reuseIdea", "")
        ).strip(),
        "warning": str(
            value.get("warning", "")
        ).strip(),
    }


async def analyze_image(
    image_base64: str,
    mime_type: str = "image/jpeg",
) -> dict[str, Any]:
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

    prompt = """
Analyze the main waste item in this image.

Return ONLY valid JSON.
Do not use Markdown code fences.
Do not add text outside the JSON.

Use exactly this schema:
{
  "itemName": "string",
  "category": "recycle | compost | trash | reuse | hazardous",
  "confidence": "low | medium | high",
  "ecoScore": 0,
  "disposalAdvice": "string",
  "reuseIdea": "string",
  "warning": "string"
}

Rules:
- Identify the main visible item.
- Select exactly one category.
- ecoScore must be an integer from 0 to 10.
- Provide practical general disposal advice.
- Mention that local rules can vary when appropriate.
"""

    contents = [
        types.Part.from_text(text=prompt),
        types.Part.from_bytes(
            data=image_bytes,
            mime_type=mime_type,
        ),
    ]

    last_error: Exception | None = None

    for attempt in range(3):
        try:
            response = client.models.generate_content(
                model=settings.gemini_model,
                contents=contents,
                config=types.GenerateContentConfig(
                    temperature=0.2,
                    response_mime_type="application/json",
                ),
            )

            response_text = response.text

            if not response_text:
                raise ValueError(
                    "Gemini returned an empty response."
                )

            return _normalise_result(
                _extract_json(response_text)
            )

        except Exception as error:
            last_error = error
            error_text = str(error).lower()

            retryable = (
                "503" in error_text
                or "unavailable" in error_text
                or "429" in error_text
                or "resource_exhausted" in error_text
                or "deadline" in error_text
                or "timeout" in error_text
            )

            if not retryable or attempt == 2:
                raise

            await asyncio.sleep(2**attempt)

    raise last_error or RuntimeError(
        "Gemini analysis failed."
    )