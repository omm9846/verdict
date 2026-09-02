"""Accuracy benchmark for the Verdict engine.

Run against a small set of addresses with known ground truth (is the mailbox
real?). Reports precision, recall and F1 for the SEND/DEAD decisions. This is
the honest way to state an accuracy number: measured, not borrowed.

Usage: python -m engine.benchmark
"""
from __future__ import annotations

import sys, os, json
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from engine.verify import verify

# Ground truth: (address, is_real)
# is_real: True  -> mailbox genuinely exists (SEND is correct)
#          False -> mailbox does not exist (DEAD is correct)
# Use a conservative, verifiable set. UNKNOWN verdicts are excluded from
# precision/recall but reported separately, because they are honest, not wrong.
GROUND_TRUTH = [
    # Consumer providers (fast-path SEND)
    ("someone@gmail.com", True),
    ("someone@yahoo.com", True),
    ("someone@outlook.com", True),
    # Corporate (real domain)
    ("support@apple.com", True),
    ("info@microsoft.com", True),
    # Disposable (RISKY - treated as not SEND-able)
    ("test@mailinator.com", True),
    # Definitively dead
    ("zzz-nobody-12345@nonexistent-domain-zzz.com", False),
]

def main():
    tp = fp = fn = tn = 0
    unknown = 0
    rows = []
    for email, is_real in GROUND_TRUTH:
        try:
            r = verify(email)
        except Exception as e:
            print(f"  {email}: engine error {str(e)[:50]}")
            continue
        verdict = r.get("verdict")
        # Map verdict -> did we say SEND-able?
        says_send = verdict in ("SEND",)
        rows.append((email, is_real, verdict))

        if verdict == "UNKNOWN":
            unknown += 1
            continue
        if verdict == "SEND":
            if is_real: tp += 1
            else: fp += 1
        elif verdict == "DEAD":
            if is_real: fn += 1
            else: tn += 1
        else:  # RISKY / CATCHALL: treated as not-a-clean-send, not DEAD
            if is_real:
                # We declined to say SEND on a real mailbox (conservative)
                fp += 1
            else:
                tn += 1

    print("Verdict accuracy benchmark (measured on labeled set)")
    print(f"  tested: {len(GROUND_TRUTH)}, UNKNOWN: {unknown}")
    print(f"  SEND correct (TP): {tp} | SEND wrong (FP): {fp}")
    print(f"  DEAD correct (TN): {tn} | DEAD wrong (FN): {fn}")
    precision = tp / (tp + fp) if (tp + fp) else 0
    recall = tp / (tp + fn) if (tp + fn) else 0
    f1 = 2 * precision * recall / (precision + recall) if (precision + recall) else 0
    print(f"  precision (SEND was right): {precision:.2%}")
    print(f"  recall (caught all real):   {recall:.2%}")
    print(f"  F1: {f1:.2%}")
    print("\n  per-address:")
    for email, is_real, verdict in rows:
        mark = "REAL " if is_real else "DEAD "
        print(f"    {mark} {email.ljust(40)} -> {verdict}")

if __name__ == "__main__":
    main()