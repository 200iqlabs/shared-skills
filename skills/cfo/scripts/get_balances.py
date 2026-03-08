#!/usr/bin/env python3
"""Fetch account balances from Revolut Business API.

Usage:
    python get_balances.py
    python get_balances.py --currency EUR
    python get_balances.py --active-only

Output: JSON array of account objects with id, name, balance, currency, state.
"""

import argparse
import json
import os
import sys

import requests

sys.path.insert(0, os.path.join(os.path.dirname(__file__), "..", "..", "..", "tools", "common"))
from env import load_env


def get_balances(api_url, api_key, currency=None, active_only=False):
    """Fetch all accounts from Revolut Business API."""
    headers = {"Authorization": f"Bearer {api_key}"}
    resp = requests.get(f"{api_url}/accounts", headers=headers, timeout=10)
    resp.raise_for_status()
    accounts = resp.json()

    if active_only:
        accounts = [a for a in accounts if a.get("state") == "active"]

    if currency:
        accounts = [a for a in accounts if a.get("currency") == currency.upper()]

    return accounts


def main():
    parser = argparse.ArgumentParser(description="Fetch Revolut Business account balances")
    parser.add_argument("--currency", help="Filter by currency (e.g. EUR, PLN, GBP)")
    parser.add_argument("--active-only", action="store_true", help="Show only active accounts")
    args = parser.parse_args()

    load_env()
    api_key = os.environ.get("REVOLUT_API_KEY")
    api_url = os.environ.get("REVOLUT_API_URL", "https://b2b.revolut.com/api/1.0")

    if not api_key:
        print(json.dumps({"error": "REVOLUT_API_KEY not set. Configure in tools/common/.env"}))
        sys.exit(1)

    try:
        accounts = get_balances(api_url, api_key, args.currency, args.active_only)
        print(json.dumps(accounts, indent=2))
    except requests.RequestException as e:
        print(json.dumps({"error": f"Revolut API error: {e}"}))
        sys.exit(1)


if __name__ == "__main__":
    main()
