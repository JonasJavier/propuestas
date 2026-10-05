# Propuestas web para restaurantes

Copia pública de las propuestas, servida con GitHub Pages como respaldo de Netlify.

**Portal:** https://jonasjavier.github.io/propuestas/

| Restaurante | GitHub Pages | Netlify | Código (privado) |
|---|---|---|---|
| La Casita de Papi | [/la-casita-de-papi/](https://jonasjavier.github.io/propuestas/la-casita-de-papi/) | [lacasitadepapi.netlify.app](https://lacasitadepapi.netlify.app) | `la-casita-de-papi` |
| Paladart | [/paladart/](https://jonasjavier.github.io/propuestas/paladart/) | [paladart.netlify.app](https://paladart.netlify.app) | `paladart-restaurante` |
| Central Gastronómica | [/central-gastronomica/](https://jonasjavier.github.io/propuestas/central-gastronomica/) | [central-gastronomica.netlify.app](https://central-gastronomica.netlify.app) | `central-gastronomica-propuesta` |
| Plaza Merengue | [/plaza-merengue/](https://jonasjavier.github.io/propuestas/plaza-merengue/) | [plazamerengue.netlify.app](https://plazamerengue.netlify.app) | `Plaza-merengue` |
| Puerta del Sol | [/puerta-del-sol/](https://jonasjavier.github.io/propuestas/puerta-del-sol/) | [puertadelsolrd.netlify.app](https://puertadelsolrd.netlify.app) | `puerta-del-sol` |
| The Deck | [/the-deck/](https://jonasjavier.github.io/propuestas/the-deck/) | [thedecksantiago.netlify.app](https://thedecksantiago.netlify.app) | `restaurante-the-deck` |
| El Tablón Latino | [/el-tablon-latino/](https://jonasjavier.github.io/propuestas/el-tablon-latino/) | [eltablonlatino.netlify.app](https://eltablonlatino.netlify.app) | `el-tablon-latino` |
| Kukka Beach | [/kukka-beach/](https://jonasjavier.github.io/propuestas/kukka-beach/) | [jonasjavier.github.io/kukka-beach](https://jonasjavier.github.io/kukka-beach/) | `kukka-beach-restaurant` |
| Sabor Criollo | [/sabor-criollo/](https://jonasjavier.github.io/propuestas/sabor-criollo/) | — | carpeta local `GitHub/sabor-criollo` |
| La Casita de Mary | [/la-casita-de-mary/](https://jonasjavier.github.io/propuestas/la-casita-de-mary/) | sin créditos en Netlify | `la-casita-de-mary` |

## Cómo actualizar

Cada sitio se sigue editando en su propio proyecto. Después de cambiar uno:

```bash
python tools/sync.py paladart     # copia la versión compilada y ajusta las rutas
python tools/check_links.py       # comprueba que no haya enlaces rotos
git add -A && git commit -m "Actualiza paladart" && git push
```

`sync.py` sin argumentos sincroniza todos. Para agregar un sitio nuevo, añádelo al diccionario `SITES` de `tools/sync.py` y al portal `index.html`.

Este repo solo contiene los sitios ya publicados. El seguimiento de contactos está en el repo privado `propuestas-seguimiento`.
