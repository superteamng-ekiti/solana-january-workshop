import {
  Keypair,
  Transaction,
  SystemProgram,
  sendAndConfirmTransaction,
  Connection,
  clusterApiUrl,
  LAMPORTS_PER_SOL,
  PublicKey
} from "@solana/web3.js";
import {
  createMint,
  getAccount,
  getMint,
  getOrCreateAssociatedTokenAccount,
  mintTo
} from "@solana/spl-token";
import bs58 from "bs58";
import { decrypt, encrypt } from "./utils/encryption.js";
import { fromLamport, toLamport } from "./utils/lamports.js";

const log = console.log;
const JSON_RPC = "https://api.devnet.solana.com";

const createWallet = () => {
  let keypair = Keypair.generate();

  let pub_key = keypair.publicKey.toBase58();
  let priv_key = keypair.secretKey;
  // log(keypair);

  let stringed_version = bs58.encode(priv_key);

  return {
    wallet_address: pub_key,
    stringed_version: encrypt(stringed_version)
  };
};

const importWallet = (privateKey) => {
  let private_key_array = bs58.decode(privateKey);

  const keyPair = Keypair.fromSecretKey(private_key_array);
  const public_Key = keyPair.publicKey.toBase58();

  return public_Key;
};

const transferSoL = async (to_address, secret_key, amount) => {
  let connection = new Connection(JSON_RPC);

  let recepient_byte_array = to_address;

  let sender_byte_array = bs58.decode(secret_key); // converts secret key (base58 string) into an Array Uint8Array .. of length 64

  let keyPair = Keypair.fromSecretKey(sender_byte_array); // imports the user's wallet as a KeyPair object
  let sender_pub_key = keyPair.publicKey; // extracting the sender's public key

  let transaction = new Transaction(); // creating a transaction builder object

  transaction.add(
    SystemProgram.transfer({
      fromPubkey: sender_pub_key,
      toPubkey: recepient_byte_array,
      lamports: toLamport(amount)
    })
  ); // building the transaction

  log("===== sending transaction =======");

  let tx = await sendAndConfirmTransaction(connection, transaction, [keyPair]);

  log("===== finished tx =======");
  return tx;
};

const querySolBalance = async (wallet_address) => {
  const connection = new Connection(JSON_RPC);

  let public_Key = new PublicKey(wallet_address);

  let balance = await connection.getBalance(public_Key);
  log("======");
  log(balance);

  return fromLamport(balance);
};
const deploySPLToken = async (secret_key) => {
  const connection = new Connection(JSON_RPC, "confirmed");
  const wallet_array = bs58.decode(secret_key);
  const payer = Keypair.fromSecretKey(wallet_array);
  // log(payer);

  let mint = await createMint(
    connection,
    payer,
    payer.publicKey,
    payer.publicKey,
    9 // We are using 9 to match the CLI decimal default exactly
  );

  let mintt = mint.toBase58();
  log("mint address");
  log(mintt);

  const mintInfo = await getMint(connection, mint);
  log("mint supply");
  log(mintInfo.supply);

  const tokenAccount = await getOrCreateAssociatedTokenAccount(
    connection,
    payer,
    mint,
    payer.publicKey
  );

  log(
    "associated account for newly minted token: ",
    tokenAccount.address.toBase58()
  );

  const tokenAccountInfo = await getAccount(connection, tokenAccount.address);

  log("associated account balance: ", tokenAccountInfo.amount);

  await mintTo(
    connection,
    payer,
    mint,
    tokenAccount.address,
    payer,
    100_000_000_000 // because decimals for the mint are set to 9
  );

  return "hello";
};

log(
  await deploySPLToken(
    "5GGFQkQhoDtrRqdqrd4EdYkoAPPZDZSr9eR1SGSoHFb4gbjnLUYbb8mRpJNrHMNcrFKuZ6oLKyRNpNS9e55wkuXB"
  )
);

// log(await querySolBalance("BPcJb1e3SSzNQBKQeSitN6juGCLCk4UhaaGd8GhsLN5"));

// log(
//   await transferSoL(
//     "BPcJb1e3SSzNQBKQeSitN6juGCLCk4UhaaGd8GhsLN5",
//     "5GGFQkQhoDtrRqdqrd4EdYkoAPPZDZSr9eR1SGSoHFb4gbjnLUYbb8mRpJNrHMNcrFKuZ6oLKyRNpNS9e55wkuXB",
//     0.002
//   )
// );

// "EXPLSnK25KiSXMGDaK4JQr5DCamUSHGBP11bwXhse5rm",
// log(createWallet());
// log(
//   importWallet(
//     "5GGFQkQhoDtrRqdqrd4EdYkoAPPZDZSr9eR1SGSoHFb4gbjnLUYbb8mRpJNrHMNcrFKuZ6oLKyRNpNS9e55wkuXB"
//   )
// );

// 2 ** 8 - 1;
