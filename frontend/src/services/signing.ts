import freighter from '@stellar/freighter-api';
const { signMessage } = freighter;

/**
 * Prepares and signs a structured action request with Freighter.
 * @param address - User's wallet address
 * @param action - the action name (e.g. 'CREATE_RULE')
 * @param metadata - additional strings to include in the message for clarity
 */
export const signActionRequest = async (
  address: string,
  action: string,
  metadata: string = ''
) => {
  const nonce = Math.random().toString(36).substring(2) + Date.now().toString(36);
  const timestamp = Math.floor(Date.now() / 1000);
  
  const message = `Zypherion Protocol Action Request\n\nAction: ${action}\nWallet: ${address}\nTimestamp: ${timestamp}\nNonce: ${nonce}\n${metadata}`.trim();

  try {
     const signedResult = await signMessage(message);
     if (!signedResult) throw new Error("Signing declined or failed.");

     const signature = typeof signedResult === 'string' ? signedResult : (signedResult as any)?.signedMessage;

     return {
       message,
       signature,
       nonce
     };
  } catch (err) {
    console.error('[SigningService] Error:', err);
    throw err;
  }
};
