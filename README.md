# B3.Pet Analytics Portal

Portal web com camada de login (catraca) para exibir relatórios Power BI via link público (*Publish to Web*).

> ⚠️ **AVISO DE SEGURANÇA**: Este portal **NÃO** protege o conteúdo do Power BI. O link "Publish to Web" é público por design — qualquer pessoa que obtiver a URL consegue acessar o relatório diretamente. O login aqui serve apenas para dificultar o compartilhamento casual (catraca). Se precisar de segurança real, use Power BI Embedded com token de serviço.

---

## Stack

- **Next.js 14** (App Router) + TypeScript
- **TailwindCSS** — tema B3.Pet já configurado
- **Supabase** — Auth (email+senha) + Postgres (RLS)
- Deploy: **Vercel** (zero-config)

---

## Pré-requisitos

- Node.js ≥ 18
- Conta no [Supabase](https://supabase.com) (free tier funciona)
- Conta no [Vercel](https://vercel.com)

---

## 1. Criar projeto no Supabase

1. Acesse [app.supabase.com](https://app.supabase.com) → **New Project**
2. Anote:
   - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
   - **anon public key** → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - **service_role key** → `SUPABASE_SERVICE_ROLE_KEY` *(Settings → API)*

---

## 2. Rodar a migration SQL

No painel do Supabase → **SQL Editor** → cole o conteúdo de `supabase.sql` → **Run**.

Isso criará:
- `user_profiles` — perfis com roles (`admin`/`viewer`)
- `portal_settings` — configuração do relatório (single row)
- `audit_logs` — log de eventos

---

## 3. Criar o primeiro usuário e torná-lo admin

**a) Criar usuário via Supabase Auth:**

No Supabase → **Authentication → Users → Add user** (ou use o formulário de login do portal, se já rodar localmente).

**b) Promover a admin:**

```sql
UPDATE public.user_profiles
SET role = 'admin'
WHERE email = 'seu@email.com';
```

Execute no **SQL Editor** do Supabase.

---

## 4. Configurar variáveis de ambiente

```bash
cp .env.example .env.local
```

Edite `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...
POWERBI_EMBED_URL_TEMPLATE=https://app.powerbi.com/view?r={{REPORT_ID}}
```

---

## 5. Rodar localmente

```bash
npm install
npm run dev
```

Acesse [http://localhost:3000](http://localhost:3000)

---

## 6. Deploy no Vercel

1. Push para GitHub
2. [vercel.com/new](https://vercel.com/new) → importe o repositório
3. Em **Environment Variables**, adicione as 4 variáveis do `.env.example`
4. **Deploy** → pronto!

---

## 7. Configurar o relatório Power BI

1. No Power BI Desktop → **Arquivo → Publicar → Publicar na Web**
2. Copie a URL gerada. Ela terá o formato:
   ```
   https://app.powerbi.com/view?r=XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
   ```
3. Acesse `/admin` no portal → cole o código após `?r=` no campo **Report ID** → Salvar.

---

## Estrutura de pastas

```
src/
├── actions/
│   ├── audit.ts        # Server Action: gravar audit log
│   ├── auth.ts         # Server Actions: login / logout
│   └── settings.ts     # Server Action: salvar configurações
├── app/
│   ├── access-denied/  # Página de acesso negado
│   ├── admin/          # Painel admin (role = admin)
│   ├── dashboard/      # Dashboard com iframe Power BI
│   ├── login/          # Tela de login
│   ├── globals.css
│   ├── layout.tsx
│   └── page.tsx        # Redireciona para /dashboard
├── components/
│   ├── AdminClient.tsx    # UI do admin (client)
│   ├── DashboardClient.tsx # UI do dashboard (client)
│   └── LoginForm.tsx      # Formulário de login (client)
├── lib/
│   ├── powerbi.ts      # Construtor da URL de embed
│   ├── supabase/
│   │   ├── client.ts   # Supabase browser client
│   │   └── server.ts   # Supabase server client + service role
│   └── types.ts        # Types compartilhados
└── middleware.ts        # Proteção de rotas
```

---

## Roles

| Role    | Dashboard | Admin |
|---------|-----------|-------|
| viewer  | ✅         | ❌     |
| admin   | ✅         | ✅     |

---

## Paleta de cores (tema B3.Pet)

| Token             | Hex       | Uso                    |
|-------------------|-----------|------------------------|
| `primary`         | `#2BBFB3` | Botões, links, destaques |
| `primary-dark`    | `#1A9E93` | Hover                  |
| `primary-light`   | `#C5E8E6` | Backgrounds suaves     |
| `foreground`      | `#0C2426` | Texto principal        |
| `muted`           | `#3D6B6E` | Texto secundário       |
| `subtle`          | `#8AB0B3` | Labels, placeholders   |
| `page`            | `#EDF2F3` | Background da página   |
| `surface`         | `#FFFFFF` | Cards, painéis         |
| `border`          | `#D4E4E5` | Bordas                 |
| `accent`          | `#F5A623` | Alertas neutros        |
| `success`         | `#17C97E` | Sucesso                |
| `danger`          | `#F05252` | Erro                   |
