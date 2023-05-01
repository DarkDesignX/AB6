import { BankAccount } from "./bank-account";

let bankAccount: BankAccount;

describe("Test BankAccount", () => {
  beforeEach(() => {
    bankAccount = new BankAccount(1, 1234, 2000);
  });
  it("Widthdraw Normal", () => {
    bankAccount.widthdraw(1000, 1234);
    expect(bankAccount.balance).toBe(1000);
  });
  it("Widthdraw Wrong Pincode", () => {
    try {
      bankAccount.widthdraw(1000, 4321);
    } catch (error: any) {
      expect(error.message).toBe("Wrong pincode");
    }
    expect(bankAccount.balance).toBe(2000);
  });
  it("Widthdraw Too Much", () => {
    try {
      bankAccount.widthdraw(3000, 1234);
    } catch (error: any) {
      expect(error.message).toBe("Insufficient funds");
    }
    expect(bankAccount.balance).toBe(2000);
  });
});
