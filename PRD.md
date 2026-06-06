# PRD — Recetario Digital Personal
**Versión 1.2 · Junio 2026**

---

## 1. Problema

Tienes ~60–100 recetas de un curso de cocina distribuidas en un recetario impreso. Consultar recetas mientras cocinas es lento e incómodo. Compartir el material con compañeros de clase requiere prestar el físico. Tus anotaciones personales no tienen un lugar estructurado y podrían perderse.

---

## 2. Objetivo

Una web app mobile-first que permita **consultar, buscar y anotar recetas digitalizadas**, con acceso de solo lectura para compañeros y notas privadas exclusivas para el autor.

---

## 3. Usuarios

| Rol | Descripción | Permisos |
|---|---|---|
| **Autor** | Propietario del recetario | Lectura completa + escritura/edición de notas privadas |
| **Lector** (compañeros) | Acceso por link directo | Solo lectura, sin notas |

- Lectores: sin registro, sin token — la app es pública por defecto.
- Autor: accede vía `/login` (URL oculta, sin links en la UI).

---

## 4. Estructura de datos

```
Módulo
  └── Día (1, 2, 3...)
        └── Receta
              ├── nombre
              ├── ingredientes[]
              │     ├── cantidad
              │     ├── unidad
              │     └── descripción
              ├── pasos[] (ordenados)
              ├── tags[] (ej: "mariscos", "chocolate", "francés")
              └── notas_autor* (privadas, markdown)

* Solo visibles con sesión de autor activa.
```

### Almacenamiento híbrido

- **Recetas** en archivos `.md` con frontmatter YAML — portables, legibles, versionables con git.
- **Notas privadas** en Supabase — sincronizadas entre dispositivos, protegidas por RLS.

#### Ejemplo de archivo `.md`

```markdown
---
modulo: "Repostería"
modulo_slug: "07-reposteria"
dia: 2
dia_tema: "Merengues y Macarrones"
orden: 1
tags: [frambuesa, merengue, francés]
porciones: 4
imagen_portada: "/images/platillos/macarrones-frambuesa.jpg"  # opcional
---

# Macarrones de Frambuesa

## Ingredientes

| Cantidad | Unidad | Ingrediente     |
|----------|--------|-----------------|
| 150      | g      | Almendra molida |
| 150      | g      | Azúcar glass    |

## Pasos

1. Tamizar almendra y azúcar glass juntos.
2. ...
```

---

## 5. Funcionalidades

### P0 — Must have
- Navegar por módulo → día → receta
- Ver receta completa (ingredientes + pasos con igual prominencia)
- Búsqueda global por nombre de receta o ingrediente
- Filtrar por módulo
- Notas privadas por receta (solo visibles con sesión de autor)
- Vista mobile-first: texto grande, una mano libre, pantalla activa
- `/login` oculto para acceso de autor

### P1 — Should have
- Escalado de porciones (multiplicar ingredientes)
- Modo "paso a paso" para cocinar (un paso a la vez, pantalla completa)

### Fuera de alcance (v1)
- Digitalización de fotos desde la app (proceso externo con Claude Vision)
- Búsqueda por ingredientes disponibles en casa
- Export a PDF
- Comentarios de compañeros
- Versión nativa iOS/Android

---

## 6. Stack

| Capa | Elección | Razón |
|---|---|---|
| **Frontend** | React + Vite | Mobile-first, rápido, componentes reutilizables |
| **Recetas** | Archivos `.md` + frontmatter YAML | Portables, sin DB, editables en cualquier editor |
| **Notas privadas** | Supabase (Postgres + RLS) | Sincronización multi-dispositivo, seguridad a nivel DB |
| **Auth** | Supabase Auth (email + password) | Un solo usuario, setup manual en dashboard |
| **Hosting** | Vercel o Netlify | Deploy automático desde GitHub, tier gratuito suficiente |

---

## 7. Arquitectura de acceso

```
App pública (sin sesión)
  → Lectores y autor sin login
  → Ve módulos, días, recetas completas
  → Las notas NO aparecen (ni en UI ni en payload)

/login (URL oculta, sin links en la app)
  → Formulario email + password
  → Supabase Auth valida
  → Sesión guardada en localStorage
  → App ahora muestra notas y habilita edición
```

### Tabla en Supabase

```sql
CREATE TABLE notes (
  recipe_id   TEXT PRIMARY KEY,  -- e.g. "reposteria-dia2-macarrones"
  content     TEXT,              -- free markdown
  updated_at  TIMESTAMPTZ DEFAULT now()
);
```

### Row Level Security

```sql
-- Only the authenticated author can read and write
CREATE POLICY "notes_author_only"
ON notes
USING (auth.uid() = 'AUTHOR_UID');
```

Las queries de lectores regresan vacías a nivel de base de datos — no es ocultamiento en UI, es ausencia de datos en el payload.

---

