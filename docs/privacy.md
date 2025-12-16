# Privacy Policy  

## Introduction:  
To be clear and transparent about what data this software uses and how it is handled.

## Information collection and use: 
### Rate limiting, Privacy and Security:

To implement a `rate limiting` system, this software works with your IP address. 

However, the IP is immediately hashed using `SHA-256`, combined with a `SALT` key (strong, secret, and secure) stored in the `.env` file. Your IP is **never logged** anywhere.

The IP is **never stored in any external database** or service. 

The **hashed IP** is the **only personal information** used by this project, and it's solely for security and abuse-prevention purposes. While fingerprinting could also be used, this project aims to remain as **privacy-friendly** as possible.

You can check the [rate.ts](utilities/rate.ts) file if you want to see how it works.

## Cookies: 
**No cookies**, **no analytics**, **no tracking logs**, or **any other** data is collected by the project.

## About my Online instance with [Cloudflare Workers](https://developers.cloudflare.com/workers/):

This project is hosted on Cloudflare Workers, a serverless platform.
 
Even though IP addresses are hashed with a strong secret and automatically after few seconds, this data might be subject to processing in jurisdictions with different privacy laws.

If you're concerned about this, consider self-hosting the project in an EU-only environment. Remember that [Cloudflare Workers](https://developers.cloudflare.com/workers/) is an edge platform, and its goal is to run code as close to the user as possible.

## Changes to This Privacy Policy:  
I may update this Privacy Policy from time to time. You are advised to review this page periodically for any changes.

Any updates will be posted on this page and will take effect immediately upon posting.

## Contact me:  
If you have any questions or suggestions about our Privacy Policy, do not hesitate to contact me.

Contact Information:  
Email: *nathan.debilloez@outlook.com*  