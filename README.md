# CineDash

Projeto base com React 18+, TypeScript (strict), Vite, TanStack Query e TanStack Router.

## Stack

- **React 18+** com TypeScript em modo strict
- **Vite** – build e dev server
- **TanStack Query** – estado assíncrono e cache
- **TanStack Router** – roteamento type-safe

## Scripts

```bash
npm run dev     # desenvolvimento
npm run build   # build de produção
npm run preview # preview do build
npm run lint    # ESLint
```

## Estrutura

```
src/
  main.tsx          # entrada da aplicação
  App.tsx           # providers + RouterProvider
  index.css         # estilos globais
  router.tsx        # instância do router e registro de tipos
  routes/
    __root.tsx      # rota raiz
  providers/
    query-client.tsx
    index.ts
```

Rotas adicionais podem ser criadas em `src/routes/` e registradas na árvore de rotas em `src/router.tsx`.
# app-cine-dash
