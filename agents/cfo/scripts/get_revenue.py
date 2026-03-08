#!/usr/bin/env python3
"""Fetch revenue data from Stripe invoices.

Usage:
    python get_revenue.py --from 2026-01-01 --to 2026-03-31
    python get_revenue.py --from 2026-01-01 --to 2026-01-31 --status paid

Output: JSON object with revenue summary and invoice list.
"""

import argparse
import json
import os
import sys
from collections import defaultdict
from datetime import datetime, timedelta

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


def get_invoices(api_key, date_from, date_to, status=None):
    """Fetch invoices from Stripe API with pagination."""
    ts_from = int(datetime.strptime(date_from, "%Y-%m-%d").timestamp())
    ts_to = int(datetime.strptime(date_to, "%Y-%m-%d").timestamp())

    all_invoices = []
    params = {
        "limit": 100,
        "created[gte]": ts_from,
        "created[lte]": ts_to,
    }
    if status:
        params["status"] = status

    has_more = True
    while has_more:
        resp = requests.get(
            "https://api.stripe.com/v1/invoices",
            auth=(api_key, ""),
            params=params,
            timeout=10,
        )
        resp.raise_for_status()
        data = resp.json()
        all_invoices.extend(data["data"])
        has_more = data.get("has_more", False)
        if has_more and data["data"]:
            params["starting_after"] = data["data"][-1]["id"]

    return all_invoices


def summarize_revenue(invoices):
    """Summarize revenue by currency and month."""
    by_currency = defaultdict(lambda: {"total": 0, "count": 0, "by_month": defaultdict(float)})

    for inv in invoices:
        amount = (inv.get("amount_paid") or 0) / 100
        currency = (inv.get("currency") or "").upper()
        # Use paid_at timestamp for month grouping (more accurate for revenue reporting)
        # Fall back to created timestamp if paid_at is not available
        paid_at = (inv.get("status_transitions") or {}).get("paid_at")
        ts = paid_at if paid_at else inv["created"]
        month_key = datetime.fromtimestamp(ts).strftime("%Y-%m")

        by_currency[currency]["total"] += amount
        by_currency[currency]["count"] += 1
        by_currency[currency]["by_month"][month_key] += amount

    # Convert defaultdicts for JSON serialization
    result = {}
    for currency, data in by_currency.items():
        result[currency] = {
            "total_revenue": round(data["total"], 2),
            "invoice_count": data["count"],
            "by_month": {k: round(v, 2) for k, v in sorted(data["by_month"].items())},
        }
    return result


def main():
    parser = argparse.ArgumentParser(description="Fetch Stripe revenue from invoices")
    parser.add_argument(
        "--from", dest="date_from",
        default=(datetime.now() - timedelta(days=30)).strftime("%Y-%m-%d"),
        help="Start date (YYYY-MM-DD), default: 30 days ago",
    )
    parser.add_argument(
        "--to", dest="date_to",
        default=datetime.now().strftime("%Y-%m-%d"),
        help="End date (YYYY-MM-DD), default: today",
    )
    parser.add_argument(
        "--status", choices=["paid", "open", "void", "uncollectible"],
        default="paid", help="Invoice status filter (default: paid)",
    )
    args = parser.parse_args()

    load_env()
    api_key = os.environ.get("STRIPE_SECRET_KEY")

    if not api_key:
        print(json.dumps({"error": "STRIPE_SECRET_KEY not set. Configure in tools/common/.env"}))
        sys.exit(1)

    try:
        invoices = get_invoices(api_key, args.date_from, args.date_to, args.status)
        summary = summarize_revenue(invoices)
        result = {
            "period": f"{args.date_from} to {args.date_to}",
            "status_filter": args.status,
            "revenue_by_currency": summary,
        }
        print(json.dumps(result, indent=2))
    except requests.RequestException as e:
        print(json.dumps({"error": f"Stripe API error: {e}"}))
        sys.exit(1)


if __name__ == "__main__":
    main()
