#!/usr/bin/env python3
"""Fetch invoices from inFakt API.

Usage:
    python get_invoices.py
    python get_invoices.py --unpaid
    python get_invoices.py --from 2026-01-01 --to 2026-03-31

Output: JSON object with invoices list and summary.
"""

import argparse
import json
import os
import sys

import requests


def load_env():
    """Load environment variables from tools/common/.env if it exists."""
    env_path = os.path.join(
        os.path.dirname(__file__), "..", "..", "..", "tools", "common", ".env"
    )
    env_path = os.path.normpath(env_path)
    if os.path.exists(env_path):
        with open(env_path) as f:
            for line in f:
                line = line.strip()
                if line and not line.startswith("#") and "=" in line:
                    key, _, value = line.partition("=")
                    os.environ.setdefault(key.strip(), value.strip())


def get_invoices(api_key, unpaid=False, date_from=None, date_to=None, page=1, per_page=50):
    """Fetch invoices from inFakt API."""
    headers = {
        "X-inFakt-ApiKey": api_key,
        "Content-Type": "application/json",
    }

    all_invoices = []
    current_page = page

    while True:
        params = {"page": current_page, "per_page": per_page}
        query = {}

        if unpaid:
            query["paid_date_null"] = True

        if date_from:
            query["invoice_date_gteq"] = date_from

        if date_to:
            query["invoice_date_lteq"] = date_to

        if query:
            for key, value in query.items():
                params[f"q[{key}]"] = value

        resp = requests.get(
            "https://api.infakt.pl/api/v3/invoices.json",
            headers=headers,
            params=params,
            timeout=10,
        )
        resp.raise_for_status()
        data = resp.json()

        entities = data.get("entities", [])
        if not entities:
            break

        all_invoices.extend(entities)

        # Check if there are more pages
        meta = data.get("metainfo", {})
        total_pages = meta.get("total_pages", 1)
        if current_page >= total_pages:
            break
        current_page += 1

    return all_invoices


def summarize_invoices(invoices):
    """Create summary of invoices."""
    total_gross = sum(inv.get("gross_price", 0) / 100 for inv in invoices)
    total_net = sum(inv.get("net_price", 0) / 100 for inv in invoices)

    return {
        "count": len(invoices),
        "total_net": round(total_net, 2),
        "total_gross": round(total_gross, 2),
    }


def main():
    parser = argparse.ArgumentParser(description="Fetch invoices from inFakt")
    parser.add_argument("--unpaid", action="store_true", help="Show only unpaid invoices")
    parser.add_argument("--from", dest="date_from", help="Start date (YYYY-MM-DD)")
    parser.add_argument("--to", dest="date_to", help="End date (YYYY-MM-DD)")
    args = parser.parse_args()

    load_env()
    api_key = os.environ.get("INFAKT_API_KEY")

    if not api_key:
        print(json.dumps({"error": "INFAKT_API_KEY not set. Configure in tools/common/.env"}))
        sys.exit(1)

    try:
        invoices = get_invoices(api_key, args.unpaid, args.date_from, args.date_to)
        summary = summarize_invoices(invoices)
        result = {
            "filter": {
                "unpaid_only": args.unpaid,
                "date_from": args.date_from,
                "date_to": args.date_to,
            },
            "summary": summary,
            "invoices": invoices,
        }
        print(json.dumps(result, indent=2, default=str))
    except requests.RequestException as e:
        print(json.dumps({"error": f"inFakt API error: {e}"}))
        sys.exit(1)


if __name__ == "__main__":
    main()
