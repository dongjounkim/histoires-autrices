function docReady(fn) {
    // see if DOM is already available
    if (document.readyState === "complete" || document.readyState === "interactive") {
        // call on next available tick
        setTimeout(fn, 1);
    } else {
        document.addEventListener("DOMContentLoaded", fn);
    }
}

docReady(function () {
    document.getElementById('siteBtn').disabled = true;
    var width = $(window).width();
    if (width > 768) {
        $("#hero__img").animate({
            right: -200,
            opacity: 0.3
        }, 1000);
    } else {
        $("#hero__img").animate({
            opacity: 0.3
        }, 1000);
    }

    $("#menuButton").click(function () {
        console.log("Clicked on menu button");
        $("#navList").toggle();
        // transform", "translate3d(-100px,0, 0)"
    });
});

function showSite() {
    var x = document.getElementById("site");
    var y = document.getElementById("visiautrices");
    document.getElementById('visiautricesBtn').disabled = false;

    if (x.style.display === "none") {
        x.style.display = "block";
        y.style.display = "none";
        document.getElementById('siteBtn').disabled = true;
    } else {
        x.style.display = "none";
    }
}

function showVisiautrices() {
    var x = document.getElementById("visiautrices");
    var y = document.getElementById("site");
    document.getElementById('siteBtn').disabled = false;

    if (x.style.display === "none") {
        x.style.display = "block";
        y.style.display = "none";
        document.getElementById('visiautricesBtn').disabled = true;
    } else {
        x.style.display = "none";
    }
}

var data1;
//from Google Sheets
// Papa.parse('https://docs.google.com/spreadsheets/d/e/2PACX-1vRBsW23Q4I427Tl_y7gcFIncVKMh5Xgk-QyTwXi8S7HO01atE23pXicffryr1dXSxkrQaxeTZsvyL2K/pub?gid=555683372&single=true&output=csv', {
//local
Papa.parse('assets/data/data1.csv', {
    download: true,
    header: true,
    complete: function (results) {
        data1 = results.data;
        console.log(data1);
        loadData(places, data1);
    }
});

var places;
Papa.parse('assets/data/places.csv', {
    download: true,
    header: true,
    complete: function (results) {
        places = results.data;
        console.log(places);
        loadData(places, data1);
    }
});

