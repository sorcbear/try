import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';

export default function Home MAWebCalculator() {
  const [ticker, setTicker] = useState('QQQ');
  const [maPeriod, setMaPeriod] = useState(150);
  const [price, setPrice] = useState(0);
  const [shares, setShares] = useState(0);
  const [result, setResult] = useState(null);

  const fetchData = async () => {
    try {
      const params = new URLSearchParams({
        ticker,
        maPeriod: maPeriod.toString()
      });
      const res = await fetch(`/api/getMa?${params.toString()}`);
      const data = await res.json();

      if (!data.success) {
        setResult({ error: data.message });
        return;
      }

      const { ma, maDate } = data;
      const equity = price * shares;
      const leverage = price > ma ? 3.5 : 1.0;
      const suggestion = price > ma ? 'Go high leverage' : 'Stay low leverage';
      const targetShares = (equity * leverage) / price;
      const deltaShares = targetShares - shares;

      setResult({
        ma: ma.toFixed(2),
        maDate,
        leverage,
        suggestion,
        targetShares: Math.round(targetShares),
        deltaShares: Math.round(deltaShares)
      });
    } catch (error) {
      setResult({ error: 'Failed to fetch data from server.' });
    }
  };

  return (
    <div className="p-6 font-mono text-xs">
      <h1 className="text-xl mb-4">📈 MA-Based Position Advisor</h1>
      <Card className="mb-4">
        <CardContent className="space-y-2 pt-4">
          <div>
            <label>Ticker:</label>
            <Input value={ticker} onChange={e => setTicker(e.target.value)} />
          </div>
          <div>
            <label>MA Period:</label>
            <Input type="number" value={maPeriod} onChange={e => setMaPeriod(+e.target.value)} />
          </div>
          <div>
            <label>Current Price:</label>
            <Input type="number" value={price} onChange={e => setPrice(+e.target.value)} />
          </div>
          <div>
            <label>Current Shares:</label>
            <Input type="number" value={shares} onChange={e => setShares(+e.target.value)} />
          </div>
          <Button onClick={fetchData}>Calculate</Button>
        </CardContent>
      </Card>

      {result && (
        result.error ? (
          <Alert variant="destructive">
            <AlertDescription>{result.error}</AlertDescription>
          </Alert>
        ) : (
          <Card>
            <CardContent className="pt-4 space-y-2">
              <div>📅 MA Date: {result.maDate}</div>
              <div>📊 MA Value: {result.ma}</div>
              <div>💡 Suggestion: {result.suggestion}</div>
              <div>⚖️ Leverage: {result.leverage}x</div>
              <div>🎯 Target Shares: {result.targetShares}</div>
              <div>🔄 Shares to Adjust: {result.deltaShares > 0 ? '+' : ''}{result.deltaShares}</div>
            </CardContent>
          </Card>
        )
      )}
    </div>
  );
}
