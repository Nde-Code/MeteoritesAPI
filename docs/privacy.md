# Privacy:

## Introduction:

This privacy policy explains clearly and transparently what data this software processes and how that data is handled.

## Information collection and use:

### Rate limiting, privacy, and security:

This project implements **rate limiting** to protect the service against abusive usage. The only mechanism implemented is **burst protection**, which prevents the service from being overwhelmed by repeated and rapid requests. It uses [Cloudflare Workers Cache](https://developers.cloudflare.com/workers/runtime-apis/cache/) to store the required data.

To implement **rate limiting**, this software processes your **IP address**.

However, the IP address is **immediately pseudonymized**:

- It is hashed using **SHA-256**.
- It is combined with a strong, secret **SALT** stored:
  - locally in `.dev.vars`,
  - and in [Cloudflare Workers Secrets](https://developers.cloudflare.com/workers/configuration/secrets/#secrets-on-deployed-workers) in production.

Your IP address is **never logged**, stored in plain text, or saved in any external database or external service.

The hashed IP is retained **only for the time required** to apply rate limiting and is **automatically removed afterward**.

You may review the implementation in the file: [rate.ts](../utilities/rate.ts).

### Legal basis:

Processing of the hashed IP address is strictly for **protecting the service against abuse** through rate limiting.

Because the IP address is immediately transformed using a cryptographic hash and a secret salt, the resulting value is not stored in its original form and is not directly identifiable as an IP address. However, this hashed value may still be considered pseudonymized personal data under applicable data protection laws.

## Cookies:

This project does not use **cookies**, **analytics**, or **application-level tracking**.

## Cloudflare Workers:

The online instance of this project runs on [Cloudflare Workers](https://workers.cloudflare.com/), a serverless edge platform designed to execute code close to users.

Although IP addresses are hashed with a secret salt and retained only briefly, data may be processed in different geographic regions, where different data protection and privacy laws may apply.

If this is a concern, you can use [Cloudflare Workers Placement](https://developers.cloudflare.com/workers/configuration/placement/) to influence where your Worker executes and help meet your geographic or privacy requirements.

## Changes to this privacy policy:

This privacy policy may be updated periodically.

Any changes will be posted on this page and take effect immediately upon publication.

## Your rights:

If you wish to request the removal of the **hashed IP** associated with your usage, you may contact me.

Please note that this hash is not used to identify you and is never linked to any other data.

## Contact:

If you have any questions or suggestions regarding this privacy policy, feel free to contact me:

- Email: [nathan.debilloez@outlook.com](mailto:nathan.debilloez@outlook.com)
- Website: [https://nde-code.github.io/](https://nde-code.github.io/)

Thank you for your understanding.
