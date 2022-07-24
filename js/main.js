/******************************************************************************
***
* WEB422 – Assignment 2
* I declare that this assignment is my own work in accordance with Seneca Academic Policy.
* No part of this assignment has been copied manually or electronically from any other source
* (including web sites) or distributed to other students.
*
* Name: Girtaj Singh
* Student ID: 142688209
* Date: 07/23/2022
*
******************************************************************************
**/ 
let data = [];
$(document).ready(function(){
    const api = "https://mysterious-sierra-55998.herokuapp.com";
    let curTrip = {};
    let page = 1;
    let perPage = 10;
    let chart = null;
    $("#curr-page a").text(page);

    const tableRows = _.template(`
        <% _.forEach(trips, function(trip) { %>
            <tr data-id="<%- trip['_id'] %>" class="Subscriber">
                <td><%- trip['bikeid'] %></td>
                <td><%- trip['start station name'] %></td>
                <td><%- trip['end station name'] %></td>
                <td><%- (trip['tripduration']/60).toFixed(2) %></td>
            </tr>
        <% }) %>
    `);

    let loadTripData = () => {
        fetch(`${api}/api/trips?page=${page}&perPage=${perPage}`)
        .then(data => data.json())
        .then((json)=>{
            console.log("Loading data for page: "+page);
            data = json;
            $("#trips-table tbody").html(tableRows({trips: data}));
        })
        .catch((err)=>{
            console.log("Failed to load data for page: "+page);
        })
    };

    $("#trips-table tbody").on("click", "tr", (e)=>{
        curTrip = _.find(data, function(o) { return o._id == e.currentTarget.dataset.id });
        $("#trip-modal h4").text(curTrip.bikeid);
        $("#map-details").html(`
            <p><b>Start Location: </b>${curTrip["start station name"]}</p>
            <p><b>End Location: </b>${curTrip["end station name"]}</p>
            <p><b>Duration: </b>${(curTrip["tripduration"]/60).toFixed(2)} Minutes</p>
        `);
        
        $('#trip-modal').modal('show');
    });

    $("#prev-page a").click(()=>{
        if(page>1) page-=1;
        loadTripData();
        $("#curr-page a").text(page);
    });

    $("#next-page a").click(()=>{
        page+=1;
        loadTripData();
        $("#curr-page a").text(page);
    });

    $('#trip-modal').on('shown.bs.modal', function (e) {
        chart = new L.Map('leaflet', {
            layers: [
                new L.TileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png')
            ]
        }).setView([51.505, -0.09], 13);


        console.log([curTrip["start station location"]["coordinates"][1], curTrip["start station location"]["coordinates"][0]]);
        console.log([curTrip["end station location"]["coordinates"][1], curTrip["end station location"]["coordinates"][0]]);

        let start = L.marker([curTrip["start station location"]["coordinates"][1], curTrip["start station location"]["coordinates"][0]])
        .bindTooltip(curTrip["start station name"],
        {
            permanent: true,
            direction: 'right'
        }).addTo(chart);

        let end = L.marker([curTrip["end station location"]["coordinates"][1], curTrip["end station location"]["coordinates"][0]])
        .bindTooltip(curTrip["end station name"],
        {
            permanent: true,
            direction: 'right'
        }).addTo(chart);

        var group = new L.featureGroup([start, end]);
        chart.fitBounds(group.getBounds(), { padding: [50, 50] });
    });

    $('#trip-modal').on('hidden.bs.modal', function (e) {
        chart.remove();
    });

    loadTripData();
});