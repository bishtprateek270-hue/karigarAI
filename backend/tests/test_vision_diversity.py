import asyncio
import io
from PIL import Image
from app.services.vision_service import vision_service
from app.services.catalog_service import catalog_service


def create_test_image(color_rgb, width=200, height=200):
    img = Image.new("RGB", (width, height), color=color_rgb)
    buf = io.BytesIO()
    img.save(buf, format="JPEG")
    return buf.getvalue()


async def test_diversity():
    samples = [
        ("Terracotta Clay Pot", create_test_image((180, 80, 40), 200, 260), "pottery_craft.jpg"),
        ("Carved Wooden Box", create_test_image((110, 60, 25), 250, 180), "wooden_box.jpg"),
        ("Brass Diya Artifact", create_test_image((210, 170, 40), 200, 200), "brass_diya.jpg"),
        ("Embroidery Fabric Bag", create_test_image((220, 30, 180), 200, 200), "handbag_embroidered.jpg"),
        ("Woven Bamboo Basket", create_test_image((210, 190, 150), 300, 200), "bamboo_basket.jpg"),
        ("Unusual Obscure Craft", create_test_image((128, 128, 128), 200, 200), "obscure_item.jpg"),
    ]

    print("\n=======================================================")
    print("      KARIGAR AI VISION AI DIVERSITY TEST SUITE       ")
    print("=======================================================\n")

    results = []
    for name, img_bytes, filename in samples:
        vision_res = await vision_service.analyze_image(img_bytes, filename, "image/jpeg")
        catalog_res = await catalog_service.generate_catalog(vision_res)
        
        pt = vision_res["product_type"]
        mat = vision_res["material"]
        craft = vision_res["craft_type"]
        title = catalog_res["title"]

        print(f"[IMAGE]: {filename} ({name})")
        print(f"   -> Detected Type:  {pt}")
        print(f"   -> Detected Mat:   {mat}")
        print(f"   -> Detected Craft: {craft}")
        print(f"   -> Title:          {title}")
        print(f"   -> Category:       {catalog_res['category']}\n")

        results.append((pt, mat, craft, title))

    # Assert that results are not all identical!
    unique_types = set(r[0] for r in results)
    unique_titles = set(r[3] for r in results)

    print(f"Unique Product Types Detected: {len(unique_types)} / {len(samples)}")
    print(f"Unique Catalog Titles Generated: {len(unique_titles)} / {len(samples)}")

    assert len(unique_types) >= 4, "Vision AI failed diversity check! Too many duplicate product types."
    assert len(unique_titles) >= 4, "Catalog generator failed diversity check! Too many duplicate titles."
    print("\n[SUCCESS] VISION AI DIVERSITY & INDEPENDENCE VERIFIED SUCCESSFULLY!\n")


if __name__ == "__main__":
    asyncio.run(test_diversity())
