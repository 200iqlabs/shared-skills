#!/usr/bin/env python3
"""Fetch recent transactions from Revolut Business API.
Usage: python get_transactions.py [--days 30] [--format json|csv]
"""
import argparse, json, os, sys
from datetime import datetime, timedelta

try:
    import requests
except ImportError:
    print("pip install requests", file=sys.stderr); sys.exit(1)

def main():
    parser = argparse.ArgumentParser(description="Fetch Revolut Business transactions")
    parser.add_argument("--days", type=int, default=30)
    parser.add_argument("--format", choices=["json", "csv"], default="json")
    args = parser.parse_args()

    api_key = os.environ.get("REVOLUT_API_KEY")
    api_url = os.environ.get("REVOLUT_API_URL", "https://b2b.revolut.com/api/1.0")
    if not api_key:
        print("Error: REVOLUT_API_KEY not set.", file=sys.stderr); sys.exit(1)

    from_date = (datetime.now() - timedelta(days=args.days)).strftime("%Y-%m-%d")
    response = requests.get(f"{api_url}/transactions",
        headers={"Authorization": f"Bearer {api_key}"},
        params={"from": from_date, "count": 1000})
    response.raise_for_status()
    transactions = response.json()

    if args.format == "json":
        print(json.dumps(transactions, indent=2, ensure_ascii=False))
    else:
        print("date,description,amount,currency,type")
        for tx in transactions:
            legs = tx.get("legs", [{}])
            print(f"{tx.get('created_at','')},{tx.get('description','')},{legs[0].get('amount',0)},{legs[0].get('currency','')},{tx.get('type','')}")

if __name__ == "__main__":
    main()
