import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.seranex.chat',
  appName: 'Chat App',
  webDir: 'out',
  server: {
    url: 'https://chat.seranex.lk',
    cleartext: true
  }
};

export default config;
