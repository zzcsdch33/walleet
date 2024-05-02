import web3 from '@solana/web3.js'
import { TOKEN_PROGRAM_ID } from '@solana/spl-token';
import {decode} from 'base58-universal';
import readline from 'readline';

async function fetchTokenHoldings(walletAddress) {
    const connection = new web3.Connection(web3.clusterApiUrl('mainnet-beta'), 'confirmed');

    // Decode the base58 wallet address
    const walletBytes = decode(walletAddress);
    // Ensure the byte length is correct
    if (walletBytes.length !== 32) {
        throw new Error("Invalid wallet address length.");
    }
    const walletPubkey = new web3.PublicKey(walletBytes);

    // Fetch all token accounts by owner
    const tokenAccounts = await connection.getParsedTokenAccountsByOwner(walletPubkey, {
        programId: TOKEN_PROGRAM_ID
    });

    // Display token information
    const tokens = tokenAccounts.value.map(account => {
        const { pubkey, account: { data: { parsed: { info }}} } = account;
        return {
            publicKey: pubkey.toBase58(),
            mintAddress: info.mint,
            tokenBalance: info.tokenAmount.uiAmount,
            owner: info.owner,
            lamports: account.account.lamports
        };
    });

    console.log(tokens);
    return tokens;
}

async function main() {
    const r1 = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    });

    r1.question("Enter a wallet address to fetch tokens: ", async (walletAddress) => {
        try {
            const tokens = await fetchTokenHoldings(walletAddress);
            if (tokens.length > 0) {
                console.log("Token holdings fetched successfully.");
            } else {
                console.log("No tokens found.");
            }
        } catch (e) {
            console.error('Error fetching tokens:', e.message);
        } finally {
            r1.close();
        }
    });
}


main();

