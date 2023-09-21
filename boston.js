var promises = [
d3.json("./geojson/MA_Blockgroup.geojson"),
d3.json("./geojson/gtfs/allroutessmall.geojson"),
d3.json("./geojson/gtfs/parentstops.geojson"),
d3.json("https://massdot.mghpcc.org/mbta/lehdmap/api/?action=rac&geocode=25&groupby=blockgroup"),
d3.json("https://massdot.mghpcc.org/mbta/lehdmap/api/?action=wac&geocode=25&groupby=blockgroup"),
];

Promise.all(promises)
 .then(function([mablockgroup,routes,stops,rac,wac]){
  
     console.log(mablockgroup);
     //console.log(rac);
     //console.log(wac);
     //console.log(rapit);

     //filter blockgroup' attribute as working or residency area
     const rac_od = rac.rac.breakdown;
     const wac_od = wac.wac.breakdown;
     const rac_total = rac.rac.total;
     const wac_total = wac.wac.total;

     console.log(wac_total);
     console.log(wac_od);
     //console.log(rac_od);
     const value = 'c000';
     //console.log(value);
     const wac_odmap = d3.map(wac_od, function(d){return d.blockgroup});
     rac_od.forEach(function(d){
           const onAdd = wac_odmap.get(d.blockgroup)
           d.val = onAdd?onAdd[value]:null;
      });
    //console.log(rac_od);
   
     const newdata = rac_od;
     const blockgroup_od =[];
     newdata.forEach(function(d){
     //console.log(d);
         const datum = {};
         datum.inflow = d.val;
         datum.outflow = d.c000;
         datum.value = d.val - d.c000;
         datum.blockgroup = d.blockgroup;
         datum.town = d.town;
         datum.country = d.county;
         blockgroup_od.push(datum);
      })
     //console.log(blockgroup_od);

     //insert towns o-d attribute into the matowns geographic layer 
     blockgroup_odmap = d3.map(blockgroup_od, function(d){return d.blockgroup});
     console.log(blockgroup_odmap);
     mablockgroup.features.forEach(function(feature){
         const onAdd = blockgroup_odmap.get(feature.properties.Blockgroup)
         feature.properties.val=onAdd?onAdd.value:null;
         feature.properties.inflow=onAdd?onAdd.inflow:null;
         feature.properties.outflow=onAdd?onAdd.outflow:null;
     });
     console.log(mablockgroup);

  
    //Intial MA map with all towns' attribute*/
    var map = L.map('mapContainer',{zoomControl: true, preferCanvas: true})

    var mymap = new L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/dark_nolabels/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, &copy; <a href="https://carto.com/attribution">CARTO</a>',
        maxZoom:17, minZoom:8,
    }).addTo(map);

   
    map.setView([42.3318, -71.08],12);
  
    function onEachFeature_towns(d, layer) {
       layer.bindPopup('<h4>'+ d.properties.Blockgroup + '</h4>' 
          + '<strong>Town: </strong>' + d.properties.Town +'</br>'
          + '<strong>County: </strong>' + d.properties.County +'</br>'
          + '<strong>Inflow: </strong>' + d.properties.inflow +' Workers' +'</br>'
          + '<strong>Outflow: </strong>' + d.properties.outflow+' Residents'
        , {noHide:true, zoomAnimation:true});
       layer.on({
        mouseover: HighlightF,
        mouseout: ResetH,
        click: zoomToFeature,
    });
    }
    /*function fillColor_town(d) {
       return d > 5000 ? '#4d1732' :
           d > 2000 ? '#8b3058' :
           d > 900  ? '#cc607d' :
           d > 200  ? '#f4a3a8' : 
           d > 0  ? '#f9f7fa' :         
           d > -100  ? '#8c8c8c' : 
           d > -400  ? ' #6aa9af' : 
           d > -1000   ? '#4dc1cb' :
           d > -2000  ? '#1aecff' :          
                      '#f7f7f7';  
    }*/
    function fillColor_town(d) {
       return d > 5000 ? '#931f1f' :  //#b34019(orange), #931f1f(red), #861339(purple)
           d > 2000 ? '#842e2e' :
           d > 900  ? '#743e3e' :
           d > 200  ? '#625050' : 
           d > 0  ? '#595959' :         
           d > -100  ? '#555e5e' :     //#506262, #527a7a 
           d > -400  ? ' #318181' :   // #3a7878, #3d8f8f
           d > -1000   ? '#1f9393' : //#1f9393, #29a3a3
           d > -2000  ? '#00cccc' :          
                      '#f7f7f7';  
    }
  //blue #d1eeea,#a8dbd9,#85c4c9,#68abb8,#4f90a6,#3b738f,#2a5674
 //purple #f3e0f7,#e4c7f1,#d1afe8,#b998dd,#9f82ce,#826dba,#63589f
 //burg #ffc6c4,#f4a3a8,#e38191,#cc607d,#ad466c,#8b3058,#672044/#4d1732

  function zoomToFeature(e) {
    map.fitBounds(e.target.getBounds());
  }

  function HighlightF(e) {
    //var stops;
    var layer = e.target;

    layer.setStyle({
        weight: 2,
        color: '#d9d9d9', //#d9d9d9,#e3e3e3
        dashArray: '3',
        fillOpacity: 0.9,
    });

    /*if (!L.Browser.ie && !L.Browser.opera && !L.Browser.edge) {
        layer.bringToFront();
    }*/
  }
 
  function Bostonname(d){
      return  d == "Boston"  ? 1.5 :
                      0.1;
     }
    

  function ResetH(e) {
      matowns.resetStyle(e.target);
    }
  
  /*function ResetH(e) {
     //stops.stylestops(e.target);
       var layer = e.target;

        layer.setStyle({
          color:'#140a0f',
          weight: 0.5,
          dashArray: '0',
          
       });
     }*/  
    var matowns = L.geoJson(mablockgroup,{
        style:function style(d) {
           return{
           fillColor:fillColor_town(d.properties.val),
           color:'#140a0f',
           weight: Bostonname(d.properties.Town),
           fillOpacity: 0.6,
           }
        },
         onEachFeature:onEachFeature_towns,
     }).addTo(map);
   console.log(matowns);
  

   //towns attribute legend
    var legend = L.control({position : 'topleft'});
      legend.onAdd = function (map) {
        var div = L.DomUtil.create('div', 'info_legend'),
        grades =["5001", "2001", "401", "-99", "-399", "-1499"];
        labels =["5000+", "2000", "400", "-100", "-400", "-1500"];
    
        div.innerHTML = '<div><b>Working or Reseidency Area</b><p><c>The value = Inflow - Ouflow <p>Inflow: Commute there to work</p><p>Outflow: Travel there to home</p></c></p></div>';
           for(var i = 0; i < grades.length; i++){
               div.innerHTML += '<i style="background:' 
               + fillColor_town(grades[i]) + '">&nbsp;&nbsp;</i>&nbsp;&nbsp;' + '<labels>'
               + labels[i] + '</labels>'  + '<br/>';
            }
       return div;      
    };
    legend.addTo(map);
    
    $(".loader").hide();
    
    $(document).ready(function(){
      $('#bos-button a').css({'background-color':'#ff3d00'});
      $('#ma-button a').css({'background-color':'#333333'});
     });

   //Jquery sliding for O-D Panel
    $(document).ready(function(){
        $("#W_open").click(function(){
        $("#W_panel").slideDown("slow"); 
        $('.OD_Working').css({'color':'#BE4E4E'});
        $('.OD_Living').css({'color':'#807C7C'}); 
        });

        $("#W_close").click(function(){
        $("#W_panel").slideUp("slow");
        });
    });

   $(document).ready(function(){
        $("#L_open").click(function(){
        $("#L_panel").slideDown("slow");
        $('.OD_Working').css({'color':'#807C7C'});
        $('.OD_Living').css({'color':'#BE4E4E'}); 
        });

        $("#L_close").click(function(){
        $("#L_panel").slideUp("slow");
        });
    });

  /* search bar setting*/
   var searchControl = new L.Control.Search({
        position :'topright',
        layer: matowns,
        propertyName:'Blockgroup',
        marker: false,
        moveToLocation: function(latlng, title, map) {
        console.log(latlng, title, map);
        var zoom = map.getBoundsZoom(latlng.layer.getBounds());
        map.setView(latlng, zoom); // access the zoom
      },   
    });
  
  /*get the search input name to call the API data*/
    searchControl.on('search:locationfound', function(e){   
    //console.log('search:locationfound', );
    //map.removeLayer(this._markerSearch)
    // map.eachLayer(function(ee){
                  //map.removeLayer(ee)
                // });
        console.log(e.text);
        const townname = e.text
        $('#location-button').html(e.text);
        $('#table *').remove();
        $('#byVar').html(); 
        $.getJSON("https://massdot.mghpcc.org/mbta/lehdmap/api/?geocode=" + townname, function(json) { 
         //console.log(json)
        //console.log(json.errors);
               if (Object.keys(json).indexOf("errors") < 0){  
                   console.log(json);
                   const home_total = json.home_od.total
                   const home_od = json.home_od.breakdown
                   const work_total = json.work_od.total
                   const work_od = json.work_od.breakdown
                   const rac = json.rac.total
                   const wac = json.wac.total
                   //console.log(work_od);
                   //console.log(work_total);
                   //console.log(rac);
                   /*lookfor table by town name*/
                   const home_odmap = d3.map(home_od, function(d){return d.blockgroup}); 
                   const work_odmap = d3.map(work_od, function(d){return d.blockgroup});
             
                   //industry sectors data for barchart 
                   const rac_industry = [
                      {name:"Agriculture", value:rac.cns01},
                      {name:"Mining", value:rac.cns02 },
                      {name:"Utilities", value:rac.cns03 },
                      {name:"Construction", value:rac.cns04 },
                      {name:"Manufacturing", value:rac.cns05 },
                      {name:"Wholesale", value:rac.cns06 },
                      {name:"Retail", value:rac.cns07 },
                      {name:"Transportation", value:rac.cns08 },
                      {name:"Information", value:rac.cns09 },
                      {name:"Finance", value:rac.cns10 },
                      {name:"Real Estate", value:rac.cns11 },
                      {name:"Science & tech", value:rac.cns12 },
                      {name:"Management", value:rac.cns13 },
                      {name:"Admin & suppor", value:rac.cns14 },
                      {name:"Education", value:rac.cns15 },
                      {name:"Health care", value:rac.cns16 },
                      {name:"Arts", value:rac.cns17 },
                      {name:"Food & hospitality", value:rac.cns18 },
                      {name:"Others", value:rac.cns19 },
                      {name:"Public administration", value:rac.cns20 },
                    ]
                   const rac_industry_sort= rac_industry.slice().sort((a, b) => d3.descending(a.value, b.value));
                   //console.log(rac_industry_sort);

                  const wac_industry = [
                      {name:"Agriculture", value:wac.cns01},
                      {name:"Mining", value:wac.cns02 },
                      {name:"Utilities", value:wac.cns03 },
                      {name:"Construction", value:wac.cns04 },
                      {name:"Manufacturing", value:wac.cns05 },
                      {name:"Wholesale", value:wac.cns06 },
                      {name:"Retail", value:rac.cns07 },
                      {name:"Transportation", value:wac.cns08 },
                      {name:"Information", value:wac.cns09 },
                      {name:"Finance", value:wac.cns10 },
                      {name:"Real Estate", value:wac.cns11 },
                      {name:"Science & tech", value:wac.cns12 },
                      {name:"Management", value:wac.cns13 },
                      {name:"Admin & suppor", value:wac.cns14 },
                      {name:"Education", value:wac.cns15 },
                      {name:"Health care", value:wac.cns16 },
                      {name:"Arts", value:wac.cns17 },
                      {name:"Food & hospitality", value:wac.cns18 },
                      {name:"Others", value:wac.cns19 },
                      {name:"Public administration", value:wac.cns20 },
                   ]
                 const wac_industry_sort = wac_industry.slice().sort((a, b) => d3.descending(a.value, b.value));
                   //console.log(wac_industry);
               
                   // load the origin attribute
                     //caculate total jobs and percentage 
                      console.log(wac_total);
                      d3.select('#W_number').html(work_total.s000);
                      d3.select('#W_percent').html(d3.format('.3%')(work_total.s000/wac_total.c000));
                      d3.select('#L_number').html(home_total.s000);;
                      d3.select('#L_percent').html(d3.format('.3%')(home_total.s000/rac_total.c000));

                     //Send value to sumtable      
                      d3.select("#sum_button").on('click', function(d){
                          sumtable(wac) 
                      });
             
                      d3.select("#sum_button_rac").on('click', function(d){
                          sumtable(rac)  
                      });

                     //Industry bar chart
                     $('#W_barchart *').remove();
                     $('#L_barchart *').remove();
                     barchart(wac_industry_sort, rac_industry_sort); 
             
                    d3.select("#WO_button").on('click', function(d){
                        map.eachLayer(function(layer){
                        map.removeLayer(layer)
                        }); 
                
                         legend2.remove();
                         drawmap(work_odmap, townname)

                         $('#table *').remove();
                         $('.List_sub').html('— As Destions: Where people live');
                         table(work_od, work_total.s000);
   
                         $('#WO_button').css({'color':'#BE4E4E'});
                         $('#LO_button').css({'color':'#807C7C'});
               
                         //draw map by the selected variable 
                         $("#button_filter").click(function() {
                             var favorite = [];
                             $.each($("input[name]:checked"), function() {
                             favorite.push($(this).val());
                             });
                             const name = variablename(favorite[0]);
                            //console.log(name);
                            $('#byVar').html(name); 
                            $('.filter_sub').html('— Where People Live');
                            console.log(favorite);
                            drawmap(work_odmap, townname, favorite);
                            $('#table *').remove();
                            table(work_od, work_total.s000, favorite);
                          });
                    });
            
                  d3.select("#LO_button").on('click', function(dd){
                        map.eachLayer(function(dd){
                        map.removeLayer(dd)
                        }); 
                
                        legend2.remove();
                        drawmap(home_odmap, townname);
                

                        $('#table *').remove();
                        $('.List_sub').html('— As Destions: Where people work');
                        table(home_od, home_total.s000)
                             
                        $('#WO_button').css({'color':'#807C7C'});
                        $('#LO_button').css({'color':'#BE4E4E'});      
              
                        // draw map by the selected variable 
                       $("#button_filter").click(function() {
                             var favorite = [];
                             $.each($("input[name]:checked"), function() {
                             favorite.push($(this).val());
                             });

                             const name = variablename(favorite[0]);
                             $('#byVar').html(name); 
                             $('.filter_sub').html('— Where People Work');
                             console.log(favorite);
                        drawmap(home_odmap, townname, favorite);
                        $('#table *').remove();
                        table(home_od, home_total.s000, favorite);
                      }); 
             
                   });     
               
             } else {
                 console.log(json);
                 $('#location-button').html('<h2>Erros</h2>');
                 }
         }); //call API ends

          e.layer.setStyle({ color:'#F6C900', weight:3});
          if(e.layer._popup)
          e.layer.openPopup();
     }) //Searchcontrol on ends

    .on('search:collapsed', function(e) {    
         matowns.eachLayer(function(layer) { //restore feature color
         matowns.resetStyle(layer);
         }); 
    }); 

    map.addControl(searchControl);  //inizialize search control
   
     //set the zoomcontrol's position  --> back to MA Overview
      map.zoomControl.setPosition('bottomright')
      //reset map view
      var resetMap = L.Control.extend({
         options: {
           position: 'bottomright'
         },
         onAdd: function(map) {
           var container = L.DomUtil.create('div', 'leaflet-bar leaflet-control leaflet-control-custom');
           container.innerHTML = '<a title = "Back to Boston" role="button"><i class="fa fa-dot-circle-o" aria-hidden="true"></i></a>'
           container.onclick = function() {
           map.setView(new L.LatLng(42.3318, -71.08), 12);
           }
         return container;
       },
      });
     map.addControl(new resetMap());
    
    //GTFS layer
    function stylestops(d) {
       return {
          radius: 4.5,  //expressed in pixels
          fillColor:"#0d0c0c",
          color: "#cccaca",  //white outline#cccaca
          weight: 0.8,  //outline width
          opacity: 0.5,   //line opacity
          fillOpacity: 0.5,
          className:"markers"
       }
    };

 
   function routes_pop(d, layer) {
      layer.bindPopup('<div class="map-popup-content"><h2>' 
        + d.properties.route_desc 
        + '</h2><p><strong>Details: </strong> ' 
        + d.properties.route_long_name 
        + '</p></div>');
   }

   function highlightFeature(e) {
    //var stops;
    var layer = e.target;

    layer.setStyle({
        weight: 2,
        color: '#F6C900',
        fillOpacity: 0.8
    });

    if (!L.Browser.ie && !L.Browser.opera && !L.Browser.edge) {
        layer.bringToFront();
    }
  }


