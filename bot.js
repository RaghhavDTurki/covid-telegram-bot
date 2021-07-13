// Setting Up Server
const express = require("express")
const app = express();
const dotenv = require("dotenv");

dotenv.config({path:"config.env"});

const PORT = process.env.PORT || 3000;
const URL = process.env.URL || "https://covid-telegram-bot1991.herokuapp.com";


// Telegraf Imports
const { Telegraf } = require('telegraf');

// Imports for Bot Commmands
const countries = require("./countries.json");
const globalData = require("./actions/globalData").getGlobalData;
const countrySearch = require("./actions/countryData").countrySearch;
const getCountryData = require("./actions/countryData").getCountryData;


const telegram_bot_id = process.env.TELEGRAM_BOT_ID;

const bot = new Telegraf(telegram_bot_id);
bot.telegram.setWebhook(`${URL}/bot${telegram_bot_id}`)
app.use(bot.webhookCallback(`/bot${telegram_bot_id}`))


bot.start((ctx) => {

	let message = `Welcome to the COVID-19 Bot.
This bot can show you the data of Novel Coronavirus (COVID-19) cases, provided by JHU CSSE.`

	let message1 = `- Enter "total" to get the global numbers.
- Enter a country to get the numbers of the specified country, for example: "India".
	`

	bot.telegram.sendMessage(ctx.chat.id, message)
	bot.telegram.sendMessage(ctx.chat.id, message1)
});

bot.hears("total", (ctx) => {
	globalData()
	.then(data => {
		let qDate = data["queryDate"];
		let globalAdded = data["added"];
		let globalCases = data["cases"];
		let globalRecovered = data["recovered"];
		let globalDeaths = data["deaths"];
		let globalActive = globalCases - globalRecovered - globalDeaths;
		
		let message = `Here's the COVID-19 numbers in the world: 
📆: ${qDate}

Added: ${globalAdded}
Confirmed: ${globalCases} 

Recovered: ${globalRecovered} (${((globalRecovered/globalCases) * 100).toFixed(2)}%)
Deaths: ${globalDeaths} (${((globalDeaths/globalCases) * 100).toFixed(2)}%)
Active: ${globalActive}`

		bot.telegram.sendMessage(ctx.chat.id, message);
	})
	.catch(err => console.error(err));

	// console.log(e);

});


bot.on('text', (ctx) => {
	let userMessage = ctx.message.text;
	let countryIndex = countrySearch(countries, userMessage);
	if(countryIndex != -1)
	{
		getCountryData(countries[countryIndex])
		.then(data => {
			let qDate = data["queryDate"];
			let countryAdded = data["added"];
			let countryCases = data["cases"];
			let countryRecovered = data["recovered"];
			let countryDeaths = data["deaths"];
			let countryActive = countryCases - countryRecovered - countryDeaths;
		
			let message = `Here's the COVID-19 numbers in ${countries[countryIndex]}: 
📆: ${qDate}

Added: ${countryAdded}
Confirmed: ${countryCases} 

Recovered: ${countryRecovered} (${((countryRecovered/countryCases) * 100).toFixed(2)}%)
Deaths: ${countryDeaths} (${((countryDeaths/countryCases) * 100).toFixed(2)}%)
Active: ${countryActive}`
			bot.telegram.sendMessage(ctx.chat.id, message);
		})
		.catch(err => console.error(err));
	}
	else
	{
		let message = `No data found! 
Please try again with a valid command.`
		bot.telegram.sendMessage(ctx.chat.id, message);
	}
})


app.get(`/`, (req,res) => {
	res.send("Bot is running");
});

app.listen(PORT, () => {
	console.log(`Server is running on port ${PORT}`);
});