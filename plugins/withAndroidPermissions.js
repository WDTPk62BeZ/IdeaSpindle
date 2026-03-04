const { withAndroidManifest } = require('@expo/config-plugins');

// Permissions added by React Native / expo-dev-client that are not needed
// in a production offline build.
const PERMISSIONS_TO_REMOVE = [
  'android.permission.INTERNET',
  'android.permission.SYSTEM_ALERT_WINDOW',
  'android.permission.READ_MEDIA_AUDIO',
  'android.permission.READ_MEDIA_VIDEO',
  'android.permission.WRITE_EXTERNAL_STORAGE',
];

function withAndroidPermissions(config) {
  return withAndroidManifest(config, (config) => {
    const manifest = config.modResults.manifest;
    if (manifest['uses-permission']) {
      manifest['uses-permission'] = manifest['uses-permission'].filter(
        (perm) => !PERMISSIONS_TO_REMOVE.includes(perm.$['android:name'])
      );
    }
    return config;
  });
}

module.exports = withAndroidPermissions;
