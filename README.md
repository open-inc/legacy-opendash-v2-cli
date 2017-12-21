# opendash-cli

The open.DASH CLI will allow you to create a new open.DASH project on the fly by letting you initialize new instances easly and providing a build process.

## Features

* Download an open.DASH instance template
* Download an open.DASH widget template
* Build your open.DASH instance with a single command

## Installation / Update

Node version `^7.6.0` is required, you should also have a current version of npm or yarn.

Install by running `npm i -g opendash-cli` or `yarn global add opendash-cli` in your prefered command line.

*Note: yarn is a bit fast but NPM is installed by default when installing node.*

*Note: To update the CLI just run the same commands again.*

## Usage

```
$ opendash --help
```

## Changes

### 1.3

**package:**

- README is now written in English

**opendash build:**

- New flag: --source-map=<setting> which allows the generation of source maps.
- New flag: --minify which will minify js output

**opendash init:**

- Official "instance" template will now ask more questions, which will allow the user to generate a more personalized instance.

### 1.2

**package:**

- Added yarn support

**opendash build:**

- Fixed output path for file-loader
- Fixed output path for stylesheets

### 1.1

**opendash build:**

- Added support for webpack file-loader
