# Dental Marketplace (DentSpot) — Propostas de Reserva e Negociação

Marketplace de aluguel de consultórios odontológicos (estilo Airbnb).
Cadastro único, painel admin, e agora o **fluxo completo de propostas de
reserva**: disponibilidade por dia da semana, procedimentos com preço
próprio, oferta de valor pelo dentista, aceite/recusa/negociação pelo
proprietário e uma regra de conflito de agenda entre clínicas diferentes.

## Novidades desta rodada

### 1. Disponibilidade e Procedimentos (Proprietário)
No `OfficeForm`, o proprietário agora define:
- **Dias da semana disponíveis** (chips selecionáveis: Segunda a Domingo).
- **Procedimentos oferecidos**, cada um com nome e preço próprio (ex: "Procedimento de
  Canal — R$ 200/turno"), independente do preço genérico por turno.

### 2. Fluxo de Proposta (Dentista) — `OfficeDetails`
O botão "Reservar" virou **"Enviar Proposta"**. O painel lateral permite escolher:
Data · Turno · Procedimento (opcional) · **Oferta de Valor** (pré-preenchida com o
preço tabelado, mas editável). Ao enviar, o backend:
1. Valida que o dia da semana está entre os disponibilizados pelo consultório.
2. Valida que o dentista **não tem outra proposta pendente/aceita no mesmo dia+turno**
   em qualquer outro consultório (regra de conflito de agenda).
3. Cria o registro com `status: "PENDENTE_APROVACAO"`.
4. Gera automaticamente a primeira mensagem estruturada no chat da proposta.

### 3. Painéis de Propostas
- **`/proposals/received`** (proprietário): cada card tem **Aceitar Oferta**,
  **Recusar Oferta** e **Negociar** (abre o chat da proposta).
- **`/proposals/sent`** (dentista): acompanha o status de cada proposta enviada
  e pode continuar a negociação pelo mesmo chat.
- Como o cadastro é único, qualquer usuário logado vê os dois links no menu —
  pode ser dentista e anfitrião ao mesmo tempo.
- Enviar uma mensagem manual no chat durante a análise muda o status para
  `NEGOCIACAO` automaticamente.

### 4. Regra de conflito de agenda
Implementada no backend (`booking.service.ts`): antes de criar uma proposta,
o sistema verifica se o mesmo dentista já tem uma proposta `PENDENTE_APROVACAO`
ou `ACEITO` na mesma data e turno — mesmo em uma clínica diferente — e bloqueia
com erro `400` explicando o conflito.

## Segurança (fechada nesta rodada)
As rotas de escrita de `offices` (`POST/PUT/PATCH/DELETE`) agora exigem
`requireAuth`, e o `ownerId` é sempre derivado de `req.authUser.id` — nunca do
corpo da requisição. Update/toggle/delete também checam posse (só o dono ou um
admin pode alterar). Todas as rotas de `bookings` exigem autenticação; o
`dentistId` também vem sempre do usuário autenticado.

> ⚠️ Autenticação continua **mockada** (token fake em Base64, senha em texto
> puro) — troque por JWT assinado + bcrypt/argon2 antes de produção.

## Arquitetura

```
dental-marketplace/
├── backend/
│   └── src/
│       ├── shared/middlewares/   # requireAuth / requireAdmin
│       └── modules/
│           ├── offices/  # + availableWeekdays (Weekday[]) e services (OfficeService[])
│           ├── users/
│           ├── admin/
│           └── bookings/  # NOVO: propostas de reserva, chat embutido, regra de conflito
│               ├── booking.model.ts
│               ├── booking.repository.ts
│               ├── booking.service.ts    # regra de negócio central
│               ├── booking.controller.ts
│               └── booking.routes.ts
└── frontend/
    └── src/
        ├── components/
        │   ├── ProposalCard/    # card de proposta (usado nas duas telas)
        │   ├── ProposalChat/    # modal de chat/negociação de uma proposta
        │   └── ... (Header, Logo, SearchBar, OfficeCard, EquipmentIcon, ProtectedRoute)
        ├── pages/
        │   ├── OfficeForm/      # + dias da semana + procedimentos
        │   ├── OfficeDetails/   # botão "Enviar Proposta" + painel de oferta
        │   └── Proposals/
        │       ├── Received/    # painel do proprietário
        │       └── Sent/        # "Minhas Propostas" do dentista
        └── services/
            ├── booking.ts        # NOVO
            └── ... (api.ts, auth.ts, admin.ts, tokenStorage.ts)
```

## Rotas do Frontend
| Rota | Página | Proteção |
|---|---|---|
| `/` | Home | Pública |
| `/offices/:id` | OfficeDetails (agora com "Enviar Proposta") | Pública (envio exige login) |
| `/proposals/received` | Propostas recebidas (proprietário) | Requer login |
| `/proposals/sent` | Minhas propostas (dentista) | Requer login |
| `/dashboard`, `/offices/new`, `/offices/:id/edit` | Gestão de consultórios | Requer login |
| `/admin` | Painel admin | Requer login + role admin |

## Endpoints novos (backend)
| Método | Rota | Descrição |
|---|---|---|
| POST | /api/bookings | Cria uma proposta (valida disponibilidade + conflito) |
| GET | /api/bookings/received | Propostas recebidas pelo proprietário logado |
| GET | /api/bookings/sent | Propostas enviadas pelo dentista logado |
| GET | /api/bookings/:id | Detalhe de uma proposta (só participantes) |
| PATCH | /api/bookings/:id/accept | Proprietário aceita |
| PATCH | /api/bookings/:id/reject | Proprietário recusa |
| POST | /api/bookings/:id/messages | Envia mensagem no chat da proposta (inicia `NEGOCIACAO`) |

## Como rodar

### Backend (porta 3333)
```bash
cd backend
npm install
npm run dev
```

Contas seed:
| E-mail | Senha | Role |
|---|---|---|
| admin@dentspot.com | admin123 | admin |
| paula@example.com | 123456 | user (dona do Meireles e da Praia do Futuro) |
| marcelo@example.com | 123456 | user (dono do Studio Aldeota) |
| camila@example.com | 123456 | user (dona do Serrinha) |

Dica para testar o fluxo: logue como `marcelo@example.com`, envie uma proposta
para um consultório da Paula; depois logue como `paula@example.com` e acesse
`/proposals/received` para aceitar/recusar/negociar.

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
- `payments`: gerar a cobrança de fato quando uma proposta é aceita (hoje só muda o status)
- Notificações em tempo real (hoje é preciso recarregar a tela para ver novas propostas/mensagens)
- Cancelamento de proposta pelo dentista antes da resposta do proprietário
- Regra adicional: bloquear duas propostas ACEITAS no mesmo consultório/data/turno (hoje só valida por dentista)
