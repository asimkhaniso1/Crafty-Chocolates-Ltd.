"""
Generate src/data/products.ts from backup_old/products.json.
Filters to published, with images, and maps Drupal fields to React shape.
"""

import json
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
SRC = ROOT / "backup_old" / "products.json"
OUT = ROOT / "src" / "data" / "products.ts"

TYPE_LABEL = {
    "make_to_stock": "Ready to Ship",
    "custom_chocolate": "Custom",
    "homeware": "Homeware",
}


def clean_html(s):
    if not s:
        return ""
    # strip tags
    s = re.sub(r"<[^>]+>", " ", s)
    # entities
    s = (s.replace("&nbsp;", " ").replace("&amp;", "&").replace("&lt;", "<")
           .replace("&gt;", ">").replace("&quot;", '"').replace("&#039;", "'")
           .replace("&rsquo;", "'").replace("&lsquo;", "'")
           .replace("&ldquo;", '"').replace("&rdquo;", '"').replace("&hellip;", "..."))
    s = re.sub(r"\s+", " ", s).strip()
    return s


def main():
    data = json.loads(SRC.read_text(encoding="utf-8"))
    pub = [p for p in data
           if p["status"] == 1 and p["image"] and p["image"].get("src")]

    pub.sort(key=lambda p: (p["type"], p["title"]))

    rows = []
    for p in pub:
        desc = clean_html(p.get("description") or p.get("headline") or "")
        if len(desc) > 280:
            desc = desc[:277].rstrip() + "..."
        gallery_paths = [g["src"] for g in p["gallery"] if g.get("src")]
        # bucket product into a top-level format (Bars / Boxes / Bites / Block / Other)
        product_types = p.get("product_type") or []
        joined = " ".join(product_types).lower()
        if "bar" in joined:
            fmt = "Bars"
        elif "box" in joined or "platter" in joined or "hamper" in joined:
            fmt = "Boxes"
        elif "bites" in joined:
            fmt = "Bites"
        elif "block" in joined:
            fmt = "Blocks"
        elif "butter" in joined or "sugar" in joined or "raw" in joined:
            fmt = "Pantry"
        elif p["type"] == "homeware":
            fmt = "Homeware"
        else:
            fmt = "Other"

        rows.append({
            "id": str(p["product_id"]),
            "sku": p["sku"],
            "name": p["title"].strip(),
            "price": round(float(p["price"]), 2) if p["price"] is not None else 0.0,
            "currency": p.get("currency") or "PKR",
            "description": desc,
            "image": p["image"]["src"],
            "gallery": gallery_paths,
            "category": TYPE_LABEL.get(p["type"], p["type"]),
            "format": fmt,
            "events": p.get("events") or [],
            "productType": product_types,
            "tags": [t for t in (p.get("category_ids") or []) if t],
            "chocolateType": p.get("chocolate_type") or [],
            "flavour": p.get("flavour") or [],
            "fillings": p.get("fillings") or [],
            "certifications": p.get("certifications") or [],
            "pieceCount": p.get("piece_count"),
            "packageWeight": p.get("package_weight"),
        })

    # write ts file
    def to_ts(v):
        return json.dumps(v, ensure_ascii=False)

    body = ",\n".join(
        "  {\n" + ",\n".join(f"    {k}: {to_ts(v)}" for k, v in r.items()) + "\n  }"
        for r in rows
    )
    content = f"""// AUTO-GENERATED from backup_old/products.json. Do not edit by hand.
// Regenerate: python scripts/generate_products_ts.py

import {{ Product }} from '../types';

export const PRODUCTS: Product[] = [
{body}
];

export const CATEGORIES = Array.from(new Set(PRODUCTS.map(p => p.category))).sort();
export const FORMATS = Array.from(new Set(PRODUCTS.map(p => p.format)));
export const EVENTS = Array.from(new Set(PRODUCTS.flatMap(p => p.events))).sort();
"""
    OUT.parent.mkdir(parents=True, exist_ok=True)
    OUT.write_text(content, encoding="utf-8")
    print(f"Wrote {OUT} with {len(rows)} products")
    from collections import Counter
    print("by category:", Counter(r["category"] for r in rows))


if __name__ == "__main__":
    main()
