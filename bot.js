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

let numberBeautify = Intl.NumberFormat('en-US');
let NumberFormat = numberBeautify.format;

bot.start((ctx) => {

	let message = `Welcome to the COVID-19 Bot.
This bot can show you the data of Novel Coronavirus (COVID-19) cases, provided by JHU CSSE.`

	let message1 = `- Enter "total" to get the global numbers.
- Enter a country to get the numbers of the specified country, for example: "India".
- Enter "help" to get this starting message again.
- Enter "covid" to get the latest covid symptoms 
	`

	bot.telegram.sendMessage(ctx.chat.id, message)
	bot.telegram.sendMessage(ctx.chat.id, message1)
});

bot.hears("total", (ctx) => {
	globalData()
	.then(data => {
		let qDate = data["queryDate"];
		let globalAdded = NumberFormat(data["added"]);
		let globalCases = NumberFormat(data["cases"]);
		let globalRecovered = NumberFormat(data["recovered"]);
		let globalDeaths = NumberFormat(data["deaths"]);
		let globalActive = NumberFormat(globalCases - globalRecovered - globalDeaths);
		
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

bot.hears("help", (ctx) => {
	let message = `Welcome to the COVID-19 Bot.
This bot can show you the data of Novel Coronavirus (COVID-19) cases, provided by JHU CSSE.`

	let message1 = `- Enter "total" to get the global numbers.
- Enter a country to get the numbers of the specified country, for example: "India".
- Enter "help" to get this starting message again.
- Enter "covid" to get the latest covid symptoms 
	`

	bot.telegram.sendMessage(ctx.chat.id, message)
	bot.telegram.sendMessage(ctx.chat.id, message1)
})

bot.hears("covid", (ctx) => {
	let message = `- Most common symptoms:
1. Fever
2. Dry cough
3. Tiredness
- Less common symptoms:
1. Aches and Pains
2. Sore throat
3. Diarrhoea
4. Conjunctivitis
5. Headache
6. Loss of taste or smell
7. Rash on skin, or discolouration of fingers or toes
- Serious symptoms:
1. Difficulty breathing or shortness of breath
2. Chest pain or pressure
3. Loss of speech or movement
- Seek immediate medical attention if you have serious symptoms. Always call before visiting your doctor or health facility.
- People with mild symptoms who are otherwise healthy should manage their symptoms at home.
- On average it takes 5–6 days from when someone is infected with the virus for symptoms to show, however it can take up to 14 days.`
	bot.telegram.sendMessage(ctx.chat.id, message);
})

bot.on('text', (ctx) => {
	let userMessage = ctx.message.text;
	let countryIndex = countrySearch(countries, userMessage);
	if(countryIndex != -1)
	{
		getCountryData(countries[countryIndex])
		.then(data => {
			let qDate = data["queryDate"];
			let countryAdded = NumberFormat(data["added"]);
			let countryCases = NumberFormat(data["cases"]);
			let countryRecovered = NumberFormat(data["recovered"]);
			let countryDeaths = NumberFormat(data["deaths"]);
			let countryActive = NumberFormat(countryCases - countryRecovered - countryDeaths);
		
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