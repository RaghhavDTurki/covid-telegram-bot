const countries = require("./countries.json");
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

console.log(binarySearch(countries, "notinarray"));
// console.log(countries[71]);
console.log(typeof countries);