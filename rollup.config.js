export default {
  external: ['jquery'],
  output: {
    format: 'iife',
    name: 'bundle',
    globals: {
      jquery: '$'
    }
  }
};
