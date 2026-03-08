"""Shared environment loader for Python scripts."""

import os


def load_env(env_path=None):
    """Load environment variables from .env file.

    Args:
        env_path: Path to .env file. Defaults to tools/common/.env relative to project root.
    """
    if env_path is None:
        env_path = os.path.join(os.path.dirname(__file__), ".env")
    env_path = os.path.normpath(env_path)
    if os.path.exists(env_path):
        with open(env_path) as f:
            for line in f:
                line = line.strip()
                if line and not line.startswith("#") and "=" in line:
                    key, _, value = line.partition("=")
                    os.environ.setdefault(key.strip(), value.strip())
