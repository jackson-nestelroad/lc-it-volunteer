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
    'September',
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
                // handle when year rolls back
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
                // put data from database into a format we can easily compare to
                // we have no more data to look at
                if(index > rows.length-1){
                    string = 'don\'t even try';
                }
                else{
                    var date = new Date(rows[index].month_year);
                    date = new Date(date.setTime(date.getTime() + 1 * 86400000));
                    var string = `${date.getMonth()+1}/1/${date.getFullYear()}`;
                }
                // we have data from our database for this month -> save it
                if(string == data[k]){
                    data[k] = rows[index].hours;
                    index += 1;
                }
                // we do not have data for this month -> default to 0
                else{
                    data[k] = 0;
                }
            }
            // at this point, labels is the x-axis and data is the y-axis
            // we can now create the graph
            var ctx = document.getElementById('graph').getContext('2d');
            var graph = new Chart(ctx, {
                type: 'line',
                data: {
                    labels: labels.reverse(),
                    datasets: [{
                        label: 'Hours',
                        fill: false,
                        borderColor: '#00a8d8',
                        backgroundColor: '#00a8d8',
                        data: data.reverse()
                    }]
                },
                options: {
                    title: {
                        display: false
                    },
                    legend: {
                        display: false
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
        else{
            var teams = [];
            var data = [];
            rows.forEach(element => {
                // get all teams
                teams.push(element.name);
                // null hours -> 0 hours
                element.hours == null ? data.push(0) : data.push(element.hours);
            });
            // check if there have been no volunteers for this month yet
            function checkZero(n){
                return n == 0;
            }
            var none = data.every(checkZero);
            // no hours -> sad face
            if(none){
                document.getElementById('sad-face').style['display'] = 'block';
            }
            // hours found -> pie chart
            else{
                var ctx = document.getElementById('pie').getContext('2d');
                new Chart(ctx, {
                    type: 'doughnut',
                    data: {
                        labels: teams,
                        datasets: [
                            {
                                label: 'Hours',
                                backgroundColor: ['#ff9393', '#f7be8f', '#f2e27b', '#81db7d', '#88d0e8', '#88a0f7', '#e096f7'],
                                data: data
                            }
                        ]
                    },
                    options: {
                        title: {
                            display: false
                        },
                        legend: {
                            display: true,
                            position: 'top',
                            onclick: null
                        }
                    }
                })
            }
        }
    })
    .fail(function(code){
        document.getElementById('httpsqlerror').style['display'] = 'block';
    })
}