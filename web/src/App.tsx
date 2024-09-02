import { MantineProvider } from '@mantine/core';
import { Market } from './market/Market';
import './App.css'
import '@mantine/core/styles.css';
import { useState } from 'react';

export type Currency = {
  name: string,
  symbol: string
}

export type Item = {
  sku?: string;
  name: string;
  price?: number;
  count?: number;
  quantity?: number;
  weight?: number;
  slot?: number;
  durability?: number;
  metadata?: any;
  listingType?: string; // "inventory" | "server" | "market" | "market-view" | "trade" 
}

export type MarketData = {
  listings?: Item[],
  trades?: Item[],
  inventory?: Item[],
}

type Translation = {
  [key: string]: string
}

let locale: Translation = {};

let currency: Currency;

export function Translate(key: string, ...args: string[]) {
  if (locale && locale[key]) {
    return locale[key].replace(/%s/g, function() {
      return args.shift() || "";
    });
  }
  return key
}

export function GetPriceString(price: any) {
  let safeNumber: any = parseFloat(price);
  const formatter = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency?.name || 'USD',
    currencyDisplay: 'narrowSymbol',
    minimumFractionDigits: 0, // (this suffices for whole numbers, but will print 2500.10 as $2,500.1)
    maximumFractionDigits: 0, // (causes 2500.99 to be printed as $2,501)
  });
  return formatter.format(safeNumber);
}

let marketData: MarketData = {};

export function GetMarketData() {
  return marketData;
}

function App() {
  const [opened, setOpened] = useState(false);
  if (opened && !currency) { // Temp workaround for out-of-game rendering
    setOpened(false);
    window.postMessage({ type: 'refreshPage' }, '*');
  }
  window.addEventListener('message', (event) => {
    if (event.data.type === 'openMarket') {
      currency = event.data.currency;
      locale = event.data.locale;
      marketData = event.data.marketData;
      setOpened(true);
    }
  })
  return (
    <MantineProvider defaultColorScheme='dark'>
      {opened ? <Market/> : null}
    </MantineProvider>
  )
}

export default App;