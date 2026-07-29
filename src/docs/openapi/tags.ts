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
    description : 'A list of financial payment methods. Examples: CASH, CREDIT CARD, DEBIT CARD, PIX, etc.',
  },
  {
    name        : 'Financial Bank Accounts',
    description : 'A list of financial bank accounts. Examples: REVOLUT, NOVO BANCO, NUBANK, ITAÚ etc.',
  },
  {
    name        : 'Financial Funds',
    description : 'A list of financial funds. Examples: BASIC EXPENSES, EMERGENCY FUND, VACATION FUND etc.',
  },
];
