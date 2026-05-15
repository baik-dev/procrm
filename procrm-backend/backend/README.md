# ProCRM Backend

Multi-tenant CRM backend built with Node.js, Express, PostgreSQL, and Prisma.

---

## Quick Start

### 1. Prerequisites

- Node.js 18+
- PostgreSQL 14+

### 2. Install dependencies

```bash
cd backend
npm install
```

### 3. Configure environment

Edit `.env`:

```env
DATABASE_URL="postgresql://YOUR_USER:YOUR_PASSWORD@localhost:5432/procrm_db"
JWT_SECRET="replace-with-a-long-random-string"
JWT_EXPIRES_IN="7d"
PORT=3000
```

### 4. Create the database

```sql
-- In psql or pgAdmin:
CREATE DATABASE procrm_db;
```

### 5. Run migrations

```bash
npm run db:migrate
```

When prompted for migration name, type: `init`

### 6. Generate Prisma client

```bash
npm run db:generate
```

### 7. Seed demo data

```bash
npm run db:seed
```

This creates:

| Email | Password | Role | Company |
|---|---|---|---|
| admin@alpha.com | 123456 | admin | Alpha Corp |
| manager@alpha.com | 123456 | manager | Alpha Corp |
| admin@beta.com | 123456 | admin | Beta Solutions |

Alpha and Beta data is **completely isolated** — admins cannot see each other's data.

### 8. Start the server

```bash
npm run dev    # development (auto-reload)
npm start      # production
```

Server runs on http://localhost:3000

---

## API Reference

All endpoints (except `/api/auth/login` and `/api/auth/register-admin`) require:

```
Authorization: Bearer <jwt_token>
```

### Auth

| Method | Path | Body | Description |
|---|---|---|---|
| POST | /api/auth/register-admin | name, email, password, company_name | Register admin + create company |
| POST | /api/auth/login | email, password | Login |
| GET | /api/auth/me | — | Current user |

### Managers (admin only)

| Method | Path | Description |
|---|---|---|
| GET | /api/managers | List company managers |
| POST | /api/managers | Create manager |
| PATCH | /api/managers/:id | Update manager |
| PATCH | /api/managers/:id/deactivate | Deactivate manager |
| DELETE | /api/managers/:id | Delete manager |

### Leads

| Method | Path | Description |
|---|---|---|
| GET | /api/leads | Admin: all company leads. Manager: assigned only |
| POST | /api/leads | Create lead |
| GET | /api/leads/:id | Get lead + nested data |
| PATCH | /api/leads/:id | Update lead |
| DELETE | /api/leads/:id | Admin only |
| PATCH | /api/leads/:id/assign | Admin only — assign to manager |
| PATCH | /api/leads/:id/stage | Move stage |

### Deals

Same access pattern as Leads. Routes: `/api/deals`

### Tasks

| Method | Path | Description |
|---|---|---|
| GET | /api/tasks | Admin: all. Manager: assigned |
| POST | /api/tasks | Create task |
| PATCH | /api/tasks/:id | Update task |
| PATCH | /api/tasks/:id/status | Change status (todo/done/overdue) |
| DELETE | /api/tasks/:id | Admin or task owner |

### Contacts

`/api/contacts` — GET, POST, PATCH /:id, DELETE /:id

### Messages

| Method | Path | Description |
|---|---|---|
| GET | /api/messages/:leadId | Get lead messages |
| POST | /api/messages | Send message |

### Pipelines & Stages

| Method | Path | Description |
|---|---|---|
| GET | /api/pipelines | Pipelines with stages |
| GET | /api/pipelines/stages | Flat stage list |
| POST | /api/pipelines/stages | Admin only |
| PATCH | /api/pipelines/stages/:id | Admin only |
| DELETE | /api/pipelines/stages/:id | Admin only |

### Settings (admin only)

| Method | Path | Description |
|---|---|---|
| GET | /api/settings | Get all settings as key/value object |
| PATCH | /api/settings | Update settings (send any key/value pairs) |

### Analytics

| Method | Path | Description |
|---|---|---|
| GET | /api/analytics/dashboard | KPI cards |
| GET | /api/analytics/funnel | Leads/deals per stage |
| GET | /api/analytics/managers | Manager performance stats |

