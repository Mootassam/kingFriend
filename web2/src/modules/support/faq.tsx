// Help Center questions and answers, the same entries PC lists on /support.
export interface FaqItem {
  id: string;
  question: string;
  answer: string;
}

export const faqItems: FaqItem[] = [
  {
    id: "1",
    question: "About official accounts and demo accounts",
    answer:
      "Formal accounts can use all online functions of the platform, while demo accounts can only use some of the functions of the platform to a limited extent, cannot use liquidity mining to make profits, and cannot deposit and withdraw coins. (Demo accounts can receive fixed virtual funds once on the 1st of each month)",
  },
  {
    id: "2",
    question: "What is transaction volume?",
    answer:
      "According to the relevant provisions of the Anti-Money Laundering Law, each transaction requires price control, and a certain transaction volume must be completed before the currency can be withdrawn, so as to prevent users from laundering money on the exchange! For example, if you deposit 10,000U, the transaction amount must reach the relevant specified amount!",
  },
  {
    id: "3",
    question: "Why transfer funds?",
    answer:
      "In order to ensure the independence of funds between your various accounts and facilitate your reasonable risk control, the accounts of major trading modules are divided Transfer refers to the process of converting assets between various trading accounts.",
  },
  {
    id: "4",
    question: "What are Futures?",
    answer:
      "Futures, also known as futures, are a form of trading that spans time. Buyers and sellers sign a contract to agree to deliver a specified amount of spot goods at a specified time, price and other trading conditions. Futures are usually concentrated in futures exchanges and bought and sold with standardized contracts. The assets traded are usually commodities or financial instruments. The predetermined price that both parties agree to buy and sell an asset is called the forward price.",
  },
  {
    id: "5",
    question: "Why does the converted amount in assets change?",
    answer:
      "The converted value in assets is the value of the digital currency currently held in USD. It changes due to the price fluctuations of digital assets, but the amount of your digital assets does not change.",
  },
  {
    id: "6",
    question: "Why is real-name authentication required?",
    answer:
      "For the safety of your funds, we limit the association of your receiving account with the real-name information of your current account.",
  },
  {
    id: "7",
    question: "What are frozen assets?",
    answer:
      "Frozen assets means that when you perform transactions or withdrawal operations, the process is not fully completed. The current assets are temporarily managed by the system and cannot be freely controlled by you. It does not mean that you have lost the asset or that something is abnormal with the asset. Please rest assured.",
  },
  {
    id: "8",
    question: "What are the rules of futures trading?",
    answer:
      "Participate in transactions by estimating the next price trend (up or down) of the current trading pair. The range of the increase or decrease is not calculated during settlement, and only the income is calculated based on the result of the increase or decrease The profit percentages for settlement at different delivery times are different, and the profits will be accurately displayed in the trading interface.",
  },
];
