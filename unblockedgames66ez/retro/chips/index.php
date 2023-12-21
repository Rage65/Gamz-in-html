<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Cookie Clicker Game</title>
    <link rel="stylesheet" href="style.css">
    <script src="game.js" defer></script>
</head>
<body>

<h1>Cookie Clicker Game</h1>

<button id="clickBtn">Click Me!</button>
<p>Chips: <span id="chipCount"><?php echo getChipCount(); ?></span></p>

<h2>Upgrades</h2>
<button id="cpsUpgradeBtn">Buy 2 Chips Per Second Upgrade (Cost: <span id="cpsUpgradeCost">50</span> chips)</button>
<button id="cpcUpgradeBtn">Buy 3 Chips Per Click Upgrade (Cost: <span id="cpcUpgradeCost">40</span> chips)</button>

<p>Chips Per Second: <span id="cps">0</span></p>
<p>Chips Per Click: <span id="cpc">1</span></p>

<button id="resetBtn">Reset Game</button>

</body>
</html>

<?php
function getChipCount() {
    return isset($_COOKIE['chipCount']) ? $_COOKIE['chipCount'] : 0;
}
?>
