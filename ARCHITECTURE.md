# Zypherion Protocol Architecture

The Zypherion Protocol is a full-stack, enterprise-grade decentralized application designed to automate, verify, and orchestrate cross-chain state interactions trustlessly. 

## High-Level System Overview

The architecture is divided into three primary layers:
1. **The Sovereign Interface (Frontend):** A Next.js-powered React application.
2. **The Orchestration Engine (Backend):** A Node.js/Express REST API and WebSocket server.
3. **The Consensus Layer (Blockchain):** Stellar Testnet for cryptographic verification and identity binding.

---

## 1. Frontend Architecture (The Sovereign Interface)
Built with **Next.js**, **React**, and **TailwindCSS**, the frontend provides a high-fidelity, premium user experience.

- **State Management:** Handled via React Hooks (`useState`, `useEffect`) and a centralized `WalletContext` that manages user identity, wallet connection (Freighter), and signing requests.
- **Routing:** Next.js Pages router (`/dashboard`, `/billing`, `/admin`).
- **Telemetry & Real-time Data:** Integrated via `socket.io-client` for real-time live logs, connection statistics, and autonomous execution alerts.
- **UI/UX Components:** Extensive use of `framer-motion` for micro-animations, glassmorphism design principles, and custom SVGs/Charts.

---

## 2. Backend Architecture (The Orchestration Engine)
Built with **Node.js**, **Express**, and **MongoDB**, the backend acts as the secure relayer and automation engine.

### Core Modules:
- **RESTful API (`/src/routes` & `/src/controllers`):** Secure endpoints for Rule creation, Proof submission, Billing, and Admin overrides.
- **Database Schema (`/src/models`):** 
  - `User.ts`: Manages profiles, SaaS tiers, and DID (`isDIDVerified`, `didDocument`).
  - `LogicRule.ts`: Stores the cross-chain logic, triggers, and multi-sig requirements.
  - `Proof.ts`: Cryptographic state attestations tied to specific rules.
  - `BatchProof.ts`: Aggregates multiple verified proofs for gas efficiency.
  - `Billing.ts`: Tracks user deposits and credit utilization.
- **Automation Worker (`/src/services/AutomationWorker.ts`):** A daemon process using `node-cron` that continually polls for pending rules, checks execution schedules, aggregates proofs into batches, and simulates interchain dispatch.
- **Security Middleware (`/src/middleware/auth.ts`):** Validates JWT tokens and enforces Role-Based Access Control (RBAC) (e.g., standard user vs. DAO Admin).

---

## 3. Cryptography & Consensus Layer

- **Multi-Signature Governance:** High-stakes rules are marked as `isMultiSig`. The system requires `N` number of signatures from an `approvers` array before the backend `AutomationWorker` will execute the logic. Signatures are requested via the frontend using the Stellar Freighter wallet.
- **Decentralized Identity (DID):** Users can link a self-sovereign identity (`did:zypher`) to their profile by signing an authentication payload. This satisfies enterprise KYC without centralized data storage.
- **Proof Aggregation (Recursive SNARK simulation):** The system batches verified proofs together, reducing the number of final transactions broadcast to the ledger, thereby abstracting gas costs and increasing throughput.
- **Emergency Kill Switch:** A global `protocolHalt` state that can only be toggled by the `ADMIN_WALLET_ADDRESS`. When active, it cryptographically freezes all write-operations across the platform.

---

## Data Flow Diagram (Logic Execution)

1. **User Action:** User creates a `LogicRule` via the Logic Architect UI.
2. **Persistence:** Backend validates the payload and saves it to MongoDB.
3. **Trigger:** The `AutomationWorker` detects that the rule is ready for execution (based on time or external event).
4. **Governance (If Multi-Sig):** Rule is placed in a `pending_approval` queue. Authorized signers must approve it via the Governance Hub.
5. **Execution:** Once approved (or immediately if standard), the state is attested, and a `Proof` is generated.
6. **Aggregation:** The worker batches the new proof with others into a `BatchProof`.
7. **Finality:** The batch is committed, user credits are deducted, and the Frontend UI is updated via WebSockets.
