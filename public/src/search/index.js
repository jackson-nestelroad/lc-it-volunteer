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
    if(keyCode == 88){
        document.getElementById('volunteerInfo').style['display'] = 'block';
    }
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
    if(window.location.search.substr(1).indexOf('=') == -1){
        var category = window.location.search.substr(1);
    }
    else{
        var category = window.location.search.substr(1).substr(0, window.location.search.substr(1).indexOf('='));
    }
    category = searchCategories.indexOf(category) + 1;
    if(category == 0){
        select.value = 1;
        updateQuery(1);
    }
    else{
        select.value = category;
        updateQuery(category);
    }
    // this will display the results retrieved from the GET request
    displayResults();
}
// update search tool when category changes
select.addEventListener('change', function(event){
    updateQuery(this.value);
})
// search submitted -- GET request
submit.addEventListener('click', function(event){
    // check if search value if we need it
    /*if(select.value != 1 && select.value != 6){
        if(query.value == ''){
            document.getElementById('search-query').style['background-color'] = 'rgba(255,0,0,0.1)';
            return;
        }
    }
    var category = searchCategories[select.value - 1];
    // refresh URL --> new GET request in URL that will display results
    if(select.value == 1 || select.value == 6){
        window.location.replace(`/search?${category}`);
    }
    else{
        window.location.replace(`/search?${category}=${query.value}`);
    }*/
})
// pops up info
document.getElementById('search-results').onclick = function(element){
	if(element.target.className == 'clickForInfo'){
        // get ID based on who you clicked on
		console.log(parseInt(element.target.parentElement.children[0].innerHTML.substr(1)));
    }
}
