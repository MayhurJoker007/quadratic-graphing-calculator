// Facts about y = ax² + bx + c, kept separate from the drawing code so they can be tested.

(function (root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  else root.Quadratic = api;
})(this, function () {
  const round = (n, dp = 3) => +n.toFixed(dp) + 0; // + 0 turns -0 into 0

  function analyse(a, b, c) {
    const f = x => a * x * x + b * x + c;
    const result = { discriminant: b * b - 4 * a * c, yIntercept: c, vertex: null, roots: [], complexRoots: null, kind: 'quadratic' };

    if (a === 0) {
      result.kind = b === 0 ? 'constant' : 'linear';
      if (b !== 0) result.roots = [-c / b];
      return result;
    }

    const vx = -b / (2 * a);
    result.vertex = { x: vx, y: f(vx) };
    const D = result.discriminant;
    if (D > 0) {
      // Citardauq form for the second root avoids cancellation when b² is much bigger than 4ac
      const q = -0.5 * (b + Math.sign(b || 1) * Math.sqrt(D));
      result.roots = [q / a, c / q].sort((x, y) => x - y);
    } else if (D === 0) {
      result.roots = [vx];
    } else {
      result.complexRoots = { re: vx, im: Math.abs(Math.sqrt(-D) / (2 * a)) };
    }
    return result;
  }

  function term(v, symbol, first) {
    if (v === 0) return '';
    const sign = v < 0 ? '−' : first ? '' : '+';
    const m = Math.abs(v);
    const coef = m === 1 && symbol ? '' : round(m);
    return (first ? sign : ' ' + sign + ' ') + coef + symbol;
  }

  function equation(a, b, c) {
    const body = (term(a, 'x²', true) + term(b, 'x', !a) + term(c, '', !a && !b)).trim();
    return 'y = ' + (body || '0');
  }

  function describeRoots(r) {
    if (r.complexRoots) return `${round(r.complexRoots.re)} ± ${round(r.complexRoots.im)}i`;
    if (!r.roots.length) return '—';
    return 'x = ' + r.roots.map(x => round(x)).join(', ');
  }

  // A "nice" grid step (1, 2 or 5 times a power of ten) giving roughly 8 lines across a range
  function niceStep(range) {
    const raw = range / 8;
    const p = 10 ** Math.floor(Math.log10(raw));
    const n = raw / p;
    return (n < 2 ? 1 : n < 5 ? 2 : 5) * p;
  }

  return { analyse, equation, describeRoots, niceStep, round };
});
