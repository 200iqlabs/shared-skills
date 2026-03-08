"""Integration tests for inFakt API scripts in agents/cfo/.

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
def test_get_invoices(env_keys):
    """get_invoices.py returns valid JSON with expected structure."""
    env_keys("INFAKT_API_KEY")
    result = subprocess.run(
        [sys.executable, os.path.join(CFO_SCRIPTS, "get_invoices.py")],
        capture_output=True, text=True, timeout=30,
    )
    assert result.returncode == 0, f"Script failed: {result.stderr}"
    data = json.loads(result.stdout)
    assert "invoices" in data
    assert "summary" in data
    assert isinstance(data["invoices"], list)
    summary = data["summary"]
    assert "count" in summary
    assert "total_net" in summary
    assert "total_gross" in summary


@pytest.mark.live_api
def test_get_costs(env_keys):
    """get_costs.py returns valid JSON with expected structure."""
    env_keys("INFAKT_API_KEY")
    result = subprocess.run(
        [sys.executable, os.path.join(CFO_SCRIPTS, "get_costs.py")],
        capture_output=True, text=True, timeout=30,
    )
    assert result.returncode == 0, f"Script failed: {result.stderr}"
    data = json.loads(result.stdout)
    assert "costs" in data
    assert "summary" in data
    assert isinstance(data["costs"], list)
    summary = data["summary"]
    assert "count" in summary
    assert "total_net" in summary
    assert "total_gross" in summary
