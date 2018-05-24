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
