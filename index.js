const express = require('express');
const fetch = require('node-fetch');
const app = express();
app.use(express.json());

// FileMaker サーバー設定
const FMSERVER = 'https://192.168.33.44';
const DBNAME = 'Retell_';
const LAYOUT = 'BtoC';
const FM_TOKEN = 'your_access_token';

// Zoom Webhook受信
app.post('/zoom/webhook', async (req, res) => {
  // 🔐 Zoomの検証リクエストに対応（encryptedTokenなし）
  if (req.body.event === 'endpoint.url_validation') {
    const plainToken = req.body.payload?.plainToken;

    console.log('🔐 Zoom検証リクエスト受信！');
    return res.json({
      plainToken
    });
  }

  // 🔍 Zoomからのリクエスト全体をログ出力
  console.log('🔍 受信データ:', JSON.stringify(req.body, null, 2));

  try {
    const caller = req.body.payload?.caller_number;
    console.log('📞 Zoom 着信番号:', caller);

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
    console.log('📥 FileMakerレスポンス:', data);

    res.status(200).send('ok');

  } catch (err) {
    console.error('❌ エラー:', err);
    res.status(500).send('error');
  }
});

// サーバー起動確認用
app.get('/', (req, res) => {
  res.send('Zoom Webhook サーバー稼働中！');
});

app.listen(3000, () => console.log('🚀 Webhook server running on port 3000'));
