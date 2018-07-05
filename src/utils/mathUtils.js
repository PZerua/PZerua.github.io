// Degrees to radians
Math.toRadians = function(degrees) {
  return degrees * Math.PI / 180.0;
};

// Radians to degrees
Math.toDegrees = function(radians) {
  return radians * 180.0 / Math.PI;
};

// Pass in a value, its range, and the range you want the value to be converted into
Math.mapToRange = function(inValue, minInRange, maxInRange, minOutRange, maxOutRange) {
    // Just to make it safer
    //if (inValue < minInRange) inValue = minInRange
    //if (inValue > maxInRange) inValue = maxOutRange

    var slope = (maxOutRange - minOutRange) / (maxInRange - minInRange)
    return minOutRange + slope * (inValue - minInRange)
}

// From https://hashids.org/
Math.toHex = function(value) {
    var hash = "";
    var alphabet = "0123456789abcdef";
    var alphabetLength = alphabet.length;

     do {
       hash = alphabet[value % alphabetLength] + hash;
       value = parseInt(value / alphabetLength, 10);
     } while (value);

     return hash;
}

Math.createHash = function(values) {
    var hash = "";
    for (var i = 0; i < values.length; i++) {

        if (typeof values[i] === "string") {
            hash += values[i];
            continue;
        }
        // Check if number has decimal values
        var numStr = (values[i] + "").split(".")
        // True if it has decimals and the decimal is different to 0
        var isValidDecimal = numStr.length == 2 && numStr[1] != "0"

        hash += Math.toHex(Number(numStr[0]));
        // If it is valid, take the decimal into account for the hash
        if (isValidDecimal) {
            hash += Math.toHex(Number(numStr[1]));
        }
    }
    return hash;
}