function resetHighlight(e) {
     //stops.stylestops(e.target);
    var layer = e.target;

    layer.setStyle({
         radius: 4.5,  //expressed in pixels
         fillColor:"#0d0c0c",
         color: "#cccaca",  //white outline#cccaca
         weight: 0.8,  //outline width
         opacity: 0.5,   //line opacity
         fillOpacity: 0.5,
    });
}

   var allstops = L.geoJSON(stops, {
       pointToLayer: function (d, latlng) {
      //console.log(d.properties);
         return L.circleMarker(latlng, stylestops(d)).bindPopup('<div class="map-popup-content"><h2>' 
         + d.properties.stop_id 
         + '</h2>'
         + d.properties.stop_name 
         + '</p></div>')
       .on({
         mouseover: highlightFeature,
         mouseout: resetHighlight,
        });
   
      },
     //onEachFeature: onEachFeature 
    });

    var commuterrail = L.geoJson(routes,{
        style:function style(d) {
           return{
             weight:2,
             opacity: 0.9,
             color: GTFSColor(d.properties.route_color),
            }
           },
        onEachFeature: routes_pop,
        filter:function(feature, layer){
        if (feature.properties.route_desc === "Commuter Rail") return true;
        else return false;
        }
    });

    var subway = L.geoJson(routes,{
        style:function style(d) {
           return{
             weight:2,
             opacity: 0.9,
             color: GTFSColor(d.properties.route_color),
            }
           },
        onEachFeature: routes_pop,
        filter:function(feature, layer){
        if (feature.properties.route_desc === "Rapid Transit") return true;
        else return false;
        }
    });

    var allrotues = L.geoJson(routes,{
        style:function style(d) {
           return{
             weight:2,
             opacity: 0.9,
             color: GTFSColor(d.properties.route_color),
            }
           },
        onEachFeature: routes_pop,
    });
    

  var baselayer = {
    "All Lines": allrotues,
    "Rapid Transit Lines": subway,
    "Commuter Rail Lines" : commuterrail,    
  }

  var overlayer = {
      //"Key Bus": keybus,
      //"Local Bus": localbus,
      "All Parent Stops": allstops,
  }

  
  var GTFSControl = L.control.layers(baselayer,overlayer);
  map.addControl(GTFSControl);

    //global variable 
    function GTFSColor(d) {
        return     d == "00843D"  ? '#00843d' :  //green
                   d == "DA291C" ?  '#DA291C' :    //red
                   d == "ED8B00"  ? '#ED8B00' :    //orange
                   d == "003DA5"  ? '#003DA5' :    //blue
                   d == "008EAA"  ? '#008EAA' :    //ferry
                   d == "Ferry"  ? '#008EAA':     //ferry
                   d == "80276C"  ? '#80276C':     //purple  
                   d == "Commuter Rail"  ? '#80276C':     //purple 
                   d == "7C878E"  ? '#7C878E':     //grey bus 
                   d == "FFC72C"  ? '#7C878E':     //yellow bus                 
                    "#FFFFFF";   //grey free shuttle        
      }

      function CapitlizeString(word) 
        {return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();}
   //filter variable
    function mapfilter (data){
          let filtername;
            if (data == undefined || data.length == 0){ 
               filtername = 's000';
               //console.log(filtername);
               return filtername;
           } else {
               filtername = data[0];
               console.log(filtername);
          return filtername;  
          }
   
      };

 function variablename(d){
  console.log(d);
  return d == "sa01" ? "Age: 29 or younger" :
         d == "sa02"  ? "Age: 30 to 54" :
         d == "sa03"  ? "Age: 55 or older" :
         d == "se01"  ? "Income: $1250/month or less" :
         d == "se02"  ? "Income: $1251/month to $3333/month" :
         d == "se03"  ? "Income: more than $3333/month" :
         d == "si01"  ? "Industry: Goods Producing" :
         d == "si02"  ? "Industry: Trade, Transportation, Utilities" :
         d == "si03"  ? "Industry: All Other Services" :
                      '';
 
   };

   /*function fillColor_town(d) {
       return d > 5000 ? '#931f1f' :  //#b34019(orange), #931f1f(red), #861339(purple)
           d > 2000 ? '#842e2e' :
           d > 900  ? '#743e3e' :
           d > 200  ? '#625050' : 
           d > 0  ? '#595959' :         
           d > -100  ? '#555e5e' :     //#506262, #527a7a 
           d > -400  ? ' #318181' :   // #3a7878, #3d8f8f
           d > -1000   ? '#1f9393' : //#1f9393, #29a3a3
           d > -2000  ? '#00cccc' :          
                      '#f7f7f7';  
    }*/

   function getColor(d) {
    return d > 500  ? '#8a0f38' :
           d > 200  ? ' #7e1b3c' :
           d > 150 ? '#77223e' :
           d > 90   ? '#6b2e42' :
           d > 40  ? '#603946' :
           d > 10  ? ' #54454a' :
           d > 0   ? '#4d4d4d' :
                      '#fffcf5';
    }

   var legend2 = L.control({position : 'topleft'});
   legend2.onAdd = function (map) {
   
    var div = L.DomUtil.create('div', 'info_legend'),
        grades =["1", "11", "41", "91", "151", "201", "501"]
      
       div.innerHTML = '<div><b>Nuber of Workers</b></br><c>The more darker color has higher value</c></div>';
       for(var i = 0; i < grades.length; i++){
            div.innerHTML += '<l style="background:' 
            + getColor(grades[i]) + '">&nbsp;&nbsp;</l>&nbsp;&nbsp;' + '<labels>'
            '</labels>';
       }
       return div;      
       };

  /* update O-D map  */ 
  function drawmap(data, townname, favorite){
   legend.remove();
   
   var mymap = new L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/dark_nolabels/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, &copy; <a href="https://carto.com/attribution">CARTO</a>',
    maxZoom:17, minZoom:8,
    }    ).addTo(map);

    map.setView([42.3318, -71.08],12); 
  
    console.log(matowns);
    //console.log(mablockgroup);
   // console.log(data);
    //console.log(favorite);
    const value = mapfilter(favorite);

    console.log(value);
    let val = value;
    console.log(val);
  
    const matowns_new = []
     matowns.eachLayer(function(layer){
          matowns_new.push(layer.feature)
        });
    
    matowns_new
      .forEach(function(d){
    const onAdd = data.get(d.properties.Blockgroup)
    d.properties.val =onAdd?onAdd[val]:null;
    });
    console.log(matowns_new);
 
    //console.log(townname);
    function color(d){
    return d == townname ? '#F6C900':
                              '#140a0f';
     }

    function lineweight(d){
       return d == townname ? '3':
                            '0.5';
    }

    function fillOpacity(d){
       return d == null ? '0':
                              '0.8';
    }


    function ResetH2(e) {
      test.resetStyle(e.target);
      //info.update();
    }


    function onEachFeature(d, layer) {
    layer.bindTooltip('<h4>'+ d.properties.Blockgroup + '</h4>' 
          + '<strong>Number of Workers: </strong>' +d.properties.val+'</br>'
          + '<strong>Town: </strong>' + d.properties.Town +'</br>'
          + '<strong>County: </strong>' + d.properties.County +'</br>'
        , {noHide:true, zoomAnimation:true});
    layer.on({
        mouseover: HighlightF,
        mouseout: ResetH2,
        //click: zoomToFeature,
    });
    }
  
    var test = L.geoJson(matowns_new,{
        style:function style(d) {
           return{
            fillColor:getColor(d.properties.val),
            color:color(d.properties.Blockgroup),
            //dashArray: '1',
            //weight:0.5,
            weight:lineweight(d.properties.Blockgroup),
            fillOpacity:fillOpacity(d.properties.val),
            //fillOpacity:0.5,       
           }
        },
        onEachFeature:onEachFeature,
   }).addTo(map);
   
   /*towns o-d attribute legend*/
  legend2.addTo(map);
} 


