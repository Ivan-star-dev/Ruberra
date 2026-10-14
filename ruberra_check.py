import json, os, html
ROOT = os.path.dirname(os.path.abspath(__file__))
SCRIPTS, FILES = ["dev", "build", "start"], ["tsconfig.json", "app/page.tsx", "app/layout.tsx"]
def check_scripts(pkg, names=SCRIPTS):
    s = pkg.get("scripts", {}) if isinstance(pkg, dict) else {}
    return [("script:" + n, bool(s.get(n))) for n in names]
def check_files(root, names=FILES):
    return [("file:" + n, os.path.isfile(os.path.join(root, n))) for n in names]
def totals(res):
    p = sum(1 for _, ok in res if ok)
    return {"pass": p, "fail": len(res) - p, "total": len(res)}
def to_html(res, t):
    rows = "".join(f"<tr><td>{html.escape(n)}</td><td>{'PASS' if ok else 'FAIL'}</td></tr>" for n, ok in res)
    return (f"<!DOCTYPE html><html><head><meta charset='utf-8'><title>Ruberra Health</title></head><body>"
            f"<h1>Ruberra Health</h1><table border='1'><tr><th>Check</th><th>Status</th></tr>{rows}</table>"
            f"<p>{html.escape(json.dumps(t))}</p></body></html>")
assert check_scripts({"scripts": {"dev": "x"}}, ["dev"]) == [("script:dev", True)]
assert check_scripts({}, ["build"]) == [("script:build", False)]
assert totals([("a", True), ("b", False)]) == {"pass": 1, "fail": 1, "total": 2}
assert "&lt;x&gt;" in to_html([("<x>", True)], totals([("<x>", True)]))
assert check_files(ROOT, ["__nope__"]) == [("file:__nope__", False)]
def main():
    with open(os.path.join(ROOT, "package.json"), encoding="utf-8") as f:
        res = check_scripts(json.load(f)) + check_files(ROOT)
    for n, ok in res: print(("PASS" if ok else "FAIL"), n)
    t = totals(res); print(f"TOTAL {t['total']} PASS {t['pass']} FAIL {t['fail']}")
    with open(os.path.join(ROOT, "ruberra-health.json"), "w", encoding="utf-8") as f:
        json.dump({"results": [{"check": n, "ok": ok} for n, ok in res], "totals": t}, f, indent=2)
    with open(os.path.join(ROOT, "ruberra-health.html"), "w", encoding="utf-8") as f:
        f.write(to_html(res, t))
    return t
if __name__ == "__main__":
    main()
