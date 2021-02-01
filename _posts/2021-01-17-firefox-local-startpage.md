---
layout: post
title: "Setting a local HTML file (with JavaScript) as Firefox new tab page"
author: Edwin
categories: [ ]
tags: [ ]
image: assets/images/article/2021-01-17/new-tab-startpage.png
---

I recently explored creating a custom local startpage like I did in 2006.

Back then, it was a simple process:

* create your HTML page.
* open Preferences.
* set new tab page to the HTML page you created.

But in 2020, things are different.

Because of security restrictions the major browsers available today no longer permit the loading of local files for a new tab. Extensions such as [New Tab Override](https://addons.mozilla.org/ja/firefox/addon/new-tab-override/) exist but they do not load JavaScript which limits the usefulness of such pages.

One solution to this problem is hosting your startpage locally or on a remote server, but this seems overkill and was a bridge I was not willing to cross to make this work.

It is also quite frustrating searching for a workaround. Because this was a feature that was supported for a long time, the web is littered with outdated articles, many close to a decade old, detailing steps that no longer apply.

After a lot of dead ends and false starts, I have pieced together these steps. I mostly referenced SUMO, notably [this one](https://support.mozilla.org/en-US/questions/1251199) and [this one](https://support.mozilla.org/ja/questions/1283835).

This should work with Firefox 86. All steps were run on macOS Catalina 10.15, but should be applicable for all platforms (with paths substituted of course).

Give them a try and enjoy rich, JavaScript-enabled new tab page!

## Step 0. (macOS only) remove application quarantine

`xattr -r -d com.apple.quarantine Firefox.app`

## Step 1. navigate to the working directory:

In my case, since I run Firefox Nightly, the directory will be:

`/Applications/Firefox Nightly.app/Contents/Resources`

Replace `Firefox Nightly.app` with your install of Firefox.

## Step 2. create `autoconfig.cfg`

Paste in the follwing:

```javascript
// First line must be a comment
var {classes:Cc,interfaces:Ci,utils:Cu} = Components;

try {
  Cu.import("resource:///modules/AboutNewTab.jsm");
  var newTabURL = "file:///<your_path_here>";   // Change this to the path to your HTML file
  AboutNewTab.newTabURL = newTabURL;
  pref("browser.newtab.url", AboutNewTab.newTabURL);
} catch(e){Cu.reportError(e);}
```

Replace the path at line 6 to the HTML file on your disk.


## Step 3. navigate to another directory

```
cd defaults/pref`
```

## Step 4. create `autoconfig.js`

Again, paste in the following:

```javascript
// First line must be a comment.
pref("general.config.filename", "autoconfig.cfg");
pref("general.config.obscure_value", 0);
```

## Step 5. reload Firefox and open a new tab

Firefox should now load the HTML file specified in `autoconfig.cfg`!
