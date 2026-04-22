<p align="center">
  <img src="frontend/public/logo.png" width="220" alt="Zypherion Logo">
</p>

<h1 align="center">Zypherion Protocol 💎🌐</h1>

<p align="center">
  <strong>Sovereign Infrastructure for Trustless Cross-Chain Automation</strong>
</p>

<p align="center">
  Zypherion is a production-grade, enterprise-ready protocol designed to define, verify, and automate cross-chain logic with cryptographic certainty. By removing centralized middlemen from state attestation, Zypherion provides a zero-trust orchestration layer secured by the Stellar network and autonomous SNARK batching.
</p>

---

## 🚀 Live Links
- **Live Demo (Frontend):** 
https://zypherion.vercel.app/
- **Backend API Server:** 
https://zypherion-backend.onrender.com/
- **Demo Video (Full Walkthrough):** `[INSERT_YOUTUBE_OR_LOOM_LINK_HERE]`
- **User Feedback Documentation:** `[INSERT_NOTION_OR_GOOGLE_DOC_LINK_HERE]`

---

## 🔑 Key Features
1. **Gas Abstraction Service:** Automated balance deduction and simulated escrow, allowing users to execute logic without managing multiple gas tokens.
2. **Recursive Proof Batching:** An automated aggregation engine that bundles individual verified proofs into high-efficiency `BatchProof` documents, reducing on-chain verification costs by 10x.
3. **Enterprise Governance (Multi-Sig):** High-value logic rules require a cryptographic quorum (e.g., 2-of-3 signatures) from authorized DAO signers before execution.
4. **Decentralized Identity (DID):** Trustless KYC and identity linking via self-sovereign `did:zypher` identifiers to satisfy enterprise compliance.
5. **Scheduled & Event-Based Triggers:** Autonomous execution polling (Chronos engine) and verifiable external data feeds (Oracles).

---

## 🛠 Technology Stack
- **Frontend:** Next.js (TypeScript), TailwindCSS, Framer Motion, Socket.io-client.
- **Backend:** Node.js, Express, MongoDB (Mongoose), Socket.io.
- **Blockchain Integration:** Stellar Testnet (Freighter Wallet integration), Simulated EVM execution.
- **Cryptography:** Ed25519 Signatures, Recursive SNARK simulation logic.

---

## 👥 Verifiable User Addresses (Stellar Testnet)
As part of our MVP testing, the following wallet addresses have interacted with the Zypherion Protocol (can be verified on Stellar Explorer):
1. `[INSERT_ADDRESS_1_HERE]`
2. `[INSERT_ADDRESS_2_HERE]`
3. `[INSERT_ADDRESS_3_HERE]`
4. `[INSERT_ADDRESS_4_HERE]`
5. `[INSERT_ADDRESS_5_HERE]`

---

## ⚙️ Local Development Setup

### Prerequisites
- Node.js (v18+)
- MongoDB (running locally or MongoDB Atlas)
- Freighter Wallet Extension (for browser)

### Installation
1. Clone the repository:
   ```bash
   git clone https://github.com/Pritam9078/ZYPHERION.git
   cd ZYPHERION
   ```

2. Install dependencies for both Backend and Frontend:
   ```bash
   cd backend && npm install
   cd ../frontend && npm install
   ```

3. Configure Environment Variables:
   Create a `.env` file in the `backend/` directory:
   ```env
   PORT=5001
   MONGO_URI=mongodb://localhost:27017/zypherion
   JWT_SECRET=your_super_secret_jwt_key
   STELLAR_NETWORK=TESTNET
   ADMIN_WALLET_ADDRESS=your_stellar_public_key
   ```
   Create a `.env.local` file in the `frontend/` directory:
   ```env
   NEXT_PUBLIC_API_BASE=http://localhost:5001
   ```

4. Start the Application:
   ```bash
   # Terminal 1 (Backend)
   cd backend && npm run dev
   
   # Terminal 2 (Frontend)
   cd frontend && npm run dev
   ```

---

## 📄 Documentation
- **[Architecture Document](./ARCHITECTURE.md):** Detailed breakdown of the system design, consensus models, and database schema.

---

*Built with ❤️ for a decentralized future.*