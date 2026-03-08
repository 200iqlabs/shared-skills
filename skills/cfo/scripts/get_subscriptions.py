#!/usr/bin/env python3
"""Fetch active subscriptions from Stripe API.

Usage:
    python get_subscriptions.py
    python get_subscriptions.py --status active
    python get_subscriptions.py --status all --limit 50

Output: JSON object with subscriptions list and summary.
"""

import argparse
import json
import os
import sys

import requests

sys.path.insert(0, os.path.join(os.path.dirname(__file__), "..", "..", "..", "tools", "common"))
from env import load_env


def get_subscriptions(api_key, status="active", limit=100):
    """Fetch subscriptions from Stripe API with pagination."""
    all_subs = []
    params = {"limit": min(limit, 100)}
    if status != "all":
        params["status"] = status

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


def main():
    parser = argparse.ArgumentParser(description="Fetch Stripe subscriptions")
    parser.add_argument(
        "--status", default="active",
        choices=["active", "past_due", "canceled", "ended", "all"],
        help="Filter by subscription status (default: active)",
    )
    parser.add_argument("--limit", type=int, default=100, help="Max subscriptions to fetch")
    args = parser.parse_args()

    load_env()
    api_key = os.environ.get("STRIPE_SECRET_KEY")

    if not api_key:
        print(json.dumps({"error": "STRIPE_SECRET_KEY not set. Configure in tools/common/.env"}))
        sys.exit(1)

    try:
        subs = get_subscriptions(api_key, args.status, args.limit)
        result = {
            "total": len(subs),
            "status_filter": args.status,
            "subscriptions": subs,
        }
        print(json.dumps(result, indent=2))
    except requests.RequestException as e:
        print(json.dumps({"error": f"Stripe API error: {e}"}))
        sys.exit(1)


if __name__ == "__main__":
    main()
