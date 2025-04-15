import type { NextApiRequest, NextApiResponse } from 'next';
import yf from 'yahoo-finance2';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { ticker, maPeriod } = req.query;

  if (!ticker || !maPeriod) {
    return res.status(400).json({ success: false, message: 'Missing parameters' });
  }

  try {
    const period = parseInt(maPeriod as string);
    const result = await yf.historical(ticker as string, {
      period1: '2020-01-01',
      interval: '1d'
    });

    const closes = result.map(r => r.close).filter(n => n != null);
    const latest = closes.slice(-period);
    const ma = latest.reduce((a, b) => a + b, 0) / period;
    const maDate = result[result.length - 1].date.toISOString().split('T')[0];

    res.status(200).json({ success: true, ma, maDate });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Error fetching MA data' });
  }
}
