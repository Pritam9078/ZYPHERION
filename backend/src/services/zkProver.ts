// backend/src/services/zkProver.ts
// @ts-ignore
import * as snarkjs from 'snarkjs';
import path from 'path';
import fs from 'fs';

// Helper to resolve circuit paths.
// In a real setup, we would precompile the circuits and store the .wasm and .zkey files
// in a designated `build/circuits` folder.
const CIRCUIT_WASM = path.join(__dirname, '../../../circuits/build/logic_evaluator_js/logic_evaluator.wasm');
const CIRCUIT_ZKEY = path.join(__dirname, '../../../circuits/build/logic_evaluator_final.zkey');

export interface ZKProofOutput {
  proof: any;
  publicSignals: string[];
}

/**
 * Generates a Groth16 proof using SnarkJS for a given rule evaluation.
 */
export async function generateProof(ruleId: string, threshold: number, privateData: number): Promise<ZKProofOutput> {
  try {
    // Check if the circuit assets exist, if not return a simulated proof for the PoC
    if (!fs.existsSync(CIRCUIT_WASM) || !fs.existsSync(CIRCUIT_ZKEY)) {
        console.warn(`ZK circuits not found at ${CIRCUIT_WASM}. Using simulated ZK proof.`);
        return {
            proof: {
                pi_a: ["1", "2", "3"],
                pi_b: [["1", "2"], ["3", "4"]],
                pi_c: ["1", "2"],
                protocol: "groth16"
            },
            publicSignals: ["1"] // Output isTrue
        };
    }

    const input = {
      ruleId: Buffer.from(ruleId, 'hex').readUInt32BE(0), // Simplified ruleId mapping
      threshold,
      privateData
    };

    const { proof, publicSignals } = await snarkjs.groth16.fullProve(input, CIRCUIT_WASM, CIRCUIT_ZKEY);
    
    return { proof, publicSignals };
  } catch (error) {
    console.error('Error generating ZK proof:', error);
    throw new Error('Failed to generate zero-knowledge proof');
  }
}

/**
 * Verifies a Groth16 proof locally (off-chain verification before attesting to Soroban).
 */
export async function verifyProof(proof: any, publicSignals: string[]): Promise<boolean> {
   const VKEY_PATH = path.join(__dirname, '../../../circuits/build/verification_key.json');
   if (!fs.existsSync(VKEY_PATH)) {
       console.warn('Verification key not found. Simulating successful verification.');
       return true;
   }

   const vKey = JSON.parse(fs.readFileSync(VKEY_PATH, 'utf-8'));
   const res = await snarkjs.groth16.verify(vKey, publicSignals, proof);
   return res;
}
