#![no_std]
use soroban_sdk::{contract, contractimpl, symbol_short, Env, Symbol, Address, String};

#[contract]
pub struct LogicRegistry;

#[contractimpl]
impl LogicRegistry {
    pub fn add_rule(env: Env, creator: Address, name: String) -> u32 {
        creator.require_auth();
        
        let mut count: u32 = env.storage().instance().get(&symbol_short!("count")).unwrap_or(0);
        count += 1;
        env.storage().instance().set(&symbol_short!("count"), &count);
        
        env.events().publish((symbol_short!("LOGIC"), symbol_short!("ADD")), (creator, count, name));
        
        count
    }

    pub fn toggle_rule(env: Env, admin: Address, rule_id: u32, active: bool) {
        admin.require_auth();
        env.events().publish((symbol_short!("LOGIC"), symbol_short!("TOGGLE")), (rule_id, active));
    }
}
