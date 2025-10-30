document.addEventListener('DOMContentLoaded', () => {
  const priceForm = document.getElementById('price-form');
  const priceResult = document.getElementById('price-result');
  priceForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const symbol = document.getElementById('symbol').value.trim();
    if (!symbol) return;
    priceResult.textContent = 'Fetching price...';
    try {
      const res = await fetch(`/price?symbol=${encodeURIComponent(symbol)}`);
      const data = await res.json();
      if (data.usd) {
        priceResult.textContent = `1 ${symbol.toUpperCase()} = $${data.usd.toLocaleString()}`;
      } else if (data.error) {
        priceResult.textContent = `Error: ${data.error}`;
      } else {
        priceResult.textContent = 'Unexpected response.';
      }
    } catch (err) {
      priceResult.textContent = 'Network error.';
    }
  });

  const balanceForm = document.getElementById('balance-form');
  const balanceResult = document.getElementById('balance-result');
  balanceForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const address = document.getElementById('address').value.trim();
    if (!address) return;
    balanceResult.textContent = 'Checking balance...';
    try {
      const res = await fetch(`/balance?address=${encodeURIComponent(address)}`);
      const data = await res.json();
      if (data.eth) {
        balanceResult.textContent = `${address.slice(0,6)}...${address.slice(-4)} has ${data.eth} ETH`;
      } else if (data.error) {
        balanceResult.textContent = `Error: ${data.error}`;
      } else {
        balanceResult.textContent = 'Unexpected response.';
      }
    } catch (err) {
      balanceResult.textContent = 'Network error.';
    }
  });
});
