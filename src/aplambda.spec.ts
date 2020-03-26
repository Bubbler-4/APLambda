import { evalAPL, execAPL } from './aplambda';

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
    testSuccess(' 1 \t + 2 ', '3');
    testSuccess('~1+2', '¯3');
    testSuccess('~(92+(~)1)+2', '¯93');
    testSuccess('1-2', '¯1');
    testSuccess('1-2-3', '2');
    testSuccess('1(Flip-)2', '1');
    testSuccess('1(Flip Flip-)2', '¯1');
    testSuccess('1(~Comp-)2', '1');
    testSuccess('1(Flip~Comp-)2', '¯1');
    testSuccess('11 (+(Flip Comp)~) 2', '¯13');
    testSuccess('1(~(Flip Comp Comp)-)2', '¯1');
    testSuccess('1(~(Flip Comp Comp)+)2', '¯3');
  });

  test('Error', () => {
    testFailure(''); // empty program is not allowed right now
    testFailure('1\n2'); // multi-line not allowed right now
    testFailure('?'); // symbol not recognized by the parser
    testFailure('1~+2'); // wrong arity
    testFailure('*2'); // unknown ident '*'
    testFailure('A+2'); // unknown ident 'A'
  });
});

describe('v0.1.1', () => {
  const testSuccess = (program : string, value : string) => {
    const result = execAPL(program);
    expect(result).toHaveProperty('success', true);
    expect(result).toHaveProperty('value', value);
  };
  const testFailure = (program : string) => {
    const result = execAPL(program);
    expect(result).toHaveProperty('success', false);
  };

  test('Success', () => {
    testSuccess('1+2', '3');
    testSuccess(' 1 \t + 2 ', '3');
    testSuccess('~1+2', '¯3');
    testSuccess('1+2\n2-3\n~3', '3\n¯1\n¯3');
    testSuccess('\n\t \n1+ \t2\n\n2-3\n~   3\n', '3\n¯1\n¯3');
    testSuccess('', '');
  });

  test('Error', () => {
    testFailure('?'); // symbol not recognized by the parser
    testFailure('1~+2'); // wrong arity
    testFailure('*2'); // unknown ident '*'
    testFailure('A+2'); // unknown ident 'A'
  });
});
