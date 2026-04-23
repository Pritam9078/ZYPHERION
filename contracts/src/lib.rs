#![no_std]
use soroban_sdk::{contract, contractimpl, symbol_short, vec, Env, Symbol, Vec, Address, String, log, Map};

#[contract]
pub struct LogicRegistry;

#[contractimpl]
impl LogicRegistry {
    pub fn init(env: Env, admin: Address) {
        admin.require_auth();
        if env.storage().instance().has(&symbol_short!("admin")) {
            panic!("already initialized");
        }
        env.storage().instance().set(&symbol_short!("admin"), &admin);
    }

    // Stores rules: Map<Address, Vec<String>> where key is creator
    pub fn add_rule(env: Env, creator: Address, name: String) -> u32 {
        creator.require_auth();
        
        let mut count: u32 = env.storage().instance().get(&symbol_short!("count")).unwrap_or(0);
        count += 1;
        env.storage().instance().set(&symbol_short!("count"), &count);
        
        // Emit event for indexing
        env.events().publish((symbol_short!("LOGIC"), symbol_short!("ADD")), (creator, count, name));
        
        count
    }

    pub fn toggle_rule(env: Env, admin: Address, rule_id: u32, active: bool) {
        admin.require_auth();
        
        let stored_admin: Address = env.storage().instance().get(&symbol_short!("admin")).unwrap();
        if admin != stored_admin {
            panic!("Unauthorized: Caller is not the protocol administrator");
        }
        
        env.events().publish((symbol_short!("LOGIC"), symbol_short!("TOGGLE")), (rule_id, active));
    }
}

#[contract]
pub struct ProofVerifier;

#[contractimpl]
impl ProofVerifier {
    pub fn verify_proof(env: Env, proposer: Address, proof_hash: Symbol, oracle_pubkey: soroban_sdk::BytesN<32>, signature: soroban_sdk::Bytes) -> bool {
        proposer.require_auth();
        
        // Convert the proof hash (Symbol) into bytes for verification
        let mut msg_bytes = soroban_sdk::Bytes::new(&env);
        // In a real implementation, we would serialize the proof_hash properly.
        // For demonstration, we assume the oracle signs a generic message to approve the proof.
        
        // Cryptographically verify the Oracle's signature using Ed25519
        // If the signature is invalid, this will panic and fail the transaction.
        env.crypto().ed25519_verify(&oracle_pubkey, &msg_bytes, &signature);
        
        env.events().publish((symbol_short!("PROOF"), symbol_short!("VERIFY")), (proposer, proof_hash));
        true
    }
}

#[contract]
pub struct ExecutionRouter;

#[contractimpl]
impl ExecutionRouter {
    pub fn execute_action(env: Env, executor: Address, proof_id: Symbol, action_data: String) -> Symbol {
        executor.require_auth();
        
        // Logic to trigger external effects or on-chain state changes
        env.events().publish((symbol_short!("ROUTER"), symbol_short!("EXEC")), (executor, proof_id, action_data));
        
        symbol_short!("EXECUTED")
    }
}