//Top 10 list
function table(data, total, favorite) {
   const value = mapfilter(favorite);
   //console.log(value);
   let val = value;
   console.log(val);
   console.log(total);

    console.log(data);
    let columns = ['Blockgroup', 'Town','Jobs', 'Percentage'];
   
    const data_sort= data.slice().sort((a, b) => d3.descending(a[val], b[val]));
    const datalimited = data_sort.filter(function(d,i){ return i< 10 })
    console.log(datalimited);
    const datatable=[];
    datalimited.forEach(function(d){
    var datum = {};
    datum.Blockgroup = d.blockgroup;
    datum.Town = d.town;
    datum.Jobs = d[val];
    datum.Percentage = d3.format('.2%')(d[val]/total)
    datatable.push(datum);
    });
    
    console.log(datatable);

    var table = d3.select('#table').append('table')
    var thead = table.append('thead')
    var tbody = table.append('tbody');

    // append the header row
    thead.append('tr')
      .selectAll('th')
      .data(columns).enter()
      .append('th')
        .text(function (column) { return column; });

    // create a row for each object in the data
    var rows = tbody.selectAll('tr')
      .data(datatable)
      .enter()
      .append('tr');
    //console.log(rows);
    // create a cell in each row for each column
    var cells = rows.selectAll('td')
      .data(function (row) {
        console.log(row);
        return columns.map(function (column) {
        return {column: column, value: row[column]};

        });
      })
      .enter()
      .append('td')
        .text(function (d) { 
          return d.value });

    return table; 
}

