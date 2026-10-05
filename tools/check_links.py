"""Verifica que toda ruta local (/propuestas/...) referenciada en HTML/CSS exista en el repo."""

import re
import sys
from pathlib import Path
from urllib.parse import unquote

ROOT = Path(__file__).resolve().parent.parent
PREFIX = "/propuestas/"
URL_RE = re.compile(r'(?:href|src|content|action)=["\']([^"\']+)["\']|url\(\s*["\']?([^"\')]+)')
SRCSET_RE = re.compile(r'srcset=["\']([^"\']+)["\']')


def resolve(path):
    p = ROOT / unquote(path[len(PREFIX):])
    return p.exists() or p.with_suffix(".html").exists() or (p / "index.html").exists()


missing, leftovers = [], []
for f in ROOT.rglob("*"):
    if f.suffix not in {".html", ".css"} or ".git" in f.parts or "tools" in f.parts:
        continue
    text = f.read_text(encoding="utf-8", errors="ignore")
    urls = [a or b for a, b in URL_RE.findall(text)]
    for s in SRCSET_RE.findall(text):
        urls += [part.strip().split()[0] for part in s.split(",") if part.strip()]
    for u in urls:
        u = u.split("#")[0].split("?")[0]
        if u.startswith(PREFIX):
            if not resolve(u):
                missing.append((f.relative_to(ROOT), u))
        elif u.startswith("/") and not u.startswith("//"):
            leftovers.append((f.relative_to(ROOT), u))

for f, u in missing:
    print(f"FALTA     {f}: {u}")
for f, u in leftovers:
    print(f"SIN AJUSTE {f}: {u}")
print(f"\n{len(missing)} rutas rotas, {len(leftovers)} rutas absolutas sin ajustar")
sys.exit(1 if missing or leftovers else 0)
