# Siddha Astro — free PWA and Android Play Store preparation

## What this branch changes
- Adds a PWA manifest with standalone display, portrait orientation and shortcuts to Panchangam and Astrology.
- Adds iOS Home Screen metadata.
- Registers the root-scoped service worker from the home page.
- Caches the app shell for basic offline access while keeping page navigations network-first.
- Preserves the existing push-notification handlers.

## Deploy and test
1. Merge this branch only after reviewing the Netlify deploy preview.
2. Open the production HTTPS website in Chrome on Android and check that the manifest and service worker load successfully.
3. Test Home, Panchangam, Astrology, Library, Settings, Google sign-in and language/theme controls online.
4. Switch to airplane mode and confirm that the cached app shell opens. Dynamic Panchangam/API data still requires a connection.
5. On iPhone, open the HTTPS site in Safari, tap Share, then Add to Home Screen.

## Android Play Store packaging (no paid builder)
1. Open https://www.pwabuilder.com/ and enter https://siddhasankalpa.netlify.app/.
2. Run the PWA checks. Confirm that the icon source is a square, high-resolution PNG and that the generated manifest reports usable 192px and 512px icons. If the checker rejects /logo.png, create dedicated square 192px and 512px PNG icons before packaging; do not publish with an invalid icon.
3. Choose Package for Stores > Android. PWABuilder generates a Trusted Web Activity (TWA) Android package.
4. Recover the exact existing applicationId/package name from the current Google Play Console listing before building the production release. Do not create a new listing or guess the ID.
5. Sign the Android package with a release key and keep the keystore and passwords private and backed up.
6. Add the generated Digital Asset Links statement at https://siddhasankalpa.netlify.app/.well-known/assetlinks.json using the final package name and SHA-256 fingerprint of the signing certificate used for the Play release.
7. Test the signed Android App Bundle on a real device. Verify Google sign-in, external links, file downloads, back navigation and push notification behavior.
8. Upload the AAB to the existing Play Console app's internal testing track first. Do not replace a currently published production build until the test passes.

## Important limitations and costs
- PWA development and PWABuilder packaging are free.
- A TWA package is a web-powered Android app, not a fully offline native rewrite. Dynamic Panchangam, astrology calculations and Firebase services need network access.
- Google Play Console registration is separate from packaging.
- Installing the PWA on iPhone from Safari is free. Publishing a native wrapper through Apple's App Store requires Apple Developer Program membership.
- This branch does not publish automatically. Review and merge after the deploy preview passes.

## Current icon note
The current manifest points to the repository's existing /logo.png for both declared icon sizes. Validate the actual image dimensions and square safe area in PWABuilder. If it fails, supply dedicated 192x192 and 512x512 PNG files before store submission.
