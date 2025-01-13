import {
  Keypair,
  Transaction,
  SystemProgram,
  sendAndConfirmTransaction,
  Connection,
  clusterApiUrl
} from "@solana/web3.js";
import bs58 from "bs58";
import { decrypt, encrypt } from "./utils/encryption.js";
import { toLamport } from "./utils/lamports.js";

const log = console.log;

const createWallet = () => {
  let keypair = Keypair.generate();

  let pub_key = keypair.publicKey.toBase58();
  let priv_key = keypair.secretKey;

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
  let connection = new Connection(clusterApiUrl("testnet"));

  let recepient_byte_array = bs58.decode(to_address);
  log(recepient_byte_array);
  let sender_byte_array = bs58.decode(secret_key);
  log(sender_byte_array);
  let keyPair = Keypair.fromSecretKey(sender_byte_array);

  let sender_pub_key = sender_byte_array.slice(32);
  log(sender_pub_key);

  // let fromKeypair = Keypair.generate();

  // let toKeypair = Keypair.generate();
  let transaction = new Transaction();

  transaction.add(
    SystemProgram.transfer({
      fromPubkey: sender_pub_key,
      toPubkey: recepient_byte_array,
      lamports: toLamport(amount)
    })
  );

  let tx = await sendAndConfirmTransaction(connection, transaction, [keyPair]);
  log(tx);
};

log(
  await transferSoL(
    "DEP26TD3mDDH9NYaHkQgALeYfgPQuF2W5CRL6L35tZNv",
    "5GGFQkQhoDtrRqdqrd4EdYkoAPPZDZSr9eR1SGSoHFb4gbjnLUYbb8mRpJNrHMNcrFKuZ6oLKyRNpNS9e55wkuXB",
    0.002
  )
);

// "EXPLSnK25KiSXMGDaK4JQr5DCamUSHGBP11bwXhse5rm",
// log(createWallet());
// log(
//   importWallet(
//     "5GGFQkQhoDtrRqdqrd4EdYkoAPPZDZSr9eR1SGSoHFb4gbjnLUYbb8mRpJNrHMNcrFKuZ6oLKyRNpNS9e55wkuXB"
//   )
// );

// 2 ** 8 - 1;
