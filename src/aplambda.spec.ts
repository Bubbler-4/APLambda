import { evalAPL } from './aplambda';

describe('v0.1.0', () => {
  const testSuccess = (program : string, value : string) => {
    const result = evalAPL(program);
    expect(result).toHaveProperty('success', true);
    expect(result).toHaveProperty('value', value);
  };
  const testFailure = (program : string) => {
    const result = evalAPL(program);
    expect(result).toHaveProperty('success', false);
  };

  test('Success', () => {
    testSuccess('1+2', '3');
    testSuccess(' 1 + 2 ', '3');
    testSuccess('~1+2', '¯3');
    testSuccess('~(92+(~)1)+2', '¯93');
  });

  test('Error', () => {
    testFailure(''); // empty program is not allowed right now
    testFailure('?'); // symbol not recognized by the parser
    testFailure('1~+2'); // wrong arity
    testFailure('-2'); // unknown ident '-'
    testFailure('A+2'); // unknown ident 'A'
  });
});
