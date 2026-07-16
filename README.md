# Dental Marketplace (DentSpot) — Admin, Moderação e Fluxo de Auth no Header

Marketplace de aluguel de consultórios odontológicos (estilo Airbnb).
Cadastro único de usuário, tela de detalhes completa, e agora um
**painel administrativo** com gestão de usuários e moderação de anúncios.

## Identidade Visual
- **Cor primária:** `#0A8491` (Azul Turquesa Clínico / Ciano Escuro).
- **Logo:** `frontend/src/components/Logo` — SVG puro (dente + pin de localização).

## Novidades desta rodada

### 1. Header com fluxo de autenticação correto
O botão do canto superior direito agora respeita o login:
- **Deslogado:** texto **"Entrar / Cadastrar"** → leva para `/auth`.
- **Logado:** texto **"+ Novo"** → leva direto para `/offices/new`.
- O link **"Anuncie seu Consultório"** só aparece logado e também leva para `/offices/new`.
- Lógica isolada em `frontend/src/components/Header/index.tsx` (antes estava embutida no `App.tsx`).
- As rotas `/dashboard`, `/offices/new` e `/offices/:id/edit` agora são de fato
  protegidas por `<ProtectedRoute>` (não só escondidas no menu) — quem tentar
  acessá-las deslogado é redirecionado para `/auth`.

### 2. Módulo `/admin`
Rota protegida (`<ProtectedRoute requiredRole="admin">`), acessível apenas para
usuários com `role: "admin"`. Sidebar com 4 seções:

| Seção | O que faz |
|---|---|
| **Visão Geral** | Cards com métricas: usuários, consultórios ativos/pendentes/recusados, avaliações, nota média |
| **Gestão de Usuários** | Tabela com todos os usuários; botões **banir/reativar** e **promover/remover admin** |
| **Moderação de Clínicas** | Lista de anúncios com `moderationStatus: PENDENTE`; botões **Aprovar** / **Recusar** |
| **Taxas e Finanças** | Painel simulado: taxa da plataforma, faturamento estimado, repasse aos anfitriões, gráfico de tendência |

**Login de teste do admin:** `admin@dentspot.com` / `admin123`

#### Regra de moderação
Todo consultório novo nasce com `moderationStatus: "PENDENTE"` (forçado no
backend, ignorando qualquer valor enviado pelo cliente) e **não aparece** na
busca pública (`/`) até um admin aprovar em `/admin`. O proprietário já vê o
próprio anúncio no dashboard (`/dashboard`) com um badge "Aguardando aprovação".

#### Proteção das rotas de admin (backend)
Um middleware (`backend/src/shared/middlewares/auth.middleware.ts`) exige o
header `Authorization: Bearer <token>` e confere `role === "admin"` antes de
liberar qualquer rota `/api/admin/*`:
- Sem token → `401`
- Token de usuário comum → `403`
- Token de admin → `200`

> ⚠️ **Aviso de segurança:** autenticação continua **mockada** (senha em texto
> puro, token fake em Base64) — troque por bcrypt/argon2 + JWT assinado antes
> de produção. As rotas de escrita de `offices` (`POST/PUT/DELETE`) ainda não
> exigem `requireAuth` no backend — hoje a proteção de "criar consultório" é
> majoritariamente client-side (rota protegida no React). Próximo passo natural:
> aplicar `requireAuth` também nessas rotas e usar `req.authUser.id` como
> `ownerId`, em vez de confiar no valor enviado pelo formulário.

## Arquitetura

```
dental-marketplace/
├── backend/
│   └── src/
│       ├── shared/middlewares/  # requireAuth / requireAdmin
│       └── modules/
│           ├── offices/  # + moderationStatus (PENDENTE/APROVADO/RECUSADO)
│           ├── users/    # + role (user/admin) e status (ATIVO/BANIDO)
│           └── admin/    # agregador: métricas, finanças, chama users/offices para ações
└── frontend/
    └── src/
        ├── components/
        │   ├── Header/           # cabeçalho dedicado (antes estava no App.tsx)
        │   ├── ProtectedRoute/    # bloqueia rota por auth e/ou role
        │   ├── Logo/, SearchBar/, OfficeCard/, EquipmentIcon/
        ├── context/AuthContext.tsx
        ├── pages/
        │   ├── Home/, Auth/, OfficeDetails/, OfficeList/, OfficeForm/
        │   └── Admin/
        │       ├── index.tsx       # layout com sidebar
        │       ├── Overview.tsx
        │       ├── Users.tsx
        │       ├── Moderation.tsx
        │       └── Finance.tsx
        └── services/
            ├── api.ts        # axios + interceptor que injeta o Bearer token
            ├── auth.ts, tokenStorage.ts
            └── admin.ts
```

## Rotas do Frontend
| Rota | Página | Proteção |
|---|---|---|
| `/` | Home | Pública |
| `/auth` | Auth | Pública |
| `/offices/:id` | OfficeDetails | Pública |
| `/dashboard` | OfficeList | Requer login |
| `/offices/new` | OfficeForm | Requer login |
| `/offices/:id/edit` | OfficeForm | Requer login |
| `/admin` | Admin | Requer login **+ role admin** |

## Como rodar

### Backend (porta 3333)
```bash
cd backend
npm install
npm run dev
```

Contas seed disponíveis:
| E-mail | Senha | Role |
|---|---|---|
| admin@dentspot.com | admin123 | admin |
| paula@example.com | 123456 | user |
| marcelo@example.com | 123456 | user |
| camila@example.com | 123456 | user |

Endpoints novos:
| Método | Rota | Descrição |
|---|---|---|
| GET | /api/admin/metrics | Métricas gerais (requer admin) |
| GET | /api/admin/finance | Painel financeiro simulado (requer admin) |
| GET | /api/admin/users | Lista todos os usuários (requer admin) |
| PATCH | /api/admin/users/:id/ban | Bane/reativa um usuário (requer admin) |
| PATCH | /api/admin/users/:id/promote | Promove/remove admin (requer admin) |
| GET | /api/admin/offices/pending | Lista anúncios pendentes (requer admin) |
| PATCH | /api/admin/offices/:id/approve | Aprova um anúncio (requer admin) |
| PATCH | /api/admin/offices/:id/reject | Recusa um anúncio (requer admin) |

### Frontend (porta 5173)
```bash
cd frontend
npm install
cp .env.example .env
npm run dev
```

## Stack
- **Backend:** Node.js, Express, TypeScript, ts-node-dev.
- **Frontend:** React 18, TypeScript, Vite, React Router, Axios, Context API, CSS puro com variáveis de tema.

## Próximos módulos sugeridos
- Aplicar `requireAuth` real nas rotas de escrita de `offices` (hoje só o front protege)
- `bookings` (reserva real de turnos)
- `chat` (mensagem anfitrião ↔ locatário)
- `reviews` reais (hoje são só seed)
- `payments` (o painel de Finanças hoje é 100% simulado)
