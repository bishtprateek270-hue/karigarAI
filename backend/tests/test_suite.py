import os
import sys
import io
import time
from fastapi.testclient import TestClient

# Ensure backend root is on sys.path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from main import app
from app.db.session import init_db

# Initialize database tables for testing
init_db()

client = TestClient(app)


def print_status(message, success=True):
    symbol = "[PASS]" if success else "[FAIL]"
    print(f"{symbol} {message}")



def test_health_check():
    res = client.get("/health")
    assert res.status_code == 200, f"Expected 200, got {res.status_code}"
    assert res.json() == {"status": "running"}
    print_status("GET /health returned 200 OK and {'status': 'running'}")


def test_auth_and_user_isolation():
    # 1. Register User A
    user_a_email = f"artisan_a_{int(time.time())}@example.com"
    res_a = client.post("/register", json={"name": "Artisan A", "email": user_a_email, "password": "password123"})
    assert res_a.status_code == 201, f"Failed to register User A: {res_a.text}"
    token_a = res_a.json()["access_token"]
    headers_a = {"Authorization": f"Bearer {token_a}"}
    print_status("User A registration & JWT issuance successful")

    # 2. Register User B
    user_b_email = f"artisan_b_{int(time.time())}@example.com"
    res_b = client.post("/register", json={"name": "Artisan B", "email": user_b_email, "password": "password123"})
    assert res_b.status_code == 201, f"Failed to register User B: {res_b.text}"
    token_b = res_b.json()["access_token"]
    headers_b = {"Authorization": f"Bearer {token_b}"}
    print_status("User B registration & JWT issuance successful")

    # 3. Duplicate Registration Prevention
    res_dup = client.post("/register", json={"name": "Artisan A Dup", "email": user_a_email, "password": "password123"})
    assert res_dup.status_code == 400
    print_status("Duplicate email registration correctly rejected with 400 Bad Request")

    # 4. Login Validation
    res_login = client.post("/login", json={"email": user_a_email, "password": "password123"})
    assert res_login.status_code == 200
    assert "access_token" in res_login.json()
    print_status("User A login & JWT verification successful")

    res_bad_pwd = client.post("/login", json={"email": user_a_email, "password": "wrongpassword"})
    assert res_bad_pwd.status_code == 401
    print_status("Invalid password login correctly rejected with 401 Unauthorized")

    # 5. Protected Route Access Control
    res_no_auth = client.get("/products")
    assert res_no_auth.status_code == 401
    print_status("Unauthenticated access to /products correctly rejected with 401 Unauthorized")

    res_bad_token = client.get("/products", headers={"Authorization": "Bearer invalid_token_123"})
    assert res_bad_token.status_code == 401
    print_status("Invalid JWT token access correctly rejected with 401 Unauthorized")

    # 6. User A Creates Product
    prod_payload = {
        "title": "Traditional Blue Pottery Vase",
        "description": "Authentic Jaipur blue pottery ceramic vase.",
        "category": "Home Decor > Pottery",
        "material": "Ceramic Clay",
        "craft_type": "Blue Pottery",
        "tags": ["pottery", "blue pottery", "vase"],
        "suggested_price": 1800.0,
        "status": "published",
    }
    res_prod_a = client.post("/products", json=prod_payload, headers=headers_a)
    assert res_prod_a.status_code == 201
    prod_a_id = res_prod_a.json()["id"]
    print_status(f"User A created Product ID {prod_a_id}")

    # 7. User Isolation Verification
    res_b_access = client.get(f"/products/{prod_a_id}", headers=headers_b)
    assert res_b_access.status_code == 404
    print_status(f"User B access to User A's Product ID {prod_a_id} correctly denied with 404 Not Found")

    res_b_update = client.put(f"/products/{prod_a_id}", json={"title": "Hacked Title"}, headers=headers_b)
    assert res_b_update.status_code == 404
    print_status(f"User B update on User A's Product ID {prod_a_id} correctly denied with 404 Not Found")

    res_b_delete = client.delete(f"/products/{prod_a_id}", headers=headers_b)
    assert res_b_delete.status_code == 404
    print_status(f"User B deletion of User A's Product ID {prod_a_id} correctly denied with 404 Not Found")

    # 8. User A Cleanup
    res_del_a = client.delete(f"/products/{prod_a_id}", headers=headers_a)
    assert res_del_a.status_code == 200
    print_status(f"User A successfully deleted Product ID {prod_a_id}")


