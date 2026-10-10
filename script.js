
const checkForm = document.getElementById('checkForm');
const urlInput = document.getElementById('url');
const resultDiv = document.getElementById('result');
const loadingP = document.getElementById('loading');
const submitButton = checkForm.querySelector('button');


checkForm.addEventListener('submit', async (event) => {
    event.preventDefault();

    let inputValue = urlInput.value.trim();



    // Add .com only when the user enters a simple name
    // without a domain extension or protocol
    if (
        !inputValue.includes(".") &&
        !inputValue.includes(" ") &&
        !inputValue.includes("://")
    ) {
        inputValue += ".com";
    }



    // Add https:// if the user has not entered a protocol
    if (!/^https?:\/\//i.test(inputValue)) {
        inputValue = "https://" + inputValue;
    }

    // Validate the final URL
    let url;

    try {
        const website = new URL(inputValue);
        website.pathname = website.pathname.replace(/\/+$/, "") || "/";
        url = website.href;
    } catch (error) {
        resultDiv.innerHTML =
            "<p>Please enter a valid website name or URL.</p>";
        return;
    }



    submitButton.disabled = true;
    submitButton.textContent = "Checking...";

    resultDiv.innerHTML = "<p>Checking website...</p>";


    try {
        const checkPromises = [
            checkDNS(url),
            checkHTTPS(url),
            checkResponseSpeed(url),
            checkReachability(url),
            checkHTTPSRedirect(url)
        ];

        const settledResults = await Promise.allSettled(checkPromises);

        const results = settledResults.map((result) => {
            if (result.status === "fulfilled") {
                return result.value;
            }

            return {
                status: "warn",
                tip: "This check could not be completed. Please try again."
            };
        });

        const healthScore = calculateHealthScore(results);
        const healthLabel = getHealthLabel(healthScore);



        resultDiv.innerHTML = `
        <h2>Website Check Results</h2>

        <h3>Overall Health Score: ${healthScore}%</h3>
        <p>Overall Status: ${healthLabel}</p>

        <h3>DNS</h3>
        
        <p>Status: ${results[0].status}</p>
  
        <p>${results[0].tip}</p>

        <h3>HTTPS</h3>
        <p>Status: ${results[1].status}</p>
        <p>${results[1].tip}</p>

        <h3>Response Speed</h3>
        <p>Status: ${results[2].status}</p>
        <p>${results[2].tip}</p>

        <h3>Reachability</h3>
        <p>Status: ${results[3].status}</p>
        <p>${results[3].tip}</p>

        <h3>HTTP to HTTPS Redirect</h3>
        <p>Status: ${results[4].status}</p>
        <p>${results[4].tip}</p>

    `;
    }



    //     const dnsResult = await checkDNS(url);
    //     const httpsResult = await checkHTTPS(url);

    //     resultDiv.innerHTML = `
    //     <p>Status: ${dnsResult.status}</p>
    //     <p>${dnsResult.tip}</p>
    //     <p>Status: ${httpsResult.status}</p>
    //     <p>${httpsResult.tip}</p>
    // `;
    finally {
        submitButton.disabled = false;
        submitButton.textContent = "Check Website";
    }


});

async function checkDNS(url) {

    const website = new URL(url);
    const dnsUrl = `https://dns.google/resolve?name=${website.hostname}&type=A`;


    try {
        const response = await fetch(dnsUrl);
        // console.log('DNS response:', response);
        const data = await response.json();

        if (data.Answer) {

            return {
                status: "pass",
                tip: "DNS is resolving correctly."
            };

        } else {
            return {
                status: "fail",
                tip: "DNS is not resolving correctly."
            };
        }
    }
    catch (error) {
        console.error('Error checking DNS:', error);
        return {
            status: "fail",
            tip: "There was an error checking DNS. Please try again later."
        };
    }



};


// async function checkHTTPS(url) {
//     const website = new URL(url);
//     const httpsUrl = `https://${website.hostname}`;


//     try {
//         const response = await fetch(httpsUrl);

//         return {
//             status: "pass",
//             tip: "HTTPS connection succeeded."
//         };
//     } catch (error) {
//         console.error("Error checking HTTPS:", error);

//         return {
//             status: "fail",
//             tip: "Could not verify the HTTPS connection from your browser."
//         };
//     }
// }




async function checkHTTPS(url) {
    const website = new URL(url);
    const httpsUrl = `https://${website.hostname}`;

    return new Promise((resolve) => {
        const image = new Image();

        image.onload = () => {
            resolve({
                status: "pass",
                tip: "An HTTPS resource loaded successfully."
            });
        };

        image.onerror = () => {
            resolve({
                status: "warn",
                tip: "Could not verify HTTPS using a browser image request."
            });
        };

        image.src = `${httpsUrl}/favicon.ico`;
    });
}


async function checkResponseSpeed(url) {
    const website = new URL(url);
    const faviconUrl = `https://${website.hostname}/favicon.ico`;
    const startTime = performance.now();

    return new Promise((resolve) => {
        const image = new Image();

        image.onload = () => {
            const endTime = performance.now();
            const duration = Math.round(endTime - startTime);

            resolve({
                status: duration < 1000 ? "pass" : "warn",
                tip: `Favicon loaded in approximately ${duration} ms.`
            });
        };

        image.onerror = () => {
            resolve({
                status: "warn",
                tip: "Response speed could not be measured because the favicon did not load."
            });
        };

        image.src = faviconUrl;
    });
}


async function checkReachability(url) {
    try {
        const startTime = performance.now();

        await fetch(url, {
            method: "HEAD",
            mode: "no-cors"
        });

        const endTime = performance.now();

        return {
            status: "pass",
            tip: `The browser completed the request in approximately ${Math.round(endTime - startTime)} ms.`
        };
    } catch (error) {
        return {
            status: "warn",
            tip: "The website could not be checked reliably. It may be offline or blocking browser requests."
        };
    }
}




function calculateHealthScore(results) {
    let points = 0;

    results.forEach((result) => {
        if (result.status === "pass") {
            points += 1;
        } else if (result.status === "warn") {
            points += 0.5;
        }
    });

    const score = Math.round((points / results.length) * 100);

    return score;
}



async function checkHTTPSRedirect(url) {
    try {
        const website = new URL(url);

        const httpUrl = `http://${website.hostname}`;

        const response = await fetch(httpUrl, {
            method: "HEAD",
            redirect: "follow",
            mode: "no-cors"
        });

        if (response.type === "opaqueredirect") {
            return {
                status: "warn",
                tip: "The browser could not confirm the HTTP-to-HTTPS redirect."
            };
        }

        return {
            status: "warn",
            tip: "The browser cannot reliably verify the redirect for this website."
        };
    } catch (error) {
        return {
            status: "warn",
            tip: "The HTTP-to-HTTPS redirect could not be checked reliably."
        };
    }
}



function getHealthLabel(score) {
    if (score >= 80) {
        return "Good";
    } else if (score >= 50) {
        return "Needs Attention";
    } else {
        return "Poor";
    }
}

