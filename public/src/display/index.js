// months array
const months = [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'Septemember',
    'October',
    'November',
    'December'
]
// buttons for events
const closeBtn4 = document.getElementById('closeBtn4');
// close button in error modal
close4.addEventListener('click', function(event){
    document.getElementById('httpsqlerror').style['display'] = 'none';
})
// we need to call a POST request to get the data to draw the graphs as soon as the page loads
window.onload = function(){
    // get graph data
    $.ajax({
        method: 'POST',
        context: document.body,
        data: {
            graph: true
        }
    })
    .done(function(rows){
        if(rows == 'error'){
            document.getElementById('httpsqlerror').style['display'] = 'block';
        }
        else{
            // we now have the data for the graph, let's put it in our own array 
            var labels = [];
            var data = [];
            var now = new Date();
            var n = now.getMonth();
            var y = now.getFullYear();
            // initialize labels
            for(var k = 0; k < 13; k++){
                // get months as words to display on x-axis
                labels.push(months[n]);
                // get months as dates to check with database result
                data.push(`${n}/1/${y}`);
                if(n == 0){
                    y -= 1;
                    n = 11;
                }
                else{
                    n -= 1;
                }
            }
            // initalize data
            var index = 0;
            for(var k = 0; k < data.length; k++){
                // we have data for this month -- save it
                if(rows[index].month_year == data[k]){
                    data[k] = rows[index].hours;
                }
                // we do not have data for this month -- default to 0
                else{
                    index += 1;
                    data[k] = 0;
                }
            }
            // at this point, labels is the x-axis and data is the y-axis
            // we can now create the graph
            var progress = document.getElementById('animationProgress');
            var ctx = document.getElementById('graph').getContext('2d');
            var graph = new Chart(ctx, {
                type: 'line',
                data: {
                    labels: labels,
                    datasets: [{
                        fill: false,
                        borderColor: 'rgb(233,0,0)',
                        backgroundColor: 'rgb(233,0,0)',
                        data: data
                    }],
                    options: {
                        title: {
                            display: false
                        },
                        animation: {
                            duration: 2000,
                            onProgress: function(animation){
                                progress.value = animation.currentStep / animation.numSteps;
                            },
                            onComplete: function(){
                                window.setTimeout(function(){
                                    progress.value = 0;
                                }, 2000);
                            }
                        }
                    }
                }
            });
        }
        
    })
    .fail(function(code){
        document.getElementById('httpsqlerror').style['display'] = 'block';
    })
    // get pie data
    $.ajax({
        method: 'POST',
        context: document.body,
        data: {
            pie: true
        }
    })
    .done(function(rows){
        if(rows == 'error'){
            document.getElementById('httpsqlerror').style['display'] = 'block';
        }
    })
    .fail(function(code){
        document.getElementById('httpsqlerror').style['display'] = 'block';
    })
}