// possible categories to search for
const searchCategories = [
    'leaderboard',
    'first',
    'last',
    'team',
    'date',
    'inactive'
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
        query.setAttribute('readonly', true);
        query.style['background-color'] = 'rgba(0,0,0,0.075)';
        setTimeout(destroyDate, 10);
        query.value = '';
    }
    else if(id == 5){
        $('#search-query').datepicker().data('datepicker');
        query.setAttribute('readonly', true);
        query.style['background-color'] = 'white';
        query.value = '';
    }
    else{
        query.removeAttribute('readonly');
        query.style['background-color'] = 'white';
        query.value = '';
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
// search submitted -- GET request
submit.addEventListener('click', function(event){
    enter = false;
    // clear search results
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
            if(rows.length == 0){
                // add a result that says "No results found!"
            }
            rows.forEach(element => {
                var id = element.vol_id;
                var name = element.first_name + ' ' + element.last_name;
                var hours = element.hours;
                var favorite = element.favorite;

                var date = new Date(element.last_active);
                var active = `${date.getMonth()+1}/${date.getDate()}/${date.getFullYear()}`;

                var add = document.createElement('div');
                add.className = 'result';
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
                                <span>${favorite}</span>
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
                var email = rows[0].email;
                var phone = rows[0].phone;
                // set the information in the modal
                document.getElementById('name').innerHTML = name;
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
