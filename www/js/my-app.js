Template7.registerHelper('stringify', function (context){
    var str = JSON.stringify(context);
    // Need to replace any single quotes in the data with the HTML char to avoid string being cut short
    return str.split("'").join('&#39;');
});

// Initialize app
var myApp = new Framework7({
    precompileTemplates: true,
    template7Pages: true,
    smartSelectBackOnSelect: true
});


// If we need to use custom DOM library, let's save it to $$ variable:
var $$ = Dom7;

// Add view
var mainView = myApp.addView('.view-main', {
    // Because we want to use dynamic navbar, we need to enable it for this view:
    dynamicNavbar: true
});

// Handle Cordova Device Ready Event
$$(document).on('deviceready', function() {
    console.log("Device is ready!");
});


var BASE_URL = 'http://fuel.basementlabs.com.ng'
//var BASE_URL = 'http://192.168.1.7:8000'
// Now we need to run the code that will be executed only for About page.

// Option 1. Using page callback for page (for "about" page in this case) (recommended way):
//myApp.onPageInit('about', function (page) {
//    // Do something here for "about" page
//    console.log("in the about page");
//})

myApp.onPageInit('add', function(page){
    var item = page.context;
    
    $$('#btnAdd').on('click', function(e){
        var brand = $$('#id_brand').val();
        if(!brand){
            myApp.alert("Please state the brand name of the station", "Careful!");
            return false;
        }
        if (brand.indexOf(' ') != -1){
            myApp.alert("The brand name should be one word", "Correction");
            return false;
        }
        
        var address = $$('#id_address').val();
        if(!address){
            myApp.alert("Please enter the address of the station", "Careful!");
            return false;
        }
        
        var area = $$('#id_area').val();
        if(!area){
            myApp.alert("Please enter at least one keyword e.g. 'ikeja'", "Careful!");
            return false;
        }
        
        var state = $$("select[name='station_state']").val();
        
        var url = BASE_URL + "/api/new/?brand=" + brand + "&address=" + encodeURIComponent(address) + "&state=" + state + "&area=" + encodeURIComponent(area);
//        console.log(url);
        
        $$.ajax({
            url: url,
            success: function(data){
                console.log(data);
                myApp.alert("Successfully updated", "Station");
                  mainView.router.load({
                    template: Template7.templates.addTemplate,
                  });
            },
            error: function(xhr){
                console.error(xhr);
                myApp.alert(xhr, "Error");
            }
        })
    })
})

myApp.onPageInit('update', function(page){
    var item = page.context;
    
    $$('#btnUpdate').on('click', function(e){
        var station_id = item.station_id;
        var station = item.name;
        var price = $$('#id_price').val();
        var kegs_value = $$('#id_kegs').prop("checked");
        var kegs = kegs_value == true? "Yes" : "No";
//        console.log("Kegs: " + kegs);
        var vehicles = $$('#id_vehicles').val();
        
        var vehicles_text = null;
        if (vehicles == 0)
            vehicles_text = "1 - 10";
        else if (vehicles == 1)
            vehicles_text = "11 - 20";
        else
            vehicles_text = "> 20";
        
        var url = BASE_URL + "/api/entry/" + item.station_id + "/?fuel_price=" + price + "&num_cars=" + vehicles;
        if ($$('#id_kegs').prop('checked') == true){
            url += "&kegs=[on]";
        }
//        console.log("url is " + url);

        $$.ajax({
            
            url: url,
            success: function(data){
                console.log("successful post " + data);
                for (i=0; i< output.length; i++){
                    if (output[i].station_id == item.station_id){
                        output[i].fuel_price = price;
                        output[i].vehicles = vehicles_text;
                        output[i].kegs = kegs;
                        output[i].kegs_value = kegs_value;
//                        if $$("#id_kegs").prop("checked"){
//                            output[i].kegs = "Yes";
//                        } else {
//                            output[i].kegs = "No";
//                        }
                        output[i].timesince = "Just now";
                    }
                }
                myApp.alert("Successfully updated", "Station");
                  mainView.router.load({
                    template: Template7.templates.listTemplate,
                    context: output
                  });
                
            },
            error: function(xhr){
                console.log("error: " + xhr.textContent);
            }
        })
    })
})

