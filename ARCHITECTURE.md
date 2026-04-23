# Zypherion Protocol: System Architecture

This document provides a detailed visual representation and technical breakdown of the Zypherion Protocol's architecture, logic flows, and security models, now enhanced with Zero-Knowledge (ZK) proof capabilities and identity-centric governance.

---

## 1. High-Level System Architecture

This diagram shows the structural relationship between the protocol layers, including the new **ZK Prover Engine** and **Identity-Based Redirection**.

```mermaid
graph TD
    subgraph FE["Sovereign Interface — Frontend"]
        A[Dashboard & UI]
        B[Logic Architect]
        C[Governance Hub]
        D[Developer Portal / API Keys]
        E[Node Monitor]
        F[Identity Redirection Service]
    end

    subgraph SDK["Zypherion SDK — TypeScript"]
        G[Signature Engine]
        H[ZK Proof Module]
        I[Module Registry]
    end

    subgraph BE["Orchestration Engine — Backend"]
        J[Express API Server]
        K[Automation Worker / Chronos]
        L[ZK Prover Engine — snarkjs/circom]
        M[(MongoDB - Persistent State)]
        N[Socket.io Real-time Hub]
    end

    subgraph CHAIN["Consensus Layer — Stellar Soroban"]
        O[Logic Registry Contract]
        P[ZK-Proof Verifier Contract]
        Q[Execution Router Contract]
    end

    F -- "Redirection" --> A
    F -- "Redirection" --> E
    B -- "Logic Rules" --> J
    L -- "Witness Generation" --> K
    K -- "Batch ZK Proof" --> P
    P --> Q
    Q -- "On-chain Exec" --> O
    N -- "Telemetry" --> E
```

---

## 2. ZK-Proof Generation & Verification Flow

This sequence diagram illustrates the lifecycle of a Zero-Knowledge verified operation — from rule triggering to cryptographic finality.

```mermaid
sequenceDiagram
    participant User
    participant Worker as Chronos Engine
    participant ZK as ZK Prover (Circom)
    participant DB as MongoDB
    participant Stellar as Soroban Verifier

    Note over User, Worker: Phase 1 — Rule Triggering
    Worker->>DB: Scan triggered logic rules
    Worker->>Worker: Validate external data feeds
    
    Note over Worker, ZK: Phase 2 — ZK Proof Generation
    Worker->>ZK: Generate Witness (Public Signals + Private Input)
    ZK->>ZK: Compute ZK-SNARK (snarkjs)
    ZK-->>Worker: Proof Payload (A, B, C) + Public Signals
    
    Note over Worker, Stellar: Phase 3 — On-chain Verification
    Worker->>Stellar: verify_zk_proof(proof, signals)
    Stellar-->>Worker: Verification Result (Boolean)
    
    Note over Worker, DB: Phase 4 — State Update
    alt Success
        Worker->>DB: Update Op Status: VERIFIED
        Worker->>User: Notify via WebSocket (Success)
    else Failure
        Worker->>DB: Update Op Status: FAILED
        Worker->>User: Notify via WebSocket (Invalid Proof)
    end
```

---

## 3. Governance & RBAC Model

The protocol utilizes an Identity-Based Access Control (RBAC) model to ensure specialized tooling for different ecosystem participants.

```mermaid
flowchart TD
    Wallet["Freighter Wallet Connection"] --> Identity{"Select Identity"}
    
    Identity -- "Developer" --> DevDash["Developer Portal\nAPI Keys & Webhooks"]
    Identity -- "Node Operator" --> NodeMon["Node Monitor\nTelemetry & Staking"]
    Identity -- "DAO Admin" --> GovHub["Governance Hub\nMulti-Sig & Kill Switch"]
    Identity -- "Guest" --> PubDash["Public Dashboard\nProtocol Stats"]

    subgraph SEC["Security Layer"]
        KS{{"Protocol Kill Switch"}}
        KS -- ACTIVE --> LOCK["Freeze All ZK-Proof Submissions"]
    end
    
    DevDash --> SEC
    NodeMon --> SEC
    GovHub --> SEC
```

---

## 4. Enhanced Database Schema

The MongoDB models now support profile metadata, API credentials, and ZK-specific operation fields.

