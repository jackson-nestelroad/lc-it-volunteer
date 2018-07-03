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
function updateQuery(id, first){
    if(id == 1 || id == 6){
        query.setAttribute('readonly', true);
        query.style['background-color'] = 'rgba(0,0,0,0.075)';
        setTimeout(destroyDate, 10);
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
        if(first){
            query.value = window.location.search.substr(1).substr(window.location.search.substr(1).indexOf('=')+1);
        }
        else{
            query.value = '';
        }
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
        updateQuery(1, true);
    }
    else{
        select.value = category;
        updateQuery(category, true);
    }
}
// update search tool when category changes
select.addEventListener('change', function(event){
    updateQuery(this.value, false);
})
// search submitted -- GET request
submit.addEventListener('click', function(event){
    // send GET request with HTML paramteres
})
// pops up info
document.getElementById('search-results').onclick = function(element){
	if(element.target.className == 'clickForInfo'){
        // get ID based on who you clicked on
		console.log(parseInt(element.target.parentElement.children[0].innerHTML.substr(1)));
    }
}
