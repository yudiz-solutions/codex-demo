document.addEventListener('DOMContentLoaded', () => {
  const HISTORY_KEY = 'cryptoSearchHistory';

  const priceForm = document.getElementById('price-form');
  const priceResult = document.getElementById('price-result');
  const balanceForm = document.getElementById('balance-form');
  const balanceResult = document.getElementById('balance-result');
  const historyList = document.getElementById('search-history');
  const clearHistoryBtn = document.getElementById('clear-history');

  let history = [];

  const formatTypeLabel = (type) => (type === 'balance' ? 'Balance' : 'Price');

  function renderHistory(historyEntries) {
    if (!historyList) return;
    historyList.innerHTML = '';

    if (!historyEntries.length) {
      const emptyItem = document.createElement('li');
      emptyItem.className = 'history-empty';
      emptyItem.textContent = 'No searches yet.';
      historyList.appendChild(emptyItem);
      return;
    }

    [...historyEntries].reverse().forEach((entry) => {
      const listItem = document.createElement('li');
      listItem.className = 'history-item';

      if (entry.result && entry.result.toLowerCase().startsWith('error')) {
        listItem.classList.add('history-item-error');
      }

      const header = document.createElement('div');
      header.className = 'history-item-header';

      const typeSpan = document.createElement('span');
      typeSpan.className = 'history-type';
      typeSpan.textContent = formatTypeLabel(entry.type);

      const querySpan = document.createElement('span');
      querySpan.className = 'history-query';
      querySpan.textContent = entry.query;

      header.appendChild(typeSpan);
      header.appendChild(querySpan);

      const resultSpan = document.createElement('span');
      resultSpan.className = 'history-result';
      resultSpan.textContent = entry.result || '';

      listItem.appendChild(header);
      listItem.appendChild(resultSpan);
      historyList.appendChild(listItem);
    });
  }

  function loadHistory() {
    let storedHistory = [];
    try {
      const raw = localStorage.getItem(HISTORY_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) {
          storedHistory = parsed;
        }
      }
    } catch (error) {
      console.warn('Unable to load search history', error);
    }

    history = storedHistory;
    renderHistory(history);
  }

  function saveToHistory(entry) {
    history.push(entry);
    try {
      localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
    } catch (error) {
      console.warn('Unable to save search history', error);
    }
    renderHistory(history);
  }

  if (clearHistoryBtn) {
    clearHistoryBtn.addEventListener('click', () => {
      history = [];
      localStorage.removeItem(HISTORY_KEY);
      renderHistory(history);
    });
  }

  if (priceForm && priceResult) {
    priceForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const symbol = document.getElementById('symbol').value.trim();
      if (!symbol) return;

      priceResult.textContent = 'Fetching price...';
      let displayMessage = '';

      try {
        const res = await fetch(`/price?symbol=${encodeURIComponent(symbol)}`);
        const data = await res.json();
        if (typeof data.usd !== 'undefined') {
          displayMessage = `1 ${symbol.toUpperCase()} = $${data.usd.toLocaleString()}`;
        } else if (data.error) {
          displayMessage = `Error: ${data.error}`;
        } else {
          displayMessage = 'Unexpected response.';
        }
      } catch (err) {
        displayMessage = 'Network error.';
      }

      if (!displayMessage) {
        displayMessage = 'No data returned.';
      }

      priceResult.textContent = displayMessage;
      saveToHistory({ type: 'price', query: symbol, result: displayMessage });
    });
  }

  if (balanceForm && balanceResult) {
    balanceForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const address = document.getElementById('address').value.trim();
      if (!address) return;

      balanceResult.textContent = 'Checking balance...';
      let displayMessage = '';

      try {
        const res = await fetch(`/balance?address=${encodeURIComponent(address)}`);
        const data = await res.json();
        if (typeof data.eth !== 'undefined') {
          const shortened = address.length > 10 ? `${address.slice(0, 6)}...${address.slice(-4)}` : address;
          displayMessage = `${shortened} has ${data.eth} ETH`;
        } else if (data.error) {
          displayMessage = `Error: ${data.error}`;
        } else {
          displayMessage = 'Unexpected response.';
        }
      } catch (err) {
        displayMessage = 'Network error.';
      }

      if (!displayMessage) {
        displayMessage = 'No data returned.';
      }

      balanceResult.textContent = displayMessage;
      saveToHistory({ type: 'balance', query: address, result: displayMessage });
    });
  }

  loadHistory();
});
