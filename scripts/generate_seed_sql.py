"""
Generate supabase/seed.sql from backup_old/products.json.
Output is a series of INSERT ... ON CONFLICT (sku) DO UPDATE statements
so it's idempotent — safe to re-run.
"""

import json
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
SRC = ROOT / "backup_old" / "products.json"
OUT = ROOT / "supabase" / "seed.sql"

TYPE_LABEL = {
    "make_to_stock": "Ready to Ship",
    "custom_chocolate": "Custom",
    "homeware": "Homeware",
}


def clean_html(s):
    if not s:
        return ""
    s = re.sub(r"<[^>]+>", " ", s)
    s = (s.replace("&nbsp;", " ").replace("&amp;", "&").replace("&lt;", "<")
           .replace("&gt;", ">").replace("&quot;", '"').replace("&#039;", "'")
           .replace("&rsquo;", "'").replace("&lsquo;", "'")
           .replace("&ldquo;", '"').replace("&rdquo;", '"').replace("&hellip;", "..."))
    s = re.sub(r"\s+", " ", s).strip()
    return s


def sql_str(s):
    if s is None:
        return "NULL"
    return "'" + str(s).replace("'", "''") + "'"


def sql_text_array(arr):
    if not arr:
        return "'{}'"
    parts = []
    for v in arr:
        # inside the array literal, escape \ and " for PG; outer SQL string still
        # needs single quotes doubled (handled after).
        v = str(v).replace("\\", "\\\\").replace('"', '\\"')
        parts.append(f'"{v}"')
    inner = "{" + ",".join(parts) + "}"
    # wrap as SQL string literal — double any single quotes inside
    return "'" + inner.replace("'", "''") + "'"


def derive_format(product_types, type_):
    joined = " ".join(product_types or []).lower()
    if "bar" in joined: return "Bars"
    if "box" in joined or "platter" in joined or "hamper" in joined: return "Boxes"
    if "bites" in joined: return "Bites"
    if "block" in joined: return "Blocks"
    if "butter" in joined or "sugar" in joined or "raw" in joined: return "Pantry"
    if type_ == "homeware": return "Homeware"
    return "Other"


def main():
    data = json.loads(SRC.read_text(encoding="utf-8"))
    rows = []
    sort_order = 0
    for p in data:
        if not (p["image"] and p["image"].get("src")):
            continue  # skip products without images
        desc = clean_html(p.get("description") or p.get("headline") or "")
        if len(desc) > 1000:
            desc = desc[:997].rstrip() + "..."
        gallery = [g["src"] for g in p["gallery"] if g.get("src")]
        rows.append({
            "sku": p["sku"],
            "name": p["title"].strip(),
            "description": desc,
            "price": round(float(p["price"] or 0), 2),
            "currency": p.get("currency") or "PKR",
            "image": p["image"]["src"],
            "gallery": gallery,
            "category": TYPE_LABEL.get(p["type"], p["type"]),
            "format": derive_format(p.get("product_type"), p["type"]),
            "events": p.get("events") or [],
            "product_type": p.get("product_type") or [],
            "tags": [t for t in (p.get("category_ids") or []) if t],
            "chocolate_type": p.get("chocolate_type") or [],
            "flavour": p.get("flavour") or [],
            "fillings": p.get("fillings") or [],
            "certifications": p.get("certifications") or [],
            "piece_count": p.get("piece_count"),
            "package_weight": p.get("package_weight"),
            "is_published": p["status"] == 1,
            "sort_order": sort_order,
        })
        sort_order += 1

    lines = [
        "-- Crafty Chocolates seed. Re-runnable (UPSERT on sku).",
        "-- Run AFTER schema.sql in Supabase SQL Editor.",
        "",
    ]
    cols = ["sku", "name", "description", "price", "currency", "image", "gallery",
            "category", "format", "events", "product_type", "tags",
            "chocolate_type", "flavour", "fillings", "certifications",
            "piece_count", "package_weight", "is_published", "sort_order"]

    for r in rows:
        values = [
            sql_str(r["sku"]),
            sql_str(r["name"]),
            sql_str(r["description"]),
            str(r["price"]),
            sql_str(r["currency"]),
            sql_str(r["image"]),
            sql_text_array(r["gallery"]),
            sql_str(r["category"]),
            sql_str(r["format"]),
            sql_text_array(r["events"]),
            sql_text_array(r["product_type"]),
            sql_text_array(r["tags"]),
            sql_text_array(r["chocolate_type"]),
            sql_text_array(r["flavour"]),
            sql_text_array(r["fillings"]),
            sql_text_array(r["certifications"]),
            sql_str(r["piece_count"]) if r["piece_count"] is not None else "NULL",
            sql_str(r["package_weight"]) if r["package_weight"] is not None else "NULL",
            "true" if r["is_published"] else "false",
            str(r["sort_order"]),
        ]
        updates = [f"{c}=excluded.{c}" for c in cols if c != "sku"]
        lines.append(
            f"insert into public.products ({', '.join(cols)}) values\n"
            f"  ({', '.join(values)})\n"
            f"on conflict (sku) do update set {', '.join(updates)};"
        )

    OUT.parent.mkdir(exist_ok=True)
    OUT.write_text("\n".join(lines) + "\n", encoding="utf-8")
    print(f"Wrote {OUT} with {len(rows)} products")


if __name__ == "__main__":
    main()
