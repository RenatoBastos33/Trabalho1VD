'use strict';

var myApp = {};

myApp.margins = {top: 10, bottom: 30, left: 25, right: 15};
myApp.cw = 500;
myApp.ch = 400;
myApp.xScale = undefined;
myApp.yScale = undefined;
myApp.xAxis = undefined;
myApp.yAxis = undefined;
myApp.brush = undefined;
myApp.DATA = 0;
myApp.DOT = 1;

myApp.createCirclesData = function (n, label) {
    let circles = [];
    for (let i = 0; i < label.length; i++) {
        for (let id = 0; id < n; id++) {
            let x = (Math.random() * 30) - 10;
            let y = Math.random() * 10;
            let c = {'cx': x, 'cy': y, 'r': 3.5, 'label': label[i]};
            circles.push(c);
        }
    }


    return circles;
}

myApp.createRecData = function (n, label) {
    let recs = [];
    for (let i = 0; i < label.length; i++) {
        for (let id = 1; id < n; id++) {
            let y = Math.random() * 10;
            let r = {'cx': id, 'cy': y, 'label': label[i]};
            recs.push(r)
        }
    }
    return recs
}

myApp.createLinesData = function (n, label) {
    let lines = [];
    for (let i = 0; i < label.length; i++) {
        let line = []
        for (let id = 1; id < n; id++) {
            let y = Math.random() * 10;
            let r = {'cx': id, 'cy': y, 'label': label[i]};
            line.push(r)
        }
        lines.push(line)
    }
    console.log(lines)
    return lines

}

myApp.appendSvg = function (div) {
    let node = d3.select(div).append('svg')
        .attr('width', myApp.cw + myApp.margins.left + myApp.margins.right)
        .attr('height', myApp.ch + myApp.margins.top + myApp.margins.bottom);

    return node;
}

myApp.appendChartGroup = function (svg) {
    let chart = svg.append('g')
        .attr('width', myApp.cw)
        .attr('height', myApp.ch)
        .attr('transform', 'translate(' + myApp.margins.left + ',' + myApp.margins.top + ')');

    return chart;
}

myApp.createAxes = function (svg, type = myApp.DOT) {

    if (type === myApp.DATA) {
        myApp.xScale = d3.scaleTime()
            .domain([new Date(2000, 0, 0), new Date(2012, 0, 0)])
            .rangeRound([0, myApp.cw]);

    } else {
        myApp.xScale = d3.scaleLinear().domain([0, 10]).range([0, myApp.cw]);
    }
    myApp.yScale = d3.scaleLinear().domain([10, 0]).range([0, myApp.ch]);


    let xAxisGroup = svg.append('g')
        .attr('class', 'xAxis')
        .attr('transform', 'translate(' + myApp.margins.left + ',' + (myApp.ch + myApp.margins.top) + ')');

    let yAxisGroup = svg.append('g')
        .attr('class', 'yAxis')
        .attr('transform', 'translate(' + myApp.margins.left + ',' + myApp.margins.top + ')');

    myApp.xAxis = d3.axisBottom(myApp.xScale);
    myApp.yAxis = d3.axisLeft(myApp.yScale);

    xAxisGroup.call(myApp.xAxis);
    yAxisGroup.call(myApp.yAxis);
}

myApp.addBrushCircle = function (svg) {
    let cValue = function (d) {
            return d.label;
        },
        color = d3.scaleOrdinal(d3.schemeCategory10);

    function brushed() {
        let selects = []
        let s = d3.event.selection,
            x0 = s[0][0],
            y0 = s[0][1],
            x1 = s[1][0],
            y1 = s[1][1];

        svg.selectAll('circle')
            .style("fill", function (d) {
                if (myApp.xScale(d.cx) >= x0 && myApp.xScale(d.cx) <= x1 &&
                    myApp.yScale(d.cy) >= y0 && myApp.yScale(d.cy) <= y1) {
                    selects.push(d)
                    return "#808080";
                }
                else {
                    return color(cValue(d));
                }
            });
        console.log('Foram selecionados ' + selects.length + ' circulos')
    };

    myApp.brush = d3.brush()
        .on("start brush", brushed);

    svg.append("g")
        .attr("class", "brush")
        .call(myApp.brush);
}

myApp.addBrushRect = function (svg) {
    let cValue = function (d) {
            return d.label;
        },
        color = d3.scaleOrdinal(d3.schemeCategory10);

    function brushedRect() {
        let selects = []
        let s = d3.event.selection,
            x0 = s[0],
            x1 = s[1];
        svg.selectAll('rect')
            .style("fill", function (d) {
                if (myApp.xScale(d.cx) >= x0 && myApp.xScale(d.cx) <= x1) {
                    selects.push(d)
                    return "#808080";
                }
                else {
                    if (!d.type) {
                        return color(cValue(d));
                    }
                }
            });
        console.log('Foram selecionados ' + selects.length + ' bar')
    };

    myApp.brushRect = d3.brushX()
        .on("start brush", brushedRect);

    svg.append("g")
        .attr("class", "brush")
        .call(myApp.brushRect);
}

