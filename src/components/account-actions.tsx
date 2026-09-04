"use client";

export function AccountActions() {
  async function signOut() {
    await fetch("/api/auth/logout", { method: "POST" });
    window.location.href = "/";
  }

  return (
    <button
      type="button"
      onClick={signOut}
      className="border border-ink px-3 py-1.5 hover:bg-ink hover:text-paper transition-colors"
    >
      sign out
    </button>
  );
}
