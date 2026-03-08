#!/usr/bin/env python3
"""Calculate MRR (Monthly Recurring Revenue) from Stripe subscriptions.

Usage:
    python get_mrr.py
    python get_mrr.py --currency pln
    python get_mrr.py --detailed

Output: JSON object with MRR calculation and breakdown.
"""

import argparse
import json
import os
import sys
from collections import defaultdict

import requests

sys.path.insert(0, os.path.join(os.path.dirname(__file__), "..", "..", "..", "tools", "common"))
from env import load_env


def get_active_subscriptions(api_key):
    """Fetch all active subscriptions from Stripe."""
    all_subs = []
    params = {"status": "active", "limit": 100}

    has_more = True
    while has_more:
        resp = requests.get(
            "https://api.stripe.com/v1/subscriptions",
            auth=(api_key, ""),
            params=params,
            timeout=10,
        )
        resp.raise_for_status()
        data = resp.json()
        all_subs.extend(data["data"])
        has_more = data.get("has_more", False)
        if has_more and data["data"]:
            params["starting_after"] = data["data"][-1]["id"]

    return all_subs


def calculate_mrr(subscriptions, currency_filter=None):
    """Calculate MRR from active subscriptions.

    Normalizes all intervals to monthly:
    - day: amount × 30
    - week: amount × (52/12)
    - month: amount
    - year: amount / 12
    """
    interval_multipliers = {
        "day": 30,
        "week": 52 / 12,
        "month": 1,
        "year": 1 / 12,
    }

    mrr_by_currency = defaultdict(lambda: {"mrr": 0, "count": 0, "plans": []})

    for sub in subscriptions:
        for item in sub.get("items", {}).get("data", []):
            price = item.get("price", {})
            amount = (price.get("unit_amount") or 0) / 100  # cents to units
            currency = (price.get("currency") or "").upper()
            interval = price.get("recurring", {}).get("interval", "month")
            interval_count = price.get("recurring", {}).get("interval_count", 1)
            quantity = item.get("quantity", 1)

            if currency_filter and currency != currency_filter.upper():
                continue

            multiplier = interval_multipliers.get(interval, 1)
            monthly_amount = (amount * quantity * multiplier) / interval_count

            mrr_by_currency[currency]["mrr"] += monthly_amount
            mrr_by_currency[currency]["count"] += 1
            mrr_by_currency[currency]["plans"].append({
                "subscription_id": sub["id"],
                "customer": sub.get("customer"),
                "plan": price.get("id"),
                "monthly_amount": round(monthly_amount, 2),
                "interval": f"{interval_count} {interval}",
            })

    return dict(mrr_by_currency)


def main():
    parser = argparse.ArgumentParser(description="Calculate MRR from Stripe subscriptions")
    parser.add_argument("--currency", help="Filter by currency (e.g. PLN, USD, EUR)")
    parser.add_argument("--detailed", action="store_true", help="Include per-subscription breakdown")
    args = parser.parse_args()

    load_env()
    api_key = os.environ.get("STRIPE_SECRET_KEY")

    if not api_key:
        print(json.dumps({"error": "STRIPE_SECRET_KEY not set. Configure in tools/common/.env"}))
        sys.exit(1)

    try:
        subs = get_active_subscriptions(api_key)
        mrr_data = calculate_mrr(subs, args.currency)

        result = {
            "total_active_subscriptions": len(subs),
            "mrr_by_currency": {},
        }

        for currency, data in mrr_data.items():
            entry = {
                "mrr": round(data["mrr"], 2),
                "arr": round(data["mrr"] * 12, 2),
                "subscription_count": data["count"],
            }
            if args.detailed:
                entry["plans"] = data["plans"]
            result["mrr_by_currency"][currency] = entry

        print(json.dumps(result, indent=2))
    except requests.RequestException as e:
        print(json.dumps({"error": f"Stripe API error: {e}"}))
        sys.exit(1)


if __name__ == "__main__":
    main()
