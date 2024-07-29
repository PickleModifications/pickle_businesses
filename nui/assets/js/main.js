var fight = null;
var fightState = null;

function ZeroPad(num) {
    if (num < 10) {
        return "0" + num;
    }
    return num;
}

function numberWithCommas(x) { // https://stackoverflow.com/questions/2901102/how-to-format-a-number-with-commas-as-thousands-separators
    return _L("money_number", x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ","));
}

function ConvertMinutes(time) {
    const minutes = Math.floor(time / 60);
    const seconds = time - minutes * 60;
    if (minutes > 0) {
        return minutes + ":" + ZeroPad(seconds);
    }
    else {
        return ":" + ZeroPad(seconds);
    }
}

function Percent(num, max) {
    var pct = Math.ceil(100 * (num / max));
    if (pct < 0) {
        pct = 0;
    }
    else if (pct > 100) {
        pct = 100;
    }
    return pct;
}

function StringifyItemMetadata(item) {
    let metadata = item.metadata;
    let metadataString = "";
    let foundMetadata = true;
    for (let key in metadata) {
        if (typeof metadata[key] === 'string' || typeof metadata[key] === 'number') {
            metadataString += `<div>${key}: ${metadata[key]}</div>`;
        }
    }
    if (metadataString == "") {
        metadataString = "No metadata available."
        foundMetadata = false;
    }
    return {string: metadataString, hasMetadata: foundMetadata};
}

$(document).ready(function() {
    
})