import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'in.siddhaastro.sankalpa',
  appName: 'Sankalpa',
  webDir: 'www',
  server: {
    // The installed app loads the live Sankalpa website so website content
    // updates can reach users without rebuilding the native shell.
    url: 'https://app.siddhaastro.in',
    cleartext: false
  }
};

export default config;
