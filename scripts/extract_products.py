"""
Extract Drupal Commerce products from raw SQL dump into products.json.

Reads backup_old/crafty_db.sql, joins commerce_product with prices, images,
descriptions, and taxonomy. Outputs:
  - backup_old/products.json     (full data)
  - backup_old/image_manifest.txt (list of image URIs to extract from files.zip)
"""

import json
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
SQL_PATH = ROOT / "backup_old" / "crafty_db.sql"
OUT_JSON = ROOT / "backup_old" / "products.json"
OUT_MANIFEST = ROOT / "backup_old" / "image_manifest.txt"

TABLES_WANTED = {
    "commerce_product",
    "field_data_commerce_price",
    "field_data_body",
    "field_data_field_image",
    "field_data_field_images",
    "field_data_field_product",
    "field_data_field_product_category",
    "field_data_field_chocolate_type",
    "field_data_field_flavour",
    "field_data_field_piece_count",
    "field_data_field_package_weight",
    "field_data_field_headline",
    "field_data_field_tagline",
    "file_managed",
    "node",
    "taxonomy_term_data",
    "taxonomy_vocabulary",
}


def parse_value_tuple(s, i):
    """Parse a single (...) tuple starting at s[i], return (list_of_values, end_index)."""
    assert s[i] == "("
    i += 1
    values = []
    n = len(s)
    while i < n:
        # skip whitespace
        while i < n and s[i] in " \t\n\r":
            i += 1
        if s[i] == ")":
            return values, i + 1
        # parse one value
        if s[i] == "'":
            # quoted string
            i += 1
            buf = []
            while i < n:
                c = s[i]
                if c == "\\":
                    nxt = s[i + 1]
                    esc = {"n": "\n", "r": "\r", "t": "\t", "0": "\0",
                           "Z": "\x1a", "b": "\b", "'": "'", '"': '"', "\\": "\\"}
                    buf.append(esc.get(nxt, nxt))
                    i += 2
                elif c == "'":
                    # check for SQL '' escape
                    if i + 1 < n and s[i + 1] == "'":
                        buf.append("'")
                        i += 2
                    else:
                        i += 1
                        break
                else:
                    buf.append(c)
                    i += 1
            values.append("".join(buf))
        elif s[i:i + 8] == "_binary ":
            # _binary 'b:0;' style — skip prefix, parse string
            i += 8
            # then it's a quoted string
            assert s[i] == "'"
            i += 1
            buf = []
            while i < n:
                c = s[i]
                if c == "\\":
                    buf.append(s[i + 1])
                    i += 2
                elif c == "'":
                    if i + 1 < n and s[i + 1] == "'":
                        buf.append("'")
                        i += 2
                    else:
                        i += 1
                        break
                else:
                    buf.append(c)
                    i += 1
            values.append("".join(buf))
        else:
            # unquoted: number, NULL, etc.
            start = i
            while i < n and s[i] not in ",)":
                i += 1
            tok = s[start:i].strip()
            if tok.upper() == "NULL":
                values.append(None)
            else:
                # try int / float
                try:
                    if "." in tok:
                        values.append(float(tok))
                    else:
                        values.append(int(tok))
                except ValueError:
                    values.append(tok)
        # consume comma if present
        while i < n and s[i] in " \t\n\r":
            i += 1
        if i < n and s[i] == ",":
            i += 1
    raise ValueError("unterminated tuple")


def extract_table(sql_text, table_name):
    """Yield each row as a list of values from INSERT INTO `table_name` VALUES (...);"""
    pat = re.compile(rf"INSERT INTO `{re.escape(table_name)}` VALUES ", re.IGNORECASE)
    for m in pat.finditer(sql_text):
        i = m.end()
        n = len(sql_text)
        while i < n:
            while i < n and sql_text[i] in " \t\n\r":
                i += 1
            if sql_text[i] != "(":
                break
            row, i = parse_value_tuple(sql_text, i)
            yield row
            while i < n and sql_text[i] in " \t\n\r":
                i += 1
            if i < n and sql_text[i] == ",":
                i += 1
                continue
            if i < n and sql_text[i] == ";":
                break


