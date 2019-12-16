var places = ["Broadview", "Chapparal", "Cheddarford", "Downtown", "East Parton", "Easton", "Northwest", "Oak Willow", "Old Town", "Palace Hills", "Pepper Mill", "Safe Town", "Scenic Vista", "Southton", "Southwest", "Terrapin Springs", "West Parton", "Weston", "Wilson Forest"]

var TimeVars;
var x;
var y;
var local_copy;
var color;

heatMap = function(_parentElement, _data){
  this.parentElement = _parentElement;
    this.data = _data;
    local_copy = _data
    this.displayData = []; // see data wrangling
    // DEBUG RAW DATA
    // console.log(this.data);

    this.initVis();
}

heatMap.prototype.initVis = function(){
    var vis = this;

    res = findFreq("",1586131200000,1586520000000)

    vis.margin = {top: 30, right: 30, bottom: 80, left: 85}
    vis.width = 1200 - vis.margin.left - vis.margin.right;
    vis.height = 350 - vis.margin.top - vis.margin.bottom;

    vis.svg = d3.select("#" + vis.parentElement).append("svg")
        .attr("width", vis.width + vis.margin.left + vis.margin.right)
        .attr("height", vis.height + vis.margin.top + vis.margin.bottom)
        .append("g")
        .attr("transform",
            "translate(" + vis.margin.left + "," + vis.margin.top + ")");

    var Neighborhoods = ["Broadview", "Chapparal", "Cheddarford", "Downtown", "East Parton", "Easton", "Northwest", "Oak Willow", "Old Town", "Palace Hills", "Pepper Mill", "Safe Town", "Scenic Vista", "Southton", "Southwest", "Terrapin Springs", "West Parton", "Weston", "Wilson Forest"]
    
    // Initial TimeVars Array (all time values)
    TimeVars = new Array(109)
        for(var i = 0; i < 109; i++){
            TimeVars[i] = 1586131200000 + (3600000 * i);
        }

    //Build X and Y axis
    x = d3.scaleBand()
        .range([ 0, vis.width ])
        .domain(TimeVars)
        .padding(0.01);

    vis.xAxis = d3.axisBottom()
        .scale(x)
        .tickFormat(d3.timeFormat("%b %d, %I %p"))

    vis.svg.append("g")
        .attr("class", "x-axis axis")
        .attr("transform", "translate(0," + vis.height + ")")

    vis.svg.select(".x-axis")
        .call(vis.xAxis)
        .selectAll("text")  
            .style("text-anchor", "end")
            .attr("dx", "-.8em")
            .attr("dy", ".15em")
            .attr("transform", "rotate(-65)" );

    y = d3.scaleBand()
        .range([ vis.height, 0 ])
        .domain(Neighborhoods)
        .padding(0.01);
    vis.svg.append("g")
        .call(d3.axisLeft(y));

    vis.svg.selectAll()
        .data(res, function(d) {
            //if d.time in time range
            return d.location+':'+d.time;})
        .enter()
        .append("rect")
        .attr("x", function(d) { return x(d.time) })
        .attr("y", function(d) { return y(d.location) })
        .attr("width", x.bandwidth() )
        .attr("height", y.bandwidth() )
        .style("fill", function(d) {
            return color(d.value)} )

    this.updateMap("", 1586163600000, 1586300400000)
}

heatMap.prototype.updateMap = function(query_word, minDate, maxDate){

    var vis = this;
    // console.log(d3.select(vis.svg))
    // vis.svg.remove()

    res = findFreq(query_word,minDate,maxDate)
    var newDomain = ((maxDate - minDate) / 3600000) + 1;
    TimeVars = new Array(newDomain)

    for(var i = 0; i < newDomain; i++){
        TimeVars[i] = minDate + (3600000 * i);
    }

    //CHANGE AXIS
    x = d3.scaleBand()
        .range([0, vis.width])
        .domain(TimeVars)
        .padding(.01)

    vis.svg.append("g")
    .attr("transform", "translate(0," + vis.height + ")")

    vis.xAxis = d3.axisBottom()
        .scale(x)
        .tickFormat(d3.timeFormat("%b %d, %I %p"))

    vis.svg.append("g")
        .attr("class", "x-axis axis")
        .attr("transform", "translate(0," + vis.height + ")")

    vis.svg.select(".x-axis")
        .call(vis.xAxis)
        .selectAll("text")  
            .style("text-anchor", "end")
            .attr("dx", "-.8em")
            .attr("dy", ".15em")
            .attr("transform", "rotate(-65)" );

    //REMOVE AND APPEND RECTANGLES
    vis.svg.selectAll("rect").remove()

    vis.svg.selectAll()
        .data(res, function(d){
            return d.location+':'+d.time;})
        .enter()
        .append("rect")
        .attr("x", function(d) { return x(d.time) })
        .attr("y", function(d) { return y(d.location) })
        .attr("width", x.bandwidth())
        .attr("height", y.bandwidth())
        .style("fill", function(d){
            return color(d.value);
        })
        .on("click", function(d) {
            var min = Number(d.time) - 2*3600000
            var max = Number(d.time) + 2*3600000
            vis.updateMap(query_word,min,max) 
            //console.log(d.time,min,abs,max)
        })
}


function initializeHeatData(minDate,maxDate) {
    heatData = {}
    for (var i = minDate; i <= maxDate; i+=3600000) {
        for (var n in places) {
            loc = places[n]+","+i.toString()
            heatData[loc] = 0;
        }
    }
    return heatData;
}

function heatDataJSON(heatData) {
    final_dict = []
    // Curr_dict = {"Broadview,12348585":4}
    Object.keys(heatData).forEach(function (item,index) {
        temp = {}
        //console.log(item,heatData[item])
        var name = item.toString().split(",")
        //console.log(name)
        var location = name[0]
        var time = name[1]
        temp["location"] = location
        temp["time"] = time
        temp["value"] = heatData[item]
        final_dict.push(temp)
    })
    return final_dict
}

function findFreq(query_word,minDate,maxDate) {
    heat = initializeHeatData(minDate,maxDate);

    for (var i = minDate; i <= maxDate; i+=3600000) {
        curr = local_copy[i];
        if(curr != null){
            curr.forEach(function(tweet) {
                loc = tweet["location"]+","+i.toString()
                if (query_word == ""){
                    heat[loc] ++;
                } else {
                    query_word.forEach(function(word){
                        if(tweet["message"].includes(word)){
                            heat[loc] ++;
                        }
                    })
                }
            })
        }
    }

    maxFreq = Math.max(...Object.values(heat))
    minFreq = Math.min(...Object.values(heat))

    //Build Color Scale
    color = d3.scaleLinear()
    .range(["#FDF8FF", "firebrick"])
    .domain([minFreq,maxFreq])

    res = heatDataJSON(heat)
    return res;
}

