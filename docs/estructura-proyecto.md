# Estructura del proyecto

## Arbol base
```text
src/
├── App.tsx
├── main.tsx
├── style.css
├── features/
│   ├── accounts/      # edicion de cuentas/proveedores/checklists
│   ├── charts/        # CapitalChart, DividendsChart, hooks de series
│   ├── controls/      # simulador y escenarios
│   ├── insights/      # recomendaciones y tips
│   ├── overview/      # resumen global y metricas
│   ├── portfolio/     # import/export, historial, persistencia
│   ├── projections/   # modelos y proyeccion de capital
│   ├── providers/     # componentes legacy testeados
│   └── settings/      # tema, monedas, metas
└── shared/
    ├── components/
    ├── styles/
    ├── services/
    └── utils/
```

## Convenciones
- Components: `PascalCase.tsx`
- Hooks: `useX.ts`
- Tests: mismo nombre + `.test.ts/.test.tsx`
- Imports con alias `@/` para rutas internas.

## Guia rapida para nueva feature
1. Crear `src/features/<feature>/`.
2. Separar `components`, `hooks`, `model` o `types` segun necesidad.
3. Mantener logica financiera fuera de UI cuando sea reutilizable.
4. Agregar tests para calculo/sanitizacion si la feature toca dinero.
