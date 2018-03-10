# Keygen + Electron Example

**Clone and run for a quick way to see Electron in action.**

This is a minimal Electron application integrated with [Keygen](https://keygen.sh) to handle licensing certain app features individually via user-accounts, as well as providing auto-updates using [Keygen Dist](https://keygen.sh/distribution). It is based on the [Quick Start Guide](http://electron.atom.io/docs/tutorial/quick-start) within the Electron documentation.

⚠️ For a much simpler Electron app example (only license key validation—no user login, no auto-updates, etc.), check out our [basic Electron app example](https://github.com/keygen-sh/basic-example-electron-app).

**Use this app along with the [Electron API Demos](http://electron.atom.io/#get-started) app for API code examples to help you get started.**

A basic Electron application needs just these files:

- `package.json` - Points to the app's main file and lists its details and dependencies.
- `main.js` - Starts the app and creates a browser window to render HTML. This is the app's **main process**.
- `index.html` - A web page to render. This is the app's **renderer process**.

You can learn more about each of these components within the [Quick Start Guide](http://electron.atom.io/docs/tutorial/quick-start).

## To Use

To download the macOS version of this app and take it for a spin without having to build it locally, use this [download link](https://dist.keygen.sh/v1/1fddcec8-8dd3-4d8d-9b16-215cac0f9b52/5499e2ec-47e6-44cb-91e9-b5d5d65c5590/releases/darwin/v1.0.0.zip?key=demo) (auto-updates are disabled in the pre-built version). To clone and run this repository you'll need [Git](https://git-scm.com) and [Node.js](https://nodejs.org/en/download/) (which comes with [npm](http://npmjs.com)) installed on your computer. From your command line:

```bash
# Clone this repository
git clone https://github.com/keygen-sh/example-electron-app
# Go into the repository
cd example-electron-app
```

Next, install dependencies with [`yarn`](https://yarnpkg.comg):
```
yarn
```

Then start the app:
```
yarn start
```

Note: If you're using Linux Bash for Windows, [see this guide](https://www.howtogeek.com/261575/how-to-run-graphical-linux-desktop-applications-from-windows-10s-bash-shell/) or use `node` from the command prompt.

## To Build

To test auto-update functionality and build the application (currently macOS only), run the following:

```bash
CSC_LINK=/path/to/your/cert.p12 yarn dist
```

Note: You'll need to have a trusted developer certificate set up so that you can sign the app. A self-signed certificate will work for non-production use as long as it is set to "always be trusted". [Auto-updates will not work unless the app is signed](https://www.electron.build/code-signing).

## To Login

Use the email `demo@example.com` and the password `demo`.

## Resources for Learning Electron

- [electron.atom.io/docs](http://electron.atom.io/docs) - all of Electron's documentation
- [electron.atom.io/community/#boilerplates](http://electron.atom.io/community/#boilerplates) - sample starter apps created by the community
- [electron/electron-quick-start](https://github.com/electron/electron-quick-start) - a very basic starter Electron app
- [electron/simple-samples](https://github.com/electron/simple-samples) - small applications with ideas for taking them further
- [electron/electron-api-demos](https://github.com/electron/electron-api-demos) - an Electron app that teaches you how to use Electron
- [hokein/electron-sample-apps](https://github.com/hokein/electron-sample-apps) - small demo apps for the various Electron APIs

## License

[CC0 1.0 (Public Domain)](LICENSE.md)
