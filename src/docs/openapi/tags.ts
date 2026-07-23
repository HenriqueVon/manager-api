export type OpenApiTag = {
  name: string;
  description?: string;
};

export const openApiTags: OpenApiTag[] = [
  {
    name        : 'Ledgers',
    description : 'Groups of accounts to manage financial transactions and balances.',
  },
];
