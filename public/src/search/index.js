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
// possible categories to search for
const searchCategories = [
    'Leaderboard',
    'First Name',
    'Last Name',
    'Team',
    'Date',
    'Inactivity List',
    'Campus',
    'Active Volunteers'
]
// teams to search for -- fetched from database onload
var teamIds = [];
var teams = [];
// order options
const orders = [
    'name',
    'campus',
    'week',
    'total',
    'team',
    'last'
]
// can we press enter to submit search?
var enter = true;
// button constants for events
const back = document.getElementById('backBtn');
const submit = document.getElementById('searchBtn');
const close4 = document.getElementById('closeBtn4');
const close5 = document.getElementById('closeBtn5');
const close6 = document.getElementById('closeBtn6');

const select = document.getElementById('category-select');
const campusSelect = document.getElementById('campus-search');
const teamSelect = document.getElementById('team-search');

const query = document.getElementById('search-query');
const campusSearch = document.getElementsByClassName('mobile-query')[0];
const teamSearch = document.getElementsByClassName('mobile-query')[1];
const normalSearch = document.getElementsByClassName('mobile-query')[2];

const check = document.getElementById('inactive-check');
const save = document.getElementById('saveBtn');
var activitySwitch = 0;
// change arrow on dropdowns
document.getElementsByTagName('html')[0].addEventListener('click', function(event){
    var clicked = event.target.id;
	if(clicked == 'category-select'){
		select.className == 'closed mobile-category' ? select.className = 'open mobile-category' : select.className = 'closed mobile-category';	
        campusSelect.className == 'open' ? campusSelect.className = 'closed' : campusSelect.className = 'closed';
        teamSelect.className == 'open' ? teamSelect.className = 'closed' : teamSelect.className = 'closed';
    }
    else if(clicked == 'campus-search'){
        select.className == 'open mobile-category' ? select.className = 'closed mobile-category' : select.className = 'closed mobile-category';
        campusSelect.className == 'closed' ? campusSelect.className = 'open' : campusSelect.className = 'closed';
        teamSelect.className == 'open' ? teamSelect.className = 'closed' : teamSelect.className = 'closed';
    }
    else if(clicked == 'team-search'){
        select.className == 'open mobile-category' ? select.className = 'closed mobile-category' : select.className = 'closed mobile-category';
        campusSelect.className == 'open' ? campusSelect.className = 'closed' : campusSelect.className = 'closed';
        teamSelect.className == 'closed' ? teamSelect.className = 'open' : teamSelect.className = 'closed';
    }
    else{
        select.className == 'open mobile-category' ? select.className = 'closed mobile-category' : select.className = 'closed mobile-category';
        campusSelect.className == 'open' ? campusSelect.className = 'closed' : campusSelect.className = 'closed';
        teamSelect.className == 'open' ? teamSelect.className = 'closed' : teamSelect.className = 'closed';
    }
})

// close button in success modal
close6.addEventListener('click', function(event){
    document.getElementById('success').style['display'] = 'none';
    enter = true;
})
// close button in info modal
close5.addEventListener('click', function(event){
    // check if activity setting is switched
    // if so, submit a POST request to change this attribute in the database
    // get ID from inside the info modal
    if(activitySwitch == 1){
        var id = document.getElementById('id').innerHTML;
        var active = !document.getElementById('inactive-check').checked;
        $.ajax({
                method: 'POST',
                context: document.body,
                data: {
                    category: -2,
                    id: id,
                    active: active
                }
            })
            .done(function(rows){
                document.getElementById('volunteerInfo').style['display'] = 'none';
                activitySwitch = 0;
                close5.innerHTML = 'Close';
                document.getElementById('success').style['display'] = 'block'; 
            })
            .fail(function(code){
                document.getElementById('httpsqlerror').style['display'] = 'block';
            })
    }
    else{
        document.getElementById('volunteerInfo').style['display'] = 'none';
        enter = true;
        activitySwitch = 0;
        close5.innerHTML = 'Close'; 
    }
})
// close button in error modal
close4.addEventListener('click', function(event){
    document.getElementById('httpsqlerror').style['display'] = 'none';
    enter = true;
})
// back button
back.addEventListener('click', function(event){
    window.location.replace('/');
})

