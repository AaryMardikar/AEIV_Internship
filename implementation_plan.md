# Outlook Workflow Hub - Architecture Blueprint

## Directory Structure
```
aeiv/
├── frontend/                   # React + TypeScript + MUI
│   ├── public/
│   ├── src/
│   │   ├── api/               # Axios instances & endpoints
│   │   ├── components/        # Reusable UI components
│   │   ├── contexts/          # Auth context
│   │   ├── hooks/             # Custom React Query hooks
│   │   ├── layouts/           # Page layouts
│   │   ├── pages/             # Route pages
│   │   ├── routes/            # React Router config
│   │   ├── store/             # Global state
│   │   ├── theme/             # MUI theme
│   │   ├── types/             # TypeScript types
│   │   └── utils/             # Helpers
│   ├── .env.example
│   ├── package.json
│   ├── tsconfig.json
│   └── vite.config.ts
│
├── backend/                    # Node.js + Express
│   ├── src/
│   │   ├── config/            # DB, env, logger config
│   │   ├── controllers/       # Route handlers
│   │   ├── db/                # PostgreSQL setup & migrations
│   │   ├── middleware/        # Auth, RBAC, error, logging
│   │   ├── models/            # Data models
│   │   ├── routes/            # Express routers
│   │   ├── services/          # Business logic
│   │   ├── types/             # TypeScript types
│   │   └── utils/             # Helpers
│   ├── .env.example
│   ├── package.json
│   └── tsconfig.json
│
└── README.md
```
