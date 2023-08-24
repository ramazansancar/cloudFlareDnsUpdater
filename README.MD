# Cloudflare DNS Updater

This is a simple script to update a Cloudflare DNS record with your current public IP address.

## Usage

1. Clone the repo
2. Run `npm install`
3. Copy `.env.example` to `.env`
4. Edit `env.json` with your Cloudflare API key and the DNS record you want to update
5. Run `npm start`

### Requirements

- NPM
- NodeJS
- A Cloudflare account
  - Cloudflare API key [#Here](https://dash.cloudflare.com/profile/api-tokens)
    - A Cloudflare API key with the following options:
      - Permissions:
        - Zone:DNS:Read
        - Zone:DNS:Edit
      - Zone Resources:
        - Include: Specific zone
        - Select zone: The zone you want to update
      - Client IP Address Filtering:
        - Is not in: 192.168.1.1 (or whatever your local IP is)

## Sources

- [https://developers.cloudflare.com/api/operations/user-api-tokens-verify-token](Verify API Token)
- [https://developers.cloudflare.com/api/operations/zones-get](Get Zone List)
- [https://developers.cloudflare.com/api/operations/dns-records-for-a-zone-list-dns-records](Get DNS Records for a Zone)
- [https://developers.cloudflare.com/api/operations/dns-records-for-a-zone-update-dns-record](Update DNS Record)
- [https://community.cloudflare.com/t/update-dns-records-via-api/132221](Update DNS Record) (Example)
- [https://community.cloudflare.com/t/whatsmyip-cloudflare-com/152247](What's my IP?)
- [https://developers.cloudflare.com/fundamentals/get-started/reference/cdn-cgi-endpoint/](CDN-CGI Endpoint)
- [https://community.cloudflare.com/t/regarding-cdn-cgi-trace/239956](Ipv4 What's my IP?)
- [https://github.com/axios/axios/issues/444](Axios requset with ipv4) (My server is ipv6 only)
- [https://axios-http.com/docs/config_defaults](Axios instance defaults)
- [https://stackoverflow.com/questions/63453491/how-to-export-axios-create-in-typescript](Axios instance export)
