
var enter = true;

const back = document.getElementById('backBtn');
const submit = document.getElementById('searchBtn');
const close4 = document.getElementById('closeBtn4');
const select = document.getElementById('category-select');

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

select.addEventListener('load', function(event){
    // need to search URL and see what category was just searched for and change it to that
    // basically saving the last search category
    var category = window.location.search.substr(1);
})

select.addEventListener('change', function(event){
    var query = document.getElementById('search-query');
    var category = this.value;
    console.log(category);
    if(category == 1 || category == 6){
        query.disabled = true;
        query.style['background-color'] = 'rgba(0,0,0,0.075)'
    }
    else{
        query.disabled = false;
        query.style['background-color'] = 'white';
    }
})

submit.addEventListener('click', function(event){
    // send GET request with HTML paramteres
})
