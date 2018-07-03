
const searchCategories = [
    'leaderboard',
    'first',
    'last',
    'team',
    'date',
    'inactive'
]

var enter = true;

const back = document.getElementById('backBtn');
const submit = document.getElementById('searchBtn');
const close4 = document.getElementById('closeBtn4');
const select = document.getElementById('category-select');
const query = document.getElementById('search-query');

close4.addEventListener('click', function(event){
    document.getElementById('httpsqlerror').style['display'] = 'none';
    enter = true;
})

back.addEventListener('click', function(event){
    window.location.replace('/');
})

document.onkeydown = function(evt){
    var keyCode = evt ? (evt.which ? evt.which : evt.keyCode) : event.keyCode;
    if(keyCode == 13 && enter)
    {
        submit.click();
    }
}

function updateQuery(id){
    if(id == 1 || id == 6){
        query.disabled = true;
        query.style['background-color'] = 'rgba(0,0,0,0.075)';
    }
    else{
        query.disabled = false;
        query.style['background-color'] = 'white';
    }
}

window.onload = function(){
    // need to search URL and see what category was just searched for and change it to that
    // basically saving the last search category
    var category = window.location.search.substr(1).substr(0, window.location.search.substr(1).indexOf('='));
    category = searchCategories.indexOf(category) + 1;
    if(category == 0){
        select.value = 1;
        updateQuery(1);
    }
    else{
        select.value = category;
        updateQuery(category);
    }
    query.value = window.location.search.substr(1).substr(window.location.search.substr(1).indexOf('=')+1);
}

select.addEventListener('change', function(event){
    var category = this.value;
    if(category == 1 || category == 6){
        updateQuery(category);
    }
    else{
        updateQuery(category);
    }
})

submit.addEventListener('click', function(event){
    // send GET request with HTML paramteres
})
