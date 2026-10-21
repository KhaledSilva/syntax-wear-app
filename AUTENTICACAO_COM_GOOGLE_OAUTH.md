# Passo a Passo: Autenticação com Google O'Auth

## Introdução

Nesse tutorial, vamos desenvolver a funcionalidade de autenticação com o **Google O'Auth 2.0**. A autenticação com o Google tem três partes principais:

1. **Configurar no Google**
2. **Fluxo no Frontend**
3. **Validação + criação do token no Backend**

---

## Passo 1: Configurar no Google

1. Acesse o [Google Cloud Console](https://console.cloud.google.com/).
2. Crie um novo projeto.
3. Após criar o projeto, vá até "Credenciais" e clique em "Configurar tela de consentimento".
4. Configure o nome do aplicativo e o e-mail de suporte.
5. Defina a opção de acesso como "Público".
6. Crie as credenciais do tipo **ID do cliente OAuth** para um "Aplicativo da Web".
7. Defina o nome do projeto, como `Syntax Wear`.
8. Adicione as URLs de origem autorizadas (`http://localhost:5173/` para desenvolvimento) e os URIs de redirecionamento autorizados.
9. Copie o **ID do cliente** gerado para usar no código mais tarde.

---

## Passo 2: Fluxo no Frontend

1. Instale a biblioteca **react-oauth/google**.
2. Envolva sua aplicação com o `GoogleOAuthProvider` passando o **clientId**.
3. Crie o botão de login utilizando o componente `GoogleLogin` da biblioteca.
4. Ao sucesso, capture o `credential` (token) do Google.

---

## Passo 3: Fluxo no Backend

1. Instale a biblioteca **google-auth-library**.
    npm install @react-oauth/google@latest
2. No backend, crie um serviço que use o `OAuth2Client` para validar o `idToken` do Google.
3. Extraia o payload do `idToken`, verificando as informações do usuário (como email).
4. Caso o usuário não esteja cadastrado, crie um novo registro no banco de dados.
5. Retorne um `token JWT` gerado pelo backend para o usuário, garantindo a segurança e a autorização na aplicação.

---

## Passo 4: Integração entre Frontend e Backend

1. No frontend, crie uma função que envie o `token` do Google para o backend usando uma requisição POST.
2. No backend, valide o `token` e retorne o `token JWT` gerado.
3. Salve o `token JWT` no navegador (por exemplo, em um cookie).

---

## Conclusão

Você aprendeu a implementar a autenticação com o **Google O'Auth 2.0**, facilitando o login dos usuários na sua aplicação, sem a necessidade de cadastro manual. Essa técnica é amplamente utilizada em diversos serviços pela praticidade que oferece.

---

## Links Úteis

- [Google Cloud Console](https://console.cloud.google.com/)
- [react-oauth/google no NPM](https://www.npmjs.com/package/@react-oauth/google)
