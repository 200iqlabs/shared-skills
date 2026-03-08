"""Integration and mock tests for ClickUp API tools.

Live tests require CLICKUP_API_TOKEN and a valid list ID.
Mock tests validate payload construction without API calls.
"""

import json
import os
import shutil
import subprocess
import tempfile
import uuid

import pytest

REPO_ROOT = os.path.normpath(os.path.join(os.path.dirname(__file__), ".."))
CLICKUP_DIR = os.path.join(REPO_ROOT, "tools", "clickup")


def _posix(path):
    """Convert Windows path to POSIX/MSYS for bash subprocess calls."""
    path = path.replace("\\", "/")
    if len(path) >= 2 and path[1] == ":":
        path = "/" + path[0].lower() + path[2:]
    return path


def _find_bash():
    """Find Git Bash that can access Windows paths via MSYS mounts."""
    git_bash = r"C:\Program Files\Git\bin\bash.exe"
    if os.path.exists(git_bash):
        return git_bash
    return shutil.which("bash") or "bash"


BASH = _find_bash()


def _ensure_env_file():
    """Ensure tools/common/.env exists for bash script tests."""
    env_file = os.path.join(REPO_ROOT, "tools", "common", ".env")
    created = False
    if not os.path.exists(env_file):
        with open(env_file, "w") as f:
            f.write("# temporary env for tests\nCLICKUP_API_TOKEN=test_token_fake\n")
        created = True
    return env_file, created


def _run_create_task_with_mock(name, desc):
    """Run create_task.sh with a mock curl and return the captured JSON payload.

    Uses a wrapper script that overrides curl as a function, avoiding PATH issues.
    """
    unique = uuid.uuid4().hex[:8]
    capture_path = f"/tmp/clickup_test_payload_{unique}.json"
    capture_win = os.path.join(tempfile.gettempdir(), f"clickup_test_payload_{unique}.json")

    script_path = _posix(os.path.join(CLICKUP_DIR, "create_task.sh"))

    # Create a wrapper script that defines curl as a function (overrides the real curl)
    wrapper_path = os.path.join(tempfile.gettempdir(), f"clickup_test_wrapper_{unique}.sh")
    with open(wrapper_path, "w", newline="\n") as f:
        f.write(f"""#!/bin/bash
# Override curl with a function that captures the -d payload
curl() {{
    local payload=""
    while [[ $# -gt 0 ]]; do
        case "$1" in
            -d) shift; payload="$1"; shift ;;
            *) shift ;;
        esac
    done
    echo "$payload" > "{capture_path}"
    echo '{{"id": "mock_task_id", "name": "mock"}}'
}}
export -f curl

source "{script_path}" "$@"
""")

    env = os.environ.copy()
    env["CLICKUP_API_TOKEN"] = "test_token_fake"

    try:
        result = subprocess.run(
            [BASH, _posix(wrapper_path), "123", name, desc],
            capture_output=True, text=True, timeout=10,
            env=env,
        )
        payload_raw = None
        if os.path.exists(capture_win):
            with open(capture_win) as f:
                payload_raw = f.read().strip()
        return result, payload_raw
    finally:
        if os.path.exists(capture_win):
            os.remove(capture_win)
        if os.path.exists(wrapper_path):
            os.remove(wrapper_path)


# ── get_tasks.sh (live) ──


@pytest.mark.live_api
def test_get_tasks_valid_json(env_keys):
    """get_tasks.sh returns valid JSON with 'tasks' key."""
    env_keys("CLICKUP_API_TOKEN")
    list_id = os.environ.get("CLICKUP_TEST_LIST_ID")
    if not list_id:
        pytest.fail(
            "CLICKUP_TEST_LIST_ID not set in tools/common/.env. "
            "Add a ClickUp list ID for testing."
        )
    result = subprocess.run(
        [BASH, _posix(os.path.join(CLICKUP_DIR, "get_tasks.sh")), list_id],
        capture_output=True, text=True, timeout=30,
    )
    assert result.returncode == 0, f"Script failed: {result.stderr}"
    data = json.loads(result.stdout)
    assert "tasks" in data


# ── create_task.sh (mocked) ──


def test_create_task_payload_construction():
    """create_task.sh builds correct JSON payload with expected fields."""
    env_file, created = _ensure_env_file()
    try:
        result, payload_raw = _run_create_task_with_mock("Test Task", "A description")
        assert result.returncode == 0, f"Script failed: {result.stderr}"
        assert payload_raw is not None, "Payload was not captured"
        payload = json.loads(payload_raw)
        assert payload["name"] == "Test Task"
        assert payload["description"] == "A description"
    finally:
        if created:
            os.remove(env_file)


def test_create_task_special_characters():
    """create_task.sh handles special characters in name/description."""
    env_file, created = _ensure_env_file()
    try:
        name_with_special = 'Task with "quotes" and $dollar'
        desc_with_special = 'Line1\\nLine2 and {braces}'

        result, payload_raw = _run_create_task_with_mock(name_with_special, desc_with_special)
        assert result.returncode == 0, f"Script failed: {result.stderr}"
        assert payload_raw is not None, "Payload was not captured"
        payload = json.loads(payload_raw)
        assert payload["name"] == name_with_special
        assert payload["description"] == desc_with_special
    finally:
        if created:
            os.remove(env_file)
