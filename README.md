<p align="center">
  <img src="https://github.com/macadev/Gibbon-Tabs/blob/master/repo_images/banner_logo.jpeg"/>
</p>

# Gibbon Tabs

A Chrome extension to help you navigate your tab jungle with ease.

<p align="center">
  <a href="https://www.youtube.com/watch?v=X4AHNVJXIS0&t">
    <img src="https://github.com/macadev/Gibbon-Tabs/blob/master/repo_images/gibbon_window.png" href="https://www.youtube.com/watch?v=X4AHNVJXIS0&t" width="450">
  </a>
  <br></br>
  <em>Click on this image to see a 1 minute demo of Gibbon Tabs.</em>
</p>

## Features

### Tab Management

- __Search and jump__ to tabs by title or URL, across all your windows.
- __Quickly delete tabs__ while being able to see their title and URL.
- Keyboard shortcuts for navigation and tab deletion will make you very fast.

### Save Tabs For Later

- __Tab Snapshots let you save all your open tabs so you can close them and open them later.__
- Take a snapshot of...
  - The internal sites you open at work every morning!
  - All the websites you use to procrastinate. Waste lots of time more effectively!
  - The giant hairy ball of tabs you don't want to close, but you sure as hell don't want to take home at the end of the day either. Free your mind!
- Snapshots are stored locally on your device. They are not sent anywhere!

## Requirements

- All you need is Google Chrome. Pretty much any version will work!

## Installation

- Go to the [Chrome Store page](https://chrome.google.com/webstore/detail/gibbon-tabs/bmkakdcikgcicahfkmcehpbhidhccfld) and install the extension.
- __It is highly recommended that you assign a keyboard shortcut to the Gibbon Tabs extension.__
  - In order to do this open [chrome://extensions](chrome://extensions) (type this URL in a new tab)
  - Scroll to the bottom of the page and click on "Keyboard Shortcuts" (see image below).

  <p align="center">
    <img src="https://github.com/macadev/Gibbon-Tabs/blob/master/repo_images/key_short.png" width="550">
  </p>

  - Assign Gibbon Tabs a keyboard shortcut as shown in the image below.

  <p align="center">
    <img src="https://github.com/macadev/Gibbon-Tabs/blob/master/repo_images/assign_shortcut.png" width="500">
  </p>

  - Refresh the chrome://extension page and the shortcut will become active!

## Usage

- Press the shortcut you assigned or click on the extension icon in your browser to activate it.
- __Type to begin searching__. The search box is always highlighted.
- Press <kbd>Enter</kbd> to activate a tab. Or click on it.
- Use the <kbd>Up</kbd> and <kbd>Down</kbd> keys to navigate the tabs list.
- Press <kbd>Shift</kbd>+<kbd>Backspace</kbd> to delete the currently highlighted tab in the tabs list.
  - You can also delete tabs by clicking on the X at the right side of each tab in the list.
- Press <kbd>Ctrl</kbd> while the extension is open to highlight the currently active tab.
  - When you haven't entered a search query the list shows all tabs ordered from left to right and by window. This lets you quickly find neighbouring tabs to the active window.
- There are no shortcuts for "Tab Snapshots". Just use it once and you'll learn how it works!

## Why do I need this?

_If you suffer from one of the following:_

- Having __dozens of tabs__ open in one or multiple windows.
- Constantly fiddling with keyboard shortcuts to find the tab you need, or worse, using your mouse/trackpad.
- The horrible confusion that ensues when the tab favicons disappear because you have too many open tabs. See below:

<p align="center">
  <img src="https://github.com/macadev/Gibbon-Tabs/blob/master/repo_images/tab_hell.png"/>
  <em>Welcome to Tab Hell. You can go throw yourself in the lava pit now.</em>
</p>

- Heartache and wrist pain.

_Then Gibbon Tabs is for You!_

<p align="center">
  <img src="https://github.com/macadev/Gibbon-Tabs/blob/master/repo_images/gibbon_chrome.png" height="600">
  <br></br>
  <em>You using Gibbon Tabs.</em>
</p>

## Some technical details

- Fuzzy search library used: [Fuse](https://github.com/krisk/Fuse)
- I wanted to implement this without using any javascript frameworks. It's all pure javascript.
  - Some parts of the code got a bit Sphagetti-ed along the way. I don't have tons of experience with frontend. I learned a lot!
- The CSS is a bit of a hack. I also learned a ton here.
- What was the hardest part of this project? Writing this damn README.

## Donate

- If you love this project and want to help it's continued development, consider donating some bitcoin to the following address [19R4F9Gas9S1Wa7Rw8UhppN5eBxyCLDpR2](https://blockchain.info/address/19R4F9Gas9S1Wa7Rw8UhppN5eBxyCLDpR2)
  - Your donations will help me buy coffee and train rides to Montreal (A large chunck of this project was completed on the train to Montreal from Toronto, believe it or not. I am amazingly productive while on trains).
  - I have many other ideas for developer tools that I think can have a pretty big impact on your workflow, so you can expect more awesome things to come.