myApp.addBrushLine = function (svg) {
    let cValue = function (d) {
            return d.label;
        },
        color = d3.scaleOrdinal(d3.schemeCategory10);

    function brushed() {
        let selects = []
        let s = d3.event.selection,
            x0 = s[0],
            x1 = s[1];
        svg.selectAll('path')
            .style("stroke-dasharray", function (d) {
                d.values.forEach((d) => {
                    if (myApp.xScale(d.cx) >= x0 && myApp.xScale(d.cx) <= x1) {
                        selects.push(d)
                        return "#808080";
                    }
                    else {
                        return color(cValue(d));
                    }
                })
            });
        console.log('Foram selecionados ' + selects.length + ' paths')
    };

    myApp.brush = d3.brushX()
        .on("start brush", brushed);

    svg.append("g")
        .attr("class", "brush")
        .call(myApp.brush);
}

myApp.addZoomCircle = function (svg) {
    function zoomedCircles() {
        console.log('call function zoomed')
        let t = d3.event.transform;

        let nScaleX = t.rescaleX(myApp.xScale);
        myApp.xAxis.scale(nScaleX);

        let xAxisGroup = svg.select('.xAxis');
        xAxisGroup.call(myApp.xAxis);

        svg.select('g')
            .selectAll('circle')
            .attr("cx", function (d) {
                return nScaleX(d.cx);
            });
    }

    myApp.zoom = d3.zoom()
        .on("zoom", zoomedCircles);

    svg.append("rect")
        .attr("class", "zoom")
        .attr("width", myApp.cw)
        .attr("height", myApp.margins.bottom)
        .attr('transform', 'translate(' + myApp.margins.left + ',' + (myApp.ch + myApp.margins.top) + ')')
        .call(myApp.zoom);
}

myApp.addZoomBar = function (svg) {
    function zoomedBar() {
        console.log('call function zoomed bar')
        let t = d3.event.transform;

        let nScaleX = t.rescaleX(myApp.xScale);
        myApp.xAxis.scale(nScaleX);

        let xAxisGroup = svg.select('.xAxis');
        xAxisGroup.call(myApp.xAxis);

        svg.select('g')
            .selectAll('rect')
            .attr("cx", function (d) {
                return nScaleX(d.cx);
            });
    }

    myApp.zoomBar = d3.zoom()
        .on("zoom", zoomedBar);

    svg.append("rect")
        .attr("class", "zoom")
        .attr("width", myApp.cw)
        .attr("height", myApp.margins.bottom)
        .attr('transform', 'translate(' + myApp.margins.left + ',' + (myApp.ch + myApp.margins.top) + ')')
        .call(myApp.zoomBar);
}

myApp.addZoomLine = function (svg) {
    function zoomedLine() {
        console.log('call function zoomed line')
        let t = d3.event.transform;

        let nScaleX = t.rescaleX(myApp.xScale);
        myApp.xAxis.scale(nScaleX);

        let xAxisGroup = svg.select('.xAxis');
        xAxisGroup.call(myApp.xAxis);

        svg.select('g')
            .selectAll('path')
            .attr("cx", function (d) {
                d.values.forEach((item) => {
                    console.log(item)
                    return nScaleX(d.cx)
                })
                // return nScaleX(d.cx);
            });
    }

    myApp.zoomLine = d3.zoom()
        .on("zoom", zoomedLine);

    svg.append("rect")
        .attr("class", "zoom")
        .attr("width", myApp.cw)
        .attr("height", myApp.margins.bottom)
        .attr('transform', 'translate(' + myApp.margins.left + ',' + (myApp.ch + myApp.margins.top) + ')')
        .call(myApp.zoomLine);
}


