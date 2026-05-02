# Wasilah Website

Static one-page landing website for `wasilah.site`.

## Files

- `index.html` - page markup and SEO metadata.
- `styles.css` - responsive visual design using Wasilah green `#004B49`.
- `script.js` - English/Bangla copy switcher and app-store link handling.
- `CNAME` - custom domain for GitHub Pages.
- `robots.txt`, `sitemap.xml`, `site.webmanifest` - publishing support files.

## Add App Store Links

When the mobile apps are published, edit `script.js`:

```js
const STORE_LINKS = {
  appStore: "https://apps.apple.com/...",
  googlePlay: "https://play.google.com/store/apps/details?id=..."
};
```

The URL `https://wasilah.site/?download=app` will then send Android visitors to Google Play and Apple visitors to the App Store.

## Publish on GitHub Pages

1. Create a GitHub repository for the website.
2. Upload these files to the repository root.
3. In GitHub, open `Settings > Pages`.
4. Set the source to deploy from the main branch root.
5. Set the custom domain to `wasilah.site`.
6. Enable HTTPS after GitHub finishes DNS and certificate checks.

For the domain, GitHub Pages supports an apex domain like `wasilah.site` and recommends also configuring the `www` subdomain in DNS.

## Publishing Checklist

- Confirm the final App Store and Google Play URLs, then add them to `STORE_LINKS` in `script.js`.
- Create the GitHub repository and upload all website files plus the brand assets used by the page.
- Keep `CNAME` in the repository root with `wasilah.site`.
- In GitHub Pages settings, deploy from the main branch root.
- In the DNS provider, point the apex domain `wasilah.site` to GitHub Pages and configure `www.wasilah.site` as a CNAME to the GitHub Pages default domain.
- Enable HTTPS in GitHub Pages after DNS is detected.
- Verify that `https://wasilah.site/`, `https://www.wasilah.site/`, `robots.txt`, `sitemap.xml`, and `site.webmanifest` load correctly.
- Test the English/Bangla switch, all navigation links, store buttons, and `https://wasilah.site/?download=app`.
- Replace placeholder launch text once the app is live.
- Submit the site URL in Google Search Console after launch.
