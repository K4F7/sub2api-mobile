import fs from 'node:fs';

const buildGradlePath = 'android/app/build.gradle';
let source = fs.readFileSync(buildGradlePath, 'utf8');

const signingAnchor = '    signingConfigs {\n        debug {';
if (!source.includes(signingAnchor)) {
  throw new Error('Could not find signingConfigs in generated build.gradle');
}

source = source.replace(
  signingAnchor,
  `    signingConfigs {
        release {
            storeFile file(System.getenv('ANDROID_KEYSTORE_PATH'))
            storePassword System.getenv('ANDROID_KEYSTORE_PASSWORD')
            keyAlias System.getenv('ANDROID_KEY_ALIAS')
            keyPassword System.getenv('ANDROID_KEY_PASSWORD')
        }
        debug {`,
);

const releasePattern = /(    buildTypes \{[\s\S]*?        release \{[\s\S]*?)signingConfig signingConfigs\.debug/;
if (!releasePattern.test(source)) {
  throw new Error('Could not find the generated release signingConfig');
}

source = source.replace(
  releasePattern,
  '$1signingConfig signingConfigs.release',
);
fs.writeFileSync(buildGradlePath, source);
