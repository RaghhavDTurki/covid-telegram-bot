const countries = require("./countries.json");
const { Telegraf } = require('telegraf');
const dotenv = require("dotenv");
const axios = require('axios');
const { Keyboard } = require("telegram-keyboard");

dotenv.config({path:"config.env"});

const telegram_bot_id = process.env.TELEGRAM_BOT_ID;

const bot = new Telegraf(telegram_bot_id);

function binarySearch(items, value){
    value = value.toLowerCase();
    var startIndex  = 0,
        stopIndex   = items.length - 1,
        middle      = Math.floor((stopIndex + startIndex)/2);

    while(items[middle].toLowerCase() != value && startIndex < stopIndex){

        //adjust search area
        if (value < items[middle].toLowerCase()){
            stopIndex = middle - 1;
        } else if (value > items[middle].toLowerCase()){
            startIndex = middle + 1;
        }

        //recalculate middle
        middle = Math.floor((stopIndex + startIndex)/2);
    }

    //make sure it's the right value
    return (items[middle].toLowerCase() != value) ? -1 : middle;
}

bot.start((ctx) => {

	let message = `Welcome to the COVID-19 Bot.
This bot can show you the data of Novel Coronavirus (COVID-19) cases, provided by JHU CSSE.`

	let message1 = `- Enter "total" to get the global numbers.
- Enter a country to get the numbers of the specified country, for example: "India".
	`

	bot.telegram.sendMessage(ctx.chat.id, message)
	bot.telegram.sendMessage(ctx.chat.id, message1)
});

async function  getGlobalData()
{
	let data = await axios.get("https://disease.sh/v3/covid-19/historical/all?lastdays=2")
	data = data.data;
	let queryDate = Object.keys(data["cases"])[1];
	let cases = Object.values(data["cases"])[1];
	let recovered = Object.values(data["recovered"])[1];
	let deaths = Object.values(data["deaths"])[1];
	let added = cases - Object.values(data["cases"])[0];
	return {queryDate, added ,cases, recovered, deaths};
}

async function getCountryData(country)
{
	let data = await axios.get(`https://disease.sh/v3/covid-19/historical/${country}?lastdays=2`);
	data = data.data;
	let queryDate = Object.keys(data["timeline"]["cases"])[1];
	let cases = Object.values(data["timeline"]["cases"])[1];
	let recovered = Object.values(data["timeline"]["recovered"])[1];
	let deaths = Object.values(data["timeline"]["deaths"])[1];
	let added = cases - Object.values(data["timeline"]["cases"])[0];
	return {queryDate, added ,cases, recovered, deaths};
}

bot.hears("total", (ctx) => {
	getGlobalData()
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
	let countryIndex = binarySearch(countries, userMessage);
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
		// let message = 
	}
})
bot.launch();