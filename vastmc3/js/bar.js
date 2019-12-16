function findRT(minDate,maxDate) {
  local_dict = {}
  for (var i = minDate; i <= maxDate; i+=3600000) {
      curr = retweets[i];
      if(curr != null){
          curr.forEach(function(tweet) {
              if (local_dict[tweet["message"]] == null) {
                local_dict[tweet["message"]] = tweet["value"]
              }
              else {
                local_dict[tweet["message"]] += tweet["value"]
              }
          })
      }
  }

  // Now sort and return the top 5 values in local_dict
  // Create items array
  var items = Object.keys(local_dict).map(function(key) {
    return [key, local_dict[key]];
  });

  // Sort the array based on the second element
  items.sort(function(first, second) {
    return second[1] - first[1];
  });

  // Create a new array with only the first 5 items
  console.log(items.slice(0, 5));
}