---

## Connecting the Frontend

### Step 1: Add api.js to your HTML

In both `procrm-landing.html` and `procrm.html`, add before the closing `</body>`:

```html
<script src="api.js"></script>
```

### Step 2: Replace in-memory DB calls

The frontend currently uses a global `DB` object. Replace each operation:

#### Login
```js
// BEFORE
const user = DB.users.find(u => u.email === email && u.password === pass);

// AFTER
const { token, user } = await API.login(email, password);
// token is auto-stored in localStorage by api.js
```

#### Register
```js
// BEFORE
DB.companies.push({...}); DB.users.push({...}); ...

// AFTER
const { token, user } = await API.registerAdmin(name, email, password, company_name);
```

#### Get leads
```js
// BEFORE
let leads = DB.leads.filter(l => l.company_id === myCompanyId());

// AFTER
const leads = await API.getLeads();
```

#### Create lead
```js
// BEFORE
DB.leads.push({id: newId('leads'), company_id: myCompanyId(), ...});

// AFTER
const lead = await API.createLead({ name, phone, email, source, stage_id, assigned_manager_id });
```

#### Move lead stage (kanban drag)
```js
// BEFORE
lead.stage_id = newStageId;

// AFTER
await API.moveLeadStage(lead.id, newStageId);
```

#### Get dashboard stats
```js
// BEFORE
const stats = { total: DB.leads.filter(...).length, ... };

// AFTER
const stats = await API.getAnalyticsDashboard();
```

### Step 3: Handle async rendering

Since all API calls are async, update render functions to be async:

```js
// BEFORE
function renderLeads() {
  const leads = getLeads();
  // ...render
}

// AFTER
async function renderLeads() {
  const leads = await API.getLeads();
  // ...render
}
```

### Step 4: Handle errors

Wrap API calls in try/catch and use the existing `notify()` function:

```js
async function createLead() {
  try {
    const lead = await API.createLead({...});
    notify('Лид создан', 'success');
    await renderLeads();
  } catch (err) {
    notify(err.message, 'error');
  }
}
```

### Step 5: Check auth on page load

Replace the `currentUser` check at page load:

```js
// BEFORE
let currentUser = JSON.parse(localStorage.getItem('crmUser'));

// AFTER
async function initApp() {
  const token = API.getToken();
  if (!token) { showAuthScreen(); return; }
  try {
    const { user } = await API.getMe();
    currentUser = user;
    showApp();
  } catch {
    API.clearToken();
    showAuthScreen();
  }
}
```

---

## Security Notes

- `company_id` is **never** taken from request body — always from JWT
- Managers can only see/edit their assigned resources
- Passwords are hashed with bcrypt (10 rounds)
- JWT expires in 7 days by default
- All Prisma queries include `company_id` filter

---

## Project Structure

```
backend/
├── src/
│   ├── app.js               # Express app + route registration
│   ├── server.js            # HTTP server
│   ├── config/
│   │   └── db.js            # Prisma singleton
│   ├── middleware/
│   │   ├── auth.middleware.js   # JWT verification
│   │   ├── role.middleware.js   # Admin/manager guards
│   │   └── tenant.middleware.js # Injects companyId from JWT
│   ├── modules/
│   │   ├── auth/            # register, login, /me
│   │   ├── managers/        # CRUD managers
│   │   ├── leads/           # CRUD + assign + stage
│   │   ├── deals/           # CRUD + stage
│   │   ├── contacts/        # CRUD
│   │   ├── tasks/           # CRUD + status
│   │   ├── messages/        # per-lead chat history
│   │   ├── pipelines/       # pipelines + stages
│   │   ├── settings/        # key/value company settings
│   │   └── analytics/       # dashboard, funnel, managers
│   ├── utils/
│   │   ├── generateToken.js # JWT sign/verify
│   │   └── errorHandler.js  # Central error handler + AppError
│   └── prisma/
│       ├── schema.prisma    # DB schema
│       └── seed.js          # Demo data
├── api.js                   # Frontend API helper
├── .env                     # Environment config
├── package.json
└── README.md
```
