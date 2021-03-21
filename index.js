/*
  Copyrighted Material 
  Made By : Vaibhav Shukla
  Title : PSIT Olt Downloader
*/

function createDirectory(name){
  fs.stat(name, (err, stats) => {
    if(err){
      fs.mkdirSync(path.join(__dirname, name)); 
    }
  });
}

function checkWhetherFileExistOrNot(path,name){
  const files = fs.readdirSync(path);
  for (const file of files){
    if(file==name){
      return true;
    }
  }
  return false;
}

async function Download(root_dir,name,page){
  try {
    let dir = root_dir + `/${name}`;
    createDirectory(dir);
    console.log("------------------------------------------------------------------------------------------------------------------");
    console.log(`${name}\n`);
    await page.goto(`https://erp.psit.in/Student/${name}`);
    if(name=="OnlineTraining"){
      await page.select("select","10000");
    }
    let response = await page.content();
    let $ = cheerio.load(response);
    for(let i in $('.btn-danger')){
        if(!isNaN(i) && i!=0 && $('tr td:nth-child(3)')[i-1] != null){
            let file_name = $('tr td:nth-child(3)')[i-1].children[0].data;
            if(!checkWhetherFileExistOrNot(dir,`${file_name}.pdf`)){
              let href = $('.btn-danger')[i].attribs.href;
              console.log(`${file_name} olt downloading`);
              console.log(href);
              await page.goto(href);
              await page
                .waitForSelector('.sidebar-minify-btn')
                .then(async () => {
                  let sideBar = await page.$('.sidebar-minify-btn');
                  await sideBar.click();
              });
              let file_loc = dir + `/${file_name}.pdf`;
              await page.pdf({ path: file_loc, format: 'a4',landscape: true, printBackground: true });
            } else {
              console.log(`${file_name} File Skipped`);
            }
        }
    }
    console.log("------------------------------------------------------------------------------------------------------------------");
  } catch (error) {
    console.error(error);
  }
}

const puppeteer = require('puppeteer');
const cheerio=require("cheerio");
const fs = require('fs');
const path = require('path'); 
const dotenv = require('dotenv');

dotenv.config();
(async () => {
  const browser = await puppeteer.launch({
      headless:true
  });
  const page = await browser.newPage();
  page.setDefaultNavigationTimeout(0); 
  await page.setViewport({ width: 1920, height: 1080});
  await page.goto('https://erp.psit.in/');
  await page.type('#page-container > div > div.article.col-xs-12.col-sm-4.col.pull-right > div > form > div:nth-child(1) > input', process.env.PSITUSERNAME, {delay: 100}); // Types slower, like a user
  await page.type('#page-container > div > div.article.col-xs-12.col-sm-4.col.pull-right > div > form > div:nth-child(2) > input', process.env.PSITPASSWORD, {delay: 100}); // Types slower, like a user
  await page.keyboard.press('Enter');
  await page.waitForNavigation();
  createDirectory("Olt");
  root_dir = "Olt";
  let name = "TechnicalTraining"
  await Download(root_dir,name,page);
  name = "OnlineTraining"
  await Download(root_dir,name,page);
  console.log("All Olt Downloaded");
  browser.close();
})();