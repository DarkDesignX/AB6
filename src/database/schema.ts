const BANK_ACCOUNT_TABLE = `
CREATE TABLE IF NOT EXISTS bank_accounts (
    accountNumber INT NOT NULL AUTO_INCREMENT,
    balance INT NOT NULL DEFAULT 0,
    pincode INT NOT NULL,
    PRIMARY KEY (accountNumber)
);
`;

export { BANK_ACCOUNT_TABLE };
