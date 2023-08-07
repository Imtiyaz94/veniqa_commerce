module.exports = {
  root: true,
  env: {
    node: true,
  },
  globals: {
    _: true,
    require: false,
  },
  settings: {
    'import/resolver': {
      alias: {
        map: [['@', './src', '*']],
        extensions: ['.js', '.json', '.vue'],
      },
    },
  },
  plugins: ['import'],
  extends: ['plugin:vue/essential', '@vue/airbnb'],
  rules: {
    // 'no-console': process.env.NODE_ENV === 'production' ? 'error' : 'off',
    'import/extensions': [
      'off',
      'always',
      {
        js: 'always',
        vue: 'always',
      },
    ],
    commonjs: true / false,
    amd: true / false,
    'no-console': 'off',
    'no-debugger': process.env.NODE_ENV === 'production' ? 'error' : 'off',
    'comma-dangle': 'off',
    'no-param-reassign': 'off',
    'arrow-parens': 'off',
    'max-len': [
      'error',
      {
        code: 120,
        ignoreComments: true,
      },
    ],
    'no-underscore-dangle': 'off',
    'vue/no-use-v-if-with-v-for': 'off',
  },

  parserOptions: {
    parser: 'babel-eslint',
  },
};
