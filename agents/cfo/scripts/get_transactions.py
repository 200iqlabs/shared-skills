#!/usr/bin/env python3
"""Fetch transactions from Revolut Business API.

Usage:
    python get_transactions.py --from 2026-01-01 --to 2026-01-31
    python get_transactions.py --from 2026-01-01 --to 2026-01-31 --type card_payment
    python get_transactions.py --from 2026-01-01 --to 2026-01-31 --count 500

Output: JSON array of transaction objects.
"""

import argparse
import json
import os
import sys
from datetime import datetime, timedelta

import requests

sys.path.insert(0, os.path.join(os.path.dirname(__file__), "..", "..", "..", "tools", "common"))
from env import load_env


def get_transactions(api_url, api_key, date_from, date_to, tx_type=None, count=100):
    """Fetch transactions from Revolut Business API with pagination."""
    headers = {"Authorization": f"Bearer {api_key}"}
    all_transactions = []
    current_to = date_to

    while True:
        params = {"from": date_from, "to": current_to, "count": min(count, 1000)}
        if tx_type:
            params["type"] = tx_type

        resp = requests.get(
            f"{api_url}/transactions", headers=headers, params=params, timeout=10
        )
        resp.raise_for_status()
        transactions = resp.json()

        if not transactions:
            break

        all_transactions.extend(transactions)

        if len(transactions) < min(count, 1000):
            break

        # Paginate: use created_at of last transaction as new 'to'
        current_to = transactions[-1].get("created_at", "")
        if not current_to:
            break

    return all_transactions


def main():
    parser = argparse.ArgumentParser(description="Fetch Revolut Business transactions")
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
        "--type",
        choices=[
            "atm", "card_payment", "card_refund", "card_chargeback", "card_credit",
            "exchange", "transfer", "loan", "fee", "refund", "topup", "topup_return",
            "tax", "tax_refund",
        ],
        help="Filter by transaction type",
    )
    parser.add_argument("--count", type=int, default=100, help="Max transactions per page (max 1000)")
    args = parser.parse_args()

    load_env()
    api_key = os.environ.get("REVOLUT_API_KEY")
    api_url = os.environ.get("REVOLUT_API_URL", "https://b2b.revolut.com/api/1.0")

    if not api_key:
        print(json.dumps({"error": "REVOLUT_API_KEY not set. Configure in tools/common/.env"}))
        sys.exit(1)

    try:
        transactions = get_transactions(
            api_url, api_key, args.date_from, args.date_to, args.type, args.count
        )
        print(json.dumps(transactions, indent=2))
    except requests.RequestException as e:
        print(json.dumps({"error": f"Revolut API error: {e}"}))
        sys.exit(1)


if __name__ == "__main__":
    main()
