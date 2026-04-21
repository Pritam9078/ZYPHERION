import { ZypherionSDK } from '../sdk/src/index';
import nacl from 'tweetnacl';
import bs58 from 'bs58';

async function main() {
  console.log("🚀 Starting Zypherion SDK Demo");

  // Generate a random keypair for this script
  const keyPair = nacl.sign.keyPair();
  const secretKey = bs58.encode(keyPair.secretKey);
  const publicKey = bs58.encode(keyPair.publicKey);

  console.log(`🔑 Initialized Wallet: ${publicKey}`);

  // 1. Initialize SDK
  const sdk = new ZypherionSDK({
    network: 'sandbox', // Connects to localhost:5001
    secretKey: secretKey
  });

  try {
    // 2. Authenticate
    console.log("⏳ Authenticating...");
    const token = await sdk.auth.authenticate();
    sdk.setToken(token);
    console.log("✅ Authentication successful");

    // 3. Register Webhook
    console.log("⏳ Registering Webhook...");
    await sdk.events.registerWebhook('https://my-app.com/webhook', ['EXECUTION_COMPLETED']);
    console.log("✅ Webhook registered");

    // 4. Create Rule
    console.log("⏳ Deploying Rule...");
    const rule = await sdk.rules.create(
      "Demo SDK Rule", 
      "balance > 100", 
      "releaseFunds"
    );
    console.log("✅ Rule deployed:", rule);

    // 5. Generate Proof
    console.log("⏳ Generating Proof...");
    const proof = await sdk.proofs.generate(rule._id);
    console.log("✅ Proof generated:", proof);

    // 6. Connect to WebSocket Events
    console.log("⏳ Connecting to event stream...");
    sdk.events.connect(publicKey);
    sdk.events.on('join_protocol', (data: any) => {
      console.log('📡 Realtime Event received:', data);
    });

  } catch (err: any) {
    console.error("❌ SDK Error:", err.response?.data || err.message);
  }
}

main();
