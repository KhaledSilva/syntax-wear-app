# SyntaxWear

SyntaxWear é uma aplicação web de e-commerce voltada ao universo da moda, com foco em uma experiência visual moderna, responsiva e voltada à navegação de produtos. O projeto simula uma loja online com catálogo, categorias, carrinho de compras e páginas institucionais.

## O que o projeto faz

A aplicação permite:

- explorar a página inicial com destaque para marcas e categorias;
- visualizar produtos por categoria, como masculino, feminino e outlet;
- navegar por páginas de apresentação, como Sobre e Nossas lojas;
- adicionar produtos ao carrinho e gerenciar a quantidade;
- acessar telas de autenticação para login e cadastro.

## Tecnologias utilizadas

- React 19
- TypeScript
- Vite
- Tailwind CSS
- TanStack Router
- React Hook Form + Zod
- React Icons

## Estrutura principal

- src/components: componentes reutilizáveis da interface
- src/pages: páginas e rotas da aplicação
- src/contexts: estado global do carrinho
- src/interfaces: tipagens compartilhadas
- src/mocks: dados simulados para produtos e categorias
- src/styles: estilos globais

## Como rodar localmente

1. Instale as dependências:
   ```bash
   npm install
   ```

2. Inicie o servidor de desenvolvimento:
   ```bash
   npm run dev
   ```

3. Acesse a aplicação no navegador pelo endereço exibido no terminal.

## Build

Para gerar a build de produção:

```bash
npm run build
```

## Observações

O projeto utiliza armazenamento local para manter o carrinho preservado durante a navegação e foi desenvolvido com foco em uma interface limpa e moderna para comércio eletrônico.
