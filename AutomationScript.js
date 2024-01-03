// node AutomationScript.js  --url="https://www.hackerrank.com" --config=config.json

// npm init -y
// npm install puppeteer
// npm install minimist

let minimist = require("minimist");
let puppeteer = require("puppeteer");
let fs = require("fs");

let args = minimist(process.argv);

let configJSON = fs.readFileSync(args.config, "utf-8");
let configJSO = JSON.parse(configJSON);

run();

async function run(){
    let browser = await puppeteer.launch({
        defaultViewport: null,
        args: [
            "--start-maximized"
        ],
        headless: false,
        slowMo: 25
    });

    let pages = await browser.pages();
    let page = pages[0];

    await page.goto(args.url);

    await page.waitForSelector("a[href='/access-account/']");
    await page.click("a[href='/access-account/']");

    await page.waitForSelector("a[href='/login/']");
    await page.click("a[href='/login/']");

    await page.waitForSelector("input[name='username']");
    await page.type("input[name='username']",configJSO.userid);

    await page.waitForSelector("input[name='password']");
    await page.type("input[name='password']",configJSO.password);
   
    await page.waitForSelector("button[type='submit']");
    await page.click("button[type='submit']");
    
    await page.waitForSelector("a[href='/contests']");
    await page.click("a[href='/contests']");

    await page.waitForSelector("a[href='/administration/contests/']");
    await page.click("a[href='/administration/contests/']");

    await page.waitForSelector("a[data-attr1='Last']");
    let numPages = await page.$eval("a[data-attr1='Last']", function(lastTag){
        let numPages = lastTag.getAttribute("data-page");
        return parseInt(numPages);
    })

    
    for(let i = 0; i < numPages; i++){
        await handlePages(browser, page);
    }

    
    async function handlePages(browser, page){
        await page.waitForSelector("a.backbone.block-center");
        let urls = await page.$$eval("a.backbone.block-center", function(atags){
           
            let tempurls = [];

            for(let i = 0; i < atags.length; i++){
                let url = atags[i].getAttribute("href");
                tempurls.push(url);
            }
            return tempurls;
            
        })

        for(let i = 0; i < urls.length; i++){
            //let npage = await browser.newPage();
            await handleContest(browser, page, urls[i]);
        }
    
        
        await page.waitForSelector("a[data-attr1='Right']");
        await page.click("a[data-attr1='Right']");
        
    }

    async function handleContest(browser, page, urls){
        let npage = await browser.newPage();
        await npage.goto(args.url + urls);

        //await npage.waitForSelector("button.save-contest.btn.btn-green");
        //await npage.click("button.save-contest.btn.btn-green");
        
        
        await npage.waitForSelector("li[data-tab='moderators']");
        await npage.click("li[data-tab='moderators']");

        await npage.waitForSelector("input#moderator");
        await npage.type("input#moderator", configJSO.moderator);

        await npage.keyboard.press("Enter");

        await npage.close();
        
    }

    browser.close();
}

