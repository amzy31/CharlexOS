<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Personal Libertarian Project</title>
  <link href="css/bootstrap.min.css" rel="stylesheet" />
  <style>
    body {
      background-color: #f8f9fa;
      font-family: Arial, sans-serif;
    }
    .donate-bar {
      background-color: #007bff;
      color: white;
      padding: 10px;
      text-align: center;
      position: fixed;
      bottom: 0;
      width: 100%;
      z-index: 1000;
    }
    .donate-bar button {
      margin-left: 10px;
    }
    .hero {
      background-color: #343a40;
      color: white;
      padding: 100px 0;
      text-align: center;
    }
    .content {
      padding: 50px 0;
    }
  </style>
</head>
<body>
  <div class="hero">
    <div class="container">
      <h1>Welcome to My Personal Libertarian Project</h1>
      <p class="lead">Advocating for freedom, liberty, and individual rights.</p>
    </div>
  </div>

  <div class="content">
    <div class="container">
      <div class="row">
        <div class="col-md-8">
          <h2>About Libertarianism</h2>
          <p>Libertarianism is a political philosophy that upholds liberty as a core principle. Libertarians seek to maximize autonomy and political freedom, emphasizing free markets, civil liberties, and non-interventionism.</p>
          <p>This project is dedicated to promoting libertarian ideas and values.</p>
        </div>
        <div class="col-md-4">
          <h3>Key Principles</h3>
          <ul>
            <li>Individual Liberty</li>
            <li>Free Markets</li>
            <li>Limited Government</li>
            <li>Personal Responsibility</li>
          </ul>
        </div>
      </div>
    </div>
  </div>

  <div class="donate-bar">
    <span>Support this project: Bitcoin Address - 1GeJAAGxiuRyzw7byVhgBGripYEeE9UWzM</span>
    <button class="btn btn-light btn-sm" onclick="copyAddress()">Copy Address</button>
  </div>

  <script>
    function copyAddress() {
      const address = '1GeJAAGxiuRyzw7byVhgBGripYEeE9UWzM';
      navigator.clipboard.writeText(address).then(() => {
        alert('Bitcoin address copied to clipboard!');
      }).catch(err => {
        console.error('Failed to copy: ', err);
      });
    }
  </script>
  <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js"></script>
</body>
</html>
