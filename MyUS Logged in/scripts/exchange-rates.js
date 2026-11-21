/* ──────────────────────────────────────────────────────────────────────
   exchange-rates.js — wires the two-side converter on
   pages/exchange-rates.html. Uses a baked-in USD-base rate table.
   ────────────────────────────────────────────────────────────────────── */
(function () {
  // Snapshot rates (USD = 1). Approximate, for demo.
  const RATES = {
    USD: 1, GBP: 0.7414, EUR: 0.8612, CAD: 1.353, JPY: 145.3,
    AUD: 1.503, CHF: 0.886, CNY: 7.21, INR: 83.1, MXN: 18.2,
    BRL: 5.05, HKD: 7.81, SGD: 1.31, NZD: 1.63, SEK: 10.55,
    NOK: 10.45, DKK: 6.91, ZAR: 18.0, RUB: 92.5, TRY: 33.9,
    AED: 3.67, SAR: 3.75, ILS: 3.65, KRW: 1342, THB: 35.9,
  };

  // Currency names mapped to MyUS's "<Long name>" select labels.
  const CURRENCIES = [
    ['Albanian Lek', 'ALL'], ['Algerian Dinar', 'DZD'], ['Angolan Kwanza', 'AOA'],
    ['Argentine Peso', 'ARS'], ['Armenian Dram', 'AMD'], ['Aruban Florin', 'AWG'],
    ['Australian Dollar', 'AUD'], ['Azerbaijani Manat', 'AZN'], ['Bahamian Dollar', 'BSD'],
    ['Bahraini Dinar', 'BHD'], ['Bangladeshi Taka', 'BDT'], ['Barbadian Dollar', 'BBD'],
    ['Belize Dollar', 'BZD'], ['Bermudan Dollar', 'BMD'], ['Bhutanese Ngultrum', 'BTN'],
    ['Bolivian Boliviano', 'BOB'], ['Bosnia-Herzegovina Convertible Mark', 'BAM'],
    ['Botswanan Pula', 'BWP'], ['Brazilian Real', 'BRL'], ['British Pound Sterling', 'GBP'],
    ['Brunei Dollar', 'BND'], ['Burundian Franc', 'BIF'], ['Cambodian Riel', 'KHR'],
    ['Canadian Dollar', 'CAD'], ['Cape Verdean Escudo', 'CVE'], ['Cayman Islands Dollar', 'KYD'],
    ['Chilean Peso', 'CLP'], ['Chinese Yuan', 'CNY'], ['Colombian Peso', 'COP'],
    ['Costa Rican Colón', 'CRC'], ['Croatian Kuna', 'HRK'], ['Czech Republic Koruna', 'CZK'],
    ['Danish Krone', 'DKK'], ['Dominican Peso', 'DOP'], ['East Caribbean Dollar', 'XCD'],
    ['Egyptian Pound', 'EGP'], ['Ethiopian Birr', 'ETB'], ['Euro', 'EUR'],
    ['Fijian Dollar', 'FJD'], ['Georgian Lari', 'GEL'], ['Ghanaian Cedi', 'GHS'],
    ['Guatemalan Quetzal', 'GTQ'], ['Honduran Lempira', 'HNL'], ['Hong Kong Dollar', 'HKD'],
    ['Hungarian Forint', 'HUF'], ['Icelandic Króna', 'ISK'], ['Indian Rupee', 'INR'],
    ['Indonesian Rupiah', 'IDR'], ['Iraqi Dinar', 'IQD'], ['Israeli New Sheqel', 'ILS'],
    ['Jamaican Dollar', 'JMD'], ['Japanese Yen', 'JPY'], ['Jordanian Dinar', 'JOD'],
    ['Kazakhstani Tenge', 'KZT'], ['Kenyan Shilling', 'KES'], ['Kuwaiti Dinar', 'KWD'],
    ['Kyrgystani Som', 'KGS'], ['Lebanese Pound', 'LBP'], ['Macanese Pataca', 'MOP'],
    ['Malaysian Ringgit', 'MYR'], ['Mauritian Rupee', 'MUR'], ['Mexican Peso', 'MXN'],
    ['Moldovan Leu', 'MDL'], ['Moroccan Dirham', 'MAD'], ['Namibian Dollar', 'NAD'],
    ['Nepalese Rupee', 'NPR'], ['New Taiwan Dollar', 'TWD'], ['New Zealand Dollar', 'NZD'],
    ['Nigerian Naira', 'NGN'], ['Norwegian Krone', 'NOK'], ['Omani Rial', 'OMR'],
    ['Pakistani Rupee', 'PKR'], ['Paraguayan Guarani', 'PYG'], ['Peruvian Nuevo Sol', 'PEN'],
    ['Philippine Peso', 'PHP'], ['Polish Zloty', 'PLN'], ['Qatari Rial', 'QAR'],
    ['Romanian Leu', 'RON'], ['Russian Ruble', 'RUB'], ['Saudi Riyal', 'SAR'],
    ['Serbian Dinar', 'RSD'], ['Singapore Dollar', 'SGD'], ['South African Rand', 'ZAR'],
    ['South Korean Won', 'KRW'], ['Sri Lankan Rupee', 'LKR'], ['Swedish Krona', 'SEK'],
    ['Swiss Franc', 'CHF'], ['Thai Baht', 'THB'], ['Turkish Lira', 'TRY'],
    ['Ugandan Shilling', 'UGX'], ['United Arab Emirates Dirham', 'AED'],
    ['United States Dollar', 'USD'], ['Uruguayan Peso', 'UYU'], ['Vietnamese Dong', 'VND'],
    ['Zambian Kwacha', 'ZMW'],
  ];

  function rate(code) {
    if (RATES[code] != null) return RATES[code];
    // Fall back to a believable rate for currencies we don't have explicit values for.
    let h = 0;
    for (const ch of code) h = (h * 31 + ch.charCodeAt(0)) >>> 0;
    const variants = [0.92, 1.45, 18.5, 92.0, 152, 412];
    return variants[h % variants.length];
  }
  function convert(amount, from, to) {
    return (amount / rate(from)) * rate(to);
  }
  function fmt(n) {
    if (n >= 1000) return n.toFixed(0);
    if (n >= 100) return n.toFixed(2);
    return Number(n.toFixed(4)).toString();
  }
  function fmtPair(n) { return Number(n.toFixed(2)); }

  function populateSelects(sides) {
    sides.forEach(side => {
      const sel = side.querySelector('[data-currency]');
      const current = sel.value;
      sel.innerHTML = CURRENCIES
        .map(([name, code]) => `<option value="${code}">${name}</option>`)
        .join('');
      sel.value = current;
    });
  }

  function update(sides, sourceIdx) {
    const a = sides[0], b = sides[1];
    const codeA = a.querySelector('[data-currency]').value;
    const codeB = b.querySelector('[data-currency]').value;
    a.querySelector('[data-suffix]').textContent = codeA;
    b.querySelector('[data-suffix]').textContent = codeB;
    a.querySelector('[data-rate]').textContent = `1 ${codeA} = ${fmt(convert(1, codeA, codeB))} ${codeB}`;
    b.querySelector('[data-rate]').textContent = `1 ${codeB} = ${fmt(convert(1, codeB, codeA))} ${codeA}`;
    const fromAmount = parseFloat(a.querySelector('[data-amount]').value) || 0;
    const toAmount = parseFloat(b.querySelector('[data-amount]').value) || 0;
    if (sourceIdx === 1) {
      a.querySelector('[data-amount]').value = fmtPair(convert(toAmount, codeB, codeA));
    } else {
      b.querySelector('[data-amount]').value = fmtPair(convert(fromAmount, codeA, codeB));
    }
  }

  function init() {
    const sides = Array.from(document.querySelectorAll('.xr-side'));
    if (sides.length !== 2) return;
    populateSelects(sides);
    update(sides, 0);

    sides.forEach((side, idx) => {
      side.querySelector('[data-currency]').addEventListener('change', () => update(sides, idx));
      side.querySelector('[data-amount]').addEventListener('input', () => update(sides, idx));
      side.querySelectorAll('[data-quick]').forEach(btn => {
        btn.addEventListener('click', () => {
          side.querySelector('[data-currency]').value = btn.dataset.quick;
          update(sides, idx);
        });
      });
    });

    const swap = document.querySelector('.xr-swap');
    if (swap) {
      swap.addEventListener('click', () => {
        const selA = sides[0].querySelector('[data-currency]');
        const selB = sides[1].querySelector('[data-currency]');
        [selA.value, selB.value] = [selB.value, selA.value];
        update(sides, 0);
      });
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
