"""
Safely extract product images from backup_old/files.zip to public/products/.

Safety rules:
  - Only extract files whose path appears in image_manifest.txt
  - Verify magic bytes match JPEG/PNG/GIF/WebP before writing
  - Skip anything not on the allowlist; never extract .php/.js/.html/etc.
  - Output filename is sanitized (slugify) to avoid path traversal / weird chars
"""

import json
import os
import re
import sys
import zipfile
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
ZIP_PATH = ROOT / "backup_old" / "files.zip"
MANIFEST = ROOT / "backup_old" / "image_manifest.txt"
PRODUCTS_JSON = ROOT / "backup_old" / "products.json"
OUT_DIR = ROOT / "public" / "products"
OUT_DIR.mkdir(parents=True, exist_ok=True)

# magic bytes
MAGIC = {
    "jpeg": [b"\xff\xd8\xff"],
    "png": [b"\x89PNG\r\n\x1a\n"],
    "gif": [b"GIF87a", b"GIF89a"],
    "webp": [b"RIFF"],  # weak — also verify "WEBP" at offset 8
}


def detect_image(data):
    if data.startswith(b"\xff\xd8\xff"):
        return "jpg"
    if data.startswith(b"\x89PNG\r\n\x1a\n"):
        return "png"
    if data[:6] in (b"GIF87a", b"GIF89a"):
        return "gif"
    if data[:4] == b"RIFF" and data[8:12] == b"WEBP":
        return "webp"
    return None


def slugify(name):
    # keep letters/digits/dot/dash/underscore; replace spaces & parens
    base = os.path.basename(name)
    base = re.sub(r"[^\w.\-]+", "_", base)
    base = re.sub(r"_+", "_", base).strip("_.")
    return base or "image"


def main():
    manifest = [ln.strip() for ln in MANIFEST.read_text(encoding="utf-8").splitlines() if ln.strip()]
    # public://X → files/X
    wanted = {}
    for uri in manifest:
        if uri.startswith("public://"):
            rest = uri[len("public://"):].lstrip("/")
            zip_path = "files/" + rest
            wanted[zip_path] = uri
    print(f"manifest entries: {len(manifest)}, mapped to zip paths: {len(wanted)}")

    extracted = {}   # uri -> public/products/filename
    skipped_not_in_zip = []
    skipped_bad_magic = []
    skipped_not_image = []

    with zipfile.ZipFile(ZIP_PATH) as z:
        # build a case-sensitive lookup
        zip_names = set(z.namelist())
        # also a case-insensitive lookup for fallback
        zip_names_ci = {n.lower(): n for n in zip_names}

        for zip_path, uri in wanted.items():
            actual_name = zip_path if zip_path in zip_names else zip_names_ci.get(zip_path.lower())
            if not actual_name:
                skipped_not_in_zip.append(uri)
                continue
            # double-extension / path-traversal guard
            base = os.path.basename(actual_name)
            if base != actual_name.split("/")[-1]:
                continue
            if any(part in ("..",) for part in actual_name.split("/")):
                continue
            # extension allowlist
            ext = os.path.splitext(base)[1].lower()
            if ext not in (".jpg", ".jpeg", ".png", ".gif", ".webp"):
                skipped_not_image.append(uri)
                continue

            with z.open(actual_name) as f:
                data = f.read()
            kind = detect_image(data)
            if not kind:
                skipped_bad_magic.append((uri, len(data)))
                continue

            out_name = slugify(base)
            # ensure unique filename
            out_path = OUT_DIR / out_name
            counter = 1
            while out_path.exists() and out_path.stat().st_size != len(data):
                stem, e = os.path.splitext(out_name)
                out_path = OUT_DIR / f"{stem}_{counter}{e}"
                counter += 1
            out_path.write_bytes(data)
            extracted[uri] = f"/products/{out_path.name}"

    print(f"\nExtracted: {len(extracted)}")
    print(f"Skipped — not in zip: {len(skipped_not_in_zip)}")
    print(f"Skipped — bad magic: {len(skipped_bad_magic)}")
    print(f"Skipped — wrong extension: {len(skipped_not_image)}")

    if skipped_not_in_zip[:5]:
        print("  sample missing:", skipped_not_in_zip[:5])

    # rewrite products.json with web paths
    products = json.loads(PRODUCTS_JSON.read_text(encoding="utf-8"))
    for p in products:
        if p["image"] and p["image"].get("uri") in extracted:
            p["image"]["src"] = extracted[p["image"]["uri"]]
        for g in p["gallery"]:
            if g.get("uri") in extracted:
                g["src"] = extracted[g["uri"]]
    PRODUCTS_JSON.write_text(json.dumps(products, indent=2, default=str), encoding="utf-8")
    print(f"\nUpdated {PRODUCTS_JSON} with web paths")


if __name__ == "__main__":
    main()
