# Welcome to the Creative Framework project!

You can create VPaid creatives, using ready-to-use interactive components.

### Install the project:

**npm i**

### There are two ways to launch and build a project

1. The first one consists in providing the path to the desired project:

**npm run dev --target=2023/example/creative.ts**

The **build** command follows the same pattern:

**npm run build --target=2023/example/creative.ts**

2. The second one consists in using the _config_ parameters, located in _package.json_:

-   _creativeYear_: the year of the creative (2023, 2024, ...)
-   _creativeCampaign_: the name of the creative folder (POC_video_and_images_carrousel, ...)
-   _creativeVersion_: the name of the creative version. Default value is "". Used both for tracking and deployment path.
    The path to the local creative should then be: src/[creativeYear]/[creativeCampaign]/creative.ts
    The command to launch the project becomes

**npm run devv**

The command to deploy the project is:

### Deploy the project:

Once again, deployment will use the _config_ parameters, located in _package.json_:

**npm run deploy**

This command will:

-   generate a path to a cdn folder: https://statics.dmcdn.net/d/PRODUCTION/[creativeYear]/[creativeCampaign]/builds/[creativeVersion]/[uuid]. The uuid is randomly generated to ensure that a newer version of the creative will not overwrite the latest ones.
-   upload the built index.js file to the above cdn path
-   upload an edited vast.xml file to the same place as the above index.js file.
    This edited vast.xml will target the above index.js. It will also contain the [creativeCampaign] name.
-   copy the vast.xml file path to the clipboard, so that it can be used immediately.

### Environment variables

In order for the deployment to work, two things need to be checked:

-   your computer should be connected to the VPN, or connected to the DM wifi
-   2 environment variables should be set in your environment:
    1. CDN_STUDIO_USER
    2. CDN_STUDIO_PSWD

These credentials are used in the gulp.js file. Get in contact with Luis Ryder if you need to retrieve them.
