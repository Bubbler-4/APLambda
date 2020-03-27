import { evalAPL, execAPL } from './aplambda';

const evalSuccess = (program : string, value : string) => {
  const result = evalAPL(program);
  expect(result).toHaveProperty('success', true);
  expect(result).toHaveProperty('value', value);
};
const evalFailure = (program : string) => {
  const result = evalAPL(program);
  expect(result).toHaveProperty('success', false);
};
const execSuccess = (program : string, value : string) => {
  const result = execAPL(program);
  expect(result).toHaveProperty('success', true);
  expect(result).toHaveProperty('value', value);
};
const execFailure = (program : string) => {
  const result = execAPL(program);
  expect(result).toHaveProperty('success', false);
};

describe('v0.1.0', () => {
  test('Success', () => {
    evalSuccess('1+2', '3');
    evalSuccess(' 1 \t + 2 ', '3');
    evalSuccess('~1+2', '¯3');
    evalSuccess('~(92+(~)1)+2', '¯93');
    evalSuccess('1-2', '¯1');
    evalSuccess('1-2-3', '2');
    evalSuccess('1(Flip-)2', '1');
    evalSuccess('1(Flip Flip-)2', '¯1');
    evalSuccess('1(~Comp-)2', '1');
    evalSuccess('1(Flip~Comp-)2', '¯1');
    evalSuccess('11 (+(Flip Comp)~) 2', '¯13');
    evalSuccess('1(~(Flip Comp Comp)-)2', '¯1');
    evalSuccess('1(~(Flip Comp Comp)+)2', '¯3');
  });

  test('Error', () => {
    evalFailure(''); // empty program is not allowed right now
    evalFailure('1\n2'); // multi-line not allowed right now
    evalFailure('?'); // symbol not recognized by the parser
    evalFailure('1~+2'); // wrong arity
    evalFailure('*2'); // unknown ident '*'
    evalFailure('A+2'); // unknown ident 'A'
  });
});

describe('v0.1.1', () => {
  test('Success', () => {
    execSuccess('1+2', '3');
    execSuccess(' 1 \t + 2 ', '3');
    execSuccess('~1+2', '¯3');
    execSuccess('1+2\n2-3\n~3', '3\n¯1\n¯3');
    execSuccess('\n\t \n1+ \t2\n\n2-3\n~   3\n', '3\n¯1\n¯3');
    execSuccess('', '');
  });

  test('Error', () => {
    execFailure('?'); // symbol not recognized by the parser
    execFailure('1~+2'); // wrong arity
    execFailure('*2'); // unknown ident '*'
    execFailure('A+2'); // unknown ident 'A'
  });
});

describe('v0.1.2', () => {
  test('Success', () => {
    execSuccess('a←2', '2');
    execSuccess(' a \t ← \t~ 2 ', '¯2');
    execSuccess('1(+(a(a←Flip Comp)Flip)~)2', '¯3');
    execSuccess('c-~(c+b←2)+(c←3)', '11');
    execSuccess('a+a←2\na', '4\n2');
  });

  test('Error', () => {
  });
});
