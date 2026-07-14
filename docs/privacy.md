# Privacy Policy:  

## Introduction:  
To be clear and transparent about what data this software uses and how it is handled.

## Information Collection and Use: 
### Rate limiting, Privacy and Security:

To implement a *rate limiting* system, this software works with your IP address. 

However, the IP is immediately hashed using *SHA-256*, combined with a *SALT* key (strong, secret, and secure) stored in the `.dev.vars` file (in local) and in [Cloudflare secrets](https://developers.cloudflare.com/workers/configuration/secrets/) in production. Your IP is **never logged** anywhere.

The IP is **never stored in any external database** or service. 

The **hashed IP** is the **only personal information** used by this project, and it's solely for security and abuse-prevention purposes. While fingerprinting could also be used, this project aims to remain as **privacy-friendly** as possible.

The **hashed IP** is kept **only for the time required** to apply rate limiting and is **automatically removed afterward**.

You can check the [rate.ts](../utilities/rate.ts) file if you want to see how it works.

### Legal Basis:

The processing of the **hashed IP** address **is strictly for protecting** the service against abuse (rate limiting). This data is **pseudonymized and cannot identify any user**.

## Cookies: 
**No cookies**, **no analytics**, **no tracking logs**, or **any other** data is collected by the project.

## About my Online instance with [Cloudflare Workers](https://developers.cloudflare.com/workers/):

This project is hosted on [Cloudflare Workers](https://developers.cloudflare.com/workers/), a serverless platform.
 
Even though IP addresses are hashed with a strong secret and automatically after few seconds, this data might be subject to processing in jurisdictions with different privacy laws.

If you're concerned about this, consider self-hosting the project in an EU-only environment. Remember that [Cloudflare Workers](https://developers.cloudflare.com/workers/) is an edge platform, and its goal is to run code as close to the user as possible.

## Changes to This Privacy Policy:  
I may update this Privacy Policy from time to time. You are advised to review this page periodically for any changes.

Any updates will be posted on this page and will take effect immediately upon posting.

## Your Rights:

If you wish to request the removal of the **hashed IP** associated with your usage, you may contact me.

Please note that this hash **cannot identify you personally** and is never linked to any other data.

## Contact me:  
If you have any questions or suggestions about our Privacy Policy, do not hesitate to contact me.

Contact Information:  
- e-mail: nathan.debilloez@outlook.com  
- Website: [https://nde-code.github.io/](https://nde-code.github.io/)

Thank you for your understanding. 
