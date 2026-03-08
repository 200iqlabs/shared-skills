#!/usr/bin/env python3
"""Fetch costs/expenses from inFakt API.

Usage:
    python get_costs.py
    python get_costs.py --from 2026-01-01 --to 2026-03-31
    python get_costs.py --from 2026-01-01 --to 2026-01-31 --group-by category

Output: JSON object with costs list and summary.
"""

import argparse
import json
import os
import sys
from collections import defaultdict

import requests

sys.path.insert(0, os.path.join(os.path.dirname(__file__), "..", "..", "..", "tools", "common"))
from env import load_env


def get_costs(api_key, date_from=None, date_to=None, page=1, per_page=50):
    """Fetch costs from inFakt API."""
    headers = {
        "X-inFakt-ApiKey": api_key,
        "Content-Type": "application/json",
    }

    all_costs = []
    current_page = page

    while True:
        params = {"page": current_page, "per_page": per_page}
        query = {}

        if date_from:
            query["invoice_date_gteq"] = date_from

        if date_to:
            query["invoice_date_lteq"] = date_to

        if query:
            for key, value in query.items():
                params[f"q[{key}]"] = value

        resp = requests.get(
            "https://api.infakt.pl/api/v3/costs.json",
            headers=headers,
            params=params,
            timeout=10,
        )
        resp.raise_for_status()
        data = resp.json()

        entities = data.get("entities", [])
        if not entities:
            break

        all_costs.extend(entities)

        meta = data.get("metainfo", {})
        total_pages = meta.get("total_pages", 1)
        if current_page >= total_pages:
            break
        current_page += 1

    return all_costs


def summarize_costs(costs, group_by=None):
    """Create summary of costs, optionally grouped."""
    total_gross = sum(c.get("gross_price", 0) / 100 for c in costs)
    total_net = sum(c.get("net_price", 0) / 100 for c in costs)

    summary = {
        "count": len(costs),
        "total_net": round(total_net, 2),
        "total_gross": round(total_gross, 2),
    }

    if group_by == "category":
        by_category = defaultdict(lambda: {"net": 0, "gross": 0, "count": 0})
        for c in costs:
            cat = c.get("category", "uncategorized") or "uncategorized"
            by_category[cat]["net"] += c.get("net_price", 0) / 100
            by_category[cat]["gross"] += c.get("gross_price", 0) / 100
            by_category[cat]["count"] += 1
        summary["by_category"] = {
            k: {"net": round(v["net"], 2), "gross": round(v["gross"], 2), "count": v["count"]}
            for k, v in sorted(by_category.items(), key=lambda x: x[1]["gross"], reverse=True)
        }

    if group_by == "month":
        by_month = defaultdict(lambda: {"net": 0, "gross": 0, "count": 0})
        for c in costs:
            month = (c.get("invoice_date") or "unknown")[:7]
            by_month[month]["net"] += c.get("net_price", 0) / 100
            by_month[month]["gross"] += c.get("gross_price", 0) / 100
            by_month[month]["count"] += 1
        summary["by_month"] = {
            k: {"net": round(v["net"], 2), "gross": round(v["gross"], 2), "count": v["count"]}
            for k, v in sorted(by_month.items())
        }

    return summary


def main():
    parser = argparse.ArgumentParser(description="Fetch costs from inFakt")
    parser.add_argument("--from", dest="date_from", help="Start date (YYYY-MM-DD)")
    parser.add_argument("--to", dest="date_to", help="End date (YYYY-MM-DD)")
    parser.add_argument(
        "--group-by", choices=["category", "month"],
        help="Group results by category or month",
    )
    args = parser.parse_args()

    load_env()
    api_key = os.environ.get("INFAKT_API_KEY")

    if not api_key:
        print(json.dumps({"error": "INFAKT_API_KEY not set. Configure in tools/common/.env"}))
        sys.exit(1)

    try:
        costs = get_costs(api_key, args.date_from, args.date_to)
        summary = summarize_costs(costs, args.group_by)
        result = {
            "filter": {
                "date_from": args.date_from,
                "date_to": args.date_to,
                "group_by": args.group_by,
            },
            "summary": summary,
            "costs": costs,
        }
        print(json.dumps(result, indent=2, default=str))
    except requests.RequestException as e:
        print(json.dumps({"error": f"inFakt API error: {e}"}))
        sys.exit(1)


if __name__ == "__main__":
    main()
