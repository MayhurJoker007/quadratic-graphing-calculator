// Expression evaluator for the keypad: + - * / ^, parentheses and unary minus.
// A small recursive descent parser instead of eval(), so the only thing that can run is arithmetic.
//
//   expr   = term (('+' | '-') term)*
//   term   = unary (('*' | '/') unary)*
//   unary  = '-' unary | power            so -2^2 = -4, like on paper
//   power  = primary ('^' unary)?         right associative: 2^3^2 = 2^9, and 2^-1 works
//   primary = number | '(' expr ')'

(function (root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  else root.Calc = api;
})(this, function () {
  function tokenize(src) {
    const s = src.replace(/÷/g, '/').replace(/×/g, '*').replace(/−/g, '-');
    const tokens = [];
    let i = 0;
    while (i < s.length) {
      const ch = s[i];
      if (/\s/.test(ch)) { i++; continue; }
      if (/[\d.]/.test(ch)) {
        const m = s.slice(i).match(/^(\d+\.?\d*|\.\d+)(e[+-]?\d+)?/i);
        if (!m) throw new SyntaxError(`Bad number at ${i}`);
        tokens.push({ type: 'num', value: parseFloat(m[0]) });
        i += m[0].length;
        continue;
      }
      if ('+-*/^()'.includes(ch)) { tokens.push({ type: ch }); i++; continue; }
      throw new SyntaxError(`Unexpected "${ch}"`);
    }
    return tokens;
  }

  function evaluate(src) {
    const tokens = tokenize(src);
    let pos = 0;
    const peek = () => tokens[pos] && tokens[pos].type;
    const take = type => {
      if (peek() !== type) throw new SyntaxError(`Expected ${type}`);
      return tokens[pos++];
    };

    function expr() {
      let v = term();
      while (peek() === '+' || peek() === '-') v = tokens[pos++].type === '+' ? v + term() : v - term();
      return v;
    }
    function term() {
      let v = unary();
      while (peek() === '*' || peek() === '/') v = tokens[pos++].type === '*' ? v * unary() : v / unary();
      return v;
    }
    function unary() {
      if (peek() === '-') { pos++; return -unary(); }
      if (peek() === '+') { pos++; return unary(); }
      return power();
    }
    function power() {
      const base = primary();
      if (peek() === '^') { pos++; return Math.pow(base, unary()); }
      return base;
    }
    function primary() {
      if (peek() === 'num') return tokens[pos++].value;
      if (peek() === '(') { pos++; const v = expr(); take(')'); return v; }
      throw new SyntaxError(pos >= tokens.length ? 'Unexpected end' : `Unexpected ${peek()}`);
    }

    if (!tokens.length) throw new SyntaxError('Empty');
    const result = expr();
    if (pos < tokens.length) throw new SyntaxError(`Unexpected ${peek()}`);
    return result;
  }

  // 12 significant digits hides float noise like 0.1 + 0.2 = 0.30000000000000004
  function format(n) {
    return Number.isFinite(n) ? String(+n.toPrecision(12)) : 'Error';
  }

  return { tokenize, evaluate, format };
});
