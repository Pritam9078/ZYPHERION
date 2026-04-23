#!/bin/bash

# Zypherion ZK-Setup Script
# This script compiles the Circom circuits and performs a mock trusted setup for local testing.

CIRCUIT_NAME="logic_evaluator"
BUILD_DIR="./build"
PTAU_PATH="./build/powersOfTau28_hez_final_12.ptau"

mkdir -p $BUILD_DIR

echo "[Zypherion-ZK] Compiling circuit: $CIRCUIT_NAME.circom..."
circom ${CIRCUIT_NAME}.circom --wasm --r1cs --out $BUILD_DIR

# Check if PTAU exists, if not download a small one (mocked here for the script)
if [ ! -f "$PTAU_PATH" ]; then
    echo "[Zypherion-ZK] Powers of Tau file missing. In a production setup, download a trusted PTAU file."
    # For now, we assume the user has it or we simulate the next steps.
    exit 1
fi

echo "[Zypherion-ZK] Generating ZKey..."
snarkjs groth16 setup $BUILD_DIR/${CIRCUIT_NAME}.r1cs $PTAU_PATH $BUILD_DIR/${CIRCUIT_NAME}_final.zkey

echo "[Zypherion-ZK] Exporting verification key..."
snarkjs zkey export verificationkey $BUILD_DIR/${CIRCUIT_NAME}_final.zkey $BUILD_DIR/verification_key.json

echo "[Zypherion-ZK] Compilation complete. Build artifacts are in $BUILD_DIR"