```mermaid
erDiagram
    USER ||--o{ LOGIC_RULE : creates
    USER ||--o{ OPERATION : initiates
    LOGIC_RULE ||--o{ OPERATION : generates

    USER {
        string  address       PK
        string  accountType      "Developer | NodeOperator | DAOAdmin"
        string  apiKey           "ZYPH-TEST-..."
        string  name             "Profile Name"
        string  email            "Notification Email"
        boolean isDIDVerified    "ZK-Identity Verified"
    }

    LOGIC_RULE {
        string   id           PK
        string   userId       FK
        json     conditions       "Logic predicates"
        boolean  useZK            "Enable snarkjs verification"
        string   status           "active | disabled"
    }

    OPERATION {
        string   id           PK
        string   ruleId       FK
        string   status           "pending | verified | failed"
        string   proofData        "ZK-SNARK Payload"
        array    publicSignals    "ZK Public Inputs"
        string   txHash           "Stellar Finality Hash"
    }
```

---

## 5. Component Dependency Map

This diagram visualizes the interconnected nature of the Zypherion ecosystem, illustrating how data and logic flow between the client, orchestration, and settlement tiers.

```mermaid
graph TD
    subgraph Client["Client Tier (Frontend)"]
        UI[Next.js 14 UI]
        3D[3D Performance Layer]
        V_SDK[Zypherion SDK]
        WS_C[Socket.io Client]
    end

    UI -- "Aesthetics & Depth" --> 3D

    subgraph Logic["Orchestration Tier (Backend)"]
        API[Express REST API]
        AUTH[RBAC & Identity]
        CHRONOS[Chronos Worker]
        ZKP[ZK Prover — snarkjs]
    end

    subgraph Data["Persistence & State"]
        MDB[(MongoDB)]
        SIO[Socket.io Hub]
    end

    subgraph Ledger["Settlement Tier (Stellar)"]
        SOROBAN[Soroban Contracts]
        FREIGHTER[Freighter Wallet]
    end

    %% Dependencies
    UI -- "REST Calls" --> API
    UI -- "SDK Wrappers" --> V_SDK
    V_SDK -- "Transaction Signing" --> FREIGHTER
    WS_C -- "Real-time Telemetry" --> SIO
    API -- "Authentication" --> AUTH
    AUTH -- "Identity State" --> MDB
    CHRONOS -- "Rule Execution" --> MDB
    CHRONOS -- "Proof Generation" --> ZKP
    CHRONOS -- "On-chain Attestation" --> SOROBAN
    ZKP -- "Witness Input" --> ZK_CIRC["Circom Circuits"]
    SOROBAN -- "Finality" --> STELLAR["Stellar Network"]
```

---

## 6. ZK-Compilation Workflow

To maintain cryptographic sovereignty, the protocol requires a local compilation of Circom circuits. The build process transforms human-readable `.circom` logic into machine-executable `.wasm` and `.zkey` artifacts.

```mermaid
graph LR
    A[.circom Source] --> B[Circom Compiler]
    B --> C[WASM Runtime]
    B --> D[R1CS Constraints]
    E[PTAU File] & D --> F[SnarkJS Setup]
    F --> G[.zkey Final]
    G --> H[Verification Key]
```

> [!TIP]
> Use the provided `circuits/compile_zk.sh` script to automate this entire pipeline.

---

## 7. 3D Sovereign Interface Layer

The frontend utilizes a custom **3D Performance Layer** to provide an immersive administrative experience without the overhead of heavy WebGL libraries.

- **Hardware Acceleration**: Uses CSS `perspective` and `transform-style: preserve-3d` for GPU-accelerated rendering.
- **Dynamic Assets**: Rotating wireframe octahedrons and orbiting data particles that respond to system state.
- **Tactile UI**: Integrated SVG noise filters and radial gradients create a premium, high-fidelity aesthetic.

---


### Technology Stack Summary

| Layer | Core Technologies |
| :--- | :--- |
| **Frontend** | Next.js 14, Framer Motion, TailwindCSS |
| **Backend** | Node.js, Express, snarkjs, Circom 2.1 |
| **Database** | MongoDB (Persistence), Redis (Optional/Caching) |
| **Smart Contracts** | Rust (Soroban SDK), ZK-Verifier |
| **Identity** | Stellar Freighter, ZK-Identity Protocol |

___
> [!IMPORTANT]
> The ZK Prover Engine currently supports Groth16 proofs generated via Circom circuits. The **Batch Aggregator** module enables the protocol to combine multiple state transitions into a single on-chain verification, significantly reducing gas costs.
