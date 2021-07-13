const axios = require("axios");

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


module.exports = {
    getGlobalData : getGlobalData
}