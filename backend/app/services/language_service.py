import json
import logging
from typing import Dict, Any, List
import httpx
from fastapi import HTTPException, status
from app.core.config import settings

logger = logging.getLogger("karigar_ai.language_service")


class LanguageService:
    def __init__(self):
        self.hi_translations_map = {
            "handcrafted": "हस्तनिर्मित",
            "pottery": "मिट्टी के बर्तन",
            "terracotta": "टेराकोटा",
            "clay": "मिट्टी",
            "shawl": "शॉल",
            "silk": "रेशम",
            "wood": "लकड़ी",
            "statue": "मूर्ति",
            "sculpture": "मूर्ति",
            "brass": "पीतल",
            "diya": "दीया",
            "lamp": "दीपक",
            "home decor": "गृह सज्जा",
            "home & living": "गृह एवं सजावट",
        }

    async def translate_catalog(
        self,
        title: str | None,
        description: str | None,
        category: str | None,
        tags: List[str] | None,
        target_language: str = "hi",
    ) -> Dict[str, Any]:
        """
        Translates catalog fields (title, description, category, tags) into target language ('hi' or 'en').
        """
        lang = target_language.lower().strip()
        if lang not in ["hi", "hindi", "en", "english"]:
            lang = "hi"

        target_name = "Hindi" if lang in ["hi", "hindi"] else "English"

        gemini_key = settings.GEMINI_API_KEY
        openai_key = settings.OPENAI_API_KEY

        if gemini_key and gemini_key != "your_gemini_api_key_here":
            return await self._translate_with_gemini(title, description, category, tags, target_name)
        elif openai_key and openai_key != "your_openai_api_key_here":
            return await self._translate_with_openai(title, description, category, tags, target_name)
        else:
            logger.info("No LLM key configured. Using dictionary fallback translator.")
            return self._fallback_translate(title, description, category, tags, target_name)

    async def _translate_with_gemini(
        self,
        title: str | None,
        description: str | None,
        category: str | None,
        tags: List[str] | None,
        target_name: str,
    ) -> Dict[str, Any]:
        prompt = (
            f"You are a professional artisan marketplace translator for KarigarAI. "
            f"Translate the following product catalog fields into {target_name}. "
            f"Return ONLY a JSON object containing these exact keys:\n"
            f"- title: Translated title\n"
            f"- description: Translated description\n"
            f"- category: Translated category hierarchy\n"
            f"- tags: Array of translated search tags\n\n"
            f"Input Catalog Content:\n"
            f"- title: {title or ''}\n"
            f"- description: {description or ''}\n"
            f"- category: {category or ''}\n"
            f"- tags: {json.dumps(tags or [])}\n"
        )

        url = f"https://generativelanguage.googleapis.com/v1beta/models/{settings.GEMINI_MODEL}:generateContent?key={settings.GEMINI_API_KEY}"
        payload = {
            "contents": [{"parts": [{"text": prompt}]}],
            "generationConfig": {"response_mime_type": "application/json"},
        }

        try:
            async with httpx.AsyncClient(timeout=25.0) as client:
                response = await client.post(url, json=payload)

            if response.status_code != 200:
                return self._fallback_translate(title, description, category, tags, target_name)

            data = response.json()
            raw_text = (
                data.get("candidates", [{}])[0]
                .get("content", {})
                .get("parts", [{}])[0]
                .get("text", "")
                .strip()
            )
            return self._parse_json_translation(raw_text, title, description, category, tags)

        except Exception as e:
            logger.error(f"Gemini translation error: {e}")
            return self._fallback_translate(title, description, category, tags, target_name)

    async def _translate_with_openai(
        self,
        title: str | None,
        description: str | None,
        category: str | None,
        tags: List[str] | None,
        target_name: str,
    ) -> Dict[str, Any]:
        system_prompt = (
            f"You are a professional artisan marketplace translator. "
            f"Translate the provided catalog entry into {target_name}. "
            f"Respond ONLY with a JSON object containing 'title', 'description', 'category', 'tags'."
        )

        user_content = json.dumps({
            "title": title or "",
            "description": description or "",
            "category": category or "",
            "tags": tags or [],
        })

        url = "https://api.openai.com/v1/chat/completions"
        headers = {
            "Authorization": f"Bearer {settings.OPENAI_API_KEY}",
            "Content-Type": "application/json",
        }
        payload = {
            "model": "gpt-4o-mini",
            "messages": [
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_content},
            ],
            "response_format": {"type": "json_object"},
        }

        try:
            async with httpx.AsyncClient(timeout=25.0) as client:
                response = await client.post(url, headers=headers, json=payload)

            if response.status_code != 200:
                return self._fallback_translate(title, description, category, tags, target_name)

            data = response.json()
            raw_text = data.get("choices", [{}])[0].get("message", {}).get("content", "").strip()
            return self._parse_json_translation(raw_text, title, description, category, tags)

        except Exception as e:
            logger.error(f"OpenAI translation error: {e}")
            return self._fallback_translate(title, description, category, tags, target_name)

    def _parse_json_translation(self, raw_text: str, orig_title, orig_desc, orig_cat, orig_tags) -> Dict[str, Any]:
        clean_text = raw_text.replace("```json", "").replace("```", "").strip()
        try:
            parsed = json.loads(clean_text)
            return {
                "title": str(parsed.get("title") or orig_title or "").strip(),
                "description": str(parsed.get("description") or orig_desc or "").strip(),
                "category": str(parsed.get("category") or orig_cat or "").strip(),
                "tags": [str(t) for t in parsed.get("tags", [])] if isinstance(parsed.get("tags"), list) else orig_tags,
            }
        except Exception:
            return self._fallback_translate(orig_title, orig_desc, orig_cat, orig_tags, "Hindi")

    def _fallback_translate(self, title, description, category, tags, target_name) -> Dict[str, Any]:
        """Robust offline rule-based translation fallback."""
        if target_name.lower() in ["hi", "hindi"]:
            t_hi = title or ""
            d_hi = description or ""
            c_hi = category or ""

            # Standard Hindi substitutions
            for en, hi in self.hi_translations_map.items():
                if en.lower() in t_hi.lower():
                    t_hi = t_hi.replace(en, hi).replace(en.capitalize(), hi)
                if en.lower() in d_hi.lower():
                    d_hi = d_hi.replace(en, hi).replace(en.capitalize(), hi)
                if en.lower() in c_hi.lower():
                    c_hi = c_hi.replace(en, hi).replace(en.capitalize(), hi)

            # Fallback prefixes if unchanged
            if t_hi == title and title:
                t_hi = f"हस्तनिर्मित {title}"
            if d_hi == description and description:
                d_hi = f"प्रामाणिक कारीगर उत्पाद: {description}"
            if c_hi == category and category:
                c_hi = "गृह एवं सजावट > हस्तशिल्प"

            tags_hi = [self.hi_translations_map.get(t.lower(), f"हस्तशिल्प-{t}") for t in (tags or [])]

            return {
                "title": t_hi,
                "description": d_hi,
                "category": c_hi,
                "tags": tags_hi,
            }
        else:
            return {
                "title": title or "",
                "description": description or "",
                "category": category or "",
                "tags": tags or [],
            }


language_service = LanguageService()
