Zypherion — Deployment notes (Stellar testnet)

This document contains step-by-step notes for deploying contracts to Soroban testnet, and deploying the backend and frontend.

1) Contracts
- Install Rust + cargo + soroban-cli
- Build and deploy to Stellar testnet using `soroban` tool

2) Backend
- Provide environment variables (MONGODB_URI, JWT_SECRET, SOROBAN_RPC_URL)
- Run `npm install` then `npm run dev` during development

3) Frontend
- Setup Freighter integration for testnet
- Build and deploy to Vercel or static host

### 🚀 Local Deployment with Soroban

To test Zypherion contracts locally:

1. **Install Soroban CLI**:
   ```bash
   cargo install --locked soroban-cli
   ```

2. **Run a local network**:
   ```bash
   docker run --rm -it \
     -p 8000:8000 \
     --name stellar \
     stellar/quickstart:latest \
     --local \
     --enable-soroban-rpc
   ```

3. **Deploy contracts**:
   ```bash
   cd contracts
   ./deploy.sh local
   ```

### 🌌 Stellar Testnet Deployment

1. **Configure Network**:
   ```bash
   soroban network add --rpc-url https://soroban-testnet.stellar.org:443 --network-passphrase "Test SDF Network ; September 2015" testnet
   ```

2. **Generate/Fund Account**:
   ```bash
   soroban config identity generate alice
   soroban config identity fund alice --network testnet
   ```

3. **Deploy**:
   ```bash
   ./deploy.sh testnet
   ```

(Details will be expanded as contracts and services are implemented.)