document.onkeydown = function(evt){
    var keyCode = evt ? (evt.which ? evt.which : evt.keyCode) : event.keyCode;
    // search with enter
    if(keyCode == 13 && enter){
        submit.click();
    }
}
function destroyDate(){
    $('#search-query').datepicker().data('datepicker').destroy();
}
function resetQuery(){
    query.value = '';
}
// retain old search information in URL paramters
function updateQuery(id){
    if(id == 1 || id == 6 || id == 8){
        query.setAttribute('readonly', true);
        query.style['background-color'] = 'rgba(0,0,0,0.075)';
        setTimeout(destroyDate, 10);
        campusSearch.className = 'mobile-query invisible';
        normalSearch.className = 'mobile-query';
        teamSearch.className = 'mobile-query invisible';
        setTimeout(resetQuery, 20);
    }
    else if(id == 4){
        campusSearch.className = 'mobile-query invisible';
        normalSearch.className = 'mobile-query invisible';
        teamSearch.className = 'mobile-query';
    }
    else if(id == 5){
        $('#search-query').datepicker().data('datepicker');
        query.setAttribute('readonly', true);
        query.style['background-color'] = 'white';
        campusSearch.className = 'mobile-query invisible';
        normalSearch.className = 'mobile-query';
        teamSearch.className = 'mobile-query invisible';
        setTimeout(resetQuery, 20);
    }
    else if(id == 7){
        campusSearch.className = 'mobile-query';
        normalSearch.className = 'mobile-query invisible';
        teamSearch.className = 'mobile-query invisible';
    }
    else{
        query.removeAttribute('readonly');
        query.style['background-color'] = 'white';
        setTimeout(destroyDate, 10);
        campusSearch.className = 'mobile-query invisible';
        normalSearch.className = 'mobile-query';
        teamSearch.className = 'mobile-query invisible';
        setTimeout(resetQuery, 20);
    }
}

