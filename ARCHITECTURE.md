# Arquitetura – CineDash

Este documento descreve as decisões técnicas do projeto e como os requisitos foram atendidos.

---

## Projeto escolhido

**CineDash** – Dashboard de curadoria de filmes com TMDB: listagem com filtros, lista “Minha Lista” persistida, detalhes do filme com trailer, autenticação simulada e tema claro/escuro.

---

## Stack técnico

| Camada        | Tecnologia                     | Motivo                                                            |
| ------------- | ------------------------------ | ----------------------------------------------------------------- |
| Build         | Vite                           | Requisito do desafio; dev rápido e bom suporte a ESM e React.     |
| UI            | React 19                       | Requisito; hooks e ecossistema estáveis.                          |
| Linguagem     | TypeScript (strict)            | Requisito; tipagem e manutenção.                                  |
| Roteamento    | TanStack Router                | Requisito; rotas tipadas, `beforeLoad` para proteção, file-based. |
| Server state  | TanStack Query                 | Requisito; cache, invalidação, `useInfiniteQuery` para paginação. |
| Client state  | Zustand                        | Requisito; leve, middleware `persist` para localStorage.          |
| UI components | Shadcn/ui + Tailwind           | Requisito; acessibilidade e consistência visual.                  |
| Formulários   | React Hook Form + Zod          | Requisito; validação no cliente e DX boa.                         |
| Testes        | Vitest + React Testing Library | Requisito; unitários e componentes.                               |
| Toasts        | Sonner (Shadcn)                | Feedback de ações (adicionar/remover da lista, erros).            |

---

## Estrutura de pastas

Organização por **papel técnico** (não FSD completo), clean code para responsabilidades únicas priorizando clareza e crescimento controlado:

```
src/
├── api/           # Cliente TMDB e funções de rede
├── components/    # Componentes reutilizáveis + ui/ (Shadcn)
├── contexts/      # Auth (provider + hook)
├── hooks/         # useDebouncedValue, etc.
├── lib/           # Utilitários (auth-storage, utils)
├── providers/     # QueryClient e outros providers
├── routes/        # Páginas (TanStack Router file-based)
├── stores/        # Zustand (theme, watchlist, dashboard)
├── test/          # Setup e helpers de teste
└── utils/         # Constantes (filtros, anos, ratings)
```

---

## Decisões por área

### Autenticação

- **Simulada no front:** sem backend, token fictício gerado com `createFakeToken` (payload base64 com expiração de 7 dias).
- **Persistência:** `localStorage` (`auth-storage.ts`), chave `cinedash_auth_token`. Sessão sobrevive ao reload.
- **Rotas protegidas:** `beforeLoad` no router chama `requireAuth()`; se não houver token, redireciona para `/`.
- **Zod:** schemas para login, e-mail + senha > 6 caracteres e registro, confirmação de senha.

### Dashboard (Home)

- **Listagem:** `useInfiniteQuery` com `discoverMovies`, queryKey `['movies', 'discover', debouncedFilters]` para cache por filtro.
- **Debounce:** filtros (gênero, ano, nota) passam por `useDebouncedValue(400ms)` para não disparar muitas requisições.
- **Infinite scroll:** `IntersectionObserver` em um sentinel no fim da lista chama `fetchNextPage()`.
- **Persistência (Zustand):** store `use-dashboard-store` com `persist`: filtros e `scrollY` em `localStorage` (`cinedash-dashboard`). Ao recarregar, filtros e posição de scroll são restaurados (scroll limitado ao conteúdo já carregado).

### Minha Lista (Watchlist)

- **Store:** `use-watchlist-store` com `persist` (`cinedash-watchlist`). Itens são `{ id, title, release_date, vote_average, genre_ids }` para não guardar dados pesados.
- **Adicionar/remover:** a partir do card ou da página de detalhes; `addFromMovie` / `addFromDetails` e `remove`.
- **Tabela:** HTML semântico com ordenação por Título, Gênero e Rating. TanStack Table seria o próximo passo para listagens mais complexas.
- **Gêneros na lista:** `useQuery(['movie-genres'])` compartilhado com o painel de filtros; mapeamento por `genre_ids` para exibir nomes.

### Detalhes do filme

- **Rota:** `/movie/:id` (TanStack Router `movie.$id`).
- **Dados:** `useQuery(['movie', movieId])` com `fetchMovieDetails` (filme + credits + videos).
- **Trailer:** primeiro vídeo tipo “Trailer” no YouTube; fallback para qualquer YouTube. Iframe com URL de embed.
- **Elenco:** primeiros 15 com nome e personagem.

### Tema (dark/light)

- **Store:** `use-theme-store` com `persist` (`cinedash-theme`). Valores `'light' | 'dark'`.
- **Aplicação:** componente `ThemeSync` no root lê o tema e aplica a classe `dark` em `document.documentElement`; Tailwind e Shadcn usam variáveis CSS para cores.
- **Sonner:** Toaster usa o mesmo store para `theme` (não `next-themes`), mantendo uma única fonte de verdade.

### Toasts

- **Sonner (Shadcn):** componente em `src/components/ui/sonner.tsx`, `<Toaster />` no `__root.tsx`.
- **Uso:** sucesso ao adicionar/remover da lista (card, detalhes, watchlist); erro ao falhar a API de filmes na home.
- **Tema:** integrado ao `useThemeStore` para consistência com o app.

### Testes

- **Vitest + RTL:** configuração em `vite.config.ts`, setup com `@testing-library/jest-dom/vitest`.
- **Cobertura:** login e registro (validação Zod, submit, navegação); theme store e ThemeToggle; `useDebouncedValue` (fake timers); watchlist store (add/remove/reset); Home (mock da API e do debounce); WatchlistPage (empty state, tabela, ordenação, remover); MovieDetailPage (loading, erro, conteúdo, botão lista); MovieCard (add/remove).
- **Mocks:** TanStack Router (Link, useNavigate, useParams), API TMDB, auth e store de dashboard com `reset()` no `beforeEach` para isolar testes.
- **QueryClient:** helper `QueryWrapper` em `test/test-utils.tsx` para páginas que usam TanStack Query.

---

## O que não foi usado (e por quê)

- **TanStack Table:** a lista da watchlist é uma tabela simples com ordenação em estado local; atende o requisito. TanStack Table seria escolhido para ordenação multi-coluna, paginação no cliente ou colunas redimensionáveis.
- **TanStack Form:** React Hook Form + Zod já cobrem formulários e validação do desafio; TanStack Form seria uma alternativa equivalente.
- **Busca por texto:** o desafio pedia debounce no input; foi implementado nos **filtros** (gênero, ano, nota).
- **Cookies para auth:** token em `localStorage` atende “persistir no localStorage ou cookie” e simplifica o fluxo sem backend.

---

## Resumo

A arquitetura segue o solicitado: React 19, TypeScript strict, Vite, TanStack Query e Router, Zustand com persist (tema, watchlist, dashboard), Shadcn/ui + Tailwind, RHF + Zod, Vitest + RTL e toasts com Sonner. A estrutura por pastas (api, components, routes, stores, hooks) mantém responsabilidades separadas e o código testável, sem adotar FSD completo no escopo atual.
