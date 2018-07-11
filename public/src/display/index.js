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
const close4 = document.getElementById('closeBtn4');
const back = document.getElementById('back-to-form');
// back button
back.addEventListener('click', function(event){
    window.location.replace('/');
})
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
        console.log(rows);
        if(rows == 'error'){
            document.getElementById('httpsqlerror').style['display'] = 'block';
        }
        else if(rows.length == 0){
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
                data.push(`${n+1}/1/${y}`);
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
                var date = new Date(rows[index].month_year);
                date = new Date(date.setTime(date.getTime() + 1 * 86400000));
                var string = `${date.getMonth()+1}/1/${date.getFullYear()}`;
                console.log(string);
                console.log(data[k]);
                if(string == data[k]){
                    data[k] = rows[index].hours;
                    index += 1;
                }
                // we do not have data for this month -- default to 0
                else{
                    data[k] = 0;
                }
                console.log(data[k]);
            }
            // at this point, labels is the x-axis and data is the y-axis
            // we can now create the graph
            var progress = document.getElementById('animationProgress');
            var ctx = document.getElementById('graph').getContext('2d');
            var graph = new Chart(ctx, {
                type: 'line',
                data: {
                    labels: labels.reverse(),
                    datasets: [{
                        label: 'Hours per Month',
                        fill: false,
                        borderColor: '#00a8d8',
                        backgroundColor: '#00a8d8',
                        data: data.reverse()
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