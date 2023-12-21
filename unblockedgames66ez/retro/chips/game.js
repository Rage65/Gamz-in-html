document.addEventListener('DOMContentLoaded', function () {
    const clickBtn = document.getElementById('clickBtn');
    const chipCountDisplay = document.getElementById('chipCount');
    const cpsUpgradeBtn = document.getElementById('cpsUpgradeBtn');
    const cpcUpgradeBtn = document.getElementById('cpcUpgradeBtn');
    const cpsDisplay = document.getElementById('cps');
    const cpcDisplay = document.getElementById('cpc');
    const resetBtn = document.getElementById('resetBtn');
    const cpsUpgradeCostDisplay = document.getElementById('cpsUpgradeCost');
    const cpcUpgradeCostDisplay = document.getElementById('cpcUpgradeCost');

    let chipCount = parseInt(chipCountDisplay.innerText);
    let chipsPerSecond = 0;
    let chipsPerClick = 1;
    let cpsInterval;
    let cpsUpgradesPurchased = 0;

    // Load previous upgrades and chip count from cookies
    const savedCPS = parseInt(getCookie('cps')) || 0;
    const savedCPC = parseInt(getCookie('cpc')) || 1;
    const savedCPSUpgrades = parseInt(getCookie('cpsUpgrades')) || 0;

    chipsPerSecond = savedCPS;
    chipsPerClick = savedCPC;
    cpsUpgradesPurchased = savedCPSUpgrades;

    cpsDisplay.innerText = chipsPerSecond;
    cpcDisplay.innerText = chipsPerClick;

    let cpsUpgradeCost = 50 * Math.pow(10, cpsUpgradesPurchased); // Increase cost based on the number of upgrades purchased
    let cpcUpgradeCost = 40;

    cpsUpgradeCostDisplay.innerText = cpsUpgradeCost;
    cpcUpgradeCostDisplay.innerText = cpcUpgradeCost;

    // If CPS upgrades were purchased, start the CPS interval
    if (cpsUpgradesPurchased > 0 && chipsPerSecond > 0) {
        cpsInterval = setInterval(function () {
            chipCount += chipsPerSecond;
            chipCountDisplay.innerText = chipCount;
            setCookie('chipCount', chipCount, 365);
        }, 1000);
    }

    // Update chip count when button is clicked
    function updateChipCount() {
        chipCount += chipsPerClick;
        chipCountDisplay.innerText = chipCount;
        setCookie('chipCount', chipCount, 365);
    }

    clickBtn.addEventListener('click', updateChipCount);

    // Buy Chips Per Second Upgrade
    cpsUpgradeBtn.addEventListener('click', function () {
        if (chipCount >= cpsUpgradeCost) {
            chipCount -= cpsUpgradeCost;
            chipsPerSecond += 2;
            cpsUpgradesPurchased++;
            cpsDisplay.innerText = chipsPerSecond;
            chipCountDisplay.innerText = chipCount;
            setCookie('chipCount', chipCount, 365);
            setCookie('cps', chipsPerSecond, 365);
            setCookie('cpsUpgrades', cpsUpgradesPurchased, 365);

            // Increase the cost for the next upgrade
            cpsUpgradeCost = 50 * Math.pow(10, cpsUpgradesPurchased);
            cpsUpgradeCostDisplay.innerText = cpsUpgradeCost;

            // Start the CPS interval if it's not already running
            if (!cpsInterval && chipsPerSecond > 0) {
                cpsInterval = setInterval(function () {
                    chipCount += chipsPerSecond;
                    chipCountDisplay.innerText = chipCount;
                    setCookie('chipCount', chipCount, 365);
                }, 1000);
            }
        } else {
            alert('Not enough chips!');
        }
    });

    // Buy Chips Per Click Upgrade
    cpcUpgradeBtn.addEventListener('click', function () {
        if (chipCount >= cpcUpgradeCost) {
            chipCount -= cpcUpgradeCost;
            chipsPerClick += 3;
            cpcDisplay.innerText = chipsPerClick;
            chipCountDisplay.innerText = chipCount;
            setCookie('chipCount', chipCount, 365);
            setCookie('cpc', chipsPerClick, 365);

            // Increase the cost for the next upgrade
            cpcUpgradeCost *= 10;
            cpcUpgradeCostDisplay.innerText = cpcUpgradeCost;
        } else {
            alert('Not enough chips!');
        }
    });

    // Reset Game Button
    resetBtn.addEventListener('click', function () {
        // Reset variables to default values
        chipCount = 0;
        chipsPerSecond = 0;
        chipsPerClick = 1;
        cpsUpgradesPurchased = 0;
        cpsDisplay.innerText = chipsPerSecond;
        cpcDisplay.innerText = chipsPerClick;
        chipCountDisplay.innerText = chipCount;

        // Reset upgrade costs to default values and update the displayed costs
        cpsUpgradeCost = 50;
        cpcUpgradeCost = 40;
        cpsUpgradeCostDisplay.innerText = cpsUpgradeCost;
        cpcUpgradeCostDisplay.innerText = cpcUpgradeCost;

        // Clear cookies
        document.cookie = 'chipCount=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
        document.cookie = 'cps=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
        document.cookie = 'cpc=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
        document.cookie = 'cpsUpgrades=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';

        // Stop CPS interval if it's running
        clearInterval(cpsInterval);
        cpsInterval = null;
    });

    // Cookies functions
    function setCookie(name, value, days) {
        const date = new Date();
        date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
        const expires = "expires=" + date.toUTCString();
        document.cookie = name + "=" + value + ";" + expires + ";path=/";
    }

    function getCookie(name) {
        const decodedCookie = decodeURIComponent(document.cookie);
        const cookies = decodedCookie.split(';');
        for (let i = 0; i < cookies.length; i++) {
            const cookie = cookies[i].trim();
            if (cookie.indexOf(name + "=") == 0) {
                return cookie.substring(name.length + 1);
            }
        }
        return "";
    }
});
