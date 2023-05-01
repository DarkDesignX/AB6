import mariadb from "mariadb";
import { Pool } from "mariadb";
import { BANK_ACCOUNT_TABLE } from "./schema";

export class Database {
  // Properties
  private _pool: Pool;
  // Constructor
  constructor() {
    this._pool = mariadb.createPool({
      database: process.env.DB_NAME || "transactions",
      host: process.env.DB_HOST || "localhost",
      port: Number(process.env.DB_PORT) || 3307,
      user: process.env.DB_USER || "transactions",
      password: process.env.DB_PASSWORD || "supersecret123",
      connectionLimit: 5,
    });
    this.initializeDBSchema();
  }
  // Methods
  private initializeDBSchema = async () => {
    console.log("Initializing DB schema...");
    await this.executeSQL(BANK_ACCOUNT_TABLE);
  };

  public beginTransaction = async () => {
    try {
      const conn = await this._pool.getConnection();
      await conn.beginTransaction();
      return conn;
    } catch (err) {
      console.log(err);
    }
  };

  public commitTransaction = async (conn: mariadb.Connection) => {
    try {
      await conn.commit();
      conn.end();
    } catch (err) {
      console.log(err);
    }
  };

  public rollbackTransaction = async (conn: mariadb.Connection) => {
    try {
      await conn.rollback();
      conn.end();
    } catch (err) {
      console.log(err);
    }
  };

  public executeSQL = async (query: string) => {
    try {
      const conn = await this._pool.getConnection();
      const res = await conn.query(query);
      conn.end();
      return res;
    } catch (err) {
      console.log(err);
    }
  };
}