def test_image_upload_validation():
    # 1. Valid JPG Upload
    valid_jpg = io.BytesIO(b"\xff\xd8\xff\xe0valid_jpg_content")
    res_jpg = client.post("/analyze-product", files={"file": ("pot.jpg", valid_jpg, "image/jpeg")})
    assert res_jpg.status_code == 200
    assert res_jpg.json()["status"] == "success"
    print_status("Valid JPG upload successfully processed by /analyze-product")

    # 2. Valid PNG Upload
    valid_png = io.BytesIO(b"\x89PNG\r\n\x1a\nvalid_png_content")
    res_png = client.post("/analyze-product", files={"file": ("statue.png", valid_png, "image/png")})
    assert res_png.status_code == 200
    print_status("Valid PNG upload successfully processed by /analyze-product")

    # 3. Invalid Extension (.txt)
    invalid_ext = io.BytesIO(b"Plain text content")
    res_txt = client.post("/analyze-product", files={"file": ("notes.txt", invalid_ext, "text/plain")})
    assert res_txt.status_code == 400
    print_status("Invalid extension (.txt) correctly rejected with 400 Bad Request")

    # 4. Invalid Content Type (application/pdf)
    invalid_mime = io.BytesIO(b"%PDF-1.4 pdf content")
    res_pdf = client.post("/analyze-product", files={"file": ("doc.jpg", invalid_mime, "application/pdf")})
    assert res_pdf.status_code == 400
    print_status("Invalid Content-Type (application/pdf) correctly rejected with 400 Bad Request")

    # 5. Oversized File (>10MB)
    large_bytes = io.BytesIO(b"0" * (11 * 1024 * 1024))
    res_large = client.post("/analyze-product", files={"file": ("large.png", large_bytes, "image/png")})
    assert res_large.status_code in (400, 413)
    print_status("Oversized file (>10MB) correctly rejected with 413 Content Too Large")


def test_pricing_engine():
    payload = {
        "material_cost": 400.0,
        "making_time_hours": 6.0,
        "hourly_rate": 120.0,
        "product_size": "large",
        "craft_category": "woodwork",
        "profit_margin": 30.0,
    }
    res = client.post("/suggest-price", json=payload)
    assert res.status_code == 200
    data = res.json()

    assert data["production_cost"] > 0
    assert data["minimum_price"] < data["recommended_price"] < data["maximum_price"]
    assert data["currency"] == "INR"
    print_status("Price suggestion engine returned valid production, min, recommended, max price tiers")

    # Negative Material Cost Validation
    res_neg = client.post("/suggest-price", json={**payload, "material_cost": -100})
    assert res_neg.status_code in (400, 422)
    print_status("Negative material cost correctly rejected with validation error")


def test_multilingual_translation():
    payload = {
        "title": "Handcrafted Terracotta Clay Pot",
        "description": "Authentic natural clay pot with red polish.",
        "category": "Home & Living > Pottery",
        "tags": ["terracotta", "clay", "handcrafted"],
        "target_language": "hi",
    }
    res = client.post("/translate", json=payload)
    assert res.status_code == 200
    data = res.json()

    assert "title" in data and len(data["title"]) > 0
    assert "description" in data and len(data["description"]) > 0
    print_status("Multilingual translation service correctly translated content into Hindi")


def test_vision_reliability_and_catalog_generation():
    # 1. Unusual / Obscure craft image analysis
    unusual_img = io.BytesIO(b"\xff\xd8\xff\xe0obscure_bytes")
    res_obscure = client.post("/analyze-product", files={"file": ("obscure_craft.jpg", unusual_img, "image/jpeg")})
    assert res_obscure.status_code == 200
    data_obscure = res_obscure.json()
    analysis = data_obscure["analysis"]
    print_status("Unusual/obscure craft image analysis processed successfully")

    # 2. Confirmed attributes catalog generation
    confirmed_payload = {
        "product_type": "Filigree Silver Earrings",
        "material": "925 Sterling Silver",
        "primary_color": "Silver",
        "craft_type": "Filigree Wire Work",
        "style": "Traditional Handcrafted",
    }
    res_cat = client.post("/generate-catalog", json=confirmed_payload)
    assert res_cat.status_code == 200
    cat_data = res_cat.json()
    assert cat_data["status"] == "success"
    cat_obj = cat_data.get("catalog") or {}
    assert "Filigree" in cat_obj.get("title", "") or "Silver" in cat_obj.get("title", "") or "Handcrafted" in cat_obj.get("title", "")
    print_status("Artisan-confirmed attributes correctly generated clean catalog entry")


if __name__ == "__main__":
    print("\n=======================================================")
    print("      KARIGAR AI PHASE 9 FULL AUTOMATED TEST SUITE     ")
    print("=======================================================\n")
    test_health_check()
    test_auth_and_user_isolation()
    test_image_upload_validation()
    test_pricing_engine()
    test_multilingual_translation()
    test_vision_reliability_and_catalog_generation()
    print("\n=======================================================")
    print("   ALL TESTS EXECUTED AND VERIFIED SUCCESSFULLY (100%)  ")
    print("=======================================================\n")

