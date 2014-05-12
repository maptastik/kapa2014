// Global variables for ease of use, would most likely
// package any larger classes into classes
var map = null;
var parcels_layer = null;
var parcels_geo_json = null;
var parcels_data = null;
var color_array = [
"#ffffb2",
"#fed976",
"#993404",
"#b30000",
"#fe9929",
"#e34a33",
"#f768a1",
"#045a8d",
"#a6bddb",
"#810f7c",
"#31a354",
"#f7f7f7",
"#636363",
"#ffffe5"
];

// Loads data, initializes map, draws everything.
function start(){
  $.getJSON("data/downtownParcels_geom.json",function(gt_parcels){
    $.getJSON("data/downtownParcels_attr.json",function(data){
      parcels_geo_json= gt_parcels;
      parcels_data = data.results;
      initialize_map();
      draw_parcels();
    })
  });
}
start();
/* Create map, center it */
function initialize_map(){
  map = new L.Map("map", {})
    // Lebanon, KS, Zoom level 4.
    .setView(new L.LatLng(38.212, -84.556), 15)
    .addLayer(new L.TileLayer('http://{s}.tile.osm.org/{z}/{x}/{y}.png',{
      attribution: '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
    }));
  initialize_info_box();
  initialize_legend();
  intialize_reset_button();
  initialize_table();
}
// Initializes the info box, which uses a handlebars template
function initialize_info_box(){
  info = L.control();
  // Prepare Template
  var info_source   = $("#info_template").html();
  var info_template = Handlebars.compile(info_source);
  info.onAdd = function (map) {
    this._div = L.DomUtil.create('div', 'info'); // create a div with a class "info"
    this.update({});
    return this._div;
  };
  info.update = function (context) {
    this._div.innerHTML = info_template(context);
  };
  info.addTo(map);
}
/*
 * Create a color Legend.
 * Rewritten to remove d3 for ie8 capability
 */
function initialize_legend(){
  legend = L.control({position: 'bottomright'});
  legend.onAdd = function(map){
    function legend_text(i){
      if (i==0) { return "11-1 Single Family"}
      else if (i==1){return "11-2 Multi-Family"}
      else if (i==2){return "11-3 Apartments"}
      else if (i==3){return "12-1 Commercial retail"}
      else if (i==4){return "12-2 Commercial wholesale"}
      else if (i==5){return "12-3 Services"}
      else if (i==6){return "12-5 Government"}
      else if (i==7){return "12-6 Institutional"}  
      else if (i==8){return "12-7 Educational"}  
      else if (i==9){return "16-1 Mixed use"}  
      else if (i==10){return "21-1 Agricultural"}  
      else if (i==11){return "99-1 Vacant"}  
      else if (i==12){return "99-4 Parking"}      
      else {return "No Value"};
    }
    var div = L.DomUtil.create('div', 'legend');
    div.innerHTML="Existing Land Use<br/>";
    for(var i=0; i < 13; i++){
      div.innerHTML += '<i style="background:' + color_array[i] + '"></i> '+ legend_text(i)+'<br>';
    }
    return div;
  }
  map.addControl(legend);
}

/* Initialize reset button */
function intialize_reset_button(){
  reset_button = L.control({position: 'bottomleft'});
  reset_button.onAdd = function(map){
    var div = L.DomUtil.create('div', 'reset');
    div.innerHTML='<a class="reset_button" href="#" title="Reset Map">Reset</a>';
    return div;
  }
  map.addControl(reset_button);
  $('.reset, .reset_button').click(function(){
    map.fitBounds(parcels_layer.getBounds());
  });
}
/* Initializes a table, uses handlebars to fill in data */
function initialize_table(){
  table = $('#table_container');
  var table_source = $("#table_template").html();
  var table_template = Handlebars.compile(table_source);
  table.html(table_template(parcels_data));
}

// Draw all the states on the map
function draw_parcels(){
  parcels_layer = L.geoJson(parcels_geo_json,{
    style: parcels_styles,
    // onEachFeature: parcels_features,
    updateWhenIdle: true
  });
  parcels_layer.addTo(map);
}

// // Styles each state, populates color based on data
function parcels_styles(feature){
  return{
    stroke: true,
    fillColor: "#ffffe5", //parcels_color(feature),
    fillOpacity: 0.7,
    weight: 1.5,
    opacity: 1,
    color: 'black',
    zIndex: 15
  };
}
// // Gets the color based on percentage
// function parcels_color(feature){
//   var parcels = get_single_parcels_data(feature.properties.GIS_MapID);
//   return color_picker(parcels['LandUse']);
// }
// // Returns a single states data by filtering for abbreviation
// function get_single_parcels_data(parcels_name){
//   var local_parcels = parcels_data.filter(function(item){return item.GIS_MapID == GIS_MapID});
//   return local_parcels[0];
// }
// /*
//  * Color Picker picks a color from a data array,
//  * could use a library if so desired
//  */
// function color_picker(percentage){
//   var bucket = Math.floor(percentage * 10);
//   if(color_array[bucket]!= null){
//     return color_array[bucket];
//   }else{
//     return "rgb(0,0,0)";
//   }
// }

// // set up state features (such as on click events and others)
// function parcels_features(feature, layer){
//   // this sets all the data needed for the hover info window. will refactor later
//   function parcels_info_window(parcels){
//     var this_parcels_data = get_single_parcels_data(feature.properties.GIS_MapID);
//     info.update(this_parcels_data);
//   }
//   // change the state styles so its highlighted with a gray border for now
//   function highlightParcels(e) {
//     var layer = e.target;
//     layer.setStyle({
//       weight: 5, color: '#666', dashArray: '', fillOpacity: 0.7
//     });
//   }
//   // disable highlight by using reset style
//   function resetHighlightParcels(e) {
//     parcels_layer.resetStyle(e.target);
//   }
//   // add click, mouseover, and mouseout interactions to state
//   layer.on({
//     click: function(){
//       map.fitBounds(layer.getBounds());
//       // Here we could something interesting, like grab county data
//       // change styles, whatever we'd be interested in
//     },
//     // set data for info window, highlight
//     mouseover: function(e){
//       parcels_info_window(feature.properties.GIS_MapID)
//       highlightParcels(e);
//     },
//     // remove info window, reset highlight
//     mouseout: function(e){
//       info.update();
//       resetHighlightParcels(e);
//     }
//   })
// }

