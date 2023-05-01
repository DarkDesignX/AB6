import { Database } from "./database";
import { Bank } from "./bank/bank";
import express, { Express, Request, Response } from "express";

async function main() {
  const db = new Database();
  const bank = new Bank(db);

  const app: Express = express();
  // Remove old accounts
  await bank.removeAccounts();
  // Create new accounts
  if (bank.accounts.length === 0) {
    await bank.createAccount(1234, 2000);
    await bank.createAccount(5678, 5000);
  }
  // Show accounts
  const account1 = bank.accounts[0];
  const account2 = bank.accounts[1];

  let fromTo = [account1, account2];
  const randomTransaction = (req: Request, res: Response) => {
    const from = fromTo[0];
    const to = fromTo[1];
    bank.transaction(from.accountNumber, to.accountNumber, 1000, from.pincode);
    fromTo = [to, from];
    res.status(200).json({ account1, account2 });
  };

  app.get("/transactions", randomTransaction);

  app.listen(3000, () => {
    console.log("Server is running on port 3000");
  });
}

main();
