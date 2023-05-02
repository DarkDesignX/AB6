import { Pool } from 'mariadb';
import { BankAccount, Database } from './bank';

// Mock the MariaDB pool so we can test without connecting to a real database
jest.mock('mariadb', () => ({
  createPool: jest.fn().mockReturnValue({
    getConnection: jest.fn().mockReturnValue({
      beginTransaction: jest.fn(),
      query: jest.fn(),
      commit: jest.fn(),
      rollback: jest.fn(),
      release: jest.fn()
    }),
    end: jest.fn()
  })
}));

describe('BankAccount', () => {
  test('getAccountNumber returns account number', () => {
    const account = new BankAccount('123456789', 1000, '1234');
    expect(account.getAccountNumber()).toBe('123456789');
  });

  test('getBalance returns balance', () => {
    const account = new BankAccount('123456789', 1000, '1234');
    expect(account.getBalance()).toBe(1000);
  });

  test('setBalance updates balance', () => {
    const account = new BankAccount('123456789', 1000, '1234');
    account.setBalance(500);
    expect(account.getBalance()).toBe(500);
  });

  test('checkPin returns true if PIN is correct', () => {
    const account = new BankAccount('123456789', 1000, '1234');
    expect(account.checkPin('1234')).toBe(true);
  });

  test('checkPin returns false if PIN is incorrect', () => {
    const account = new BankAccount('123456789', 1000, '1234');
    expect(account.checkPin('5678')).toBe(false);
  });
});

describe('Database', () => {
  test('executeInTransaction executes SQL statements in a transaction', async () => {
    const db = new Database();
    const sqlStatements = ['INSERT INTO bank_accounts (account_number, balance, pin) VALUES ("123456789", 1000, "1234")'];
    await db.executeInTransaction(sqlStatements);
    const pool = new Pool();
    const connection = await pool.getConnection();
    const rows = await connection.query('SELECT * FROM bank_accounts WHERE account_number = "123456789"');
    expect(rows).toHaveLength(1);
    expect(rows[0].balance).toBe(1000);
    await connection.end();
  });

  test('getBankAccount returns BankAccount object for existing account', async () => {
    const db = new Database();
    const account = await db.getBankAccount('123456789');
    expect(account.getAccountNumber()).toBe('123456789');
    expect(account.getBalance()).toBe(1000);
    expect(account.checkPin('1234')).toBe(true);
  });

  test('getBankAccount throws error for non-existing account', async () => {
    const db = new Database();
    await expect(db.getBankAccount('987654321')).rejects.toThrow('Bank account not found');
  });
});
