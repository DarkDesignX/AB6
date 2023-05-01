export interface IBankAccount {
  deposit(amount: number): void;
  widthdraw(amount: number, pincode: number): void;
  getBalance(pincode: number): number | undefined;
  accountNumber: number;
  pincode: number;
  balance: number;
}

export class BankAccount {
  private _balance: number;
  private _accountNumber: number;
  private _pincode: number;

  constructor(accountNumber: number, pincode: number, balance: number) {
    this._accountNumber = accountNumber;
    this._pincode = pincode;
    this._balance = balance;
  }

  public deposit(amount: number): void {
    if (amount < 0) throw new Error("Cannot deposit negative amount");
    this._balance += amount;
  }

  public widthdraw(amount: number, pincode: number): void {
    if (pincode !== this._pincode) return;
    if (amount < 0) throw new Error("Cannot widthdraw negative amount");
    if (amount > this._balance) throw new Error("Insufficient funds");
    this._balance -= amount;
  }

  public getBalance(pincode: number): number | undefined {
    if (pincode !== this._pincode) throw new Error("Invalid pincode");
    return this._balance;
  }

  public get accountNumber(): number {
    return this._accountNumber;
  }

  public get pincode(): number {
    return this._pincode;
  }

  public get balance(): number {
    return this._balance;
  }
}
