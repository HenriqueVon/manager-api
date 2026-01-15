import globals from 'globals';
import pluginJs from '@eslint/js';
import tseslint from 'typescript-eslint';


/** @type {import('eslint').Linter.Config[]} */
export default [
  {
    ignores: [
      '.build',
      '.serverless',
      '**/_prisma/generated/**'
    ]
  },
  {
    files           : ['**/*.{js,mjs,cjs,ts}'],
    languageOptions : {
      globals: {
        ...globals.node,
        _cache: 'readonly'
      },
    }
  },
  pluginJs.configs.recommended,
  ...tseslint.configs.recommended,
  {
    rules: {
      'quotes'      : ['error', 'single'],
      'no-console'  : 'error',
      'key-spacing' : [
        'error',
        {
            'align': {
                'beforeColon' : true,
                'afterColon'  : true,
                'on'          : 'colon'
            }
        }
      ],
      '@typescript-eslint/no-empty-object-type' : 'off',
      '@typescript-eslint/no-explicit-any'      : 'off'
    }
  }
];