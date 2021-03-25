---
layout: post
title: Migrating from Selenium to Playwright
author: Edwin
categories: [Technology]
tag: [Code, Quality Assurance]
image: assets/images/technology/2021-03-24-playwright.png
card-thumb: true
---

If you spent any time in the quality engineering space, you would have heard or interacted with Selenium at some point. It has been around for a long time after all - in some form or another since [2004](https://www.selenium.dev/history/), an eternity in software engineering.

Personally, I have used Selenium in various iterations since 2015 with varying degrees of success:
- 2015: Pure Selenium + Python 2.7 bindings
- 2016: Ranorex 
- 2017: Nightwatch.js + JavaScript bindings 
- 2021: in-house framework with Node.JS/ES6.

Seems like as with any piece of technology these days, Selenium has its supporters. But let's be honest - no one wants to be the one that maintains flakey tests, unreliable element selection and scaling up tests that take 10 minutes for a simple check. I feel like the people that defend Selenium (they are out there) are taken by Stockholm Syndrome or something. I guess if you spend enough time with it, you grow to love it? Or perhaps if you are the one person in the world devloping a Nintendo 3DS-compatible website who appreciates the extensive collection of WebDrivers available?

But for 99% of quality engineers in 2021, we are better served by using a more modern framework.

### Why not Puppeteer

The framework that was often mentioned in same sentence as 'don't use Selenium, use...' was Puppeteer.

It's fast, it's modern, and it is tightly knit with Google Chrome. Great!

And that's where its pitfall lies. It only supports Google Chrome. There are still millions of users out on the Web whose browser of choice is not Google Chrome or one of its clone-stamped variants. Some of us value privacy + control and use Firefox. Others value speed + tight integration and use Safari. Puppeteer leaves all of us in the dust to fend for ourselves.

In short, Puppeteer is everything that's wrong with the Web today: Google dominance.

### Playwright is the way

I am not sure what prompted the engineering team that developed Puppeteer to suddenly move _en masse_ to Microsoft, but the quality engineering space and by extension the Web is a better place for the team's actions.

Playwright natively supports all three major browser engines still available today<sup>[1]</sup>. This alone should be enough for everyone to make plans to switch. Show Google that monopolistic behavior is not acceptable.

### Benchmark

In my experience with a bare-bones test that loads a webpage, Playwright is twice as fast as Selenium in execution speed.

[Selenium](https://github.com/Automattic/wp-calypso/blob/trunk/test/e2e/specs/wp-log-in-out-spec.js#L35-L50):
````javascript
describe( `Auth Screen Canary`, function () {
	let driver;

	before( 'Start browser', async function () {
		driver = await driverManager.startBrowser();
		return await driverManager.ensureNotLoggedIn( driver );
	} );

	describe( 'Loading the log-in screen', function () {
		step( 'Can see the log in screen', async function () {
			await LoginPage.Visit( driver, LoginPage.getLoginURL() );
		} );
	} );
} );
````

[Playwright](https://github.com/Automattic/wp-calypso/blob/trunk/test/e2e/specs-playwright/wp-log-in-out-spec.js):
````javascript
describe( `Auth Screen`, function () {
	let page;
	let browser;

	before( 'Start browser', async function () {
		browser = await playwright.chromium.launch( {
			headless: false,
		} );
		const browserContext = await browser.newContext();
		page = await browserContext.newPage();
	} );

	describe( 'Loading the log-in screen using Playwright', function () {
		step( 'Can see the log in screen', async function () {
			const url = LoginPage.getLoginURL();
			await page.goto( url, { waitUntill: 'networkidle' } );
		} );
	} );
````

For this canned example, the best execution time I have seen from a serial 15 run was 700ms for Playwright, but 1400ms for Selenium.
I would bet the median difference would be greater than 2x if the tests were run 100 times each.

### The difficult part

The difficult part is not necessarily with rewriting the end-to-end tests. That is actually quite easy, and takes a skilled engineer only several days to translate a sizable numner of scenarios.

No, what makes transition of any sorts difficult are the supporting libraries.

In the case of Automattic/wp-calypso, there are hundreds of files that forms the scaffolding within which end-to-end tests run. 

To migrate all those files while keeping Selenium tests running concurrently - that is the challenge, and given the magnitude of it, understandable that many organizations choose to continue patching their Selenium suite.

### Is it worth it?

I think it is worth it. Why else would I take [this project](https://github.com/Automattic/wp-calypso/issues/50693) on, right? :)

&nbsp;
&nbsp;
&nbsp;

#### Footnotes

[1] Playwright team manually patched Firefox and Safari. It might not 100% represent the behavior of _real_ Firefox/Safari, but it should be close enough.