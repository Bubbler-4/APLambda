export default {
  external: ['jquery', 'parsimmon'],
  output: {
    format: 'iife',
    name: 'bundle',
    globals: {
      jquery: '$',
      parsimmon: 'Parsimmon'
    }
  }
};
