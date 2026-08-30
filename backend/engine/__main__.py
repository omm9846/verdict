"""Command line entry point.

    python -m engine verify  someone@example.com
    python -m engine check   someone@example.com     # DNS tier, no probe
    python -m engine audit   example.com
    python -m engine mcp                             # MCP server over stdio

Everything prints JSON, so it pipes into jq or gets read by an agent without
parsing prose. Exit status is 0 when a verdict was reached and 1 when the
answer is genuinely unknown, so a shell script can branch on it.
"""
from __future__ import annotations

import json
import sys

USAGE = __doc__


def main(argv: list[str] | None = None) -> int:
    argv = list(sys.argv[1:] if argv is None else argv)
    if not argv or argv[0] in ("-h", "--help", "help"):
        print(USAGE.strip())
        return 0

    cmd, rest = argv[0], argv[1:]

    if cmd == "mcp":
        from engine.mcp_server import main as mcp_main
        mcp_main()
        return 0

    if not rest:
        print(f"'{cmd}' needs an argument.\n\n{USAGE.strip()}", file=sys.stderr)
        return 2

    target = rest[0]

    if cmd == "verify":
        from engine.verify import verify
        result = verify(target)
    elif cmd == "check":
        from engine.precheck import precheck
        result = precheck(target)
    elif cmd == "audit":
        from engine.domain_audit import audit_domain
        result = audit_domain(target)
    else:
        print(f"unknown command '{cmd}'.\n\n{USAGE.strip()}", file=sys.stderr)
        return 2

    print(json.dumps(result, indent=2, ensure_ascii=False))
    # UNKNOWN means the server refused us, not that the address is bad. Exiting
    # non-zero keeps a caller from reading "no verdict" as "verdict: fine".
    return 1 if result.get("verdict") == "UNKNOWN" else 0


if __name__ == "__main__":
    sys.exit(main())
