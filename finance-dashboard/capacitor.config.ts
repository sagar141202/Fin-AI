import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.finai.app',
  appName: 'Fin-AI',
  webDir: 'dist',
  server: {
    androidScheme: 'https',
    url: 'https://finai-frontend-xi.vercel.app',
    cleartext: true
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      backgroundColor: '#030712',
      showSpinner: false
    }
  }
};

export default config;
