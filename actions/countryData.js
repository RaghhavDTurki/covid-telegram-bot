const axios = require("axios");

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
module.exports = {
    countrySearch : binarySearch,
    getCountryData : getCountryData
}