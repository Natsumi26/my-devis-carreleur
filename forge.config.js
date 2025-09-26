const { FusesPlugin } = require('@electron-forge/plugin-fuses');
const { FuseV1Options, FuseVersion } = require('@electron/fuses');
const path = require('path');

const iconPath = path.resolve(__dirname, 'assets', 'icon.ico');

module.exports = {
  packagerConfig: {
    name: 'MesDevisFactures',
    asar: true,
    icon: iconPath,
    extraResources: [
      'assets/'
    ]
  },
  rebuildConfig: {},
  makers: [
    // {
    //   "name": "electron-forge-maker-nsis",
    //   "config": {
    //     "oneClick": false,
    //     "perMachine": true,
    //     "allowToChangeInstallationDirectory": true,
    //     "createDesktopShortcut": true,
    //     "createStartMenuShortcut": true,
    //     "shortcutName": "Mes DevisFactures",
    //     "deleteAppDataOnUninstall": true
    //   }
    // },
    // {
    //   name: '@electron-forge/maker-squirrel',
    //   config: {
    //     name: 'MesDevisFactures',
    //     authors: 'REDON marion',                  // optionnel
    //     setupIcon: iconPath, // icône du setup
    //     iconUrl: 'https://github.com/Natsumi26/my-devis-carreleur/blob/dev/assets/logoDevis.png' 
    //   }
    // },
    {
      name: '@electron-forge/maker-zip',
      platforms: ['darwin'],
    },
    // {
    //   name: '@electron-forge/maker-deb',
    //   config: {},
    // },
    // {
    //   name: '@electron-forge/maker-rpm',
    //   config: {},
    // },
  ],
  plugins: [
    {
      name: '@electron-forge/plugin-auto-unpack-natives',
      config: {},
    },
    // Fuses are used to enable/disable various Electron functionality
    // at package time, before code signing the application
    new FusesPlugin({
      version: FuseVersion.V1,
      [FuseV1Options.RunAsNode]: false,
      [FuseV1Options.EnableCookieEncryption]: true,
      [FuseV1Options.EnableNodeOptionsEnvironmentVariable]: false,
      [FuseV1Options.EnableNodeCliInspectArguments]: false,
      [FuseV1Options.EnableEmbeddedAsarIntegrityValidation]: true,
      [FuseV1Options.OnlyLoadAppFromAsar]: true,
    }),
  ],
};
