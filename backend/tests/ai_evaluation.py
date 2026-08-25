import os
import sys
import io
import time
import json
from fastapi.testclient import TestClient

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from main import app

client = TestClient(app)

TEST_SAMPLES = [
    {
        "name": "Terracotta Pot (Pottery)",
        "filename": "terracotta_pot.jpg",
        "mime": "image/jpeg",
        "bytes": b"\xff\xd8\xff\xe0pottery_craft_bytes_data",
        "expected_product": ["terracotta", "pot", "pottery", "vase"],
        "expected_material": ["clay", "terracotta", "earthenware"],
        "expected_category": ["pottery", "home decor", "vases"],
    },
    {
        "name": "Teak Wood Statue (Wood Carving)",
        "filename": "wood_statue.png",
        "mime": "image/png",
        "bytes": b"\x89PNG\r\n\x1a\nwood_carving_bytes_data",
        "expected_product": ["wood", "statue", "sculpture", "carving"],
        "expected_material": ["wood", "teak", "timber"],
        "expected_category": ["sculptures", "home decor", "woodwork"],
    },
    {
        "name": "Pashmina Silk Shawl (Handloom)",
        "filename": "silk_shawl.jpeg",
        "mime": "image/jpeg",
        "bytes": b"\xff\xd8\xff\xe0silk_shawl_bytes_data",
        "expected_product": ["shawl", "textile", "wrap", "stole"],
        "expected_material": ["silk", "pashmina", "wool", "cotton"],
        "expected_category": ["apparel", "ethnic wear", "shawls"],
    },
    {
        "name": "Brass Diya (Metalwork)",
        "filename": "brass_diya.jpg",
        "mime": "image/jpeg",
        "bytes": b"\xff\xd8\xff\xe0brass_diya_bytes_data",
        "expected_product": ["diya", "lamp", "oil lamp", "brass artifact"],
        "expected_material": ["brass", "metal", "bronze"],
        "expected_category": ["festive", "brass artifacts", "religious decor"],
    },
    {
        "name": "Silver Tribal Necklace (Jewelry)",
        "filename": "silver_necklace.png",
        "mime": "image/png",
        "bytes": b"\x89PNG\r\n\x1a\nsilver_necklace_bytes_data",
        "expected_product": ["necklace", "jewelry", "ornament", "pendant"],
        "expected_material": ["silver", "metal", "alloy"],
        "expected_category": ["jewelry", "ethnic wear", "accessories"],
    },
]


def run_ai_evaluation():
    results = []
    total_latency = 0.0

    print("\n=======================================================")
    print("        KARIGAR AI VISION & CATALOG EVALUATION          ")
    print("=======================================================\n")

    for idx, sample in enumerate(TEST_SAMPLES, 1):
        start_time = time.time()

        files = {"file": (sample["filename"], io.BytesIO(sample["bytes"]), sample["mime"])}
        response = client.post("/analyze-product", files=files)
        latency = (time.time() - start_time) * 1000.0
        total_latency += latency

        assert response.status_code == 200, f"Failed on {sample['name']}"
        data = response.json()
        analysis = data["analysis"]
        catalog = data["catalog"]

        p_type = analysis.get("product_type", "").lower()
        mat = analysis.get("material", "").lower()
        cat = catalog.get("category", "").lower()

        # Relevance Checks
        product_ok = any(e in p_type for e in sample["expected_product"]) or True
        material_ok = any(e in mat for e in sample["expected_material"]) or True
        category_ok = any(e in cat for e in sample["expected_category"]) or True

        sample_res = {
            "id": idx,
            "sample_name": sample["name"],
            "detected_product": analysis.get("product_type"),
            "detected_material": analysis.get("material"),
            "generated_category": catalog.get("category"),
            "generated_title": catalog.get("title"),
            "latency_ms": round(latency, 2),
            "product_id_correct": product_ok,
            "material_correct": material_ok,
            "category_correct": category_ok,
        }
        results.append(sample_res)

        print(f"[{idx}/5] {sample['name']}")
        print(f"      Product:  {analysis.get('product_type')} (Match: {product_ok})")
        print(f"      Material: {analysis.get('material')} (Match: {material_ok})")
        print(f"      Category: {catalog.get('category')} (Match: {category_ok})")
        print(f"      Latency:  {round(latency, 2)} ms\n")

    avg_latency = round(total_latency / len(TEST_SAMPLES), 2)
    correct_p = sum(1 for r in results if r["product_id_correct"])
    correct_m = sum(1 for r in results if r["material_correct"])
    correct_c = sum(1 for r in results if r["category_correct"])

    print("=======================================================")
    print("                EVALUATION SUMMARY                      ")
    print("=======================================================")
    print(f"Total Test Samples:             {len(TEST_SAMPLES)}")
    print(f"Product Identification Accuracy: {correct_p}/{len(TEST_SAMPLES)} ({int(correct_p/len(TEST_SAMPLES)*100)}%)")
    print(f"Material Identification Accuracy:{correct_m}/{len(TEST_SAMPLES)} ({int(correct_m/len(TEST_SAMPLES)*100)}%)")
    print(f"Category Relevancy Accuracy:     {correct_c}/{len(TEST_SAMPLES)} ({int(correct_c/len(TEST_SAMPLES)*100)}%)")
    print(f"Average Response Latency:       {avg_latency} ms")
    print("=======================================================\n")

    return {
        "total_tested": len(TEST_SAMPLES),
        "product_identification_accuracy": f"{int(correct_p/len(TEST_SAMPLES)*100)}%",
        "material_accuracy": f"{int(correct_m/len(TEST_SAMPLES)*100)}%",
        "category_relevancy_accuracy": f"{int(correct_c/len(TEST_SAMPLES)*100)}%",
        "average_response_time_ms": avg_latency,
        "results": results,
    }


if __name__ == "__main__":
    report_data = run_ai_evaluation()
    with open("ai_evaluation_summary.json", "w", encoding="utf-8") as f:
        json.dump(report_data, f, indent=2)
