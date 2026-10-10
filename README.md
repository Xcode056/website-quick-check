# Website Quick-Check

A simple website checker built with HTML, CSS, and JavaScript. It checks a few basic things about a website and shows the results with an overall health score.

## Features

* Check DNS using Google's DNS-over-HTTPS service.
* Try to check HTTPS availability.
* Measure approximate favicon loading time.
* Attempt to check website reachability.
* Attempt to check HTTP-to-HTTPS redirection.
* Display results and an overall health score.
* Responsive design for desktop and mobile.

## Built With

* HTML
* CSS
* JavaScript
* Google DNS-over-HTTPS API

## How to Use

1. Open the website.
2. Enter a website address, such as `google.com`.
3. Click **Check Website**.
4. Review the results and health score.

## Limitations

This project runs in the browser, so some checks have limitations.

* **CORS:** Browsers restrict access to responses from other websites. This means the tool cannot reliably read another site's HTML or check its page titles, meta descriptions, and other SEO details.
* **DNS:** A failed DNS lookup does not necessarily mean a domain is available for registration.
* **HTTPS:** The current check uses a favicon request, so a missing favicon can affect the result.
* **Response speed:** The tool measures favicon loading time, not the full page loading time.
* **Reachability and redirects:** Browser security restrictions prevent the tool from reliably confirming HTTP status codes and redirects for every website.

This is a basic learning project, not a complete security scanner or SEO audit tool.

## What I Learned

While building this project, I practised JavaScript functions, `async/await`, promises, the Fetch API, error handling, and working with external data. I also learned how browser security restrictions affect requests to other websites and why some checks cannot be verified reliably from the front end alone.

## Run Locally

Download or clone the repository, then open `index.html` in your browser. An internet connection is needed for the external requests.
