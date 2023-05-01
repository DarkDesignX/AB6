import { BankAccount, IBankAccount } from ".";
import { Database } from "../database";

export class Bank {
  private _database: Database;
  private _accounts: BankAccount[];

  constructor(database: Database) {
    this._database = database;
    this._accounts = [];
  }

  public async loadAccounts(): Promise<void> {
    const rows = await this._database.executeSQL(
      "SELECT * FROM bank_accounts;"
    );
    this._accounts = rows.map(
      (row: IBankAccount) =>
        new BankAccount(row.accountNumber, row.pincode, row.balance)
    );
  }

  public async createAccount(pincode: number, balance: number): Promise<void> {
    const { insertId } = await this._database.executeSQL(
      `INSERT INTO bank_accounts (pincode, balance) VALUES (${pincode}, ${balance});`
    );
    const account = new BankAccount(Number(insertId), pincode, balance);
    this._accounts.push(account);
  }

  public showAccounts(): void {
    this._accounts.forEach((account) => {
      console.log(account);
    });
  }

  public transaction = async (
    accountNumberFrom: number,
    accountNumberTo: number,
    amount: number,
    pincode: number
  ): Promise<void> => {
    const conn = await this._database.beginTransaction();
    if (!conn) {
      console.log("Could not start transaction");
      return;
    }
    try {
      const bankAccountFromIndex = this._accounts.findIndex(
        (account) => account.accountNumber === accountNumberFrom
      );
      const bankAccountToIndex = this._accounts.findIndex(
        (account) => account.accountNumber === accountNumberTo
      );
      if (bankAccountFromIndex === -1 || bankAccountToIndex === -1) {
        throw new Error("Account not found");
      }
      const bankAccountFrom = this._accounts[bankAccountFromIndex];
      const bankAccountTo = this._accounts[bankAccountToIndex];
      bankAccountFrom.widthdraw(amount, pincode);
      bankAccountTo.deposit(amount);
      await conn.query(
        `UPDATE bank_accounts SET balance = ${bankAccountFrom.balance} WHERE accountNumber = ${bankAccountFrom.accountNumber};`
      );
      await conn.query(
        `UPDATE bank_accounts SET balance = ${bankAccountTo.balance} WHERE accountNumber = ${bankAccountTo.accountNumber};`
      );
      await this._database.commitTransaction(conn);
      console.log("Transaction successful");
    } catch (err) {
      await this._database.rollbackTransaction(conn);
      console.log(err);
    }
  };

  public get accounts(): BankAccount[] {
    return this._accounts;
  }

  public removeAccounts(): void {
    this._database.executeSQL("DELETE FROM bank_accounts;");
    this._accounts = [];
  }
}
