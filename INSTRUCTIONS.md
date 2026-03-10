# Instruções – CineDash

## Projeto escolhido

**CineDash** – Dashboard de curadoria e descoberta de filmes usando a API do TMDB, pensado como ferramenta interna para curadores selecionarem filmes para catálogo de streaming.

---

## Pré-requisitos

- **Node.js** 18+ (recomendado 20+)
- **npm** ou **yarn**

---

## Como rodar o projeto

### 1. Clonar e instalar dependências

```bash
git clone <url-do-repositorio>
cd CineDash
npm install
```

### 2. Configurar variáveis de ambiente

A aplicação usa a API do [The Movie Database (TMDB)](https://www.themoviedb.org/). É obrigatório ter uma chave de API.

1. Crie uma conta em [TMDB](https://www.themoviedb.org/signup) e obtenha uma API key em [Developer](https://developer.themoviedb.org/docs/getting-started).
2. Na raiz do projeto, crie um arquivo `.env` (pode copiar de `.env.example`):

```bash
cp .env.example .env
```

3. Edite `.env` e preencha sua chave:

```
VITE_TMDB_API_KEY=sua_chave_aqui
```

### 3. Subir o servidor de desenvolvimento

```bash
npm run dev
```

Acesse no navegador o endereço exibido no terminal (geralmente `http://localhost:5173`).

### 4. Fluxo na aplicação

- **Login/Registro**: use qualquer e-mail válido e senha com mais de 6 caracteres (autenticação é simulada no front-end).
- Após o login você pode explorar filmes, aplicar filtros, adicionar/remover da lista e ver detalhes e trailer.

---

## Outros comandos

| Comando           | Descrição                          |
|------------------|------------------------------------|
| `npm run build`   | Build de produção (`dist/`)        |
| `npm run preview`| Preview do build de produção        |
| `npm run lint`    | Executar o ESLint                   |
| `npm run test`    | Rodar testes (Vitest) em watch      |
| `npm run test:run`| Rodar testes uma vez                |

---

## Creditação TMDB

Este produto utiliza a API do TMDB mas não é endossado ou certificado pelo TMDB.  
Site: [https://www.themoviedb.org/](https://www.themoviedb.org/).
