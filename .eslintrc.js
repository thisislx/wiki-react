module.exports = {
 'env': {
  browser: true,
  es2021: true,
  node: true,
 },

 'extends': [
  'eslint:recommended',
  'plugin:react/recommended',
  'plugin:@typescript-eslint/recommended'
 ],
 'parser': '@typescript-eslint/parser',
 'parserOptions': {
  'ecmaFeatures': {
   'jsx': true,
  },
  'ecmaVersion': 12,
  'sourceType': 'module'
 },
 'plugins': [
  'react',
  '@typescript-eslint'
 ],
 'rules': {
  '@typescript-eslint/consistent-type-imports': [
   'error',
   {
    disallowTypeAnnotations: true,
   }
  ],
  '@typescript-eslint/no-explicit-any': -1,
  'indent': [
   'error',
   1,
  ],
  'linebreak-style': [
   'error',
   'windows'
  ],
  'quotes': [
   'error',
   'single'
  ],
  'semi': [
   'error',
   'never'
  ]
 }
}
