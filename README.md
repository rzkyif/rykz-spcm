# rykz-spcm

## Description
An MCM equivalent for Skyrim Platform plugins.

This is the source code. For releases, visit the [mod page on Skyrim Special Edition Nexus](https://www.nexusmods.com/skyrimspecialedition/mods/61556).

## Build Requirements
- [Yarn 3](https://yarnpkg.com/)
- [Typescript headers for PapyrusUtil SE](https://www.nexusmods.com/skyrimspecialedition/mods/56916?tab=files&file_id=238235)

## Build Preparation
1. Run `yarn install`
2. Run `yarn build` once, `scripts/config.js` will be generated
3. Fill `scripts/config.js` according to the [Config](#configjs) section of this readme
4. Run the script you need according to the [Yarn Scripts](#yarn-scripts) section of this readme

## Yarn Scripts
- `yarn dev` : build the plugin and minified ui files and install to `dataPathInstall` in hot reload mode
- `yarn dev-plugin` : build the plugin and install to `dataPathInstall` in hot reload mode
- `yarn dev-ui` : build nonminified ui files in hot reload mode
- `yarn build` : build everything, create a fomod installer zip, and install to `dataPathInstall`
- `yarn build-plugin` : build the plugin and install to `dataPathInstall`
- `yarn build-ui` : build minified ui files (for installation and release)
- `yarn build-ui-nonminified` : build nonminified ui files (for development)
- `yarn build-install` : build everything and install to `dataPathInstall`
- `yarn build-zip` : build everything and create a fomod installer zip

## Config
- `dataPathInstall`
    <br/>A path to a Skyrim Special Edition `Data` folder where the build tools will install the built plugin when you call `yarn build-install`. 
    <br/>This can be the actual Skyrim Special Edition `Data` folder or a Mod Organizer 2 mod folder.
- `dataPathModules`
    <br/>A path to a Skyrim Special Edition `Data` folder where the build tools can find the required Skyrim Plaform modules and `skyrimPlatform.ts`. 
    <br/>This can be the actual Skyrim Special Edition `Data` folder or a Mod Organizer 2 mod folder.