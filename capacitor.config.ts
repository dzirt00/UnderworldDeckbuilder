import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.dzirt00.UnderworldDeckbuilder',
  appName: 'Underworld Deckbuilder',
  webDir: 'dist',
    plugins: {
      StatusBar: {
        backgroundColor: "#0f0f1a",
        overlaysWebView: true,
        style: "DARK"
      }
    },
    android: {
      backgroundColor: "#0f0f1a"
    }
};

export default config;
