const express = require('express');
const fetch = require('node-fetch');
const app = express();
app.use(express.json());

// FileMaker サーバー設定
const FMSERVER = 'https://192.168.33.44';      // FileMaker Server URL
const DBNAME = 'Retell_';
const LAYOUT = 'BtoC';
const FM_TOKEN = 'your_access_token';          // Data API トークン

// Zoom Webhook受信
app.post('/zoom/webhook', async (req, res) => {
  // 🔐 Zoomの検証リクエストに対応
  if (req.body.plainToken && req.body.encryptedToken) {
    return res.json({
      plainToken: req.body.plainToken,
      encryptedToken: req.body.encryptedToken
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

  }