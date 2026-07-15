# Dental Marketplace — Auth + Detalhes do Consultório

Marketplace de aluguel de consultórios odontológicos (estilo Airbnb).
Design premium (azul turquesa clínico), busca por localização/data/turno,
**cadastro único de usuário** e tela de detalhes completa com fotos,
avaliações e anfitrião.

## Identidade Visual
- **Cor primária:** `#0A8491` (Azul Turquesa Clínico / Ciano Escuro).
- **Fundos:** branco (`#FFFFFF`) e cinza claro (`#F7F7F7`).
- **Logo:** `frontend/src/components/Logo` — SVG puro misturando dente + pin de localização.

## Cadastro único de usuário
Não existem tipos de conta separados. Qualquer pessoa autenticada pode:
- Buscar e visualizar consultórios livremente (não precisa estar logada para isso).
- Clicar em **"Anuncie seu Consultório"** e cadastrar o seu próprio espaço,
  virando automaticamente um "anfitrião" — sem nenhum fluxo de conta adicional.

## Arquitetura

```
dental-marketplace/
├── backend/
│   └── src/modules/
│       ├── offices/   # Consultórios (model agora com images[] e reviews[])
│       └── users/     # Cadastro único: registro, login, perfil público do anfitrião
└── frontend/
    └── src/
        ├── components/
        │   ├── Logo/            # Logo SVG (dente + pin)
        │   ├── SearchBar/       # Busca (Onde / Quando / Período)
        │   ├── OfficeCard/      # Card estilo Airbnb (grid da Home e do Dashboard)
        │   └── EquipmentIcon/   # Ícones SVG dos equipamentos/comodidades
        ├── context/
        │   └── AuthContext.tsx  # Estado global de autenticação (login/registro/logout)
        ├── pages/
        │   ├── Home/            # Descoberta pública: busca + grid
        │   ├── Auth/            # Login / Cadastro (cadastro único)
        │   ├── OfficeDetails/   # Página de detalhes (galeria, avaliações, anfitrião, reserva)
        │   ├── OfficeList/      # Dashboard do proprietário ("Meus Anúncios")
        │   └── OfficeForm/      # Cadastro/edição de consultório
        ├── services/            # api.ts (axios), auth.ts (login/registro/perfil)
        └── types/                # Tipos/DTOs compartilhados com o backend
```

## Rotas do Frontend
| Rota | Página | Descrição |
|---|---|---|
| `/` | Home | Busca + grid de consultórios ativos |
| `/auth` | Auth | Login / Cadastro único |
| `/offices/:id` | OfficeDetails | Detalhes completos: galeria, comodidades, avaliações, anfitrião, reserva |
| `/dashboard` | OfficeList | Painel do proprietário logado |
| `/offices/new` | OfficeForm | Cadastro de novo consultório |
| `/offices/:id/edit` | OfficeForm | Edição de consultório existente |

## Como rodar

### 1. Backend (porta 3333)
```bash
cd backend
npm install
npm run dev
```
Dados em memória, já populados com:
- 4 consultórios com **galeria de 5 fotos** e **avaliações reais simuladas**.
- 3 usuários/anfitriões demo (login de teste: `paula@example.com` / `123456`).

Endpoints:
| Método | Rota | Descrição |
|---|---|---|
| POST | /api/auth/register | Cria uma conta |
| POST | /api/auth/login | Login |
| GET | /api/users/:id | Perfil público de um anfitrião |
| POST | /api/offices | Cria um consultório |
| GET | /api/offices | Lista consultórios (filtros: `?ownerId=` `&status=`) |
| GET | /api/offices/:id | Busca um consultório (com images/reviews) |
| PUT | /api/offices/:id | Atualiza um consultório |
| PATCH | /api/offices/:id/toggle-status | Ativa/Desativa |
| DELETE | /api/offices/:id | Remove um consultório |

> ⚠️ **Aviso de segurança:** a autenticação atual é um **mock** para prototipagem
> (senha em texto puro, token fake em Base64). Antes de ir para produção, troque
> por hashing de senha (bcrypt/argon2) e JWT assinado + middleware de autenticação
> real nas rotas protegidas.

### 2. Frontend (porta 5173)
```bash
cd frontend
npm install
cp .env.example .env
npm run dev
```

## Stack
- **Backend:** Node.js, Express, TypeScript, ts-node-dev.
- **Frontend:** React 18, TypeScript, Vite, React Router, Axios, Context API (auth), CSS puro com variáveis de tema.

## Próximos módulos sugeridos
- `bookings` (reservas reais de turnos, hoje o botão "Reservar" é só um placeholder)
- `chat` (o botão "Enviar mensagem ao anfitrião" hoje é um placeholder)
- `reviews` (avaliações reais escritas por locatários após uma reserva concluída)
- `payments`
- Middleware de autenticação real (JWT) protegendo rotas de escrita (`POST/PUT/DELETE /offices`)
