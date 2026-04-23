# Zypherion Protocol: System Architecture

This document provides a detailed visual representation and technical breakdown of the Zypherion Protocol's architecture, logic flows, and security models.

---

## 1. High-Level System Architecture

This diagram shows the structural relationship between the four primary layers of the protocol: the Sovereign Interface, the SDK, the Orchestration Engine, and the Consensus Layer.

```mermaid
graph TD
    subgraph FE["Sovereign Interface — Frontend"]
        A[Dashboard & UI]
        B[Logic Architect]
        C[Governance Hub]
        D[Billing System]
        E[Freighter Wallet]
    end

    subgraph SDK["Zypherion SDK — TypeScript"]
        F[Signature Engine]
        G[Request Wrapper]
        H[Module Registry]
    end

    subgraph BE["Orchestration Engine — Backend"]
        I[Express API Server]
        J[Automation Worker / Cron]
        K[Socket.io WebSocket Hub]
        L[(MongoDB Instance)]
    end

    subgraph CHAIN["Consensus Layer — Stellar Soroban"]
        M[Logic Registry Contract]
        N[Proof Verifier Contract]
        O[Execution Router Contract]
    end

    E -- "Cryptographic Signing" --> B
    B -- "Signed Payload" --> F
    F --> G
    G -- "HTTPS / JWT" --> I
    I -- "Persistence" --> L
    J -- "State Monitoring" --> L
    J -- "Batch Proof Submission" --> N
    N --> O
    O -- "Contract Events" --> M
    K -- "Real-time Telemetry" --> A
```

---

## 2. Logic Execution & Batching Flow

This sequence diagram illustrates the full lifecycle of an automated rule — from user definition through recursive proof batching to on-chain finality.

```mermaid
sequenceDiagram
    participant User
    participant Frontend
    participant Backend
    participant Worker as Automation Worker
    participant DB as MongoDB
    participant Stellar as Soroban Contracts

    Note over User, Backend: Phase 1 — Rule Creation

    User->>Frontend: Create Logic Rule (e.g. Scheduled Payment)
    Frontend->>User: Request Signature (Freighter)
    User-->>Frontend: Signed Message
    Frontend->>Backend: POST /api/rules
    Backend->>DB: Save Rule (status: active)

    Note over Worker, DB: Phase 2 — Chronos Engine Polling (every 1 min)

    Worker->>DB: Find Triggered Rules
    Worker->>Worker: Verify Data Feeds / Time
    Worker->>DB: Check Gas Abstraction Credits
    Worker->>DB: Create Proof (status: pending)

    Note over Worker, Stellar: Phase 3 — Recursive Batching Engine

    Worker->>Worker: Aggregate 3+ Proofs into BatchProof
    Worker->>Stellar: verify_proof(BatchProof)
    Stellar-->>Worker: Verification Success
    Worker->>Stellar: execute_action(Payload)
    Stellar-->>Worker: EXECUTED_EVENT

    Note over Worker, Frontend: Phase 4 — Notification

    Worker->>Backend: Execution Success Update
    Backend->>Frontend: Socket.io — Notify User
    Frontend-->>User: Success Alert & Dashboard Update
```

---

## 3. Governance & Security Model

The protocol utilizes a multi-layered security model to ensure trustless execution and sovereign control over automation rules.

```mermaid
flowchart LR
    Admin(["Master Admin Wallet\nADMIN_WALLET_ADDRESS"])

    Admin -- Toggle --> KS{{"Kill Switch Active?"}}

    KS -- YES --> STOP["BLOCK ALL OPERATIONS\nProtocol Frozen"]

    KS -- NO --> Rules["Logic Rules\nActive Rule Queue"]

    Rules -- "Requires Multi-Sig?" --> Quorum{{"Quorum Reached?"}}

    Quorum -- "N/M Signatures" --> Batch["Proof Batching\nBatchProof Engine"]

    Quorum -- "Pending" --> Wait["Governance Hub\nAwait Approver Signatures"]

    Wait -. "Signatures Collected" .-> Quorum

    Batch --> Finality["Stellar Ledger\nOn-chain Finality"]
```

---

## 4. Database Schema Relationships

A high-level entity-relationship view of how the MongoDB models are interconnected across the protocol.

```mermaid
erDiagram
    USER ||--o{ LOGIC_RULE : creates
    USER ||--o{ BILLING : manages
    LOGIC_RULE ||--o{ PROOF : generates
    PROOF }|--|| BATCH_PROOF : aggregates

    USER {
        string  address       PK  "Wallet public key"
        string  tier              "free or pro or enterprise"
        float   gasBalance        "Prepaid ZYP credits"
        boolean isDIDVerified     "Self-sovereign identity"
        string  didDocument       "did:zypher document"
    }

    LOGIC_RULE {
        string   id           PK  "Rule UUID"
        string   userId       FK  "Owner wallet"
        string   name             "Human-readable label"
        string   logic            "Encoded rule payload"
        string   status           "active or pending or executed"
        datetime scheduledAt      "Trigger timestamp"
        boolean  isMultiSig       "Requires N-of-M sigs"
        array    approvers        "Authorised signer list"
    }

    PROOF {
        string   id           PK  "Proof UUID"
        string   ruleId       FK  "Parent rule"
        string   status           "pending or verified or batched"
        string   txHash           "Soroban tx reference"
        datetime createdAt        "Generation timestamp"
    }

    BATCH_PROOF {
        string   id           PK  "Batch UUID"
        array    proofIds     FK  "Aggregated proof refs"
        string   aggregatedData   "Recursive SNARK payload"
        string   txHash           "On-chain finality hash"
        string   status           "pending or submitted or confirmed"
    }

    BILLING {
        string   id           PK  "Billing record UUID"
        string   userId       FK  "Owner wallet"
        float    credits          "Total deposited credits"
        float    spent            "Credits consumed"
        datetime updatedAt        "Last deduction timestamp"
    }
```

---

## 5. Component Dependency Map

This map outlines the core technologies and dependencies used across each layer of the stack.

```mermaid
graph LR
    subgraph FE["Frontend"]
        next["Next.js 14"]
        tw["TailwindCSS"]
        fm["Framer Motion"]
        sio_c["socket.io-client"]
        freighter["Freighter SDK"]
    end

    subgraph BE["Backend"]
        express["Express"]
        mongoose["Mongoose / MongoDB"]
        cron["node-cron"]
        jwt["jsonwebtoken"]
        sio_s["socket.io"]
    end

    subgraph CHAIN["Blockchain"]
        stellar["Stellar SDK"]
        soroban["Soroban Client"]
    end

    next --> express
    sio_c --> sio_s
    freighter --> stellar
    express --> mongoose
    cron --> soroban
    soroban --> stellar
```
