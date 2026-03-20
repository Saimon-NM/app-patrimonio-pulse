## `features/accounts`

Este módulo es el nuevo “home” lógico para **Cuentas y flujo** (providers + accounts).

Por ahora, expone una capa de compatibilidad re-exportando implementaciones desde `features/providers/*`.
El objetivo es migrar gradualmente (sin romper imports) y eventualmente mover el código fuente.

