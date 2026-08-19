/* grumble — sample basket
   ---------------------------------------------------------------------------
   Progressive enhancement, not a requirement. The page ships the serves-2 state
   fully rendered in HTML; this file recomputes it when the stepper moves. With
   JavaScript blocked you still get a complete, correct, readable basket — the
   controls just aren't there (`.js-only` is display:none until the inline
   snippet in <head> drops the `no-js` class).

   Rules this follows, from design-system/grumble/MASTER.md:
   · One status region for the surface, atomic, and a sentence — never a bare
     number read out on its own.
   · Semantic state is set directly. Nothing waits on transitionend, so mashing
     the stepper can't strand the basket in a half-applied state.
   · The serves count lives in the URL, so a scaled basket can be shared.
   --------------------------------------------------------------------------- */
(function () {
  'use strict';

  var BASE_SERVES = 2;
  var MIN = 1, MAX = 8;

  var basket = document.getElementById('basket');
  if (!basket) return;

  var valueEl  = document.getElementById('serves-value');
  var minusEl  = document.getElementById('serves-minus');
  var plusEl   = document.getElementById('serves-plus');
  var totalEl  = document.getElementById('total');
  var noteEl   = document.getElementById('total-note');
  var liveEl   = document.getElementById('live');
  var copyEl   = document.getElementById('copy');
  var resetEl  = document.getElementById('reset');
  var stapleCountEl = document.getElementById('staple-count');

  var rows = Array.prototype.slice.call(basket.querySelectorAll('.item--toggle'));
  var staples = Array.prototype.slice.call(
    basket.querySelectorAll('#staple-items .item--toggle'));

  var serves = clamp(parseInt(new URLSearchParams(location.search).get('serves'), 10) || BASE_SERVES);

  function clamp(n) { return Math.min(MAX, Math.max(MIN, n)); }
  function money(n) { return '$' + n.toFixed(2); }

  /* Quantities scale linearly; packs do not. Ceil is the whole point — you
     cannot buy 1.07 packs of noodles, and the jump from one pack to two is the
     thing this page exists to show. */
  function compute(row) {
    var qty  = parseFloat(row.dataset.qty) * serves / BASE_SERVES;
    var pack = parseFloat(row.dataset.pack);
    var packs = Math.max(1, Math.ceil(qty / pack));
    return { qty: qty, packs: packs, price: packs * parseFloat(row.dataset.price) };
  }

  function tidy(n) {
    return (Math.round(n * 100) / 100).toString();
  }

  function render() {
    var total = 0, counted = 0, checks = 0, staplesOn = 0;

    rows.forEach(function (row) {
      var c = compute(row);
      var on = row.querySelector('.item__check').checked;

      row.querySelector('.item__meta').textContent =
        tidy(c.qty) + ' ' + row.dataset.unit + ' → ' + c.packs + ' × ' + row.dataset.packlabel;
      row.querySelector('.item__price').textContent = money(c.price);
      row.classList.toggle('item--off', !on);

      if (on) {
        total += c.price;
        counted++;
        if (row.querySelector('.chip--check')) checks++;
        if (row.parentElement.id === 'staple-items') staplesOn++;
      }
    });

    var aside = staples.length - staplesOn;
    totalEl.textContent = money(total);
    valueEl.textContent = serves;
    if (stapleCountEl) stapleCountEl.textContent = aside;

    noteEl.textContent =
      counted + (counted === 1 ? ' item' : ' items') + ' · ' +
      aside + (aside === 1 ? ' staple' : ' staples') + ' set aside · ' +
      checks + ' to check';

    minusEl.disabled = serves <= MIN;
    plusEl.disabled  = serves >= MAX;

    announce('Basket ' + money(total) + ', ' + counted +
             (counted === 1 ? ' item' : ' items') + ', feeding ' + serves +
             ', ' + checks + ' to check.');

    var url = serves === BASE_SERVES ? location.pathname : location.pathname + '?serves=' + serves;
    history.replaceState(null, '', url);
  }

  /* Debounced so holding the stepper down doesn't queue eight announcements
     that talk over each other. The visible numbers still update immediately. */
  var liveTimer = null;
  function announce(text) {
    clearTimeout(liveTimer);
    liveTimer = setTimeout(function () { liveEl.textContent = text; }, 400);
  }

  function setServes(n) {
    var next = clamp(n);
    if (next === serves) return;
    serves = next;
    render();
  }

  minusEl.addEventListener('click', function () { setServes(serves - 1); });
  plusEl.addEventListener('click',  function () { setServes(serves + 1); });

  rows.forEach(function (row) {
    row.querySelector('.item__check').addEventListener('change', render);
  });

  if (resetEl) {
    resetEl.addEventListener('click', function () {
      serves = BASE_SERVES;
      rows.forEach(function (row) {
        var isStaple = row.parentElement.id === 'staple-items';
        row.querySelector('.item__check').checked = !isStaple;
      });
      render();
      liveEl.textContent = 'Basket reset to the starting list, feeding ' + BASE_SERVES + '.';
    });
  }

  if (copyEl) {
    copyEl.addEventListener('click', function () {
      var lines = ['Chilli oil noodles — feeding ' + serves, ''];
      rows.forEach(function (row) {
        if (!row.querySelector('.item__check').checked) return;
        var c = compute(row);
        lines.push('- ' + row.querySelector('.item__name').textContent.trim() +
                   ' — ' + c.packs + ' × ' + row.dataset.packlabel + ' — ' + money(c.price));
      });
      lines.push('', 'Estimated total ' + totalEl.textContent,
                 'Illustration only — example prices, from ' + location.origin + location.pathname);

      var text = lines.join('\n');
      var done = function () {
        copyEl.textContent = 'Copied';
        liveEl.textContent = 'Shopping list copied to the clipboard.';
        setTimeout(function () { copyEl.textContent = 'Copy the list'; }, 2000);
      };
      var failed = function () {
        liveEl.textContent = 'Could not copy — your browser blocked clipboard access.';
      };

      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(text).then(done, failed);
      } else {
        failed();
      }
    });
  }

  render();
})();
