import json
import logging
from typing import Dict, Any
import httpx
from fastapi import HTTPException, status
from app.core.config import settings

logger = logging.getLogger("karigar_ai.catalog_service")


class CatalogService:
    def __init__(self):
        self.system_prompt = (
            "You are an expert e-commerce catalog generator for KarigarAI. "
            "Using the provided vision analysis of an artisan craft product, generate a marketplace-ready catalog entry. "
            "Return ONLY a JSON object containing these exact 5 keys:\n"
            "- title: A concise, attractive, marketplace-friendly title (e.g. 'Handcrafted Terracotta Clay Pot - Traditional Indian Style')\n"
            "- description: A professional, grounded product description highlighting craft, material, color, and style. Do not invent unverified claims.\n"
            "- category: E-commerce category hierarchy (e.g. 'Home & Living > Home Decor > Pottery & Vases')\n"
            "- tags: An array of 5 to 10 relevant search tags (e.g. ['terracotta', 'pottery', 'handcrafted', 'home decor', 'clay'])\n"
            "- seo_keywords: An array of 3 to 6 high-intent SEO keywords or phrases\n"
            "Do not include markdown formatting or extra commentary outside the JSON."
        )

    async def generate_catalog(self, vision_analysis: Dict[str, Any]) -> Dict[str, Any]:
        """
        Generates a marketplace-ready product catalog based on Vision AI analysis.
        Uses Gemini/OpenAI API if keys are set, otherwise uses deterministic fallback.
        """
        gemini_key = settings.GEMINI_API_KEY
        openai_key = settings.OPENAI_API_KEY

        if gemini_key and gemini_key != "your_gemini_api_key_here":
            return await self._generate_with_gemini(vision_analysis, gemini_key)
        elif openai_key and openai_key != "your_openai_api_key_here":
            return await self._generate_with_openai(vision_analysis, openai_key)
        else:
            logger.info("No active Vision/LLM API key found in .env. Using offline catalog generator.")
            return self._offline_fallback_catalog(vision_analysis)

    async def _generate_with_gemini(self, vision_analysis: Dict[str, Any], api_key: str) -> Dict[str, Any]:
        prompt = (
            f"{self.system_prompt}\n\n"
            f"Input Vision Analysis:\n"
            f"- Product Type: {vision_analysis.get('product_type')}\n"
            f"- Material: {vision_analysis.get('material')}\n"
            f"- Primary Color: {vision_analysis.get('primary_color')}\n"
            f"- Craft Type: {vision_analysis.get('craft_type')}\n"
            f"- Style: {vision_analysis.get('style')}\n"
        )

        url = f"https://generativelanguage.googleapis.com/v1beta/models/{settings.GEMINI_MODEL}:generateContent?key={api_key}"
        payload = {
            "contents": [{"parts": [{"text": prompt}]}],
            "generationConfig": {"response_mime_type": "application/json"},
        }

        try:
            async with httpx.AsyncClient(timeout=30.0) as client:
                response = await client.post(url, json=payload)

            if response.status_code != 200:
                logger.error(f"Gemini Catalog API error ({response.status_code}): {response.text}")
                raise HTTPException(
                    status_code=status.HTTP_502_BAD_GATEWAY,
                    detail=f"Catalog generation error: Status {response.status_code} from Gemini API.",
                )

            data = response.json()
            raw_text = (
                data.get("candidates", [{}])[0]
                .get("content", {})
                .get("parts", [{}])[0]
                .get("text", "")
                .strip()
            )
            return self._parse_json_catalog(raw_text)

        except HTTPException:
            raise
        except Exception as e:
            logger.error(f"Gemini Catalog API request failed: {str(e)}")
            raise HTTPException(
                status_code=status.HTTP_502_BAD_GATEWAY,
                detail=f"Failed to generate catalog via Gemini API: {str(e)}",
            )

    async def _generate_with_openai(self, vision_analysis: Dict[str, Any], api_key: str) -> Dict[str, Any]:
        user_content = (
            f"Input Vision Analysis:\n"
            f"- Product Type: {vision_analysis.get('product_type')}\n"
            f"- Material: {vision_analysis.get('material')}\n"
            f"- Primary Color: {vision_analysis.get('primary_color')}\n"
            f"- Craft Type: {vision_analysis.get('craft_type')}\n"
            f"- Style: {vision_analysis.get('style')}\n"
        )

        url = "https://api.openai.com/v1/chat/completions"
        headers = {
            "Authorization": f"Bearer {api_key}",
            "Content-Type": "application/json",
        }
        payload = {
            "model": "gpt-4o-mini",
            "messages": [
                {"role": "system", "content": self.system_prompt},
                {"role": "user", "content": user_content},
            ],
            "response_format": {"type": "json_object"},
        }

        try:
            async with httpx.AsyncClient(timeout=30.0) as client:
                response = await client.post(url, headers=headers, json=payload)

            if response.status_code != 200:
                logger.error(f"OpenAI Catalog API error ({response.status_code}): {response.text}")
                raise HTTPException(
                    status_code=status.HTTP_502_BAD_GATEWAY,
                    detail=f"Catalog generation error: Status {response.status_code} from OpenAI API.",
                )

            data = response.json()
            raw_text = data.get("choices", [{}])[0].get("message", {}).get("content", "").strip()
            return self._parse_json_catalog(raw_text)

        except HTTPException:
            raise
        except Exception as e:
            logger.error(f"OpenAI Catalog API request failed: {str(e)}")
            raise HTTPException(
                status_code=status.HTTP_502_BAD_GATEWAY,
                detail=f"Failed to generate catalog via OpenAI API: {str(e)}",
            )

    def _parse_json_catalog(self, raw_text: str) -> Dict[str, Any]:
        clean_text = raw_text.replace("```json", "").replace("```", "").strip()
        try:
            parsed = json.loads(clean_text)
        except json.JSONDecodeError:
            logger.error(f"Failed to parse catalog JSON response: {raw_text}")
            raise HTTPException(
                status_code=status.HTTP_502_BAD_GATEWAY,
                detail="Catalog AI response could not be parsed as valid JSON.",
            )

        required_keys = ["title", "description", "category", "tags", "seo_keywords"]
        missing_keys = [k for k in required_keys if k not in parsed]

        if missing_keys:
            raise HTTPException(
                status_code=status.HTTP_502_BAD_GATEWAY,
                detail=f"Catalog AI response missing required keys: {', '.join(missing_keys)}",
            )

        tags = [str(t).lower().strip() for t in parsed.get("tags", [])]
        seo_keywords = [str(k).strip() for k in parsed.get("seo_keywords", [])]

        # Enforce 5-10 tags limit requirement
        if len(tags) < 5:
            tags.extend(["artisan", "handcrafted", "authentic craft", "traditional art", "karigar"])
        tags = list(dict.fromkeys(tags))[:10]  # Remove duplicates and cap at 10

        return {
            "title": str(parsed["title"]).strip(),
            "description": str(parsed["description"]).strip(),
            "category": str(parsed["category"]).strip(),
            "tags": tags,
            "seo_keywords": seo_keywords,
        }

    def _offline_fallback_catalog(self, vision_analysis: Dict[str, Any]) -> Dict[str, Any]:
        product_type = vision_analysis.get("product_type", "Artisan Product")
        material = vision_analysis.get("material", "Natural Material")
        primary_color = vision_analysis.get("primary_color", "Multicolor")
        craft_type = vision_analysis.get("craft_type", "Handcrafted")
        style = vision_analysis.get("style", "Traditional")

        title = f"Handcrafted {material} {product_type} - {style} Style ({primary_color})"
        description = (
            f"Authentic {primary_color.lower()} {product_type.lower()} meticulously created using traditional {craft_type.lower()} techniques. "
            f"Made from high-quality {material.lower()}, this piece showcases timeless {style.lower()} craftsmanship, perfect for home decor or gifting."
        )

        category_map = {
            "pottery": "Home & Living > Home Decor > Pottery & Vases",
            "statue": "Home & Living > Home Decor > Sculptures & Figurines",
            "wood": "Home & Living > Home Decor > Wooden Artifacts",
            "shawl": "Apparel & Accessories > Ethnic Wear > Handwoven Shawls",
            "diya": "Home & Living > Religious & Festive Decor > Brass Artifacts",
        }

        matched_cat = "Home & Living > Artisan Crafts & Decor"
        for key, cat_val in category_map.items():
            if key in product_type.lower() or key in craft_type.lower() or key in material.lower():
                matched_cat = cat_val
                break

        base_slugs = [
            product_type.lower(),
            material.lower(),
            craft_type.lower(),
            style.lower(),
            primary_color.lower(),
            "handcrafted",
            "artisan product",
            "karigar craft",
            "ethnic decor",
        ]
        tags = list(dict.fromkeys([s.replace(" ", "-") for s in base_slugs if s]))[:8]

        seo_keywords = [
            f"handcrafted {material.lower()} {product_type.lower()}",
            f"authentic {craft_type.lower()} {product_type.lower()}",
            f"{style.lower()} {product_type.lower()} online",
            f"artisan {product_type.lower()}",
        ]

        return {
            "title": title,
            "description": description,
            "category": matched_cat,
            "tags": tags,
            "seo_keywords": seo_keywords,
        }


catalog_service = CatalogService()