// Option 2. Using one 'pageInit' event handler for all pages:
$$(document).on('pageInit', function (e) {
    // Get page data from event data
    var page = e.detail.page;

    if (page.name === 'about') {
        // Following code will be executed for page with data-page attribute equal to "about"
        //myApp.alert('Here comes About page');
        //console.log("here comes the about page");
    }
})

myApp.onPageInit('list', function(page){
    console.log("in the list page");
})

// Option 2. Using live 'pageInit' event handlers for each page
$$(document).on('pageInit', '.page[data-page="about"]', function (e) {
    // Following code will be executed for page with data-page attribute equal to "about"
    //myApp.alert('Here comes About page');
    console.log("here comes the about page");
})

$$(document).on('keyup', '#search', function(e){
    console.log('typed');
})

function timeSince(date) {

    var seconds = Math.floor((new Date() - date) / 1000);

    var interval = Math.floor(seconds / 31536000);

    if (interval > 1) {
        return interval + " years";
    }
    interval = Math.floor(seconds / 2592000);
    if (interval > 1) {
        return interval + " months";
    }
    interval = Math.floor(seconds / 86400);
    if (interval > 1) {
        return interval + " days";
    }
    interval = Math.floor(seconds / 3600);
    if (interval > 1) {
        return interval + " hours";
    }
    interval = Math.floor(seconds / 60);
    if (interval > 1) {
        return interval + " minutes";
    }
    if (interval == 1) {
        return "1 minute";
    }
    return Math.floor(seconds) + " seconds";
}

$$(document).on('click', '#btnSearch', function(e){
    console.log('clicked button');
    var area = $$('#term').val();
    console.log(term);
    if (term.length == 0){
        myApp.alert("Please enter an area to search for");
    } else {
        var state = $$("select[name='state']").val();
        var url = BASE_URL + "/api/stations/?state=" + state + "&name=" + area;
        console.log("url = " + url);
        //var url = "http://fuel.basementlabs.com.ng/api/stations/";
        //var url = "http://fuel.basementlabs.com.ng/api/stations/?state=" + state + "&area=" + area;
        $$.ajax({
            url: url,
            dataType: "json",
            success: function(data){
//                console.log("got data back: " + data);
//                console.log("results: " + data[0]["name"]);
                output = [];
                for (i=0; i< data.length; i++){
//                    console.log("item[" + i + "] = " + data[i].name);
                    var raw_time = data[i].time.replace(" ", "T");
                    console.log(raw_time);
                    var dt = new Date(raw_time);
                    if (isNaN(dt)){
                        tsince = "(N/A)"
                    } else {
                        tsince = "" + timeSince(dt) + " ago";
                    }
                    veh0 = data[i].num_cars == "1 - 10"? true: false;
                    veh1 = data[i].num_cars == "11 - 20"? true: false;
                    veh2 = data[i].num_cars == "> 20"? true: false;
                    
                    // Kegs
                    kegs_value = data[i].kegs.toLowerCase() == "yes"; 
                    
                    output.push({
                        name: data[i].name,
                        address: data[i].address,
                        fuel_price: data[i].fuel_price,
                        vehicles: data[i].num_cars,
                        kegs: data[i].kegs,
                        kegs_value: kegs_value,
                        timesince: tsince,
                        station_id: data[i].station_id,
                        veh_0: veh0,
                        veh_1: veh1,
                        veh_2: veh2,
                    });
                }
                
                mainView.router.load({
                    template: Template7.templates.listTemplate,
                    context: output
                })
            },
            error: function(xhr){
                console.error("Error in async call " + xhr);
            }
        })
    }
})

$$(document).on('click', '#search', function(e){
    mainView.router.loadPage("index.html");
//    mainView.router.load({pageName: "index"});
    myApp.closePanel();
})


$$(document).on('click', '#add', function(e){
    mainView.router.load({template: Template7.templates.addTemplate});
    myApp.closePanel();
})

$$(document).on('click', '#about', function(e){
    mainView.router.load({template: Template7.templates.aboutTemplate});
    myApp.closePanel();
})