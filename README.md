# SyntaxWear

SyntaxWear é uma aplicação web de e-commerce de calçados. O projeto oferece navegação por catálogo e categorias, páginas de produto, carrinho de compras e telas de autenticação, além de páginas institucionais.

## Funcionalidades

- Página inicial com banner, categorias e galeria de imagens.
- Catálogo de produtos com paginação e listagem por categoria.
- Página de detalhes do produto com preço, descrição, cálculo de prazo/custo estimado de entrega pelo CEP e opção de adicionar ao carrinho.
- Carrinho lateral com ajuste de quantidade, remoção de itens e persistência no `localStorage`.
- Cadastro e login com e-mail e senha, além de autenticação com Google.
- Encerramento de sessão para usuários autenticados.
- Páginas institucionais “Sobre” e “Nossas lojas”.
- Layout responsivo para diferentes tamanhos de tela.

> A interface do carrinho inclui o botão “Fechar pedido”, mas a finalização do checkout ainda não está implementada.

## Tecnologias

- React 19 e TypeScript
- Vite
- Tailwind CSS
- TanStack Router
- React Hook Form e Zod
- React Icons
- Google OAuth

## Requisitos

- Node.js e npm
- API de backend disponível em `http://localhost:3000` para autenticação, perfil, produtos e categorias
- Credencial de cliente do Google OAuth para habilitar o login com Google

O endereço da API está definido no código. Para autenticação com Google, crie um arquivo `.env` na raiz do projeto e defina:

```env
VITE_GOOGLE_CLIENT_ID=seu_client_id
```

## Como executar

Instale as dependências:

```bash
npm install
```

Inicie o servidor de desenvolvimento:

```bash
npm run dev
```

O Vite exibirá no terminal o endereço local da aplicação.

## Scripts

```bash
npm run dev      # inicia o servidor de desenvolvimento
npm run build    # verifica os tipos TypeScript e gera a build de produção
npm run preview  # serve localmente a build de produção
npm run lint     # executa o Oxlint
```

## Rotas principais

| Rota | Página |
| --- | --- |
| `/` | Página inicial |
| `/products` | Catálogo |
| `/products/category/$category` | Produtos de uma categoria |
| `/products/$productId` | Detalhes de um produto |
| `/sign-in` | Login |
| `/sign-up` | Cadastro |
| `/about` | Sobre a SyntaxWear |
| `/our-stores` | Nossas lojas |

## Organização do projeto

- `src/components`: componentes reutilizáveis da interface
- `src/contexts`: estado global de autenticação e carrinho
- `src/interfaces`: tipos compartilhados
- `src/mocks`: conteúdo local usado em partes da interface
- `src/pages`: páginas e rotas
- `src/services`: comunicação com a API
- `src/styles`: estilos globais
- `src/utils`: funções auxiliares
