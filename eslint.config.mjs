import globals from 'globals';
import pluginJs from '@eslint/js';
import tseslint from 'typescript-eslint';


/** @type {import('eslint').Linter.Config[]} */
export default [
  {
    ignores: [
      '.build',
      '.serverless',
      '.esbuild',
      '**/_prisma/generated/**',
      '**/*.js'
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
    files: ['**/*.ts'],
    languageOptions: {
      parserOptions: {
        project: './tsconfig.json',
        tsconfigRootDir: process.cwd()
      }
    },    
    rules: {
      'indent': ['error', 2, { SwitchCase: 1 }],
      'quotes': ['error', 'single', { avoidEscape: true }],
      'no-console': ['warn', { allow: ['warn', 'error', 'info'] }],
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
      '@typescript-eslint/no-explicit-any'      : 'off',
      "@typescript-eslint/no-unused-vars": ["warn"],      
      "@typescript-eslint/explicit-function-return-type": 'off',
      "@typescript-eslint/no-non-null-assertion": 'off'     
    }
  }
];