def main():
    print(f"Reading {SQL_PATH} ...")
    sql = SQL_PATH.read_text(encoding="utf-8", errors="replace")
    print(f"  {len(sql) / 1e6:.1f} MB loaded")

    # ----- commerce_product: (product_id, revision_id, sku, title, type, language, uid, status, created, changed, data)
    products = {}
    for r in extract_table(sql, "commerce_product"):
        pid, _rev, sku, title, ptype, _lang, _uid, status, created, changed, _data = r
        products[pid] = {
            "product_id": pid,
            "sku": sku,
            "title": title,
            "type": ptype,
            "status": int(status),
            "created": created,
            "changed": changed,
            "price": None,
            "currency": None,
            "node_id": None,
            "description": None,
            "headline": None,
            "tagline": None,
            "piece_count": None,
            "package_weight": None,
            "chocolate_type": [],
            "flavour": [],
            "category_ids": [],   # Collection vocab (Best Sellers, Corporate Gifts, etc.)
            "events": [],          # Events & Occasions vocab (Eid, Birthday, Wedding, etc.)
            "product_type": [],   # Product Type vocab (Chocolate Bar, Chocolate Box, etc.)
            "certifications": [], # Halal, Gluten Free, etc.
            "fillings": [],
            "image": None,
            "gallery": [],
        }
    print(f"  commerce_product: {len(products)}")

    # ----- field_data_commerce_price
    # (entity_type, bundle, deleted, entity_id, revision_id, language, delta, amount, currency, data)
    for r in extract_table(sql, "field_data_commerce_price"):
        etype, bundle, deleted, eid, _rev, _lang, delta, amount, currency, _data = r
        if etype != "commerce_product" or deleted:
            continue
        if eid in products and (delta == 0 or products[eid]["price"] is None):
            # PKR is configured as zero-decimal on this site (raw = whole rupees).
            # USD/EUR/etc. follow standard Drupal Commerce convention (raw = cents).
            divisor = 1 if currency in ("PKR", "JPY", "KRW") else 100
            products[eid]["price"] = int(amount) / divisor
            products[eid]["currency"] = currency
    print("  prices joined")

    # ----- file_managed: fid → uri
    # (fid, uid, filename, uri, filemime, filesize, status, timestamp, type, uuid)
    files_by_fid = {}
    for r in extract_table(sql, "file_managed"):
        fid, _uid, filename, uri, mime, _size, _st, _ts, _ftype, _uuid = r
        files_by_fid[fid] = {"filename": filename, "uri": uri, "mime": mime}
    print(f"  file_managed: {len(files_by_fid)}")

    # ----- node: nid → (type, title, status)
    nodes = {}
    for r in extract_table(sql, "node"):
        nid, _vid, ntype, _lang, title, _uid, status, _c, _ch, _cm, _p, _s, _tn, _tr, _uuid = r
        nodes[nid] = {"type": ntype, "title": title, "status": int(status)}
    print(f"  node: {len(nodes)}")

    # ----- field_data_field_product: links display node → product entity
    # entity_id = nid, field_product_product_id = pid
    node_to_product = {}
    product_to_node = {}
    for r in extract_table(sql, "field_data_field_product"):
        etype, bundle, deleted, eid, _rev, _lang, delta, pid = r
        if etype != "node" or deleted:
            continue
        if pid in products:
            node_to_product[eid] = pid
            product_to_node[pid] = eid
            products[pid]["node_id"] = eid
    print(f"  product-node links: {len(node_to_product)}")

    # ----- field_data_field_image / field_data_field_images
    # These can be attached to either nodes (then need node→product join) OR
    # directly to commerce_product entities (entity_id IS the product_id).
    def consume_image_table(table_name):
        for r in extract_table(sql, table_name):
            etype, bundle, deleted, eid, _rev, _lang, delta, fid, alt, ititle, w, h = r
            if deleted or fid is None:
                continue
            if etype == "commerce_product":
                pid = eid if eid in products else None
            elif etype == "node":
                pid = node_to_product.get(eid)
            else:
                continue
            if not pid:
                continue
            img = {"fid": fid, "alt": alt, "title": ititle, "width": w, "height": h, "delta": delta}
            if fid in files_by_fid:
                img.update(files_by_fid[fid])
            if delta == 0 and products[pid]["image"] is None:
                products[pid]["image"] = img
            else:
                products[pid]["gallery"].append(img)

    consume_image_table("field_data_field_image")
    consume_image_table("field_data_field_images")
    # sort gallery by delta for stable order
    for p in products.values():
        p["gallery"].sort(key=lambda x: x.get("delta", 0))
    print("  images joined")

    # ----- field_data_body → description (on node)
    for r in extract_table(sql, "field_data_body"):
        etype, bundle, deleted, eid, _rev, _lang, delta, body_value, body_summary, body_format = r
        if deleted:
            continue
        pid = node_to_product.get(eid)
        if pid and pid in products and products[pid]["description"] is None:
            products[pid]["description"] = body_value

    # ----- field_data_field_headline
    for table_name, field in [
        ("field_data_field_headline", "headline"),
        ("field_data_field_tagline", "tagline"),
    ]:
        for r in extract_table(sql, table_name):
            # entity_type, bundle, deleted, entity_id, revision_id, language, delta, value, format
            try:
                etype, bundle, deleted, eid, _rev, _lang, delta, value, *_ = r
            except ValueError:
                continue
            if deleted:
                continue
            pid = node_to_product.get(eid)
            if pid and pid in products and not products[pid][field]:
                products[pid][field] = value

    # ----- field_data_field_package_weight (free-text on node)
    for r in extract_table(sql, "field_data_field_package_weight"):
        try:
            etype, bundle, deleted, eid, _rev, _lang, delta, value, *_ = r
        except ValueError:
            continue
        if deleted:
            continue
        pid = node_to_product.get(eid)
        if pid and pid in products:
            products[pid]["package_weight"] = value

    # ----- taxonomy
    terms = {}
    for r in extract_table(sql, "taxonomy_term_data"):
        tid, vid, name, desc, *_ = r
        terms[tid] = {"name": name, "vid": vid}
    print(f"  taxonomy terms: {len(terms)}")

    # ----- product category (on node)
    for r in extract_table(sql, "field_data_field_product_category"):
        try:
            etype, bundle, deleted, eid, _rev, _lang, delta, tid, *_ = r
        except ValueError:
            continue
        if deleted or tid is None:
            continue
        pid = node_to_product.get(eid)
        if pid and pid in products:
            term_name = terms.get(tid, {}).get("name")
            if term_name:
                products[pid]["category_ids"].append(term_name)

    # taxonomy-ref fields. Some are attached to nodes (need node->product map),
    # others directly to commerce_product (entity_id IS product_id).
    TAXO_FIELDS = [
        ("field_data_field_chocolate_type",   "chocolate_type",  "either"),
        ("field_data_field_flavour",          "flavour",         "either"),
        ("field_data_field_category",         "events",          "node"),           # vid=5 Events & Occasions
        ("field_data_field_product_type",     "product_type",    "commerce_product"),  # vid=12 Bar/Box/etc.
        ("field_data_field_piece_count",      "piece_count_tag", "commerce_product"),  # vid=6
        ("field_data_field_certified_tested", "certifications",  "commerce_product"),  # vid=11
        ("field_data_field_fillings_toppings", "fillings",        "commerce_product"),  # vid=7
    ]
    for table_name, field, attached in TAXO_FIELDS:
        for r in extract_table(sql, table_name):
            try:
                etype, bundle, deleted, eid, _rev, _lang, delta, tid, *_ = r
            except ValueError:
                continue
            if deleted or tid is None:
                continue
            if attached == "node" or (attached == "either" and etype == "node"):
                pid = node_to_product.get(eid)
            elif attached == "commerce_product" or (attached == "either" and etype == "commerce_product"):
                pid = eid if eid in products else None
            else:
                pid = None
            if not pid or pid not in products:
                continue
            tn = terms.get(tid, {}).get("name")
            if not tn:
                continue
            # piece_count_tag → store as piece_count (string) if scalar piece_count not already set
            if field == "piece_count_tag":
                if products[pid]["piece_count"] is None:
                    products[pid]["piece_count"] = tn
            else:
                lst = products[pid].setdefault(field, [])
                if tn not in lst:
                    lst.append(tn)

    # ----- output
    published = [p for p in products.values() if p["status"] == 1]
    print(f"\nTotal products: {len(products)}  |  published: {len(published)}")
    with_price = sum(1 for p in published if p["price"] is not None)
    with_image = sum(1 for p in published if p["image"] is not None)
    print(f"  published with price: {with_price}")
    print(f"  published with image: {with_image}")

    OUT_JSON.parent.mkdir(exist_ok=True)
    OUT_JSON.write_text(json.dumps(list(products.values()), indent=2, default=str), encoding="utf-8")
    print(f"\nWrote {OUT_JSON}")

    # image manifest — uris referenced by products
    uris = set()
    for p in products.values():
        if p["image"] and p["image"].get("uri"):
            uris.add(p["image"]["uri"])
        for g in p["gallery"]:
            if g.get("uri"):
                uris.add(g["uri"])
    OUT_MANIFEST.write_text("\n".join(sorted(uris)), encoding="utf-8")
    print(f"Wrote {OUT_MANIFEST} ({len(uris)} unique URIs)")


if __name__ == "__main__":
    main()
