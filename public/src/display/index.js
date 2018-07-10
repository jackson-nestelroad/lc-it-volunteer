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
            // initialize labels
            for(var k = 0; k < 13; k++){
                labels.push(months[n]);
                n = n == 0 ? 11 : n - 1;
            }
            // initalize data
            var m = 0;
            var month = now.getMonth();
            var year = now.getFullYear();
            rows.forEach(element => {
                // TO DO
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