window.onload = function(){
    // get team data for dropdown

    $.ajax({
        method: 'GET',
        url: '/teams',
        context: document.body
    })
    .done(function(rows){
        console.log(rows.length);
        if(rows == 'error'){
            document.getElementById('httpsqlerror').style['display'] = 'block';
        }
        else if(rows.length == 0){
            document.getElementById('httpsqlerror').style['display'] = 'block';
        }
        else{
            for(var k = 0; k < rows.length; k++)
            {
                teamIds.push(k + 1);
                teams.push(rows[k].name);
                var option = document.createElement('option');
                option.setAttribute('value', k + 1);
                option.innerHTML = rows[k].full_name;
                teamSelect.appendChild(option);
            }
        }
    })
    .fail(function(code){
        document.getElementById('httpsqlerror').style['display'] = 'block';
    })

    updateQuery(1);
    submit.click();
    // get campuses and put them into the options

    // !! will not work on Heroku !!

    // $.ajax({
    //     method: 'POST',
    //     context: document.body,
    //     data: {
    //         category: -1
    //     }
    // })
    // .done(function(rows){
    //     console.log(rows.length);
    //     if(rows == 'error'){
    //         document.getElementById('httpsqlerror').style['display'] = 'block';
    //     }
    //     else if(rows.length == 0){
    //         document.getElementById('httpsqlerror').style['display'] = 'block';
    //     }
    //     else{
    //         rows.forEach(element => {
    //             if(element.Name == 'Unknown'){
    //                 // skip
    //             }
    //             else{
    //                 // create the option in the dropdown
    //                 var value = element.CampusCode;
    //                 var campusName = element.Name + ', ' + element.State;
    //                 var option = document.createElement('option');
    //                 option.setAttribute('value', value);
    //                 option.innerHTML = campusName;
    //                 document.getElementById('campus-search').appendChild(option); 
    //             }
    //         })
    //     }
    // })
    // .fail(function(code){
    //     document.getElementById('httpsqlerror').style['display'] = 'block';
    // })
}
// update search tool when category changes
select.addEventListener('change', function(event){
    updateQuery(this.value);
})
// update header after search 
function updateHeader(category, query){
    var string = '';
    if(category == 1){
        string = `${months[(new Date()).getMonth()]} ${searchCategories[category-1]}`;
    }
    else if(category == 2 || category == 3 ){
        string = `${searchCategories[category-1]}: ${query}...`;
    }
    else if(category == 4){
        string = `${searchCategories[category-1]}: ${teams[query-1]}`;
    }
    else if(category == 5 || category == 7){
        if(category == 5){
            query = JSON.parse(query);
            query = query.join(' - ');
        }
        string = `${searchCategories[category-1]}: ${query}`;
    }
    else if(category == 6 || category == 8){
        string = `${searchCategories[category-1]}`;
    }
    document.getElementsByClassName('search-header')[0].innerHTML = string;
}
// check which order radio button is selected
function getOrder(){
    // default to name just in case
    var checked = 0;
    for(var k = 0; k < orders.length; k++){
        if(document.getElementById(`${orders[k]}-radio`).checked){
            checked = k;
        }
    }
    return checked;
}
// check if volunteer is being changed from inactive to active
check.addEventListener('change', function(event){
    // this variable checks if we
    if(activitySwitch == -1){
        activitySwitch = 0;
    } 
    activitySwitch = activitySwitch == 1 ? 0 : 1;
    if(activitySwitch == 0){
        close5.innerHTML = 'Close';
    }
    if(activitySwitch == 1){
        close5.innerHTML = 'Save';
    }
})
// search submitted -- POST request
// this sounds backwards, but we are not an API, we are an interactive search page
// POST requests will allow us to update the search page AFTER the request is completed
// so we will get data in our POST request, send it back here, and display them
submit.addEventListener('click', function(event){
    enter = false;
    // check if there is a query if we need one
    if(select.value != 1 && select.value != 6 && select.value != 7 && select.value != 4 && select.value != 8){
        if(query.value == ''){
            query.style['background-color'] = 'rgba(255,0,0,0.1)';
            enter = true;
            return;
        }
    }
    // handle team searches
    if(select.value == 4){
        var search = teamSelect.value;
        if(!teamIds.includes(parseInt(search))){
            query.style['background-color'] = 'rgba(255,0,0,0.1)';
            enter = true;
            return;  
        }
    }
    // handle date searches -- array so we can use range of dates
    if(select.value == 5){
        var search = query.value.split(' - ');
        search = JSON.stringify(search);
        query.style['background-color'] = 'white';
    }
    // campus search -- make it the query
    if(select.value == 7){
        var search = campusSelect.value;
    }
    // take away the red error background on submission
    if(select.value == 2 || select.value == 3){
        var search = query.value;
        query.style['background-color'] = 'white';
    }
    // no query needed -- use none for logging purposes
    if(select.value == 1 || select.value == 6 || select.value == 8){
        var search = searchCategories[select.value-1];
    }
    console.log(search);
    var order = getOrder();
    // clear search results
    document.getElementById('search-results').innerHTML = '';
    // send our request
    $.ajax({
        method: 'POST',
        context: document.body,
        data: {
            category: select.value,
            query: search,
            order: order
        }
    })
    .done(function(rows){
        if(rows == 'error'){
            // this string is sent if something bad happened
            document.getElementById('httpsqlerror').style['display'] = 'block';
        }
        else{
            // rows is an array in order of returned rows
            // change header at top of page
            updateHeader(select.value, search);
            // no results found
            if(rows.length == 0){
                var add = document.createElement('div');
                add.className = 'result none';

                add.innerHTML = `
                No results found!
                `
                document.getElementById('search-results').appendChild(add);
                enter = true;
                return;
            }
            // results were found -> display each element in rows array
            rows.forEach(element => {
                var id = element.vol_id;
                var name = element.first_name + ' ' + element.last_name;
                var campus = element.campus;
                var week = element.week;
                var total = element.total;
                var team = element.favorite;

                var inactive = !element.active;

                var date = new Date(element.last_active);
                date = new Date(date.setTime(date.getTime() + 1 * 86400000));
                var active = `${date.getMonth()+1}/${date.getDate()}/${date.getFullYear()}`;
                
                week = week == null ? 0 : week;
                total = total == null ? 0 : total;
                team = team == null ? element.preferred : team;

                var add = document.createElement('div');

                // different colors are used for 30, 60, and 90 days of activity

                if(inactive){
                    active = active == '1/1/1970' ? 'Never!' : active;
                    add.className = 'result inactive';
                    add.title = 'Marked as Inactive';
                }
                else if(active == '1/1/1970'){
                    active = 'Never!';
                    add.className = 'result green';
                    add.title = 'Never volunteered!'
                }
                else{
                    var then = new Date(active);
                    var now = new Date();
                    var diff = now.getTime() - then.getTime();
                    diff /= 86400000;
                    diff = Math.round(diff);
    
                    if(diff < 30){
                        add.className = 'result';
                        add.title = diff != 1 ? `Last Active: ${diff} days ago` : `Last Active: ${diff} day ago`;
                    }
                    else if(diff >= 30 && diff < 60){
                        add.className = 'result yellow';
                        add.title = `Last Active: ${diff} days ago`;
                    }
                    else if(diff >= 60 && diff < 90){
                        add.className = 'result orange';
                        add.title = `Last Active: ${diff} days ago`;
                    }
                    else if(diff >= 90){
                        add.className = 'result red';
                        add.title = `Last Active: ${diff} days ago`;
                    }
                }

                add.innerHTML = `
                <table>
                    <tbody>
                        <tr>
                            <td class="small">#${id}</td>
                            <td class="clickForInfo">${name}</td>
                            <td class="center">
                                <i>Campus</i>
                                <br>
                                <span>${campus}</span>
                            <td class="center">
                                <i>Week</i>
                                <br>
                                <span>${week}</span>
                            <td class="center no-mobile">
                                <i>Total</i>
                                <br>
                                <span>${total}</span>
                            </td>
                            <td class="center">
                                <i>Team</i>
                                <br>
                                <span>${team}</span>
                            </td>
                            <td class="center">
                                <i>Last</i>
                                <br>
                                <span>${active}</span>
                            </td>
                        </tr>
                    </tbody>
                </table>
                `
                document.getElementById('search-results').appendChild(add);
            });
            enter = true;
        }
    })
    .fail(function(code){
        document.getElementById('httpsqlerror').style['display'] = 'block';
    })
})
// pops up info modal
document.getElementById('search-results').onclick = function(element){
	if(element.target.className == 'clickForInfo'){
        enter = false;
        // get ID based on who you clicked on
        var id = parseInt(element.target.parentElement.children[0].innerHTML.substr(1));
        $.ajax({
            method: 'POST',
            context: document.body,
            data: {
                category: 0,
                query: id
            }
        })
        .done(function(object){
            if(object == 'error'){
                // this string is sent if something bad happened
                document.getElementById('httpsqlerror').style['display'] = 'block';
            }
            else{
                // rows is the info in the modal
                var rows = object.info;
                // dist is for the bar graph only
                var dist = object.dist;
                // now format the data
                var id = rows[0].vol_id;
                var name = rows[0].first_name + ' ' + rows[0].last_name;
                var team = rows[0].preferred;
                var email = rows[0].email;
                var phone = rows[0].phone;
                var campus = rows[0].campus;
                var active = rows[0].active;
                // set the information in the modal
                document.getElementById('id').innerHTML = id;
                document.getElementById('name').innerHTML = name;
                document.getElementById('team').innerHTML = team;
                document.getElementById('email').innerHTML = email;
                document.getElementById('phone').innerHTML = phone;
                document.getElementById('campus').innerHTML = campus;

                activitySwitch = -1;
                check.checked = !active;    

                var logs = document.getElementById('logs');
                logs.innerHTML = '';
                if(rows.length == 1){
                    if(rows[0].date == null){
                        var add = document.createElement('p');
                        add.className = 'log';
                        add.innerHTML = `Never volunteered!`;
                        logs.appendChild(add);  
                    }
                    else{
                        rows.forEach(row => {
                            var add = document.createElement('p');
                            add.className = 'log';
                            var date = new Date(row.date);
                            date = new Date(date.setTime(date.getTime() + 1 * 86400000));
                            date = `${date.getMonth()+1}/${date.getDate()}/${date.getFullYear()}`;
                            add.innerHTML = `${date} – ${row.hours} hours with ${row.team}`;
                            logs.appendChild(add);
                        });
                    }
                }
                else{
                    rows.forEach(row => {
                        var add = document.createElement('p');
                        add.className = 'log';
                        var date = new Date(row.date);
                        date = new Date(date.setTime(date.getTime() + 1 * 86400000));
                        date = `${date.getMonth()+1}/${date.getDate()}/${date.getFullYear()}`;
                        add.innerHTML = `${date} – ${row.hours} hours with ${row.team}`;
                        logs.appendChild(add);
                    });
                }
                // draw graph with var dist ([]) as data
                var labels = [];
                var data = [];
                dist.forEach(row => {
                    labels.push(row.team);
                    if(row.frequency == null){
                        data.push(0);
                    }
                    else{
                        data.push(row.frequency);
                    }
                })
                document.getElementsByClassName('graph')[0].innerHTML = '<canvas id="bar" width="100%" height="100%"></canvas>';
                var ctx = document.getElementById('bar').getContext('2d');
                new Chart(ctx, {
                    type: 'bar',
                    data: {
                        labels: labels,
                        datasets: [
                            {
                                label: 'Hours',
                                backgroundColor: ['rgba(255,147,147,0.8)', 'rgba(252,183,126,0.8)', 'rgba(242,226,123,0.8)', 'rgba(129,219,125,0.8)', 'rgba(136,208,232,0.8)', 'rgba(136,160,247,0.8)', 'rgba(224,150,247,0.8)', 'rgba(255,163,202,0.8)', 'rgba(191,191,191,0.8)', 'rgba(255,163,120,0.8)', 'rgba(189,229,126,0.8)', 'rgba(136,182,232,0.8)', 'rgba(255,119,178,0.8)', 'rgba(168,168,168,0.8)'],
                                data: data
                            }
                        ]
                    },
                    options: {
                        maintainAspectRatio: false,
                        title: {
                            display: false
                        },
                        legend: {
                            display: false,
                            position: 'top',
                            onclick: null
                        },
                        scales:{
                            xAxes: [{
                                display: false
                            }],
                            yAxes: [{
                                display: false
                            }]
                        }
                    }
                })
                // display modal with information
                document.getElementById('volunteerInfo').style['display'] = 'block';
            }
        })
        .fail(function(code){
            document.getElementById('httpsqlerror').style['display'] = 'block';
        })
    }
}