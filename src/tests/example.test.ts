function add(a: number, b: number) {
  return a + b;
}

describe('add function', () => {
  it('adds two numbers correctly', () => {
    expect(add(2, 2)).toBe(4);
  });

  it('returns NaN if one of the arguments is not a number', () => {
    expect(add(2, 'foo')).toBe(NaN);
  });
});
