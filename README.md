# Patrimonio Pulse

Aplicación web para visualizar y simular el estado de tu patrimonio: cuentas, proveedores, escenarios, proyecciones, gráficos e importación desde Excel.

## Stack

- **React 18** + **TypeScript**
- **Vite** (build)
- **Tailwind CSS**
- **Recharts** (gráficos)
- **SheetJS (xlsx)** (importación Excel)
- **Vitest** + **Testing Library** (tests)

## Requisitos

- **Node.js 20** (alineado con GitHub Actions)
- **npm** (el repo incluye `package-lock.json`)

## Comandos

| Comando         | Descripción                          |
| --------------- | ------------------------------------ |
| `npm ci`        | Instala dependencias (reproducible)  |
| `npm run dev`   | Servidor de desarrollo (Vite)        |
| `npm run build` | `tsc` + build de producción → `dist` |
| `npm run preview` | Sirve la carpeta `dist` localmente |
| `npm test`      | Tests con Vitest (modo watch)        |
| `npm test -- --run` | Tests en una sola pasada (CI)    |

## Estructura del código

El código vive en `src/`, organizado por **features** (`accounts`, `portfolio`, `charts`, etc.) y utilidades compartidas en `shared/`. Los alias de import usan `@/` → `src/` (ver `tsconfig.json` y `vite.config.ts`).

## Despliegue con GitHub Actions

Hay dos workflows en `.github/workflows/`:

1. **`ci.yml`** — En cada **push** o **pull request** a `main`: instala dependencias, ejecuta tests y build.
2. **`pages.yml`** — En **push** a `main` (o manualmente con *workflow_dispatch*): construye la app, sube `dist` y despliega a **GitHub Pages** con `actions/deploy-pages`.

### Pasos en GitHub

1. **Settings → Pages** → origen **GitHub Actions** (no “Deploy from a branch”).
2. Haz **push** de los cambios a la rama **`main`**.
3. Revisa la pestaña **Actions** para ver CI y el despliegue.

### Si en Actions aparece `jekyll-build-pages` o errores al convertir `.md` en `docs/`

Eso indica que Pages está usando **“Deploy from a branch”** con la carpeta **`/docs`** (Jekyll procesa los Markdown). Esta app se publica como **SPA estática** desde el workflow **`pages.yml`** (carpeta `dist`), no desde Jekyll.

**Qué hacer:** en **Settings → Pages**, cambia el origen a **GitHub Actions** y desactiva el despliegue desde rama/`/docs`. En el repo hay `docs/_config.yml` que excluye los `.md` de Jekyll por si alguna vez vuelves a usar `/docs` como origen; igualmente lo recomendable para esta app es **solo GitHub Actions**.

Los archivos en `docs/` deben guardarse en **UTF-8** (sin mezclar bytes Latin-1 como `0xF1` para la ñ); si no, Jekyll falla con *invalid byte sequence in UTF-8*.

### Pantalla en blanco y consola: `main.tsx` 404 / `Unexpected token 'export'`

Eso significa que el navegador está cargando el **`index.html` de desarrollo** (el que apunta a `src/main.tsx`), **no** el `index.html` que genera Vite dentro de **`dist/`** (que usa `/assets/index-....js`).

En **Settings → Pages**, si el origen es **GitHub Actions** pero sigue el texto *“Workflow details will appear here once your site has been deployed”*, normalmente **aún no se ha publicado ningún sitio con el workflow correcto** (o sigue activo un despliegue viejo). Comprueba esto en el repo **`saimon-nm/app-patrimonio-pulse`** (o el tuyo):

1. **En GitHub (web):** abre `.github/workflows/pages.yml` en la rama **`main`** y confirma que existe y está actualizado (no solo en tu PC).
2. **Actions:** debe haber una ejecución exitosa del workflow **“Deploy GitHub Pages”** con pasos **Upload Pages artifact** y **Deploy to GitHub Pages**. Si está en amarillo **“Waiting for approval”**, entra en la run y aprueba el despliegue (**Settings → Environments → `github-pages`** puede tener revisores obligatorios).
3. **No uses** los templates **“Static HTML”** ni **“Jekyll”** si suben la **raíz del repo** (`path: .`): eso publica el `index.html` con `main.tsx` y rompe la app. Si creaste esos workflows, **bórralos** o desactiva su `on:`.
4. Tras un deploy bueno, en **Settings → Pages** debería enlazarse el workflow que publica; la consola del sitio debe pedir **`/<repo>/assets/index-....js`**, no **`main.tsx`**.

Prueba también **Ctrl+F5** (caché).

### URL base en GitHub Pages (project pages)

Para repositorios con URL del tipo `https://<usuario>.github.io/<repositorio>/`, el workflow define por defecto:

`VITE_BASE_URL=/<nombre-del-repo>/`

Si necesitas otro valor, crea una **variable de repositorio** llamada `VITE_BASE_URL` en **Settings → Secrets and variables → Actions → Variables**.

## Variables de entorno (Vite)

Cualquier variable expuesta al cliente debe usar el prefijo `VITE_`. Crea un `.env.local` (no se versiona; ver `.gitignore`) si lo necesitas en desarrollo.

## Licencia

Proyecto privado (`"private": true` en `package.json`).
