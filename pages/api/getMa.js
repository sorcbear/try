import yahooFinance from 'yahoo-finance2';

export default async function handler(req, res) {
  const { ticker, maPeriod } = req.query;
  try {
    const result = await yahooFinance(ticker, { period1: '2020-01-01' });
    const closePrices = result.map(r => r.close).filter(n => typeof n === 'number').slice(-parseInt(maPeriod));
    if (closePrices.length < maPeriod) {
      return res.json({ success: false, message: 'Not enough data.' });
    }
    const ma = closePrices.reduce((a, b) => a + b, 0) / closePrices.length;
    const lastDate = result[result.length - 1].date;
    return res.json({ success: true, ma, maDate: lastDate.toISOString().split('T')[0] });
  } catch (error) {
    return res.json({ success: false, message: 'Error fetching data.' });
  }
}