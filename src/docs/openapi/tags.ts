export type OpenApiTag = {
  name: string;
  description?: string;
};

export const openApiTags: OpenApiTag[] = [
  {
    name        : 'Ledgers',
    description : 'Groups of accounts to manage financial transactions and balances.',
  },
  {
    name        : 'Financial Currencies',
    description : 'A list of financial currencies used in the system, including their names and symbols.',
  },  
  {
    name        : 'Financial Descriptions',
    description : 'A list of financial descriptions used in the system.',
  },
  {
    name        : 'Financial Payment Methods',
    description : 'A list of financial payment methods. Examples: Cash, Credit Card, Debit Card, Pix, etc.',
  },
  {
    name        : 'Financial Bank Accounts',
    description : 'A list of financial bank accounts. Examples: Revolut, Novo Banco, Nubank, Itaú etc.',
  },
  {
    name        : 'Financial Funds',
    description : 'A list of financial funds. Examples: Basic expenses, emergency fund, vacation fund etc.',
  },
  {
    name        : 'Financial Categories',
    description : 'A list of expenses or incomes categories. Examples: Supermarket, Water, Electricity etc.',
  },
  {
    name        : 'Financial Entries',
    description : 'A list of financial entries payable or receivable. Examples: Rent, Water, Electricity etc.',
  },  
  {
    name        : 'Financial Fund Transactions',
    description : 'A list of financial fund transactions. Examples: Rent, Water, Electricity etc.',
  },
];
