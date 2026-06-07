# Recetas

Guia para agregar y editar recetas en el recetario.

## Estructura de carpetas

Las recetas se organizan en tres niveles, todos con el formato `NN-slug`:

```
src/content/recipes/
  01-bases-culinarias/              # Carpeta de modulo (NN-slug)
    01-terminologia-culinaria/      # Carpeta de dia (NN-slug)
      01-corte-de-vegetales.md      # Archivo de receta (NN-slug.md)
      02-bouquet-garni.md
    02-fondos-y-salsas/
      01-fondo-oscuro.md
  07-reposteria/
    02-merengues-y-macarrones/
      01-macarrones-frambuesa.md
```

- **Carpeta de modulo** (`NN-slug`): El numero define el orden del modulo. Ej: `01-bases-culinarias`, `07-reposteria`.
- **Carpeta de dia** (`NN-slug`): El numero corresponde al dia dentro del modulo. Ej: `01-terminologia-culinaria`.
- **Archivo de receta** (`NN-slug.md`): El numero define el orden de la receta dentro del dia. Ej: `01-corte-de-vegetales.md`.

Estos numeros reemplazan las propiedades `modulo_slug`, `dia` y `orden` que antes se ponian en el frontmatter. Ya no es necesario incluirlas.

## Formato del archivo markdown

Cada receta es un archivo `.md` con dos partes: frontmatter YAML y cuerpo markdown.

### Frontmatter

```yaml
---
modulo: 'Reposteria'
dia_tema: 'Merengues y Macarrones'
tags: [frambuesa, merengue, frances]
porciones: 4
imagen_portada: ruta/a/imagen.jpg
---
```

| Campo | Requerido | Descripcion |
|-------|-----------|-------------|
| `modulo` | Si | Nombre del modulo con formato legible (ej: "Bases Culinarias", "Reposteria") |
| `dia_tema` | Si | Tema del dia con formato legible (ej: "Terminologia Culinaria") |
| `tags` | Si | Lista de etiquetas entre corchetes, separadas por comas |
| `porciones` | Si | Numero de porciones que rinde la receta |
| `imagen_portada` | No | Ruta a una imagen de portada |

### Cuerpo

El cuerpo tiene tres secciones en este orden:

```markdown
# Titulo de la Receta

## Ingredientes

| Cantidad | Unidad | Ingrediente     |
|----------|--------|-----------------|
| 150      | g      | Almendra molida |
| 50       | ml     | Agua            |

## Pasos

1. Primer paso de la preparacion.
2. Segundo paso de la preparacion.
3. Tercer paso.
```

#### Titulo (`# Titulo`)

El titulo de la receta. Debe ser un heading de nivel 1 (`#`).

#### Ingredientes (`## Ingredientes`)

Tabla markdown con tres columnas: **Cantidad**, **Unidad** e **Ingrediente**. La primera fila (header) se ignora automaticamente.

Si la receta tiene ingredientes agrupados (ej: masa y relleno), se pueden usar sub-secciones con `###`:

```markdown
## Ingredientes

### Masa

| Cantidad | Unidad | Ingrediente     |
|----------|--------|-----------------|
| 150      | g      | Almendra molida |

### Relleno

| Cantidad | Unidad | Ingrediente        |
|----------|--------|--------------------|
| 200      | g      | Frambuesas frescas |
```

#### Pasos (`## Pasos`)

Lista numerada con los pasos de preparacion. **El heading debe ser exactamente `## Pasos`** — si se usa otro nombre (como "Preparacion" o "Procedimiento") los pasos no se van a mostrar en la app.

```markdown
## Pasos

1. Tamizar la almendra molida y el azucar glass.
2. Preparar un merengue italiano.
3. Hornear a 150 °C por 14 minutos.
```

## Validacion

Para verificar que todas las recetas cumplan con la estructura esperada:

```bash
yarn validate-recipes
```

El script reporta errores (estructura invalida, frontmatter faltante) y warnings (propiedades deprecadas como `modulo_slug`, `dia` u `orden` que ya se infieren de la estructura de carpetas).

## Ejemplo completo

Archivo: `src/content/recipes/07-reposteria/02-merengues-y-macarrones/01-macarrones-frambuesa.md`

```markdown
---
modulo: 'Reposteria'
dia_tema: 'Merengues y Macarrones'
tags: [frambuesa, merengue, frances]
porciones: 4
---

# Macarrones de Frambuesa

## Ingredientes

| Cantidad | Unidad | Ingrediente     |
|----------|--------|-----------------|
| 150      | g      | Almendra molida |
| 150      | g      | Azucar glass    |
| 55       | g      | Claras de huevo |

### Relleno

| Cantidad | Unidad | Ingrediente        |
|----------|--------|--------------------|
| 200      | g      | Frambuesas frescas |
| 100      | g      | Mantequilla        |

## Pasos

1. Tamizar la almendra molida y el azucar glass juntos dos veces.
2. Preparar un merengue italiano: llevar el azucar y el agua a 118 °C.
3. Hornear a 150 °C por 14 minutos.
```
