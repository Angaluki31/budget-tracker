# Budget Tracker

A simple, fast budget tracker that helps people plan their money, track where it goes, and stay inside their limits. Built with plain HTML, CSS and JavaScript – no frameworks, no sign-up, no server. Your data stays in your own browser.

## Features

- Record income and expenses with a date, category and note
- Monthly summary: income, spent, and money left to spend
- Spending limits per category with progress bars (amber at 80%, red when over)
- One-click "Suggest limits" based on the 50/30/20 rule (needs / wants / savings)
- Savings goal with a progress bar
- Multiple currencies (KSh, USD, EUR, GBP, UGX, TZS, NGN)
- Export transactions to CSV
- Works offline and on mobile screens; data saved in `localStorage`

## Getting started

1. Clone the repo
   ```bash
   git clone https://github.com/Angaluki31/budget-tracker.git
   cd budget-tracker
   ```
2. Open `index.html` in your browser (or use the **Live Server** extension in VS Code).

## Project structure

```
pocketplan/
├── index.html   # page structure
├── style.css    # styling
├── app.js       # app logic and storage
└── README.md
```

## How to use

1. Add your income for the month.
2. Click **Suggest limits (50/30/20)** or set your own limit for each category.
3. Log expenses as they happen and watch the bars.
4. Set a savings goal and add transactions in the **Savings** category.

## Roadmap

- [ ] Charts (spending by category, month-to-month trend)
- [ ] Recurring transactions (rent, subscriptions)
- [ ] Edit transactions
- [ ] Dark mode
- [ ] Installable PWA with offline support
- [ ] Mobile-money (M-Pesa) message import
- [ ] Cloud backup / multi-device sync

## Contributing

Pull requests are welcome. For big changes, please open an issue first to discuss what you would like to change.

## License

MIT