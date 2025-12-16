const express = require('express');
const fetch = require('node-fetch');
const app = express();
app.use(express.json());

// FileMaker サーバー設定
const FMSERVER = 'https://192.168.33.44';      // FileMaker Server URL
const DBNAME = 'Retell_';
const LAYOUT = 'BtoC';
const FM_TOKEN = 'your_access_token';            // Data API トークン

// Zoom Webhook受信
app.post('/zoom/webhook', async (req, res) => {
  try {
    const caller = req.body.payload?.caller_number;
    console.log('Zoom 着信番号:', caller);

    if (!caller) {
      return res.status(400).send('caller_number not found');
    }

    // FileMaker Data API呼び出し
    const fmpUrl = `${FMSERVER}/fmi/data/v1/databases/${DBNAME}/layouts/${LAYOUT}/script/${encodeURIComponent('着信番号検索')}`;

    const response = await fetch(fmpUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${FM_TOKEN}`
      },
      body: JSON.stringify({ "script.param": caller })
    });

    const data = await response.json();
    console.log('FileMakerレスポンス:', data);

    res.status(200).send('ok');

  } catch (err) {
    console.error(err);
    res.status(500).send('error');
  }
});

// サーバー起動
app.get('/', (req, res) => {
  res.send('Zoom Webhook サーバー稼働中！');
});
app.listen(3000, () => console.log('Webhook server running on port 3000'));