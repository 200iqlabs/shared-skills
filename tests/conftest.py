"""Shared fixtures for tool and agent script tests."""

import os
import pytest

# Path to .env file relative to repo root
ENV_FILE = os.path.join(os.path.dirname(__file__), "..", "tools", "common", ".env")


def _load_env():
    """Load key=value pairs from tools/common/.env into os.environ."""
    if not os.path.exists(ENV_FILE):
        return False
    with open(ENV_FILE) as f:
        for line in f:
            line = line.strip()
            if not line or line.startswith("#"):
                continue
            if "=" in line:
                key, value = line.split("=", 1)
                os.environ.setdefault(key.strip(), value.strip())
    return True


@pytest.fixture
def env_keys():
    """Load .env and return a helper to require specific keys.

    Usage in tests:
        def test_something(env_keys):
            env_keys("REVOLUT_API_KEY", "REVOLUT_API_URL")
            # keys are now guaranteed to be in os.environ
    """
    env_loaded = _load_env()

    def _require(*keys):
        if not env_loaded:
            pytest.fail(
                f".env not found at {ENV_FILE}. "
                "Copy tools/common/.env.example to tools/common/.env and fill in your API keys."
            )
        for key in keys:
            if not os.environ.get(key):
                pytest.fail(
                    f"{key} not set in tools/common/.env. "
                    "Copy tools/common/.env.example to tools/common/.env and fill in your API keys."
                )

    return _require
