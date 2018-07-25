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
    'Campus'
]
// teams to search for
const teams = [
    'Hardware',
    'Software',
    'Database',
    'Project',
    'Communication',
    'Development'
]
// can we press enter to submit search?
var enter = true;
// button constants for events
const back = document.getElementById('backBtn');
const submit = document.getElementById('searchBtn');
const close4 = document.getElementById('closeBtn4');
const close5 = document.getElementById('closeBtn5');

const select = document.getElementById('category-select');
const campusSelect = document.getElementById('campus-search');
const teamSelect = document.getElementById('team-search');

const query = document.getElementById('search-query');
const campusSearch = document.getElementsByClassName('mobile-query')[0];
const teamSearch = document.getElementsByClassName('mobile-query')[1];
const normalSearch = document.getElementsByClassName('mobile-query')[2];
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
// close button in info modal
close5.addEventListener('click', function(event){
    document.getElementById('volunteerInfo').style['display'] = 'none';
    enter = true;
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
    if(id == 1 || id == 6){
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
        string = `${searchCategories[category-1]}: ${query.join(' - ')}`;
    }
    else if(category == 6){
        string = `${searchCategories[category-1]}`;
    }
    document.getElementsByClassName('search-header')[0].innerHTML = string;
}
// search submitted -- POST request
// this sounds backwards, but we are not an API, we are an interactive search page
// POST requests will allow us to update the search page AFTER the request is completed
// so we will get data in our POST request, send it back here, and display them
submit.addEventListener('click', function(event){
    enter = false;
    // check if there is a query if we need one
    if(select.value != 1 && select.value != 6 && select.value != 7 && select.value != 4){
        if(query.value == ''){
            query.style['background-color'] = 'rgba(255,0,0,0.1)';
            enter = true;
            return;
        }
    }
    // handle team searches
    if(select.value == 4){
        var search = teamSelect.value;
        if(![1,2,3,4,5,6].includes(parseInt(search))){
            query.style['background-color'] = 'rgba(255,0,0,0.1)';
            enter = true;
            return;  
        }
    }
    // handle date searches -- array so we can use range of dates
    if(select.value == 5){
        var search = query.value.split(' - ');
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
    if(select.value == 1 || select.value == 6){
        var search = 'none';
    }
    console.log(search);
    // clear search results
    document.getElementById('search-results').innerHTML = '';
    // send our request
    $.ajax({
        method: 'POST',
        context: document.body,
        data: {
            category: select.value,
            query: search
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
                var hours = element.hours;
                var team = element.team;

                var date = new Date(element.last_active);
                date = new Date(date.setTime(date.getTime() + 1 * 86400000));
                var active = `${date.getMonth()+1}/${date.getDate()}/${date.getFullYear()}`;

                hours = hours == null ? 0 : hours;
                team = team == null ? element.preferred : team;

                var add = document.createElement('div');
                add.className = 'result';

                if(active == '1/1/1970'){
                    active = 'Never!';
                    add.className = 'result red';
                }

                add.innerHTML = `
                <table>
                    <tbody>
                        <tr>
                            <td class="small">#${id}</td>
                            <td class="clickForInfo">${name}</td>
                            <td class="center">
                                <i>Hours</i>
                                <br>
                                <span>${hours}</span>
                            </td>
                            <td class="center">
                                <i>Team</i>
                                <br>
                                <span>${team}</span>
                            </td>
                            <td class="center">
                                <i>Last Active</i>
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
        .done(function(rows){
            if(rows == 'error'){
                // this string is sent if something bad happened
                document.getElementById('httpsqlerror').style['display'] = 'block';
            }
            else{
                var name = rows[0].first_name + ' ' + rows[0].last_name;
                var team = rows[0].team;
                var email = rows[0].email;
                var phone = rows[0].phone;
                var campus = rows[0].campus;
                // set the information in the modal
                document.getElementById('name').innerHTML = name;
                document.getElementById('team').innerHTML = team;
                document.getElementById('email').innerHTML = email;
                document.getElementById('phone').innerHTML = phone;
                document.getElementById('campus').innerHTML = campus;
                // display modal with information
                document.getElementById('volunteerInfo').style['display'] = 'block';
            }
        })
        .fail(function(code){
            document.getElementById('httpsqlerror').style['display'] = 'block';
        })
    }
}