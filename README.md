# 🔷 ZYPHERION Protocol

> **Trustless Cross-Chain State Attestation & Automation**

Zypherion is an SDK-first, API-first developer platform for deploying cryptographic logic rules, generating cross-chain proofs, and automating trustless execution — built on Stellar/Soroban.

---

## 🚀 Quick Start

### Install the SDK

```bash
npm install zypherion-sdk
```

### Initialize

```typescript
import { ZypherionSDK } from 'zypherion-sdk';

const sdk = new ZypherionSDK({
  network: 'sandbox', // or 'mainnet' | 'testnet'
  secretKey: 'YOUR_ED25519_SECRET_KEY_BASE58'
});

// Authenticate
const token = await sdk.auth.authenticate();
sdk.setToken(token);

// Deploy a Logic Rule
const rule = await sdk.rules.create('My Rule', 'balance > 100', 'releaseFunds');

// Generate a Proof
const proof = await sdk.proofs.generate(rule._id);

// Subscribe to real-time events
sdk.events.connect('YOUR_WALLET_ADDRESS');
sdk.events.on('execution_update', (data) => console.log(data));
```

---

## 📦 Project Structure

```
ZYPHERION/
├── backend/          # Express + TypeScript API server
│   ├── src/
│   │   ├── controllers/  # Business logic
│   │   ├── models/       # MongoDB schemas
│   │   ├── routes/       # Express routers
│   │   ├── middleware/   # Auth, rate limiting
│   │   ├── services/     # AutomationWorker, Webhooks
│   │   └── utils/        # Signature verification
│   └── src/openapi.yaml  # Swagger / OpenAPI spec
│
├── frontend/         # Next.js dashboard
│   └── src/
│       ├── pages/    # Dashboard, Admin, Developer Portal
│       ├── components/
│       ├── context/  # WalletContext (Freighter)
│       └── services/ # API, signing, socket
│
├── sdk/              # 📦 zypherion-sdk (TypeScript)
│   └── src/
│       ├── index.ts          # ZypherionSDK class
│       ├── signature.ts      # Ed25519 signing engine
│       ├── RequestWrapper.ts # Signed HTTP requests
│       └── modules/
│           ├── AuthModule.ts
│           ├── RuleModule.ts
│           ├── ProofModule.ts
│           ├── ExecutionModule.ts
│           └── EventModule.ts
│
└── sample-app/       # SDK usage example
```

---

## 🔐 API Reference

Interactive Swagger docs available at:
```
http://localhost:5001/api-docs
```

### Base URL
```
http://localhost:5001/v1    (sandbox)
https://api.zypherion.io/v1 (production)
```

### Key Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET`  | `/auth/request-message` | Get signature challenge |
| `POST` | `/auth/verify-signature` | Exchange signature for JWT |
| `POST` | `/rules/create` | Deploy a logic rule |
| `GET`  | `/rules/list` | List all rules |
| `POST` | `/proof/generate` | Generate cross-chain proof |
| `POST` | `/execute/trigger` | Trigger rule execution |
| `POST` | `/webhooks/register` | Register a webhook |

---

## 🛠 Development

```bash
# Backend
cd backend && npm install && npm run dev

# Frontend
cd frontend && npm install && npm run dev

# SDK
cd sdk && npm install && npm run build
```

---

## 🏛 Governance — Kill Switch

The Admin Dashboard includes a cryptographically-secured **Emergency Protocol Override (Kill Switch)**. When activated by the Master Admin (via Freighter wallet signature), all rule deployments, proof requests, and attestations are immediately frozen across the protocol.

---

## 📄 License

MIT — © 2024 Pritam9078