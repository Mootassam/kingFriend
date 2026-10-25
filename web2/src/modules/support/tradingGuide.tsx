import type { FaqItem } from "src/modules/support/faq";

// Trading Guide articles for the Help Center. They describe the workspace as it works:
// the Trade terminal, its order ticket, the Orders page and the account.
export const tradingGuideItems: FaqItem[] = [
  {
    id: "1",
    question: "Getting started: demo and live accounts",
    answer:
      "KingFriend offers two kinds of account.\n\n" +
      "Demo account: trades with virtual funds on live market prices. It is the safest way to learn the platform — nothing you do can lose real money, and deposits and withdrawals are not available.\n\n" +
      "Live account: trades with the funds held in your wallets. Orders, balances and history are stored on our servers, so you see the same positions on every device.\n\n" +
      "Tip: practise each step of this guide on a demo account first, then open a live account when you feel confident.",
  },
  {
    id: "2",
    question: "Finding an instrument",
    answer:
      "Instruments are grouped into four categories: Forex (currency pairs such as EURUSD), Crypto (BTCUSD, ETHUSD, LTCUSD), Commodities (gold XAUUSD, silver XAGUSD, oil) and Indices (NAS100, SPX500, US30 and more).\n\n" +
      "Open Markets to browse every instrument with its live price and daily change, or use Market Watch inside the Trade terminal to switch instruments without leaving the chart. Selecting an instrument loads its chart and order ticket.\n\n" +
      "A \"Closed\" tag next to the symbol means its market is shut (for example forex at the weekend). Crypto trades 24/7.",
  },
  {
    id: "3",
    question: "Reading the chart",
    answer:
      "The chart shows candlesticks: each candle covers one period and shows where the price opened, its highest and lowest point, and where it closed. Green candles closed higher than they opened; red candles closed lower.\n\n" +
      "Use the timeframe buttons (M1, M5, M15, M30, H1, H4, D1) to change the period of each candle — M1 is one minute, H1 is one hour, D1 is one day. Short timeframes show detail; long ones show the trend.\n\n" +
      "The O / H / L / C line above the chart shows the open, high, low and close of the latest candle. Scroll to zoom and drag to move back in time.",
  },
  {
    id: "4",
    question: "Bid, ask and spread",
    answer:
      "Every instrument has two prices. The bid is the price the market will buy from you; the ask is the price it will sell to you. The ask is always slightly higher than the bid.\n\n" +
      "The difference between them is the spread. It is a cost of trading: a new position starts slightly negative because it must recover the spread before it shows a profit.\n\n" +
      "Spreads are usually tightest when a market is busiest and can widen when a market opens, closes or reacts to major news.",
  },
  {
    id: "5",
    question: "Placing a market order",
    answer:
      "A market order opens a position straight away at the current price.\n\n" +
      "1. In the Trade terminal, choose the Market Price tab.\n" +
      "2. Pick a multiplier and enter the number of lots (the minimum is 0.01).\n" +
      "3. Optionally switch on Set Loss and Take Profit and enter their prices.\n" +
      "4. Check the estimated margin and handling fee in the summary.\n" +
      "5. Press Buy if you expect the price to rise, or Sell if you expect it to fall.\n" +
      "6. Review the confirmation and press Confirmation.\n\n" +
      "Your new position appears straight away under Positions on the Orders page.",
  },
  {
    id: "6",
    question: "Pending orders: trading at your price",
    answer:
      "A pending order waits until the market reaches a price you choose, then opens automatically.\n\n" +
      "Choose the Pending Orders tab, enter the trigger price, then set your multiplier, lots and optional stop loss and take profit as for a market order. The summary shows the current price next to your trigger so you can see how far away it is.\n\n" +
      "Waiting orders are listed under Pending on the Orders page. You can cancel one at any time before it triggers. Once the price is reached it becomes an open position and moves to Positions.",
  },
  {
    id: "7",
    question: "Lots, multiplier and margin",
    answer:
      "Lots set the size of your trade; one lot is 100 units of the instrument and sizes go up in steps of 0.01. Bigger positions make bigger profits and bigger losses for the same price move.\n\n" +
      "Margin is the amount set aside from your balance while a position is open. The multiplier reduces it: at 100× the margin equals the full value of the position, at 200× it is half, and at 500× it is a fifth.\n\n" +
      "A higher multiplier frees up balance, but it does not shrink the risk — profit and loss still follow the full position size. The ticket shows the estimated margin before you trade and warns you if your balance is not enough.",
  },
  {
    id: "8",
    question: "Stop loss and take profit",
    answer:
      "Stop loss and take profit close a position for you when the price reaches a level you set, so you do not need to watch the screen.\n\n" +
      "Take profit locks in a gain: for a Buy it sits above the entry price, for a Sell below it.\n" +
      "Stop loss limits a loss: for a Buy it sits below the entry price, for a Sell above it.\n\n" +
      "Switch either one on in the order ticket — the field starts at the current price so you can adjust it up or down. When the level is reached the position is closed and moved to History, marked TP or SL.",
  },
  {
    id: "9",
    question: "Managing your positions",
    answer:
      "The Orders page has three tabs.\n\n" +
      "Positions: your open trades with the entry price, live price, margin and floating profit or loss. Press Close to exit a position at the current price.\n" +
      "Pending: orders waiting for their trigger price. Press Cancel to remove one.\n" +
      "History: closed and cancelled orders with their final result.\n\n" +
      "The Floating P&L card adds up the profit or loss of every open position. It is not realised until you close them. Press Refresh if prices ever look stale.",
  },
  {
    id: "10",
    question: "Profit, loss and fees",
    answer:
      "While a position is open its profit or loss moves with the market and is shown as floating P&L. When you close it, the result becomes realised and your margin is released back to your balance.\n\n" +
      "A Buy gains when the price rises above the entry price; a Sell gains when it falls below. The amount depends on the size of the move and the number of lots.\n\n" +
      "Each order has a small handling fee, shown in the ticket before you confirm, and the spread is an indirect cost of every trade.",
  },
  {
    id: "11",
    question: "Deposits, withdrawals and verification",
    answer:
      "Live accounts can deposit and withdraw from the Profile page or the account menu.\n\n" +
      "Before your first withdrawal you will need to verify your identity (KYC), add a bank account and set a withdrawal password. Verification usually needs a valid ID document and is reviewed by our team.\n\n" +
      "For your security, withdrawals are blocked for 24 hours after you change your login password. Withdrawals can take up to 24 hours to process.",
  },
  {
    id: "12",
    question: "Managing risk",
    answer:
      "Trading carries risk, and prices can move quickly against you. A few habits help protect your account:\n\n" +
      "• Only trade money you can afford to lose.\n" +
      "• Start small — 0.01 lots — while you learn how an instrument moves.\n" +
      "• Set a stop loss on every trade and decide your exit before you enter.\n" +
      "• Don't put your whole balance into one position or one instrument.\n" +
      "• Be careful with high multipliers: they make it easier to open large positions.\n" +
      "• Practise new ideas on a demo account first.\n\n" +
      "If you have any questions, our support team is available through Live Chat.",
  },
];
