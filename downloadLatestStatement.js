// https://www.npmjs.com/package/chromedriver
require("chromedriver")
require("dotenv").config()

// https://team.goodeggs.com/getting-started-with-selenium-webdriver-for-node-js-f262a00c52e1

const { Builder, By, Key, until } = require("selenium-webdriver")
const axios = require("axios").default
const fs = require("fs")

const vars = {}

const driver = new Builder().forBrowser("chrome").build()

async function waitForWindow(timeout = 2) {
  await driver.sleep(timeout)
  const handlesThen = vars["windowHandles"]
  const handlesNow = await driver.getAllWindowHandles()
  if (handlesNow.length > handlesThen.length) {
    return handlesNow.find((handle) => !handlesThen.includes(handle))
  }
  throw new Error("New window did not appear before timeout")
}

const getCurrentUrl = async () => {
  await driver.get(
    "https://bmy.bezeq.co.il/actions/login?widId=CONNECTED_INVOICE&WT.ac=mybezeq_invoice_last-bill-view#Widget_182"
  )

  await driver.wait(until.elementLocated(By.css(".loginIcon")))

  await (await driver.findElement(By.css(".loginIcon"))).click()
  await driver.wait(until.elementLocated(By.name("password")))

  await driver
    .findElement(By.name("password"))
    .sendKeys(process.env.BEZEQ_PASSWORD)
  await driver
    .findElement(By.name("username"))
    .sendKeys(process.env.BEZEQ_USERNAME)
  await driver.findElement(By.css(".loginIcon > p:nth-child(2)")).click()
  await driver.findElement(By.name("username")).click()
  await driver.findElement(By.name("password")).click()
  await driver.findElement(By.css(".big-button:nth-child(1)")).click()

  vars["windowHandles"] = await driver.getAllWindowHandles()

  await driver.wait(until.elementLocated(By.id("lastInvoicesBtn")))

  const invoiceBtn = (await driver).findElement(By.id("lastInvoicesBtn"))

  await driver.wait(until.elementIsVisible(invoiceBtn))
  await driver.findElement(By.id("lastInvoicesBtn")).click()
  vars["win2272"] = await waitForWindow(2000)

  vars["root"] = await driver.getWindowHandle()
  await driver.switchTo().window(vars["win2272"])

  const currentUrl = await driver.getCurrentUrl()

  await driver.quit()
  return currentUrl
}

const downloadData = (url) => {
  axios({
    url,
    method: "GET",
    responseType: "stream",
  }).then((response) => {
    response.data.pipe(fs.createWriteStream("./test.pdf"))
  })
}

const run = async () => {
  const url = await getCurrentUrl()
  console.log("url:", url)
  downloadData(url)
}

run()