/* bar chart*/ 
function barchart(wac_industry_sort, rac_industry_sort){ 

 const wac_in = wac_industry_sort;
 const rac_in = rac_industry_sort;
 
 console.log(wac_in);
 //console.log(rac_in);
 
 var width = 250;
 var height = 200;
 var margin = {top: 5, right: 5, bottom: 5, left: 5};
 
 var x = d3.scaleBand().range([0, width]).padding(0.1);

 var y = d3.scaleLinear().range([height, 0]);

 var tooltip1 = d3.select('#W_barchart').append("div").attr("class", "toolTip");

 var svg1 = d3.select('#W_barchart').append("svg")
     .attr("width", width + margin.left + margin.right)
     .attr("height", height + margin.top + margin.bottom)
     .append("g")
     .attr("transform", 
          "translate(" + margin.left + "," + margin.top + ")");
    
  x.domain(wac_in.map(function(d) { return d.name; }));
  y.domain([0, d3.max(wac_in, function(d) { return d.value; })]);

  svg1.selectAll(".bar")
      .data(wac_in)
      .enter().append("rect")
      .attr('class', 'bar')
      .style("opacity", 0.3)
      .attr("x", function(d) { return x(d.name); })
      .attr("width", x.bandwidth())
      .attr("y", function(d) { return y(d.value); })
      .attr("height", function(d) { return height - y(d.value); })
      .on('mouseover', (d) => {
        tooltip1.transition().duration(200).style('opacity', 0.9)
        tooltip1.html(`${d.name}` + ` : <span>${d.value}</span> Workers`)
          .style('left', `${d3.event.layerX}px`)
          .style('top', `${(d3.event.layerY + 15)}px`);
      })
      .on('mouseout', () => tooltip1.transition().duration(500).style('opacity', 0));
    
  var tooltip2 = d3.select("#L_barchart").append("div").attr("class", "toolTip2");
  var svg2 = d3.select("#L_barchart").append("svg")
     .attr("width", width + margin.left + margin.right)
     .attr("height", height + margin.top + margin.bottom)
     .append("g")
     .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

  x.domain(rac_in.map(function(d) { return d.name; }));
  y.domain([0, d3.max(rac_in, function(d) { return d.value; })]);
  
  svg2.selectAll(".bar")
      .data(rac_in)
      .enter().append("rect")
      .attr('class', 'bar')
      .style("opacity", 0.3)
      .attr("x", function(d) { return x(d.name); })
      .attr("width", x.bandwidth())
      .attr("y", function(d) { return y(d.value); })
      .attr("height", function(d) { return height - y(d.value); })
      .on('mouseover', (d) => {
        tooltip2.transition().duration(200).style('opacity', 0.9)
        tooltip2.html(`${d.name}` + ` : <span>${d.value}</span> Workers`)
          .style('left', `${d3.event.layerX}px`)
          .style('top', `${(d3.event.layerY + 15)}px`);
      })
      .on('mouseout', () => tooltip2.transition().duration(500).style('opacity', 0));

}


function sumtable (data){
  console.log(data);
  d3.select('#cr01').html(data.cr01);
  d3.select('#cr02').html(data.cr02);
  d3.select('#cr03').html(data.cr03);
  d3.select('#cr04').html(data.cr04);
  d3.select('#cr05').html(data.cr05);
  d3.select('#cr07').html(data.cr07);
  d3.select('#ct01').html(data.ct01);
  d3.select('#ct02').html(data.ct02);
  d3.select('#cd01').html(data.cd01);
  d3.select('#cd02').html(data.cd02);
  d3.select('#cd03').html(data.cd03);
  d3.select('#cd04').html(data.cd04);
  d3.select('#cs01').html(data.cs01);
  d3.select('#cs02').html(data.cs02);
}



}); //Promise ends