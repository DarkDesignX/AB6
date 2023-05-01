import { Database } from "./database";
import { Bank } from "./bank/bank";

async function main() {
  const db = new Database();
  const bank = new Bank(db);
  await bank.loadAccounts();
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
  console.log("Initial accounts");
  await bank.showAccounts();
  // Do transaction
  await bank.transaction(
    account1.accountNumber,
    account2.accountNumber,
    1000,
    1234
  );
  console.log("After Successfull Transaction");
  await bank.showAccounts();
  // Do transaction (error due to insufficient funds)
  await bank.transaction(
    account1.accountNumber,
    account2.accountNumber,
    1500,
    1234
  );
  console.log("After Failed Transaction");
  await bank.showAccounts();
  // Do transaction with negative amount (error)
  await bank.transaction(
    account1.accountNumber,
    account2.accountNumber,
    -1000,
    1234
  );
  console.log("After Failed Transaction");
  await bank.showAccounts();
  // Do transaction with wrong pincode (error)
  await bank.transaction(account1.accountNumber, 0, 1000, 1234);
  console.log("After Failed Transaction");
  await bank.showAccounts();
  // Load accounts from database
  await bank.loadAccounts();
  console.log("After loading accounts from database");
  await bank.showAccounts();
}

main();
