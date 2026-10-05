"""Copia la versión compilada de cada propuesta a este repo para servirla en GitHub Pages.

Los sitios originales usan rutas absolutas ("/assets/...") porque Netlify los sirve
en la raíz del dominio. GitHub Pages los sirve en /propuestas/<slug>/, así que aquí
se reescriben esas rutas en la copia. Los proyectos originales no se tocan.

Uso:  python tools/sync.py            (todas)
      python tools/sync.py paladart   (solo una)
"""

import re
import shutil
import sys
from pathlib import Path

REPO = "propuestas"
ROOT = Path(__file__).resolve().parent.parent
DOCS = Path.home() / "Documents"

# slug -> carpeta compilada del proyecto original
# old_base: prefijo que el sitio ya usa (si se compiló para otra subcarpeta)
SITES = {
    "la-casita-de-papi": {"src": DOCS / "la-casita-de-papi/site"},
    "paladart": {"src": DOCS / "paladart-restaurante/site"},
    "central-gastronomica": {"src": DOCS / "central-gastronomica-propuesta/site"},
    "plaza-merengue": {"src": DOCS / "GitHub/Plaza merengue"},
    "puerta-del-sol": {"src": DOCS / "puerta-del-sol/site"},
    "the-deck": {"src": DOCS / "restaurante-the-deck/site"},
    "el-tablon-latino": {"src": DOCS / "el-tablon-latino/site"},
    "kukka-beach": {
        "src": DOCS / "kukka-beach-restaurant/site",
        "old_base": "/kukka-beach/",
        # menu.js arma las rutas de las fotos a partir de SITE_URL
        "extra": {"assets/js/config.js": [("github.io/kukka-beach\"", "github.io/propuestas/kukka-beach\"")]},
    },
    "sabor-criollo": {"src": DOCS / "GitHub/sabor-criollo/out"},
    "la-casita-de-mary": {"src": DOCS / "la-casita-de-mary/site"},
}

IGNORE = shutil.ignore_patterns(".git", ".github", "README.md", "netlify.toml", "node_modules", ".DS_Store")
TEXT_EXT = {".html", ".css", ".js", ".json", ".webmanifest", ".xml", ".txt", ".svg"}
ROOT_ATTR_EXT = {".html", ".webmanifest", ".json"}


def rewrite(text, entries, base, ext, old_base):
    if old_base:
        return re.sub(r'(?<=["\'(\s,=])' + re.escape(old_base), base, text)
    # "/assets/...", "/menu.html", "/menu", "/_next/..." -> "<base>assets/..."
    names = "|".join(re.escape(e) for e in sorted(entries, key=len, reverse=True))
    text = re.sub(r'(?<=["\'(\s,=])/(?=(?:' + names + r')(?:[/?#"\'\s),]|$))', base, text)
    if ext in ROOT_ATTR_EXT:
        # href="/", href="/#ubicacion", href="/./", "start_url": "/"
        text = re.sub(r'((?:href|action|content|src)=|"(?:start_url|scope|id)":\s*)(["\'])/(?=[#?.\'"])', r"\1\2" + base, text)
    return text


def sync(slug, cfg):
    src, dst = cfg["src"], ROOT / slug
    if not src.is_dir():
        print(f"  ! {slug}: no existe {src}")
        return
    if dst.exists():
        shutil.rmtree(dst)
    shutil.copytree(src, dst, ignore=IGNORE)

    entries = set()
    for p in dst.iterdir():
        entries.add(p.name)
        if p.suffix == ".html":
            entries.add(p.stem)
    base = f"/{REPO}/{slug}/"
    changed = 0
    for f in dst.rglob("*"):
        if f.suffix.lower() not in TEXT_EXT or not f.is_file():
            continue
        text = f.read_text(encoding="utf-8", errors="surrogateescape")
        new = rewrite(text, entries, base, f.suffix.lower(), cfg.get("old_base"))
        if new != text:
            f.write_text(new, encoding="utf-8", errors="surrogateescape", newline="")
            changed += 1
    for rel, pairs in cfg.get("extra", {}).items():
        f = dst / rel
        text = f.read_text(encoding="utf-8")
        for old, new in pairs:
            text = text.replace(old, new)
        f.write_text(text, encoding="utf-8", newline="")
    print(f"  ok {slug}: {changed} archivos ajustados")


def main():
    wanted = sys.argv[1:] or list(SITES)
    for slug in wanted:
        if slug not in SITES:
            sys.exit(f"Slug desconocido: {slug}. Opciones: {', '.join(SITES)}")
        sync(slug, SITES[slug])


if __name__ == "__main__":
    main()
