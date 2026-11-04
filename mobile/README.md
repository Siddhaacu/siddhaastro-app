# Sankalpa mobile app wrapper

This folder contains the initial Capacitor wrapper configuration for the existing Sankalpa website.

## App identity
- Display name: Sankalpa
- Proposed Android application ID / iOS bundle ID: `in.siddhaastro.sankalpa`
- Website: https://app.siddhaastro.in

The identifier is a proposed fresh identity. Confirm that it is available in Google Play Console and App Store Connect before creating store records; application IDs and bundle IDs cannot be casually changed after publication.

## Important architecture note
The initial wrapper loads the live HTTPS website. This allows website content and fixes to appear in the installed app without shipping a new native binary, but the app requires an internet connection for the website and its dynamic services. It is not a fully bundled offline native app. App-review policies and sign-in/payment behavior must be tested before submission.

## Generate native projects
From this directory:
1. `npm install`
2. `npx cap add android`
3. `npx cap add ios` (requires macOS/Xcode)
4. `npx cap sync`
5. Open Android Studio with `npx cap open android` or Xcode with `npx cap open ios`.

## Release signing
- Android APK/AAB: create and securely retain a release keystore; never commit it or its passwords. Configure Play App Signing in Play Console.
- iOS IPA: requires an Apple Distribution certificate, provisioning profile, and Apple Developer Team. Build/archive/sign with Xcode on macOS.
- Do not upload unsigned/debug builds to either store.

## Status
This is configuration only, not a generated or signed APK/IPA. A production build still requires native platform generation, device testing, and owner-controlled signing credentials.