function loadData(places, data1) {

    // Use PapaParse to convert string to array of objects
    // var data1 = Papa.parse(csvString, {
    //     header: true,
    //     encoding: "fr",
    //     transform: function (h) {
    //         return h.replace(',', '.')
    //     },
    //     dynamicTyping: true
    // }).data;

    function getUniqueListBy(arr, key) {
        return [...new Map(arr.map(item => [item[key], item])).values()]
    }

    let datasetLinks = {
        'name': [],
        'id': []
    };

    //find all datasets
    for (let i = 0; i < data1.length; i++) {
        datasetLinks['name'].push(data1[i]['Jeu de données']);
        datasetLinks['id'].push(data1[i]['dataset_id_FK']);
    }

    //Detect duplicates and null values and push the remainder into a new array
    let newdatasetLinks = {
        'name': [],
        'id': []
    };

    for (let i = 0; i < datasetLinks['name'].length; i++) {
        if (newdatasetLinks['name'].indexOf(datasetLinks['name'][i]) === -1 && datasetLinks['name'][i] != null) {
            newdatasetLinks['name'].push(datasetLinks['name'][i]);
            newdatasetLinks['id'].push(datasetLinks['id'][i]);
        }
    }

    //render dataset links
    let flexLinks = document.getElementById('flexLinks');
    for (let i = 0; i < newdatasetLinks['name'].length; i++) {
        flexLinks.innerHTML += `<li class="une__flex__item"><a href="dataset/?id=${newdatasetLinks['id'][i]}">${newdatasetLinks['name'][i]}</a></li>`;
    }



    //leaflet.js
    var map = L.map('mapid', {
        preferCanvas: true

    }).setView([46.2276, 2.2137], 3);

    map._layersMaxZoom = 19;

    //get all female authors
    let femaleAuthors = [];
    for (let i = 0; i < data1.length; i++) {
        if (data1[i]["Genre"] === 'F') {
            femaleAuthors.push(data1[i]);
        }
    }

    //remove duplicates
    const trimmedAuthors = getUniqueListBy(femaleAuthors, 'author_id_FK')

    console.log(trimmedAuthors);

    //get authors birthplaces======================================================================================
    var markers = L.markerClusterGroup();

    let authorsPlaces = {};
    for (let i = 0; i < trimmedAuthors.length; i++) {
        if (!(trimmedAuthors[i]['birth_coordinates'] in authorsPlaces)) {
            authorsPlaces[trimmedAuthors[i]['birth_coordinates']] = {
                placename: trimmedAuthors[i]['birth_location'],
                authors: {
                    authorname: [],
                    id: []
                }
            };
        }
        authorsPlaces[trimmedAuthors[i]['birth_coordinates']]['authors']['authorname'].push(trimmedAuthors[i]['Auteur ou autrice']);
        authorsPlaces[trimmedAuthors[i]['birth_coordinates']]['authors']['id'].push(trimmedAuthors[i]['author_id_FK']);

    }

    for (let q = 0; q < Object.keys(authorsPlaces).length; q++) {
        // Splits links of authors
        let authorsLinks = '';
        for ( let i = 0; i<authorsPlaces[Object.keys(authorsPlaces)[q]]['authors']['id'].length; i++) {
            authorsLinks += `<a href="/authors/?key=${authorsPlaces[Object.keys(authorsPlaces)[q]]['authors']['id'][i]}">${authorsPlaces[Object.keys(authorsPlaces)[q]]['authors']['authorname'][i]}</a> `;
        }

        console.log(authorsPlaces[Object.keys(authorsPlaces)[q]]['authors']['id'])
        console.log(authorsPlaces[Object.keys(authorsPlaces)[q]]['authors']['authorname'])
        let birthLocat = Object.keys(authorsPlaces)[q].split(" ")

        if (birthLocat[0] !== undefined && birthLocat[1] !== undefined) {
            markers.addLayer(L.circleMarker([birthLocat[1], birthLocat[0]]).setStyle({
                fillColor: 'green'
            }).bindPopup(`<p>${authorsLinks}</p>Née à <b>${authorsPlaces[Object.keys(authorsPlaces)[q]]['placename']}</b>`));
            map.addLayer(markers);
        }
        console.log(authorsLinks)
    }

    // for (let i = 0; i < authorsPlaces[Object.keys(authorsPlaces)]['authors']['id'].length; i++) {
        
    //     console.log(authorsPlaces[Object.keys(authorsPlaces)[i]]['authors']['id']);
    // }

    //show authors birth location
    // for (let i = 0; i < trimmedAuthors.length; i++) {
    //     let birthLocat = trimmedAuthors[i]["birth_coordinates"].split(" ");
    //     let deathLocat = trimmedAuthors[i]["death_coordinates"].split(" ");
    //     // if (birthLocat[0] !== undefined && birthLocat[1] !== undefined) {
    //     //     markers.addLayer(L.circleMarker([birthLocat[1], birthLocat[0]]).setStyle({
    //     //         fillColor: 'green'
    //     //     }).bindPopup(`<p><a href="../authors/?key=${trimmedAuthors[i]["author_id_FK"]}">${trimmedAuthors[i]["Auteur ou autrice"]}</a></p>Née à <b>${trimmedAuthors[i]["birth_location"]}</b>`));
    //     //     map.addLayer(markers);
    //     // }

    //     if (deathLocat[0] !== undefined && deathLocat[1] !== undefined) {
    //         markers.addLayer(L.circleMarker([deathLocat[1], deathLocat[0]]).setStyle({
    //             fillColor: 'red'
    //         }).bindPopup(`<p><a href="../authors/?key=${trimmedAuthors[i]["author_id_FK"]}">${trimmedAuthors[i]["Auteur ou autrice"]}</a></p>Décédée à <b>${trimmedAuthors[i]["death_location"]}</b>`));
    //         map.addLayer(markers);
    //     }

    // }


    // var marker = L.marker([51.5, -0.09]).bindPopup("<b>Hello world!</b><br>I am a popup.")
    // marker.addTo(map);

    // add OpenStreetMap tiles
    L.tileLayer('https://{s}.tile.openstreetmap.fr/osmfr/{z}/{x}/{y}.png', {
        maxZoom: 20,
        attribution: '&copy; OpenStreetMap France | &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map);

    // add map scale on lower left corner
    L.control.scale().addTo(map);

}