function loadFile(url, callback, args) {

    var request = new XMLHttpRequest();

    request.onreadystatechange = function () {
        // If the request is "DONE" (completed or failed)
        if (request.readyState == XMLHttpRequest.DONE) {
            if (request.status == 200) {
                //console.log('"' + url + '" loaded');
                // Do whatever we want with the file
                callback(request.responseText, args)
            }
        else console.error('Could not load "' + url + '"');
        }
    };

  request.open("GET", url);
  request.send();
}

function loadFileSync(url) {

  var request = new XMLHttpRequest();

  request.open("GET", url);
  request.send();

    if (request.status == 200) {
        // Do whatever we want with the file
        console.error('Loaded "' + url + '"');
        return request.responseText;
    }
    else {
        console.error('Could not load "' + url + '"');
        return "";
    }
}
