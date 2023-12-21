document.addEventListener('DOMContentLoaded', function () {
    const clickBtn = document.getElementById('clickBtn');
    const chipCountDisplay = document.getElementById('chipCount');
    const cpsUpgradeBtn = document.getElementById('cpsUpgradeBtn');
    const cpcUpgradeBtn = document.getElementById('cpcUpgradeBtn');
    const cpsDisplay = document.getElementById('cps');
    const cpcDisplay = document.getElementById('cpc');
    const resetBtn = document.getElementById('resetBtn');

    let chipCount = parseInt(chipCountDisplay.innerText);
    let chipsPerSecond = 0;
    let chipsPerClick = 1;
    let cpsInterval;

    // Load previous upgrades and chip count from cookies
    const savedCPS = parseInt(getCookie('cps')) || 0;
    const savedCPC = parseInt(getCookie('cpc')) || 1;
    const cpsPurchased = getCookie('cpsPurchased') === 'true';

    chipsPerSecond = cpsPurchased ? savedCPS : 0;
    chipsPerClick = savedCPC;

    cpsDisplay.innerText = chipsPerSecond;
    cpcDisplay.innerText = chipsPerClick;

    // If CPS was purchased, start the CPS interval
    if (cpsPurchased && chipsPerSecond > 0) {
        cpsInterval = setInterval(function () {
            chipCount += chipsPerSecond;
            chipCountDisplay.innerText = chipCount;
            setCookie('chipCount', chipCount, 365);
        }, 1000);
    }

    // Update chip count when button is clicked
    clickBtn.addEventListener('click', function () {
        chipCount += chipsPerClick;
        chipCountDisplay.innerText = chipCount;
        setCookie('chipCount', chipCount, 365);
    });

    // Buy Chips Per Second Upgrade
    cpsUpgradeBtn.addEventListener('click', function () {
        if (chipCount >= 50 && chipsPerSecond === 0) {
            chipCount -= 50;
            chipsPerSecond += 2;
            cpsDisplay.innerText = chipsPerSecond;  // Update the display immediately
            chipCountDisplay.innerText = chipCount;
            setCookie('chipCount', chipCount, 365);
            setCookie('cps', chipsPerSecond, 365);
            setCookie('cpsPurchased', 'true', 365);

            // Start the CPS interval if it's not already running
            if (!cpsInterval) {
                cpsInterval = setInterval(function () {
                    chipCount += chipsPerSecond;
                    chipCountDisplay.innerText = chipCount;
                    setCookie('chipCount', chipCount, 365);
                }, 1000);
            }
        } else if (chipsPerSecond > 0) {
            alert('You already bought the Chips Per Second upgrade.');
        } else {
            alert('Not enough chips or upgrade already bought!');
        }
    });

    // Buy Chips Per Click Upgrade
    cpcUpgradeBtn.addEventListener('click', function () {
        if (chipCount >= 40) {
            chipCount -= 40;
            chipsPerClick += 3;
            cpcDisplay.innerText = chipsPerClick;
            chipCountDisplay.innerText = chipCount;
            setCookie('chipCount', chipCount, 365);
            setCookie('cpc', chipsPerClick, 365);
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
        cpsDisplay.innerText = chipsPerSecond;
        cpcDisplay.innerText = chipsPerClick;
        chipCountDisplay.innerText = chipCount;

        // Clear cookies
        document.cookie = 'chipCount=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
        document.cookie = 'cps=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
        document.cookie = 'cpc=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
        document.cookie = 'cpsPurchased=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';

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
