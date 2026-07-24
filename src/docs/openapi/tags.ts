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
];
