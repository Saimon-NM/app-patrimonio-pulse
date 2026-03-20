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

### URL base en GitHub Pages (project pages)

Para repositorios con URL del tipo `https://<usuario>.github.io/<repositorio>/`, el workflow define por defecto:

`VITE_BASE_URL=/<nombre-del-repo>/`

Si necesitas otro valor, crea una **variable de repositorio** llamada `VITE_BASE_URL` en **Settings → Secrets and variables → Actions → Variables**.

## Variables de entorno (Vite)

Cualquier variable expuesta al cliente debe usar el prefijo `VITE_`. Crea un `.env.local` (no se versiona; ver `.gitignore`) si lo necesitas en desarrollo.

## Licencia

Proyecto privado (`"private": true` en `package.json`).
