"""Integration tests for Stripe API scripts in agents/cfo/.

All live_api tests are read-only and validate response shape, not values.
"""

import json
import subprocess
import sys
import os

import pytest

REPO_ROOT = os.path.join(os.path.dirname(__file__), "..")
CFO_SCRIPTS = os.path.join(REPO_ROOT, "agents", "cfo", "scripts")


@pytest.mark.live_api
def test_get_subscriptions(env_keys):
    """get_subscriptions.py returns valid JSON with expected structure."""
    env_keys("STRIPE_SECRET_KEY")
    result = subprocess.run(
        [sys.executable, os.path.join(CFO_SCRIPTS, "get_subscriptions.py")],
        capture_output=True, text=True, timeout=30,
    )
    assert result.returncode == 0, f"Script failed: {result.stderr}"
    data = json.loads(result.stdout)
    assert "subscriptions" in data
    assert "total" in data
    assert isinstance(data["subscriptions"], list)
    assert isinstance(data["total"], int)


@pytest.mark.live_api
def test_get_revenue(env_keys):
    """get_revenue.py returns valid JSON with revenue summary."""
    env_keys("STRIPE_SECRET_KEY")
    result = subprocess.run(
        [sys.executable, os.path.join(CFO_SCRIPTS, "get_revenue.py")],
        capture_output=True, text=True, timeout=30,
    )
    assert result.returncode == 0, f"Script failed: {result.stderr}"
    data = json.loads(result.stdout)
    assert "revenue_by_currency" in data
    assert "period" in data
    assert isinstance(data["revenue_by_currency"], dict)


@pytest.mark.live_api
def test_get_mrr(env_keys):
    """get_mrr.py returns valid JSON with MRR output structure."""
    env_keys("STRIPE_SECRET_KEY")
    result = subprocess.run(
        [sys.executable, os.path.join(CFO_SCRIPTS, "get_mrr.py")],
        capture_output=True, text=True, timeout=30,
    )
    assert result.returncode == 0, f"Script failed: {result.stderr}"
    data = json.loads(result.stdout)
    assert "total_active_subscriptions" in data
    assert "mrr_by_currency" in data
    assert isinstance(data["mrr_by_currency"], dict)
