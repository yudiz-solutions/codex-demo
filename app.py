from flask import Flask, render_template, request, jsonify, send_from_directory
import requests
from functools import lru_cache
from web3 import Web3
import os

app = Flask(__name__, static_folder='static', template_folder='templates')

# CoinGecko API endpoint
COINGECKO_URL = 'https://api.coingecko.com/api/v3/simple/price'

# Infura settings (placeholder: add your own INFURA URL)
INFURA_URL = 'https://mainnet.infura.io/v3/YOUR_INFURA_PROJECT_ID'
w3 = Web3(Web3.HTTPProvider(INFURA_URL))

@app.route('/')
def index():
    return render_template('index.html')

@lru_cache(maxsize=64)
def get_crypto_price(symbol):
    resp = requests.get(COINGECKO_URL, params={'ids': symbol.lower(), 'vs_currencies': 'usd'})
    data = resp.json()
    if symbol.lower() in data:
        return {'usd': data[symbol.lower()]['usd']}
    return {'error': 'Symbol not found'}

@app.route('/price')
def price():
    symbol = request.args.get('symbol', '')
    if not symbol:
        return jsonify({'error': 'Missing symbol'}), 400
    result = get_crypto_price(symbol)
    return jsonify(result)

@app.route('/balance')
def balance():
    address = request.args.get('address', '')
    if not address or not w3.isAddress(address):
        return jsonify({'error': 'Invalid wallet address'}), 400
    try:
        balance_wei = w3.eth.get_balance(address)
        eth_balance = w3.fromWei(balance_wei, 'ether')
        return jsonify({'eth': str(eth_balance)})
    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True)
