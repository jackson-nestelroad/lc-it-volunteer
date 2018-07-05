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
    'Inactivity List'
]
// teams to search for
const teams = [
    'Hardware',
    'Software',
    'Database',
    'Project',
    'Communication'
]
// can we press enter to submit search?
var enter = true;
// button constants for events
const back = document.getElementById('backBtn');
const submit = document.getElementById('searchBtn');
const close4 = document.getElementById('closeBtn4');
const close5 = document.getElementById('closeBtn5');
const select = document.getElementById('category-select');
const query = document.getElementById('search-query');
// change arrow on dropdown
document.getElementsByTagName('body')[0].addEventListener('click', function(event){
	if(event.target.id == 'category-select'){
		select.className == 'closed' ? select.className = 'open' : select.className = 'closed';	
    }
	else{
		select.className == 'open' ? select.className = 'closed' : select.className = 'closed';
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
    // test key
    // if(keyCode == 88){
    //     document.getElementById('volunteerInfo').style['display'] = 'block';
    // }
}
function destroyDate(){
    $('#search-query').datepicker().data('datepicker').destroy();
}
// retain old search information in URL paramters
function updateQuery(id){
    if(id == 1 || id == 6){
        query.value = '';
        query.setAttribute('readonly', true);
        query.style['background-color'] = 'rgba(0,0,0,0.075)';
        setTimeout(destroyDate, 10);
    }
    else if(id == 5){
        query.value = '';
        $('#search-query').datepicker().data('datepicker');
        query.setAttribute('readonly', true);
        query.style['background-color'] = 'white';
    }
    else{
        query.value = '';
        query.removeAttribute('readonly');
        query.style['background-color'] = 'white';
        setTimeout(destroyDate, 10);
    }
}

// retain old search information in URL paramters
window.onload = function(){
    updateQuery(1);
    submit.click();
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
    else if(category == 2 || category == 3 || category == 5){
        string = `${searchCategories[category-1]}: ${query}...`;
    }
    else if(category == 4){
        string = `${searchCategories[category-1]}: ${teams[query-1]}`;
    }
    else if(category == 6){
        string = `${searchCategories[category-1]}`;
    }
    document.getElementsByClassName('search-header')[0].innerHTML = string;
}
// search submitted -- GET request
submit.addEventListener('click', function(event){
    enter = false;
    // check if there is a query if we need one
    if(select.value != 1 && select.value != 6){
        if(query.value == ''){
            query.style['background-color'] = 'rgba(255,0,0,0.1)';
            enter = true;
            return;
        }
    }
    // handle team searches
    if(select.value == 4){
        // hardware
        if(query.value.toLowerCase().startsWith('h')){
            query.value = 1;
        }
        // software
        else if(query.value.toLowerCase().startsWith('s')){
            query.value = 2;
        }
        // database
        else if(query.value.toLowerCase().startsWith('d')){
            query.value = 3;
        }
        // project
        else if(query.value.toLowerCase().startsWith('p')){
            query.value = 4;
        }
        // communication
        else if(query.value.toLowerCase().startsWith('c')){
            query.value = 5;
        }
        // number codes already searched
        else if([1,2,3,4,5].includes(query.value)){
            query.value;
        }
        // invalid team
        else{
            query.style['background-color'] = 'rgba(255,0,0,0.1)';
            enter = true;
            return;
        }
    }
    // clear search results
    if(select.value != 1 && select.value != 6){
        query.style['background-color'] = 'white';
    }
    document.getElementById('search-results').innerHTML = '';
    $.ajax({
        method: 'POST',
        context: document.body,
        data: {
            category: select.value,
            query: query.value
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
            updateHeader(select.value, query.value);
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
            // results were found
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
// pops up info
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
                // set the information in the modal
                document.getElementById('name').innerHTML = name;
                document.getElementById('team').innerHTML = team;
                document.getElementById('email').innerHTML = email;
                document.getElementById('phone').innerHTML = phone;
                // display modal with information
                document.getElementById('volunteerInfo').style['display'] = 'block';
            }
        })
        .fail(function(code){
            document.getElementById('httpsqlerror').style['display'] = 'block';
        })
    }
}
