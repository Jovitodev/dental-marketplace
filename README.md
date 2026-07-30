# Dental Marketplace (DentSpot) — Polimento de MVP: Toasts, Validações e Máscaras

Marketplace de aluguel de consultórios odontológicos (estilo Airbnb).
Esta rodada foca em **UX de erro/sucesso** e **validação rígida de
formulários**, preparando o MVP para produção.

## Novidades desta rodada

### Etapa 1 — Notificações visuais (Toasts)
- Biblioteca **sonner** configurada globalmente em `main.tsx` (`<Toaster />`,
  canto superior direito, cantos arredondados, `richColors`).
- Toasts de sucesso/erro em:
  - **Login/Cadastro** (`pages/Auth`): "Bem-vindo de volta!" ou "E-mail ou
    senha incorretos" no login; mensagens equivalentes no cadastro.
  - **Cadastro de consultório** (`pages/OfficeForm`): "Consultório cadastrado
    com sucesso!" / "Consultório atualizado com sucesso!" ou erro da API.
  - **Envio de proposta e de mensagem ao anfitrião** (`pages/OfficeDetails`):
    "Proposta enviada com sucesso!" e "Mensagem enviada com sucesso!".
  - **Chat de propostas/conversas** (`components/ChatModal`, usado por
    `ProposalChat` e `ConversationChat`): toast centralizado num único
    lugar (o modal genérico), evitando duplicar a lógica nos dois wrappers.
  - Como extra de consistência, **todos os `alert()` restantes no app**
    (Meus Anúncios, Moderação de Clínicas, Gestão de Usuários, Propostas
    Recebidas) foram substituídos por toasts.
- **Bug corrigido de brinde:** `OfficeList` (Meus Anúncios) usava um
  `ownerId` fixo (`owner-demo-01`) em vez do usuário autenticado — qualquer
  pessoa logada via os consultórios da Paula. Agora usa `useAuth().user.id`.

### Etapa 2 — Validações e máscaras (`pages/OfficeForm`)
- **Campo CRO**: máscara em tempo real no formato `12345-SP` (dígitos + sigla
  do estado), implementada em `utils/masks.ts` (`formatCRO`, `isValidCRO`).
  Validação obrigatória via regex `^\d{4,6}-[A-Z]{2}$`.
  - Dados legados no formato antigo (ex: `"CRO-CE 10234"`, usado no seed) são
    **normalizados automaticamente** ao carregar um consultório para edição,
    evitando que o botão de salvar fique travado por causa de dado antigo.
- **Preço por Turno / Procedimentos / Oferta de valor**: máscara de moeda
  brasileira em tempo real (`components/CurrencyInput`), usando a técnica
  "dígitos = centavos" (como em apps bancários). O componente sempre reporta
  ao componente pai o **valor numérico puro** (ex: `250.5`) — a formatação
  `R$ 250,50` é só visual. Usado em: preços por turno e de procedimentos no
  `OfficeForm`, e na "oferta de valor" no `OfficeDetails`.
- **Botão "Salvar Consultório" desabilitado** até que todos os campos
  obrigatórios estejam válidos: Título, Descrição, CRO (formato correto),
  Endereço completo, ao menos um Preço de Turno e ao menos um dia da semana
  disponível.

## Arquitetura (arquivos novos/alterados nesta rodada)

```
frontend/src/
├── utils/masks.ts              # NOVO: formatCRO, isValidCRO
├── components/
│   └── CurrencyInput/          # NOVO: input com máscara de moeda BRL
├── pages/
│   ├── Auth/                   # + toasts de sucesso/erro
│   ├── OfficeForm/             # + máscaras, validação, botão desabilitado, toasts
│   ├── OfficeDetails/          # + toasts, CurrencyInput na oferta de valor
│   ├── OfficeList/             # + toasts, corrigido bug do ownerId fixo
│   ├── Admin/Moderation.tsx    # + toasts (era alert)
│   ├── Admin/Users.tsx         # + toasts (era alert)
│   └── Proposals/Received/     # + toasts (era alert)
├── components/ChatModal/       # + toast de envio de mensagem (usado por
│                                  ProposalChat e ConversationChat)
└── main.tsx                    # + <Toaster /> do sonner
```

## Testes realizados
As funções puras de máscara (`formatCRO`, `isValidCRO`, formatação de
centavos) foram testadas isoladamente em Node antes do empacotamento,
incluindo o caso real dos 4 consultórios do seed (formato antigo
`"CRO-CE 10234"` → convertido corretamente para `"10234-CE"`). O backend foi
testado em runtime aceitando o novo formato de CRO e preços com centavos
sem qualquer alteração necessária (o campo continua sendo uma string livre
no schema — a validação de formato é 100% do frontend).

## Como rodar

### Backend (porta 3333)
```bash
cd backend
npm install
npm run dev
```

### Frontend (porta 5173)
```bash
cd frontend
npm install
cp .env.example .env
npm run dev
```

## Stack
- **Backend:** Node.js, Express, TypeScript, ts-node-dev.
- **Frontend:** React 18, TypeScript, Vite, React Router, Axios, Context API,
  **sonner** (toasts), CSS puro com variáveis de tema.

## Próximos passos sugeridos
- Validação de CRO também no backend (hoje é só uma string livre) — se o
  requisito de formato for regra de negócio real, não só de UX.
- Aplicar `CurrencyInput` também nos campos de preço exibidos em modo leitura
  (ex: `<option>` do select de turno/procedimento em `OfficeDetails`), hoje
  ainda formatados com `toFixed(2)` simples.
- Testes automatizados (unitários para `masks.ts`/`CurrencyInput`, e2e para
  o fluxo de cadastro) — os testes desta rodada foram manuais/pontuais.
