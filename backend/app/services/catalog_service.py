import json
import logging
import re
from typing import Dict, Any, List
import httpx
from fastapi import HTTPException, status
from app.core.config import settings

logger = logging.getLogger("karigar_ai.catalog_service")


class CatalogService:
    def __init__(self):
        self.system_prompt = (
            "You are an expert e-commerce catalog generator for KarigarAI. "
            "Using the provided artisan-confirmed attributes of an artisan craft product, generate a clean, marketplace-ready catalog entry. "
            "CRITICAL CONSTRAINTS TO PREVENT HALLUCINATIONS AND POOR QUALITY:\n"
            "1. TITLE: Must be clean, concise, marketplace-friendly, and strictly between 5 to 10 words (e.g., 'Handcrafted Carved Wooden Jewelry Box'). Do NOT make titles overly long or repetitive.\n"
            "2. NO HALLUCINATIONS: Do NOT claim exact wood species (e.g., Teak, Sheesham), specific geographic origins (e.g., Rajasthani, Kashmiri), or unverified manufacturing techniques unless explicitly supported by the confirmed analysis.\n"
            "3. DESCRIPTION: Clean, natural, and professional (2-3 sentences max). Highlight visible craft, material, and utility without exaggerated or unverifiable claims.\n"
            "4. TAGS: Array of 5 to 10 short, search-friendly keyword phrases (e.g., ['wooden jewelry box', 'wood carving', 'handcrafted', 'jewelry storage', 'home decor']). Do NOT use hyphens joining 5 words or long ugly slugs.\n"
            "5. CATEGORY: Accurate, concise e-commerce hierarchy (e.g., 'Home & Living > Home Decor > Wooden Boxes & Storage').\n\n"
            "Return ONLY a JSON object containing these exact 5 keys:\n"
            "- title: Concise title (5-10 words)\n"
            "- description: Natural, grounded description\n"
            "- category: Clean category path\n"
            "- tags: Array of short search tags\n"
            "- seo_keywords: Array of 3 to 5 SEO search phrases\n"
            "Do not include markdown code block formatting or extra commentary outside the JSON."
        )

    def _get_val(self, item: Any, default: str = "") -> str:
        if isinstance(item, dict):
            return str(item.get("value", default)).strip()
        if item is None:
            return default
        return str(item).strip()

    async def generate_catalog(self, artisan_inputs: Dict[str, Any]) -> Dict[str, Any]:
        """
        Generates a marketplace-ready product catalog based on artisan-provided facts.
        Uses Gemini/OpenAI API if keys are set, otherwise uses deterministic fallback.
        """
        gemini_key = settings.GEMINI_API_KEY
        openai_key = settings.OPENAI_API_KEY

        p_name = self._get_val(artisan_inputs.get("product_name") or artisan_inputs.get("product_type"), "Handcrafted Artisan Product")
        mat = self._get_val(artisan_inputs.get("material"), "Quality Material")
        craft = self._get_val(artisan_inputs.get("craft_type"), "Handicraft")
        size = self._get_val(artisan_inputs.get("product_size"), "Medium")
        basic_desc = self._get_val(artisan_inputs.get("basic_description") or artisan_inputs.get("description"), "")

        clean_analysis = {
            "product_name": p_name,
            "product_type": p_name,
            "material": mat,
            "craft_type": craft,
            "product_size": size,
            "basic_description": basic_desc,
            "primary_color": self._get_val(artisan_inputs.get("primary_color"), "Natural"),
            "style": self._get_val(artisan_inputs.get("style"), "Traditional Handcrafted"),
        }

        if gemini_key and gemini_key != "your_gemini_api_key_here":
            return await self._generate_with_gemini(clean_analysis, gemini_key)
        elif openai_key and openai_key != "your_openai_api_key_here":
            return await self._generate_with_openai(clean_analysis, openai_key)
        else:
            logger.info("No active LLM API key found in .env. Using offline catalog generator.")
            return self._offline_fallback_catalog(clean_analysis)

    async def _generate_with_gemini(self, vision_analysis: Dict[str, Any], api_key: str) -> Dict[str, Any]:
        prompt = (
            f"{self.system_prompt}\n\n"
            f"Input Artisan-Confirmed Attributes:\n"
            f"- Product Type: {self._get_val(vision_analysis.get('product_type'))}\n"
            f"- Material: {self._get_val(vision_analysis.get('material'))}\n"
            f"- Primary Color: {self._get_val(vision_analysis.get('primary_color'))}\n"
            f"- Craft Type: {self._get_val(vision_analysis.get('craft_type'))}\n"
            f"- Style: {self._get_val(vision_analysis.get('style'))}\n"
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
                logger.warning(f"Gemini Catalog API status ({response.status_code}). Using offline catalog generator.")
                return self._offline_fallback_catalog(vision_analysis)

            data = response.json()
            raw_text = (
                data.get("candidates", [{}])[0]
                .get("content", {})
                .get("parts", [{}])[0]
                .get("text", "")
                .strip()
            )
            return self._parse_json_catalog(raw_text, vision_analysis)

        except Exception as e:
            logger.warning(f"Gemini Catalog request failed ({e}). Using offline catalog generator.")
            return self._offline_fallback_catalog(vision_analysis)

    async def _generate_with_openai(self, vision_analysis: Dict[str, Any], api_key: str) -> Dict[str, Any]:
        user_content = (
            f"Input Artisan-Confirmed Attributes:\n"
            f"- Product Type: {self._get_val(vision_analysis.get('product_type'))}\n"
            f"- Material: {self._get_val(vision_analysis.get('material'))}\n"
            f"- Primary Color: {self._get_val(vision_analysis.get('primary_color'))}\n"
            f"- Craft Type: {self._get_val(vision_analysis.get('craft_type'))}\n"
            f"- Style: {self._get_val(vision_analysis.get('style'))}\n"
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
                logger.warning(f"OpenAI Catalog API status ({response.status_code}). Using offline catalog generator.")
                return self._offline_fallback_catalog(vision_analysis)

            data = response.json()
            raw_text = data.get("choices", [{}])[0].get("message", {}).get("content", "").strip()
            return self._parse_json_catalog(raw_text, vision_analysis)

        except Exception as e:
            logger.warning(f"OpenAI Catalog request failed ({e}). Using offline catalog generator.")
            return self._offline_fallback_catalog(vision_analysis)

    def _parse_json_catalog(self, raw_text: str, vision_analysis: Dict[str, Any]) -> Dict[str, Any]:
        clean_text = raw_text.replace("```json", "").replace("```", "").strip()
        try:
            parsed = json.loads(clean_text)
        except json.JSONDecodeError:
            return self._offline_fallback_catalog(vision_analysis)

        raw_title = str(parsed.get("title", "")).strip()
        raw_description = str(parsed.get("description", "")).strip()
        raw_category = str(parsed.get("category", "")).strip()
        raw_tags = parsed.get("tags", [])

        # Sanitize Title (Max 12 words)
        title_words = raw_title.split()
        if len(title_words) > 12:
            raw_title = " ".join(title_words[:10])

        # Sanitize Tags (Short search-friendly 2-3 word phrases)
        sanitized_tags = self._sanitize_tags(raw_tags, vision_analysis)

        pt_val = self._get_val(vision_analysis.get("product_type"), "Craft Item")

        return {
            "title": raw_title or f"Handcrafted {pt_val}",
            "description": raw_description,
            "category": raw_category or "Home & Living > Home Decor > Wooden Boxes & Storage",
            "tags": sanitized_tags,
            "seo_keywords": [str(k).strip() for k in parsed.get("seo_keywords", [])][:5],
        }

    def _sanitize_tags(self, raw_tags: Any, vision_analysis: Dict[str, Any]) -> List[str]:
        cleaned = []
        if isinstance(raw_tags, list):
            for t in raw_tags:
                t_str = str(t).lower().replace("-", " ").strip()
                # Remove extra spaces & punctuation
                t_clean = re.sub(r"[^\w\s]", "", t_str).strip()
                # Limit tag length to 3 words
                words = t_clean.split()
                if 1 <= len(words) <= 3:
                    cleaned.append(t_clean)

        # Fallback default tags if sanitized list is short
        p_type = self._get_val(vision_analysis.get("product_type"), "craft").lower()
        if "box" in p_type or "jewelry" in p_type:
            defaults = ["wooden jewelry box", "wood carving", "handcrafted", "jewelry storage", "home decor"]
        elif "pot" in p_type or "clay" in p_type:
            defaults = ["terracotta pot", "clay pottery", "handcrafted", "home decor", "earthenware"]
        elif "shawl" in p_type or "silk" in p_type:
            defaults = ["handwoven shawl", "silk scarf", "ethnic wear", "handcrafted", "handloom"]
        else:
            defaults = ["handcrafted craft", "artisan decor", "home decor", "handmade artifact", "ethnic craft"]

        for d in defaults:
            if d not in cleaned:
                cleaned.append(d)

        return list(dict.fromkeys(cleaned))[:8]

    def _offline_fallback_catalog(self, vision_analysis: Dict[str, Any]) -> Dict[str, Any]:
        product_type = self._get_val(vision_analysis.get("product_type"), "Handcrafted Artisan Product")
        material = self._get_val(vision_analysis.get("material"), "Quality Material")
        craft_type = self._get_val(vision_analysis.get("craft_type"), "Handicraft")

        if not product_type or product_type.lower() == "unknown":
            product_type = "Handcrafted Artisan Product"
        if not material or material.lower() == "unknown":
            material = "Quality Handcrafted Material"
        if not craft_type or craft_type.lower() == "unknown":
            craft_type = "Artisan Crafting"

        # Grounded, concise title (strictly under 8-10 words)
        title = f"Handcrafted {product_type}"
        description = (
            f"Authentic {product_type.lower()} meticulously created using traditional {craft_type.lower()} techniques. "
            f"Made from {material.lower()}, this piece is perfect for home decor, personal use, or gifting."
        )

        category_map = {
            "box": "Home & Living > Home Decor > Wooden Boxes & Storage",
            "jewelry": "Jewelry & Accessories > Handcrafted Jewelry",
            "earring": "Jewelry & Accessories > Handcrafted Jewelry > Earrings",
            "pottery": "Home & Living > Home Decor > Pottery & Vases",
            "pot": "Home & Living > Home Decor > Pottery & Vases",
            "vase": "Home & Living > Home Decor > Pottery & Vases",
            "statue": "Home & Living > Home Decor > Sculptures & Figurines",
            "wood": "Home & Living > Home Decor > Wooden Artifacts",
            "shawl": "Apparel & Accessories > Ethnic Wear > Handwoven Shawls",
            "textile": "Apparel & Accessories > Ethnic Wear > Handwoven Textiles",
            "bag": "Apparel & Accessories > Bags & Purses",
            "basket": "Home & Living > Home Decor > Baskets & Storage",
            "diya": "Home & Living > Religious & Festive Decor > Brass Artifacts",
            "brass": "Home & Living > Home Decor > Metal Handicrafts",
            "metal": "Home & Living > Home Decor > Metal Handicrafts",
        }

        matched_cat = "Home & Living > Handcrafted Products"
        for key, cat_val in category_map.items():
            if key in product_type.lower() or key in craft_type.lower() or key in material.lower():
                matched_cat = cat_val
                break

        tags = self._sanitize_tags([], vision_analysis)

        seo_keywords = [
            f"handcrafted {product_type.lower()}",
            f"authentic {craft_type.lower()}",
            f"{product_type.lower()} online",
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

