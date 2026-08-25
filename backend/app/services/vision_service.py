import base64
import json
import logging
from typing import Dict, Any
import httpx
from fastapi import HTTPException, status
from app.core.config import settings

logger = logging.getLogger("karigar_ai.vision_service")


class VisionService:
    def __init__(self):
        self.system_prompt = (
            "You are an expert artisan product classifier for KarigarAI. "
            "Analyze the uploaded product image and extract structured information in JSON format. "
            "Return ONLY a JSON object containing these exact 5 keys:\n"
            "- product_type: Specific type of product (e.g., Terracotta Pot, Handwoven Shawl, Wooden Statue)\n"
            "- material: Primary material (e.g., Clay, Silk, Brass, Teak Wood)\n"
            "- primary_color: Dominant color or color combination (e.g., Terracotta Red, Deep Blue, Gold)\n"
            "- craft_type: Artisan craft or technique (e.g., Handmade Pottery, Handloom Weaving, Metalwork)\n"
            "- style: Cultural or artistic style (e.g., Traditional Indian, Rajasthani Folk, Modern Minimalist)\n"
            "Do not include markdown code block formatting or extra commentary outside the JSON."
        )

    async def analyze_image(self, file_bytes: bytes, filename: str, content_type: str) -> Dict[str, Any]:
        """
        Main entry point for image analysis.
        Uses Gemini Vision API if GEMINI_API_KEY is configured.
        Falls back to OpenAI Vision API if OPENAI_API_KEY is configured.
        Returns smart offline mock analysis if no API key is provided in .env (for local testing).
        """
        gemini_key = settings.GEMINI_API_KEY
        openai_key = settings.OPENAI_API_KEY

        if gemini_key and gemini_key != "your_gemini_api_key_here":
            return await self._analyze_with_gemini(file_bytes, content_type, gemini_key)
        elif openai_key and openai_key != "your_openai_api_key_here":
            return await self._analyze_with_openai(file_bytes, content_type, openai_key)
        else:
            logger.info("No active Vision API key found in .env. Using offline structured analyzer for testing.")
            return self._offline_fallback_analysis(filename)

    async def _analyze_with_gemini(self, file_bytes: bytes, content_type: str, api_key: str) -> Dict[str, Any]:
        """
        Calls Google Gemini Vision REST API.
        """
        b64_image = base64.b64encode(file_bytes).decode("utf-8")
        url = f"https://generativelanguage.googleapis.com/v1beta/models/{settings.GEMINI_MODEL}:generateContent?key={api_key}"

        payload = {
            "contents": [
                {
                    "parts": [
                        {"text": self.system_prompt},
                        {
                            "inline_data": {
                                "mime_type": content_type,
                                "data": b64_image,
                            }
                        },
                    ]
                }
            ],
            "generationConfig": {
                "response_mime_type": "application/json"
            },
        }

        try:
            async with httpx.AsyncClient(timeout=30.0) as client:
                response = await client.post(url, json=payload)

            if response.status_code != 200:
                logger.error(f"Gemini API error ({response.status_code}): {response.text}")
                raise HTTPException(
                    status_code=status.HTTP_502_BAD_GATEWAY,
                    detail=f"Vision AI service error: Received status {response.status_code} from Gemini API.",
                )

            data = response.json()
            raw_text = (
                data.get("candidates", [{}])[0]
                .get("content", {})
                .get("parts", [{}])[0]
                .get("text", "")
                .strip()
            )

            return self._parse_json_response(raw_text)

        except HTTPException:
            raise
        except Exception as e:
            logger.error(f"Gemini API request failed: {str(e)}")
            raise HTTPException(
                status_code=status.HTTP_502_BAD_GATEWAY,
                detail=f"Failed to communicate with Gemini Vision AI service: {str(e)}",
            )

    async def _analyze_with_openai(self, file_bytes: bytes, content_type: str, api_key: str) -> Dict[str, Any]:
        """
        Calls OpenAI Vision REST API.
        """
        b64_image = base64.b64encode(file_bytes).decode("utf-8")
        url = "https://api.openai.com/v1/chat/completions"

        headers = {
            "Authorization": f"Bearer {api_key}",
            "Content-Type": "application/json",
        }

        payload = {
            "model": "gpt-4o-mini",
            "messages": [
                {
                    "role": "user",
                    "content": [
                        {"type": "text", "text": self.system_prompt},
                        {
                            "type": "image_url",
                            "image_url": {
                                "url": f"data:{content_type};base64,{b64_image}"
                            },
                        },
                    ],
                }
            ],
            "response_format": {"type": "json_object"},
        }

        try:
            async with httpx.AsyncClient(timeout=30.0) as client:
                response = await client.post(url, headers=headers, json=payload)

            if response.status_code != 200:
                logger.error(f"OpenAI API error ({response.status_code}): {response.text}")
                raise HTTPException(
                    status_code=status.HTTP_502_BAD_GATEWAY,
                    detail=f"Vision AI service error: Received status {response.status_code} from OpenAI API.",
                )

            data = response.json()
            raw_text = data.get("choices", [{}])[0].get("message", {}).get("content", "").strip()
            return self._parse_json_response(raw_text)

        except HTTPException:
            raise
        except Exception as e:
            logger.error(f"OpenAI API request failed: {str(e)}")
            raise HTTPException(
                status_code=status.HTTP_502_BAD_GATEWAY,
                detail=f"Failed to communicate with OpenAI Vision AI service: {str(e)}",
            )

    def _parse_json_response(self, raw_text: str) -> Dict[str, Any]:
        """
        Parses and validates the 5 required fields from AI JSON response.
        """
        # Clean markdown code block wraps if present
        clean_text = raw_text.replace("```json", "").replace("```", "").strip()
        try:
            parsed = json.loads(clean_text)
        except json.JSONDecodeError:
            logger.error(f"Failed to decode JSON from AI response: {raw_text}")
            raise HTTPException(
                status_code=status.HTTP_502_BAD_GATEWAY,
                detail="Vision AI response could not be parsed as valid JSON.",
            )

        required_keys = ["product_type", "material", "primary_color", "craft_type", "style"]
        missing_keys = [k for k in required_keys if k not in parsed or not parsed[k]]

        if missing_keys:
            raise HTTPException(
                status_code=status.HTTP_502_BAD_GATEWAY,
                detail=f"Vision AI response missing required fields: {', '.join(missing_keys)}",
            )

        return {
            "product_type": str(parsed["product_type"]),
            "material": str(parsed["material"]),
            "primary_color": str(parsed["primary_color"]),
            "craft_type": str(parsed["craft_type"]),
            "style": str(parsed["style"]),
        }

    def _offline_fallback_analysis(self, filename: str) -> Dict[str, Any]:
        """
        Provides structured analysis for development/testing when no API key is set in .env.
        """
        fn_lower = filename.lower()
        if "wood" in fn_lower:
            return {
                "product_type": "Wooden Statue",
                "material": "Teak Wood",
                "primary_color": "Brown",
                "craft_type": "Wood Carving",
                "style": "Traditional Indian",
            }
        elif "shawl" in fn_lower or "textile" in fn_lower or "fabric" in fn_lower:
            return {
                "product_type": "Handwoven Shawl",
                "material": "Pashmina Silk",
                "primary_color": "Royal Blue",
                "craft_type": "Handloom Weaving",
                "style": "Kashmiri Folk",
            }
        elif "metal" in fn_lower or "brass" in fn_lower:
            return {
                "product_type": "Brass Oil Lamp (Diya)",
                "material": "Brass",
                "primary_color": "Golden Yellow",
                "craft_type": "Metal Casting",
                "style": "Traditional Ethnic",
            }
        else:
            return {
                "product_type": "Terracotta Pot",
                "material": "Natural Clay",
                "primary_color": "Terracotta Red",
                "craft_type": "Handmade Pottery",
                "style": "Traditional Indian",
            }


vision_service = VisionService()
