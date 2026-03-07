#!/usr/bin/env python3
"""Fetch account balances from Revolut Business API.
Usage: python get_balance.py
"""
import json, os, sys
try:
    import requests
except ImportError:
    print("pip install requests", file=sys.stderr); sys.exit(1)

api_key = os.environ.get("REVOLUT_API_KEY")
api_url = os.environ.get("REVOLUT_API_URL", "https://b2b.revolut.com/api/1.0")
if not api_key:
    print("Error: REVOLUT_API_KEY not set.", file=sys.stderr); sys.exit(1)

response = requests.get(f"{api_url}/accounts",
    headers={"Authorization": f"Bearer {api_key}"})
response.raise_for_status()
print(json.dumps(response.json(), indent=2, ensure_ascii=False))
