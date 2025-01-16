const express = require("express");
const axios = require("axios");
const app = express();
const port = 3000;

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Varsayılan kart numarası
const defaultKartNo = "0430207A8E6C80";

// Ana sayfa: varsayılan kart numarası kullanılır
app.get("/", async (req, res) => {
  res.redirect(`/k/${defaultKartNo}`);
});

// Dinamik kart numarası için rota
app.get("/k/:kartNo", async (req, res) => {
  const kartNo = req.params.kartNo;

  try {
    // Login API'ye POST isteği göndererek token al
    const loginResponse = await axios.post(
      "https://pv2api3.teknarteknoloji.com/api/Transportation/Login",
      {
        username: "tur",
        password: "t@r!",
      }
    );

    if (loginResponse.status === 200) {
      const token = loginResponse.data?.data?.Item1;

      if (!token) {
        return res.status(400).send("Token bulunamadı.");
      }

      // Kart bakiyesi sorgulama API'sine GET isteği gönder
      const balanceResponse = await axios.get(
        `https://pv2api3.teknarteknoloji.com/api/Assistant/getCardBalance/${kartNo}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (balanceResponse.status === 200) {
        const balanceData = balanceResponse.data?.data;

        // Dinamik HTML içeriği oluştur
        const htmlContent = `
          <!DOCTYPE html>
          <html lang="tr">
          <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Kart Bakiyesi</title>
            <style>
              body {
                font-family: Arial, sans-serif;
                background-color: #f4f4f9;
                margin: 0;
                padding: 0;
              }
              h1 {
                text-align: center;
                color: #333;
                margin-top: 20px;
              }
              .container {
                max-width: 800px;
                margin: 0 auto;
                padding: 20px;
                background-color: #fff;
                box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
                border-radius: 8px;
              }
              table {
                width: 100%;
                border-collapse: collapse;
                margin-top: 20px;
              }
              th, td {
                padding: 12px;
                text-align: left;
                border-bottom: 1px solid #ddd;
              }
              th {
                background-color: #007bff;
                color: white;
              }
              tr:hover {
                background-color: #f1f1f1;
              }
              td {
                background-color: #f9f9f9;
              }
              .highlight {
                font-weight: bold;
                color: #333;
              }
              a {
                display: block;
                text-align: center;
                margin: 20px auto;
                padding: 10px 20px;
                background-color: #007bff;
                color: white;
                text-decoration: none;
                border-radius: 5px;
                max-width: 200px;
              }
              a:hover {
                background-color: #0056b3;
              }
            </style>
          </head>
          <body>
            <div class="container">
              <h1>Kart Bakiyesi Bilgileri</h1>
              <table>
                <tr><th>Bakiyeniz</th><td>${balanceData.balance || "N/A"}</td></tr>
                <tr><th>Geçerlilik Tarihi</th><td>${balanceData.validity || "N/A"}</td></tr>
                <tr><th>Son İşlem Tarihi</th><td>${balanceData.lastOperation || "N/A"}</td></tr>
                <tr><th>Son Yükleme</th><td>${balanceData.lastUpload || "Yok"}</td></tr>
                <tr><th>Mifare ID</th><td>${balanceData.mifareId || "N/A"}</td></tr>
                <tr><th>Adı</th><td>${balanceData.name || "N/A"}</td></tr>
                <tr><th>Bekleyen Yükleme</th><td>${balanceData.waitingUpload || "Yok"}</td></tr>
                <tr><th>Durum</th><td>${balanceData.status || "N/A"}</td></tr>
                <tr><th>TC</th><td>${balanceData.tc || "N/A"}</td></tr>
                <tr><th>Tip Açıklaması</th><td>${balanceData.typeDescription || "N/A"}</td></tr>
                <tr><th>Geçerlilik Sonu</th><td>${balanceData.expiration || "N/A"}</td></tr>
              </table>
            </div>
            <a href="/k/044E80FADB5E80">Varsayılan Kartı Sorgula</a>
          </body>
          </html>
        `;

        // HTML içeriğini döndür
        res.send(htmlContent);
      } else {
        res.status(400).send("Kart bakiyesi sorgulaması başarısız!");
      }
    } else {
      res.status(400).send("Giriş başarısız!");
    }
  } catch (error) {
    console.error(error.message);
    res.status(500).send("Bir hata oluştu!");
  }
});

// Sunucuyu başlat
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
