import json
import logging
import re
from typing import Dict, Any, List
import httpx
from app.core.config import settings

logger = logging.getLogger("karigar_ai.language_service")


class LanguageService:
    def __init__(self):
        # Comprehensive artisan dictionary mapping for offline word-boundary fallback
        self.hi_translations_map = {
            "handcrafted": "हस्तनिर्मित",
            "hand-crafted": "हस्तनिर्मित",
            "handmade": "हस्तनिर्मित",
            "authentic": "प्रामाणिक",
            "carved": "नक्काशीदार",
            "carving": "नक्काशी",
            "wooden": "लकड़ी का",
            "wood": "लकड़ी",
            "jewelry box": "आभूषण डिब्बा",
            "jewellery box": "आभूषण डिब्बा",
            "box": "डिब्बा",
            "pottery": "मिट्टी के बर्तन",
            "terracotta": "टेराकोटा",
            "clay": "मिट्टी",
            "shawl": "शॉल",
            "silk": "रेशम",
            "cotton": "सूती",
            "embroidery": "कढ़ाई",
            "statue": "मूर्ति",
            "sculpture": "मूर्ति",
            "brass": "पीतल",
            "copper": "तांबा",
            "metal": "धातु",
            "diya": "दीया",
            "lamp": "दीपक",
            "home decor": "गृह सजावट",
            "home & living": "गृह एवं सजावट",
            "storage": "भंडारण",
            "gifting": "उपहार",
            "gift": "उपहार",
            "traditional": "पारंपरिक",
            "techniques": "तकनीकें",
            "technique": "तकनीक",
            "meticulously": "सावधानीपूर्वक",
            "created": "निर्मित",
            "made from": "से निर्मित",
            "quality": "गुणवत्तापूर्ण",
            "piece": "उत्पाद",
            "perfect for": "के लिए बेहतरीन विकल्प",
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
        Follows a robust multi-tiered translation strategy:
        1. Configured Gemini LLM API (if valid API key available)
        2. Configured OpenAI LLM API (if valid API key available)
        3. Free Web Translation API (Google Translate GTX endpoint)
        4. Offline Rule-Based & Dictionary Fallback
        """
        lang = target_language.lower().strip()
        target_code = "hi" if lang in ["hi", "hindi"] else "en"
        target_name = "Hindi" if target_code == "hi" else "English"

        gemini_key = settings.GEMINI_API_KEY
        openai_key = settings.OPENAI_API_KEY

        # Tier 1: Try Gemini LLM if key is present
        if gemini_key and gemini_key != "your_gemini_api_key_here":
            res = await self._translate_with_gemini(title, description, category, tags, target_name)
            if res:
                logger.info("Catalog translated using Gemini API.")
                return res

        # Tier 2: Try OpenAI LLM if key is present
        if openai_key and openai_key != "your_openai_api_key_here":
            res = await self._translate_with_openai(title, description, category, tags, target_name)
            if res:
                logger.info("Catalog translated using OpenAI API.")
                return res

        # Tier 3: Use Free Web Translation API (Google GTX endpoint)
        res = await self._translate_with_free_api(title, description, category, tags, target_code)
        if res:
            logger.info("Catalog translated using Free Web Translation API.")
            return res

        # Tier 4: Final Offline Dictionary Fallback
        logger.info("Using offline dictionary fallback translator.")
        return self._fallback_translate(title, description, category, tags, target_name)

    async def _translate_with_free_api(
        self,
        title: str | None,
        description: str | None,
        category: str | None,
        tags: List[str] | None,
        target_code: str,
    ) -> Dict[str, Any] | None:
        """
        Translates catalog content using free Google Translate GTX API endpoint.
        """
        try:
            async with httpx.AsyncClient(timeout=10.0) as client:
                async def _gtx_text(text: str) -> str:
                    if not text or not text.strip():
                        return ""
                    url = "https://translate.googleapis.com/translate_a/single"
                    params = {
                        "client": "gtx",
                        "sl": "auto",
                        "tl": target_code,
                        "dt": "t",
                        "q": text.strip(),
                    }
                    r = await client.get(url, params=params)
                    if r.status_code == 200:
                        data = r.json()
                        translated = "".join([item[0] for item in data[0] if item and item[0]])
                        return translated.strip()
                    return text

                t_translated = await _gtx_text(title) if title else ""
                d_translated = await _gtx_text(description) if description else ""
                c_translated = await _gtx_text(category) if category else ""

                tags_translated = []
                if tags:
                    for tag in tags:
                        tr_tag = await _gtx_text(tag) if tag else tag
                        tags_translated.append(tr_tag)

                return {
                    "title": t_translated or title or "",
                    "description": d_translated or description or "",
                    "category": c_translated or category or "",
                    "tags": tags_translated or tags or [],
                }

        except Exception as e:
            logger.warning(f"Free web translation failed, switching to dictionary fallback: {e}")
            return None

    async def _translate_with_gemini(
        self,
        title: str | None,
        description: str | None,
        category: str | None,
        tags: List[str] | None,
        target_name: str,
    ) -> Dict[str, Any] | None:
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
                logger.warning(f"Gemini API returned status {response.status_code}")
                return None

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
            return None

    async def _translate_with_openai(
        self,
        title: str | None,
        description: str | None,
        category: str | None,
        tags: List[str] | None,
        target_name: str,
    ) -> Dict[str, Any] | None:
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
                logger.warning(f"OpenAI API returned status {response.status_code}")
                return None

            data = response.json()
            raw_text = data.get("choices", [{}])[0].get("message", {}).get("content", "").strip()
            return self._parse_json_translation(raw_text, title, description, category, tags)

        except Exception as e:
            logger.error(f"OpenAI translation error: {e}")
            return None

    def _parse_json_translation(self, raw_text: str, orig_title, orig_desc, orig_cat, orig_tags) -> Dict[str, Any] | None:
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
            return None

    def _fallback_translate(self, title, description, category, tags, target_name) -> Dict[str, Any]:
        """Robust offline rule-based translation fallback with word-boundary awareness."""
        if target_name.lower() in ["hi", "hindi"]:
            t_hi = title or ""
            d_hi = description or ""
            c_hi = category or ""

            # Sort mappings by word length descending to translate multi-word phrases first
            sorted_mappings = sorted(self.hi_translations_map.items(), key=lambda x: len(x[0]), reverse=True)

            for en, hi in sorted_mappings:
                pattern = re.compile(r'\b' + re.escape(en) + r'\b', re.IGNORECASE)
                t_hi = pattern.sub(hi, t_hi)
                d_hi = pattern.sub(hi, d_hi)
                c_hi = pattern.sub(hi, c_hi)

            # Fallback prefixes if unchanged
            if t_hi == title and title:
                t_hi = f"हस्तनिर्मित {title}"
            if d_hi == description and description:
                d_hi = f"प्रामाणिक कारीगर उत्पाद: {description}"
            if c_hi == category and category:
                c_hi = "गृह एवं सजावट > हस्तशिल्प"

            tags_hi = []
            for t in (tags or []):
                if not t:
                    continue
                tr_t = t
                for en, hi in sorted_mappings:
                    pattern = re.compile(r'\b' + re.escape(en) + r'\b', re.IGNORECASE)
                    tr_t = pattern.sub(hi, tr_t)
                if tr_t == t:
                    tr_t = f"हस्तशिल्प-{t}"
                tags_hi.append(tr_t)

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

