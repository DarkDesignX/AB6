import * as mariadb from 'mariadb';
import { Pool, PoolConnection } from 'mariadb';
import express from 'express';

class BankAccount {
  private accountNumber: string;
  private balance: number;
  private pin: string;

  constructor(accountNumber: string, balance: number, pin: string) {
    this.accountNumber = accountNumber;
    this.balance = balance;
    this.pin = pin;
  }

  getAccountNumber() {
    return this.accountNumber;
  }

  getBalance() {
    return this.balance;
  }

  setBalance(balance: number) {
    this.balance = balance;
  }

  checkPin(pin: string) {
    return this.pin === pin;
  }
}

class Database {
  private pool: Pool;

  constructor() {
    this.pool = mariadb.createPool({
        database: 'bank',
        host: 'localhost',
        user: 'root',
        password: 'supersecret123'
    });
    console.log('Database connected');
  }

  async executeInTransaction(sqlStatements: string[]) {
    let connection: PoolConnection | undefined;
    try {
      connection = await this.pool.getConnection();
      await connection.beginTransaction();
      for (let i = 0; i < sqlStatements.length; i++) {
        await connection.query(sqlStatements[i]);
      }
      await connection.commit();
    } catch (err) {
      if (connection) {
        await connection.rollback();
      }
      throw err;
    } finally {
      if (connection) {
        connection.release();
      }
    }
  }

  async getBankAccount(accountNumber: string) {
    let connection: PoolConnection | undefined;
    try {
      connection = await this.pool.getConnection();
      const sql = `SELECT * FROM bank_accounts WHERE account_number = '${accountNumber}'`;
      const rows = await connection.query(sql);
      if (!rows || rows.length === 0) {
        throw new Error('Bank account not found');
      }
      const accountData = rows[0];
      return new BankAccount(accountData.account_number, accountData.balance, accountData.pin);
    } catch (err) {
      throw err;
    } finally {
      if (connection) {
        connection.release();
      }
    }
  }

  async updateBankAccountBalance(accountNumber: string, newBalance: number) {
    let connection: PoolConnection | undefined;
    try {
      connection = await this.pool.getConnection();
      const sql = `UPDATE bank_accounts SET balance = ${newBalance} WHERE account_number = '${accountNumber}'`;
      await connection.query(sql);
    } catch (err) {
      throw err;
    } finally {
      if (connection) {
        connection.release();
      }
    }
  }
}

async function transferMoney(senderAccountNumber: string, senderPin: string, receiverAccountNumber: string, amount: number) {
  const db = new Database();
  const senderAccount = await db.getBankAccount(senderAccountNumber);
  const receiverAccount = await db.getBankAccount(receiverAccountNumber);

  if (!senderAccount.checkPin(senderPin)) {
    throw new Error('Invalid PIN');
  }

  if (amount > senderAccount.getBalance()) {
    throw new Error('Insufficient funds');
  }

  if (amount <= 0) {
    throw new Error('Invalid amount');
  }

  const sqlStatements = [
    `UPDATE bank_accounts SET balance = balance - ${amount} WHERE account_number = '${senderAccountNumber}'`,
    `UPDATE bank_accounts SET balance
      = balance + ${amount} WHERE account_number = '${receiverAccountNumber}'`
  ];
  await db.executeInTransaction(sqlStatements);
}
