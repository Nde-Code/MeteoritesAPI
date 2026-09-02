# Privacy:

## Introduction:

This privacy policy explains clearly and transparently what data this software processes and how that data is handled.

## Information collection and use:

### Rate limiting, privacy, and security:

To implement **rate limiting**, this software processes your **IP address**.  
However, the IP address is **immediately pseudonymized**:

- It is hashed using **SHA-256**.
- It is combined with a strong, secret **SALT** stored:
  - locally in `.dev.vars`,
  - and in [Cloudflare Workers Secrets](https://developers.cloudflare.com/workers/configuration/secrets/#secrets-on-deployed-workers) in production.

Your IP address is **never logged**, stored in plain text, or saved in any external database or external service.

Only the **hashed IP** is used, and it is the **only personal data** processed by this project. It is used **solely** for rate limiting and abuse prevention.

Although fingerprinting could be used, this project intentionally avoids it to remain as **privacy-friendly** as possible.

The hashed IP is retained **only for the time required** to apply rate limiting and is **automatically removed afterward**.

You may review the implementation in the file [rate.ts](../utilities/rate.ts).

### Legal basis:

Processing of the hashed IP address is strictly for **protecting the service against abuse** through rate limiting.  

Because the IP address is pseudonymized using a cryptographic hash and never stored in its original form, it **cannot be used to personally identify you**.

## Cookies:

This project uses **no cookies**, **no analytics**, **no tracking logs**, and does not collect any additional data.

## Cloudflare Workers hosting:

The online instance of this project runs on [Cloudflare Workers](https://workers.cloudflare.com/), a serverless edge platform designed to execute code close to users.

Although IP addresses are hashed with a secret salt and retained only briefly, data may be processed in different geographic regions, where different data protection and privacy laws may apply.

If this is a concern, you can use [Cloudflare Workers Placement](https://developers.cloudflare.com/workers/configuration/placement/) to influence where your Worker executes and help meet your geographic or privacy requirements.

## Changes to this privacy policy:

This privacy policy may be updated periodically.

Any changes will be posted on this page and take effect immediately upon publication.

## Your rights:

If you wish to request the removal of the **hashed IP** associated with your usage, you may contact me.

Please note that this hash **cannot identify you personally** and is never linked to any other data.

## Contact:

If you have any questions or suggestions regarding this privacy policy, feel free to contact me:

- Email: [nathan.debilloez@outlook.com](mailto:nathan.debilloez@outlook.com)
- Website: [https://nde-code.github.io/](https://nde-code.github.io/)

Thank you for your understanding.
