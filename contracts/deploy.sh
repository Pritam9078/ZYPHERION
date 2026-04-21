#!/bin/bash

# Zypherion Soroban Deployment Script (3-Contract Architecture)
set -e

NETWORK="testnet"
RPC_URL="https://soroban-testnet.stellar.org"

echo "🚀 Starting Zypherion Triple Deployment to $NETWORK..."

# 1. Identity & Funding
if ! stellar keys address deployer > /dev/null 2>&1; then
    stellar keys generate deployer --network $NETWORK
fi
echo "Funding deployer account..."
curl -s "https://friendbot.stellar.org/?addr=$(stellar keys address deployer)" > /dev/null
echo "✅ Account ready."

# 2. Build Workspace
echo "Building Workspace WASM binaries..."
cargo build --target wasm32-unknown-unknown --release

# Paths
LOGIC_WASM="target/wasm32-unknown-unknown/release/zypherion_logic_registry.wasm"
PROOF_WASM="target/wasm32-unknown-unknown/release/zypherion_proof_verifier.wasm"
EXEC_WASM="target/wasm32-unknown-unknown/release/zypherion_execution_router.wasm"

# 3. Deploy logic_registry
echo "Deploying LogicRegistry..."
LOGIC_ID=$(stellar contract deploy --wasm $LOGIC_WASM --source deployer --network $NETWORK)
echo "✅ LogicRegistry ID: $LOGIC_ID"

# 4. Deploy proof_verifier
echo "Deploying ProofVerifier..."
PROOF_ID=$(stellar contract deploy --wasm $PROOF_WASM --source deployer --network $NETWORK)
echo "✅ ProofVerifier ID: $PROOF_ID"

# 5. Deploy execution_router
echo "Deploying ExecutionRouter..."
EXEC_ID=$(stellar contract deploy --wasm $EXEC_WASM --source deployer --network $NETWORK)
echo "✅ ExecutionRouter ID: $EXEC_ID"

# 6. Save deployment info
mkdir -p ../deployment
echo "{\"logicRegistryId\": \"$LOGIC_ID\", \"proofVerifierId\": \"$PROOF_ID\", \"executionRouterId\": \"$EXEC_ID\", \"network\": \"$NETWORK\", \"rpc\": \"$RPC_URL\"}" > ../deployment/contract_ids.json

echo "🎉 Deployment successful! Contract IDs saved to deployment/contract_ids.json"