## 8. Diseño y UX

### Principios
- **Mobile-first y una mano libre** — la app se usa mientras se cocina; texto grande, touch targets generosos, sin gestos complejos.
- **Contenido sobre chrome** — las pantallas de detalle (módulo, receta) son pantalla completa sin navegación persistente que distraiga.
- **Búsqueda como tarea, no estado permanente** — el usuario entra, busca, llega a su receta. No necesita el buscador visible en todo momento.

### Sistema de diseño

**Tipografía**
| Rol | Fuente | Uso |
|---|---|---|
| Display | Playfair Display (700) | Títulos de módulo, nombre de receta, números de paso |
| UI | DM Sans (400/500/600) | Todo lo demás — metadata, ingredientes, labels |

**Paleta**
| Token | Color | Uso |
|---|---|---|
| `--bg` | `#FAFAF8` | Fondo general (off-white cálido) |
| `--surface` | `#FFFFFF` | Cards, modales |
| `--border` | `#EBEBEA` | Separadores, bordes |
| `--text-primary` | `#1A1A18` | Títulos y texto principal |
| `--text-secondary` | `#6B6B67` | Metadata, subtítulos, labels |
| `--accent` | `#C8401A` | CTA, tab activo, número de paso, badges |
| `--accent-light` | `#FDF0EC` | Fondo de badges y hover states |

**Módulos — colores de fondo**
Cada módulo tiene un color de fondo único (tonos terrosos suaves) que se usa en la card del home y en el hero de la pantalla de módulo y receta. Sin fotos, el color es el elemento visual identificador.

### Navegación — 4 pantallas

**1. Home**
- Bottom tab bar visible (Inicio · Buscar)
- Header: título "Mi Recetario" + search bar decorativa (tap → abre Search)
- Grid 2 columnas de módulos como cards con color, número grande de fondo, nombre, chips de días y recetas
- Primer módulo ocupa ancho completo (card featured)

**2. Search** *(tab dedicado)*
- Bottom tab bar visible
- Input funcional con autofocus
- Estado vacío: lista de todos los módulos con su color
- Con query: resultados en tiempo real agrupados por módulo
- Búsqueda global — no filtra por módulo actual
- Estado sin resultados: mensaje amigable

**3. Módulo** *(pantalla full screen)*
- Sin bottom tab bar — pantalla de consumo
- Hero con color del módulo, número grande de fondo, back button
- Pills horizontales de días (Día 1 · Día 2 · Día 3…) scrollables
- Lista de recetas como cards: badge con número (1.3), nombre en Playfair, tiempo si existe

**4. Receta** *(pantalla full screen)*
- Sin bottom tab bar — pantalla de consumo puro
- Hero con color del módulo, badge de número, módulo y día, nombre grande, tags
- Tabs: **Ingredientes | Pasos** — igual de prominentes
  - Ingredientes: tabla con columnas cantidad / unidad / ingrediente, agrupadas por sección si aplica
  - Pasos: cards numeradas, número en Playfair accent, texto cuerpo grande
- Botón de notas: ícono flotante, visible solo con sesión de autor activa

### Comportamiento del search

| Dónde | Qué hace |
|---|---|
| Home — search bar | Decorativa. Tap lleva al tab Search |
| Search — input | Funcional. Busca en todas las recetas de todos los módulos |
| Módulo — sin search | No hay buscador. El usuario ya eligió su contexto |
| Receta — sin search | No hay buscador. Pantalla de consumo puro |

La búsqueda es **siempre global** — con ~75–100 recetas, la búsqueda local por módulo añade complejidad sin beneficio real.

---

## 9. Flujo de digitalización (proceso externo)

La digitalización de recetas ocurre **fuera de la app**, como un proceso separado:

```
Foto del recetario
      ↓
Claude Vision (subir imagen, extraer texto)
      ↓
Markdown estructurado con frontmatter
      ↓
Revisión manual (~5 min por receta)
      ↓
Archivo .md guardado en repositorio
      ↓
App lo consume automáticamente en el siguiente deploy
```

Estimado con ~75 recetas: **3–5 horas** incluyendo revisión.

---

## 10. Criterios de éxito

- Encontrar cualquier receta en menos de 10 segundos desde el home
- La app es usable con una mano, con la otra ocupada en la cocina
- Un compañero puede acceder al link y navegar sin instrucciones previas
- Las notas del autor son invisibles en la sesión de lector (a nivel de red, no solo de UI)
- La sesión de autor persiste entre visitas (no hay que re-loguearse cada vez)

---

## 11. Consideraciones de seguridad

- `/login` no está linkeado en ningún lugar de la UI — acceso solo por URL directa
- La contraseña del autor vive en Supabase Auth (bcrypt), nunca en el código
- RLS en Supabase garantiza que notas no se filtren en ningún escenario
- El patrón es "security through obscurity" combinado con auth real — adecuado para el caso de uso