myApp.appendCircles = function (div, arr) {
    let cValue = function (d) {
            return d.label;
        },
        color = d3.scaleOrdinal(d3.schemeCategory10);


    var tran = d3.transition()
        .duration(750);

    let circle = div.selectAll('circle')
        .data(arr)
        .enter()
        .append('circle')
        .attr('cx', function (d) {
            return myApp.xScale(d.cx);
        })
        .attr('cy', function (d) {
            return myApp.yScale(d.cy);
        })
        .attr('r', function (d) {
            return d.r;
        })
        .style('fill', function (d) {
            return color(cValue(d));
        });

    circle
        .style('fill', 'rgb(150,150,190)')
        .transition(tran)
        .attr('cx', function(d){ return myApp.xScale(d.cx); })
        .attr('cy', function(d){ return myApp.yScale(d.cy); })
        .attr('r' , function(d){ return d.r;  });

    circle
        .style('fill', 'rgb(150,150,190)')
        .transition(tran)
        .attr('cx', function(d){ return myApp.xScale(d.cx); })
        .attr('cy', function(d){ return myApp.yScale(d.cy); })
        .attr('r' , function(d){ return d.r;  });

    circle
        .exit()
        .transition(tran)
        .style("fill-opacity", 1e-6)
        .remove();

    // .on("mouseover", function(d) {
    //     tooltip.transition()
    //         .duration(1)
    //         .style("opacity", 1);
    //     tooltip.html(d.label)
    //         .style("left", myApp.xScale(d.cx) + "px")
    //         .style("top", myApp.yScale(d.cy) + "px");
    // })
    return circle;
}
myApp.appendRecs = function (div, arr) {

    let unique = myApp.labels(arr);


    let cValue = function (d) {
            return d.label;
        },
        color = d3.scaleOrdinal(d3.schemeCategory10);

    let qntLabels = unique.length
    let tamGroup = 0.8
    let tamLabel = tamGroup / qntLabels

    console.log(unique.indexOf('teste'))

    let rec = div.selectAll('rect')
        .data(arr)
        .enter()
        .append('rect')
        .attr("class", "bar")
        .style('fill', function (d) {
            return color(cValue(d));
        })
        .attr('cx', function (d) {
            //console.log(d.cx)
            return myApp.xScale(d.cx);
        })
        .attr('cy', myApp.yScale(0))
        .attr("transform", function (d) {
            return "translate(" + myApp.xScale(d.cx + (tamGroup / 2) - ((unique.indexOf(d.label) + 1) * tamLabel)) + "," + myApp.yScale(d.cy) + ")";
        })
        .attr('width', myApp.xScale(tamLabel))
        .attr('height', function (d) {
            //console.log(d.cy)
            //console.log(myApp.xScale(d.cy))
            return myApp.yScale(0) - myApp.yScale(d.cy);
        });
    return rec
}

myApp.labels = function (arr) {
    return [...new Set(arr.map(item => item.label))];
}

myApp.appendLines = function (div, arr) {

    let line = d3.line()
        .x(function (d) {
            console.log(d)
            return myApp.xScale(d.cx);
        })
        .y(function (d) {
            return myApp.yScale(d.cy);
        });
    console.log(arr)
    let color = d3.scaleOrdinal(d3.schemeCategory10);

    let sumstat = d3.nest()
        .key(function (d) {
            return d.label;
        })
        .entries(arr);

    const lines = div.selectAll("path")
        .data(sumstat)
        .enter()
        .append('path')
        .attr('class', 'line')
        .attr('fill', 'none')
        .attr('stroke', function (d) {
            return color(d.key)
        })
        .attr('stroke-width', '1')
        .attr('d', function (d) {
            console.log("d",d.values)
            return d3.line()
                .x(function (d) {
                    console.log(d.cx)
                    return myApp.xScale(d.cx);
                })
                .y(function (d) {
                    console.log(d.cy)
                    return myApp.yScale(d.cy);
                })
                (d.values)
        })
    console.log(lines)

    return lines
}


myApp.run = function () {

    let arrRects = myApp.createRecData(20, ['teste', 'teste1', 'teste2', 'teste3', 'teste4']);
    let arrLines = myApp.createLinesData(9, ['teste', 'teste1', 'teste2']);
    let arrCircles = myApp.createCirclesData(30, ['teste', 'teste1', 'teste2']);

    let svgHistogram = myApp.appendSvg("#mainDiv");
    let chtHistogram = myApp.appendChartGroup(svgHistogram);

    let svgLine = myApp.appendSvg("#mainDiv");
    let chtLine = myApp.appendChartGroup(svgLine);

    let svgScatter = myApp.appendSvg("#mainDiv");
    let chtScatter = myApp.appendChartGroup(svgScatter);




    myApp.createAxes(svgScatter);
    myApp.createAxes(svgHistogram);
    myApp.createAxes(svgLine);

    myApp.appendRecs(chtHistogram, arrRects)
    myApp.appendLines(chtLine, arrRects)
    myApp.appendCircles(chtScatter, arrCircles);

    myApp.addBrushCircle(chtScatter);
    myApp.addBrushRect(chtHistogram);
    myApp.addBrushLine(chtLine);
    myApp.addZoomCircle(svgScatter)
    myApp.addZoomBar(svgHistogram)

    // d3.interval(function() {
    //     let arrCircles = myApp.createCirclesData(30, ['teste', 'teste1', 'teste2']);
    //     myApp.appendCircles(chtScatter, arrCircles);
    // }, 1000);


}

window.onload = myApp.run;