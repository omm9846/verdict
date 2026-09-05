"""Verdict as an MCP server, so an agent can verify mail for you.

Speaks MCP over stdio, which is plain JSON-RPC 2.0, implemented here directly
rather than through an SDK. The point of this file is that it installs with
nothing but dnspython: an agent tool that fails at `pip install` is an agent
tool nobody uses.

Running it locally is not a convenience, it is the only way this works.
Confirming a mailbox needs an SMTP conversation on port 25, and every major
cloud provider blocks outbound 25 - so a hosted verifier can only infer. On
your own machine the probe is real, and your contact list never leaves it.

Add to Claude Desktop or Claude Code:

    {
      "mcpServers": {
        "verdict": {
          "command": "python",
          "args": ["-m", "engine.mcp_server"],
          "cwd": "/path/to/verdict/backend"
        }
      }
    }
"""
from __future__ import annotations

import json
import sys
import traceback

from engine.verify import verify
from engine.precheck import precheck
from engine.domain_audit import audit_domain

PROTOCOL_VERSION = "2024-11-05"

TOOLS = [
    {
        "name": "verify_email",
        "description": (
            "Confirm whether a single mailbox exists, using a real SMTP probe. "
            "Returns SEND (mailbox accepted), DEAD (server named the recipient "
            "as unknown), CATCHALL (domain accepts every address, so nothing "
            "can be determined), RISKY (behind a filtering gateway), or UNKNOWN "
            "(the server refused the probe; no evidence either way). Requires "
            "outbound port 25, which is blocked on most cloud hosts but open on "
            "a normal machine. Never treat UNKNOWN as invalid."
        ),
        "inputSchema": {
            "type": "object",
            "properties": {
                "email": {"type": "string", "description": "Address to verify."}
            },
            "required": ["email"],
        },
    },
    {
        "name": "precheck_email",
        "description": (
            "Everything that can be established about an address without "
            "sending anything: syntax, typosquats of major providers, "
            "disposable domains, whether the domain accepts mail at all, role "
            "accounts, filtering gateways, SPF and DMARC presence. Works "
            "anywhere, including hosts that block port 25. Cannot confirm a "
            "mailbox exists - use verify_email for that."
        ),
        "inputSchema": {
            "type": "object",
            "properties": {
                "email": {"type": "string", "description": "Address to check."}
            },
            "required": ["email"],
        },
    },
    {
        "name": "audit_domain",
        "description": (
            "Grade a domain's email security posture: MX, SPF, DKIM, DMARC and "
            "MTA-STS. Returns a letter grade, a score out of 100, and a fix for "
            "each failing check. Answers whether someone else can send email as "
            "this domain. Pure DNS, nothing is sent to the domain."
        ),
        "inputSchema": {
            "type": "object",
            "properties": {
                "domain": {"type": "string", "description": "Domain, e.g. example.com"}
            },
            "required": ["domain"],
        },
    },
]


def call_tool(name: str, args: dict) -> dict:
    if name == "verify_email":
        return verify(args["email"])
    if name == "precheck_email":
        return precheck(args["email"])
    if name == "audit_domain":
        return audit_domain(args["domain"])
    raise ValueError(f"unknown tool: {name}")


def handle(req: dict) -> dict | None:
    method = req.get("method")
    req_id = req.get("id")

    # Notifications carry no id and must not be answered.
    if req_id is None and method and method.startswith("notifications/"):
        return None

    def ok(result):
        return {"jsonrpc": "2.0", "id": req_id, "result": result}

    def err(code, message):
        return {"jsonrpc": "2.0", "id": req_id,
                "error": {"code": code, "message": message}}

    if method == "initialize":
        return ok({
            "protocolVersion": PROTOCOL_VERSION,
            "capabilities": {"tools": {}},
            "serverInfo": {"name": "verdict", "version": "0.1.0"},
        })

    if method == "tools/list":
        return ok({"tools": TOOLS})

    if method == "tools/call":
        params = req.get("params") or {}
        name = params.get("name")
        args = params.get("arguments") or {}
        try:
            result = call_tool(name, args)
        except Exception as e:
            # Report the failure as tool output rather than a protocol error,
            # so the agent can read it and decide what to do.
            return ok({
                "content": [{"type": "text", "text": f"{type(e).__name__}: {e}"}],
                "isError": True,
            })
        return ok({
            "content": [{"type": "text",
                         "text": json.dumps(result, indent=2, ensure_ascii=False)}]
        })

    if method == "ping":
        return ok({})

    return err(-32601, f"method not found: {method}")


def main():
    for line in sys.stdin:
        line = line.strip()
        if not line:
            continue
        try:
            req = json.loads(line)
        except json.JSONDecodeError:
            continue
        try:
            resp = handle(req)
        except Exception:
            print(traceback.format_exc(), file=sys.stderr, flush=True)
            resp = {"jsonrpc": "2.0", "id": req.get("id"),
                    "error": {"code": -32603, "message": "internal error"}}
        if resp is not None:
            sys.stdout.write(json.dumps(resp) + "\n")
            sys.stdout.flush()


if __name__ == "__main__":
    main()
