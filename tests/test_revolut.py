"""Integration tests for Revolut API tools.

Tests tools/revolut/ scripts and skills/cfo/scripts/ Revolut scripts.
All live_api tests are read-only and validate response shape, not values.
"""

import json
import subprocess
import sys
import os

import pytest

REPO_ROOT = os.path.join(os.path.dirname(__file__), "..")


# ── tools/revolut/get_balance.py ──


@pytest.mark.live_api
def test_get_balance_valid_json(env_keys):
    """get_balance.py returns valid JSON list with expected fields."""
    env_keys("REVOLUT_API_KEY")
    result = subprocess.run(
        [sys.executable, os.path.join(REPO_ROOT, "tools", "revolut", "get_balance.py")],
        capture_output=True, text=True, timeout=30,
    )
    assert result.returncode == 0, f"Script failed: {result.stderr}"
    data = json.loads(result.stdout)
    assert isinstance(data, list)
    for account in data:
        assert "id" in account
        assert "balance" in account
        assert "currency" in account


# ── tools/revolut/get_transactions.py ──


@pytest.mark.live_api
def test_get_transactions_json(env_keys):
    """get_transactions.py returns valid JSON list."""
    env_keys("REVOLUT_API_KEY")
    result = subprocess.run(
        [sys.executable, os.path.join(REPO_ROOT, "tools", "revolut", "get_transactions.py"),
         "--days", "7"],
        capture_output=True, text=True, timeout=30,
    )
    assert result.returncode == 0, f"Script failed: {result.stderr}"
    data = json.loads(result.stdout)
    assert isinstance(data, list)


@pytest.mark.live_api
def test_get_transactions_csv(env_keys):
    """get_transactions.py CSV output has correct header."""
    env_keys("REVOLUT_API_KEY")
    result = subprocess.run(
        [sys.executable, os.path.join(REPO_ROOT, "tools", "revolut", "get_transactions.py"),
         "--days", "7", "--format", "csv"],
        capture_output=True, text=True, timeout=30,
    )
    assert result.returncode == 0, f"Script failed: {result.stderr}"
    lines = result.stdout.strip().splitlines()
    assert len(lines) >= 1
    assert lines[0] == "date,description,amount,currency,type"


# ── skills/cfo/scripts/get_balances.py ──


@pytest.mark.live_api
def test_cfo_get_balances(env_keys):
    """CFO get_balances.py returns valid JSON list with expected fields."""
    env_keys("REVOLUT_API_KEY")
    result = subprocess.run(
        [sys.executable, os.path.join(REPO_ROOT, "agents", "cfo", "scripts", "get_balances.py")],
        capture_output=True, text=True, timeout=30,
    )
    assert result.returncode == 0, f"Script failed: {result.stderr}"
    data = json.loads(result.stdout)
    assert isinstance(data, list)
    for account in data:
        assert "id" in account
        assert "balance" in account
        assert "currency" in account


@pytest.mark.live_api
def test_cfo_get_balances_currency_filter(env_keys):
    """CFO get_balances.py --currency filters results correctly."""
    env_keys("REVOLUT_API_KEY")
    result = subprocess.run(
        [sys.executable, os.path.join(REPO_ROOT, "agents", "cfo", "scripts", "get_balances.py"),
         "--currency", "PLN"],
        capture_output=True, text=True, timeout=30,
    )
    assert result.returncode == 0, f"Script failed: {result.stderr}"
    data = json.loads(result.stdout)
    assert isinstance(data, list)
    for account in data:
        assert account["currency"] == "PLN"


# ── skills/cfo/scripts/get_transactions.py ──


@pytest.mark.live_api
def test_cfo_get_transactions(env_keys):
    """CFO get_transactions.py returns valid JSON list."""
    env_keys("REVOLUT_API_KEY")
    result = subprocess.run(
        [sys.executable, os.path.join(REPO_ROOT, "agents", "cfo", "scripts", "get_transactions.py")],
        capture_output=True, text=True, timeout=30,
    )
    assert result.returncode == 0, f"Script failed: {result.stderr}"
    data = json.loads(result.stdout)
    assert isinstance(data, list)
