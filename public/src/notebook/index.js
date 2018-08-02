// date picker and time picker initialization
var datePicker = $('.datepicker-here').datepicker({
    position: 'top left',
    language: 'en',
    maxDate: new Date(`${(new Date()).getMonth()+2}/1/${(new Date()).getFullYear()}`)
})


function defaultDates(){
    var now = new Date();
    var then = new Date();
    then.setTime(now.getTime() - 30 * 86400000);
    datePicker.data('datepicker').selectDate(then);
    datePicker.data('datepicker').selectDate(now);
}

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
// teams to search for
const teams = [
    'Hardware',
    'Software',
    'Database',
    'Project',
    'Admin',
    'Develop',
    'Social'
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
const teamSelect = document.getElementById('team-search');

const query = document.getElementById('search-query');
const teamSearch = document.getElementsByClassName('mobile-query')[0];
const dateSearch = document.getElementsByClassName('mobile-query')[1];

const staff = document.getElementById('staff-input');
const notes = document.getElementById('notes-input');
var oldStaff;
var oldNotes;

// change arrow on dropdowns
document.getElementsByTagName('html')[0].addEventListener('click', function(event){
    var clicked = event.target.id;
	if(clicked == 'category-select'){
		select.className == 'closed mobile-category' ? select.className = 'open mobile-category' : select.className = 'closed mobile-category';	
        teamSelect.className == 'open' ? teamSelect.className = 'closed' : teamSelect.className = 'closed';
    }
    else if(clicked == 'team-search'){
        select.className == 'open mobile-category' ? select.className = 'closed mobile-category' : select.className = 'closed mobile-category';
        teamSelect.className == 'closed' ? teamSelect.className = 'open' : teamSelect.className = 'closed';
    }
    else{
        select.className == 'open mobile-category' ? select.className = 'closed mobile-category' : select.className = 'closed mobile-category';
        teamSelect.className == 'open' ? teamSelect.className = 'closed' : teamSelect.className = 'closed';
    }
})
// update header after search 
function updateHeader(category, search){
    var string = '';
    if(category == 'date'){
        string = JSON.parse(search);
        string = string.join(' - ');
        string = `Date: ${string}`;
    }
    if(category == 'team'){
        string = `Team: ${teams[search-1]}`;
    }
    document.getElementsByClassName('search-header')[0].innerHTML = string;
}

// close button in notebook modal
close5.addEventListener('click', function(event){
    // check if stored variables for staff and notes have changed
    // aka different from the values in the notebook modal
    var newStaff = staff.value;
    var newNotes = notes.value;
    if(newStaff != oldStaff || newNotes != oldNotes){
        // they are updating notes, but not putting a staff name
        if(newNotes != oldNotes && newStaff == ''){
            newStaff = '??????';
        }
        var id = document.getElementById('id').innerHTML;
        newStaff = newStaff == '' ? null : newStaff;
        newNotes = oldStaff == '' ? null : newNotes;
        $.ajax({
            method: 'POST',
            context: document.body,
            data: {
                reason: 'update',
                id: id,
                staff: newStaff,
                notes: newNotes
            }
        })
        .done(function(rows){
            document.getElementById('notebook').style['display'] = 'none';
            close5.innerHTML = 'Close';
            document.getElementById('success').style['display'] = 'block';
        })
        .fail(function(code){
            document.getElementById('httpsqlerror').style['display'] = 'block';
        })
    }
    else{
        document.getElementById('notebook').style['display'] = 'none';
        enter = true;
        close5.innerHTML = 'Close'; 
    }
})
// close button in success modal
close6.addEventListener('click', function(event){
    document.getElementById('success').style['display'] = 'none';
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
// retain old search information in URL paramters
function updateQuery(id){
    if(id == 'date'){
        dateSearch.className = 'mobile-query';
        teamSearch.className = 'mobile-query invisible';
    }
    if(id == 'team'){
        dateSearch.className = 'mobile-query invisible';
        teamSearch.className = 'mobile-query';
    }
}
// update search tool when category changes
select.addEventListener('change', function(event){
    updateQuery(this.value);
})
// check if staff attribute has been edited
staff.addEventListener('change', function(event){
    if(staff.value != oldStaff || notes.value != oldNotes){
        close5.innerHTML = 'Save';
    }
    else{
        close5.innerHTML = 'Close';
    }
})
// check if notes attribute has been edited
notes.addEventListener('change', function(event){
    if(staff.value != oldStaff || notes.value != oldNotes){
        close5.innerHTML = 'Save';
    }
    else{
        close5.innerHTML = 'Close';
    }
})
// search submitted -- POST request
// this sounds backwards, but we are not an API, we are an interactive search page
// POST requests will allow us to update the search page AFTER the request is completed
// so we will get data in our POST request, send it back here, and display them
submit.addEventListener('click', function(event){
    var category = select.value;
    var search = category == 'date' ? query.value : teamSelect.value;
    enter = false;
    if(category != 'date' && category != 'team'){
        document.getElementById('httpsqlerror').style['display'] = 'block';
        enter = true;
        return;
    }
    if(search == ''){
        if(category == 'date'){
            defaultDates();
            search = query.value;
        }
        if(category == 'team'){
            if(![1,2,3,4,5,6,7].includes(parseInt(search))){
                teamSelect.value = 1;
                search = teamSelect.value;
            }
        }
    }
    if(category == 'date'){
        search = search.split(' - ');
        search = JSON.stringify(search);
    }
    // clear results and send request
    document.getElementById('notebook-logs').innerHTML = '';
    $.ajax({
        method: 'POST',
        context: document.body,
        data: {
            reason: 'fetch',
            category: category,
            query: search
        }
    })
    .done(function(rows){
        if(rows == 'error'){
            document.getElementById('httpsqlerror').style['display'] = 'block';
        }
        else{
            // handle results and display them
            updateHeader(category, search);
            // no results found
            if(rows.length == 0){
                var add = document.createElement('div');
                add.className = 'entry none';

                add.innerHTML = `
                No results found!
                `
                document.getElementById('notebook-logs').appendChild(add);
                enter = true;
                return;
            }
            // results were found -> display each element in rows array
            rows.forEach(element => {
                var id = element.log_id;
                var name = element.first_name + ' ' + element.last_name;
                var campus = element.campus;
                var hours = element.hours;
                var team = element.team;

                var date = new Date(element.date);
                date = new Date(date.setTime(date.getTime() + 1 * 86400000));
                date = `${date.getMonth()+1}/${date.getDate()}/${date.getFullYear()}`;

                var staff = element.staff;
                var notes = element.notes;

                var add = document.createElement('div');
                add.className = 'entry';

                if(staff == null){
                    add.className = 'entry red';
                }

                if(staff != null && notes != null){
                    add.title = `${staff}: ${notes}`;
                }
                else{
                    add.title = 'Not assigned!';
                }

                add.innerHTML = `
                <table>
                    <tbody>
                        <tr>
                            <td style="display: none">${id}</td>
                            <td class="icon"><img class="image" src="/assets/images/pencil.svg" /></td>
                            <td class="name">${name}</td>
                            <td class="center">
                                <i>Campus</i>
                                <br />
                                <span>${campus}</span>
                            </td>
                            <td class="center">
                                <i>Hours</i>
                                <br />
                                <span>${hours}</span>
                            </td>
                            <td class="center">
                                <i>Team</i>
                                <br />
                                <span>${team}</span>
                            </td>
                            <td class="center">
                                <i>Date</i>
                                <br />
                                <span>${date}</span>
                            </td>
                        </tr>
                    </tbody>
                </table>
                `;
                document.getElementById('notebook-logs').appendChild(add);
            });
            enter = true;   
        }
    })
    .fail(function(code){
        document.getElementById('httpsqlerror').style['display'] = 'block';
    })
})

// pops up assignment modal
document.getElementById('notebook-logs').onclick = function(element){
    var clicked = element.target.className == 'image' ? element.target.parentElement : element.target; 
    if(clicked.className == 'icon'){
        enter = false;
        // get log_id based on which entry you clicked on
        var id = parseInt(clicked.parentElement.children[0].innerHTML);
        $.ajax({
            method: 'POST',
            context: document.body,
            data: {
                reason: 'modal',
                id: id
            }
        })
        .done(function(rows){
            if(rows == 'error'){
                // this string is sent if something bad happened
                document.getElementById('httpsqlerror').style['display'] = 'block';
            }
            else{
                // now format the data
                var name = rows[0].first_name + ' ' + rows[0].last_name;
                var team = rows[0].team;
                var id = rows[0].log_id;

                var date = new Date(rows[0].date);
                date = new Date(date.setTime(date.getTime() + 1 * 86400000));
                date = `${date.getMonth()+1}/${date.getDate()}/${date.getFullYear()}`;

                var hours = rows[0].hours;
                var staffValue = rows[0].staff;
                var notesValue = rows[0].notes;
    
                var description = `${name} volunteered on ${date} for ${hours} hours with ${team}`;
    
                // set the information in the modal
                document.getElementById('id').innerHTML = id;
                document.getElementById('description').innerHTML = description;
                oldStaff = staffValue == null ? '' : staffValue;
                oldNotes = notesValue == null ? '' : notesValue;
                staff.value = staffValue;
                notes.value = notesValue;
    
                // display modal with information
                document.getElementById('notebook').style['display'] = 'block';
            }
        })
        .fail(function(code){
            document.getElementById('httpsqlerror').style['display'] = 'block';
        })
    }
}

// submit on load basically
defaultDates();
submit.click();