# 🌅 Aurora OS

Sistema pessoal de organização de vida — baseado no seu template de Notion. Cada pessoa que usar o site cria sua própria conta e vê apenas os próprios dados (objetivos, hábitos, finanças, saúde, etc).

**Stack:** Next.js (frontend) + Supabase (banco de dados + login) + Vercel (hospedagem).

---

## Antes de começar

Você vai precisar (todos gratuitos para começar):
- Uma conta no [Supabase](https://supabase.com)
- Uma conta no [GitHub](https://github.com)
- Uma conta na [Vercel](https://vercel.com)
- [Node.js](https://nodejs.org) instalado no seu computador (versão 18 ou superior) — só se você quiser rodar o projeto no seu computador antes de publicar

---

## Passo 1 — Criar o banco de dados no Supabase

1. Entre em [supabase.com](https://supabase.com) e crie uma conta (pode ser com GitHub).
2. Clique em **"New Project"**.
3. Dê um nome (ex: `aurora-os`), crie uma senha para o banco (guarde ela, mas não vai precisar usar diretamente) e escolha uma região perto de você (ex: São Paulo).
4. Aguarde uns 2 minutos enquanto o projeto é criado.
5. No menu lateral, clique em **"SQL Editor"**.
6. Clique em **"New query"**.
7. Abra o arquivo `supabase/schema.sql` (está dentro da pasta do projeto que te entreguei), copie **todo o conteúdo** e cole no editor SQL do Supabase.
8. Clique em **"Run"** (ou Ctrl/Cmd + Enter). Isso cria todas as tabelas, a segurança por usuário, e a automação que prepara a conta de cada pessoa nova.
9. Se aparecer "Success. No rows returned", deu certo. ✅

### Pegar as chaves de conexão
1. No menu lateral, vá em **"Project Settings" → "API"**.
2. Copie dois valores:
   - **Project URL** (algo como `https://xxxxx.supabase.co`)
   - **anon public key** (uma chave longa)
3. Guarde os dois — você vai usar no Passo 3.

### (Opcional, recomendado) Desativar confirmação de e-mail para testar mais rápido
Por padrão o Supabase exige confirmar o e-mail antes de logar. Para testar rapidamente:
- Vá em **Authentication → Providers → Email** e desmarque **"Confirm email"**.
- Você pode reativar isso depois, quando for lançar de verdade.

---

## Passo 2 — Colocar o projeto no GitHub

1. Crie uma conta no [GitHub](https://github.com) se ainda não tiver.
2. Crie um repositório novo (botão verde **"New"**), pode ser privado ou público, nome sugerido: `aurora-os`.
3. No seu computador, dentro da pasta do projeto (`aurora-os`), rode no terminal:
   ```bash
   git init
   git add .
   git commit -m "Aurora OS - versão inicial"
   git branch -M main
   git remote add origin https://github.com/SEU-USUARIO/aurora-os.git
   git push -u origin main
   ```
   (Troque `SEU-USUARIO` pelo seu nome de usuário do GitHub. O GitHub mostra esse comando exato na tela do repositório recém-criado, em "…or push an existing repository from the command line".)

---

## Passo 3 — Publicar na Vercel

1. Entre em [vercel.com](https://vercel.com) e crie uma conta (recomendo entrar com sua conta do GitHub, fica tudo conectado automaticamente).
2. Clique em **"Add New" → "Project"**.
3. Selecione o repositório `aurora-os` que você acabou de subir no GitHub.
4. Antes de clicar em "Deploy", abra a seção **"Environment Variables"** e adicione duas:
   | Nome | Valor |
   |---|---|
   | `NEXT_PUBLIC_SUPABASE_URL` | a Project URL que você copiou do Supabase |
   | `NEXT_PUBLIC_SUPABASE_ANON_KEY` | a anon public key que você copiou do Supabase |
5. Clique em **"Deploy"**.
6. Em cerca de 1-2 minutos, a Vercel te dá um link, tipo `https://aurora-os-seu-usuario.vercel.app` — esse é o site no ar! 🎉

Qualquer pessoa que acessar esse link pode criar a própria conta e usar o Aurora OS, com os dados de cada um separados e privados.

---

## Rodar no seu computador (opcional, antes de publicar)

Se quiser testar localmente antes de publicar:

```bash
npm install
cp .env.local.example .env.local
# edite o .env.local e cole a URL e a chave do Supabase
npm run dev
```

Depois abra [http://localhost:3000](http://localhost:3000) no navegador.

---

## Estrutura do projeto

- `app/(auth)` — telas de login e criação de conta
- `app/(app)` — todas as seções do Aurora OS (Dashboard, Objetivos, Projetos, Tarefas, Planejamento, Saúde, Finanças, Vida, Cultura, Experiências, Caixa de Entrada)
- `components/` — componentes reutilizáveis (navegação, checklist, tabela de hábitos, etc.)
- `lib/` — conexão com Supabase, tipos e funções auxiliares
- `supabase/schema.sql` — todo o banco de dados e as regras de segurança

## Fazer alterações depois de publicado

Sempre que quiser mudar alguma coisa no código: edite os arquivos, rode `git add . && git commit -m "mensagem" && git push`, e a Vercel republica o site automaticamente em cerca de 1 minuto.

## Problemas comuns

- **"Erro ao carregar" ou tela em branco:** confira se as duas variáveis de ambiente na Vercel estão exatamente certas (sem espaços extras).
- **Não consigo logar após criar conta:** verifique se a confirmação de e-mail está ativada no Supabase — se estiver, confirme o e-mail recebido antes de tentar entrar.
- **Erro ao rodar o schema.sql:** confira se você copiou o arquivo inteiro, do início ao fim.
