$(document).ready(function(){
  var country_api_url = "https://corona.lmao.ninja/countries?sort=cases";
  var global_stats_api_url = "https://corona.lmao.ninja/all";
  var corona_global_data = {};
  var total_countries = 0;
  var total_deaths = 0;
  var total_cases = 0;
  var total_recovered = 0;
  var today_cases = 0;
  var highest_death = 0;
  var highest_death_country = "";
  var countries = [];

  function sizeMap() {
    $page_width = $('#content').width();
    var containerWidth = $page_width-($page_width/10.0),
    containerHeight = (containerWidth / 3);
    $('.world_map').css({
      'width': containerWidth,
      'height': containerHeight
    });
  }

  function get_country_flag(country_code){
    return "https://www.countryflags.io/"+country_code+"/shiny/64.png";
  }

  function get_custom_label(code){
    var country_code = code.toUpperCase();
    var message = "";
    if(corona_global_data.hasOwnProperty(country_code)){
      message = "<h6 class='center'>"+corona_global_data[country_code].country + "</h6>"+"<b>Total Deaths</b>: " +corona_global_data[country_code].deaths+"<br><b>Total Cases</b>: " +corona_global_data[country_code].cases+"<br><b>Recovered</b>: " +corona_global_data[country_code].recovered+"<br><b>Active</b>: " +corona_global_data[country_code].active;
    }
    else{
      message = code + ' data is not available.';
    }
    return message;
  }

  function get_calculated_colors(criteria){
    var max = 0,
    min = Number.MAX_VALUE,
    cc,
    startColor = [200, 238, 255],
    endColor = [0, 100, 145],
    colors = {},
    hex;

    //find maximum and minimum values
    for (cc in corona_global_data)
    {
      criteria_value = parseFloat(corona_global_data[cc][criteria]);
      if (criteria_value > max)
      {
        max = criteria_value;
      }
      if (criteria_value < min)
      {
        min = criteria_value;
      }
    }

    //set colors according to values of GDP
    for (cc in corona_global_data)
    {
      criteria_value = corona_global_data[cc][criteria];
      cc_lower = cc.toLowerCase();
      if (criteria_value > 0)
      {
        colors[cc_lower] = '#';
        for (var i = 0; i<3; i++)
        {
          hex = Math.round(startColor[i] + (endColor[i] - startColor[i]) * (criteria_value / (max - min))).toString(16);
          if (hex.length == 1)
          {
            hex = '0'+hex;
          }

          colors[cc_lower] += (hex.length == 1 ? '0' : '') + hex;
        }
      }
    }
    return colors;
  }

  function set_map_data(html_id_selector, colors){
    $(html_id_selector).vectorMap({
      map: 'world_en',
      backgroundColor: '#a5bfdd',
      borderColor: '#818181',
      borderOpacity: 0.25,
      borderWidth: 1,
      enableZoom: true,
      colors: colors,
      hoverOpacity: 0.7,
      hoverColor: false,
      normalizeFunction: 'linear',
      scaleColors: ['#b6d6ff', '#005ace'],
      selectedColor: null,
      selectedRegions: null,
      showTooltip: true,
      onLabelShow: function(event, label, code)
      {
        var country_summary = get_custom_label(code);
        label.html(country_summary);
      },
    });
  }

  $.getJSON(global_stats_api_url).done(function(data){
    total_countries=data.affectedCountries;
    total_cases=data.cases;
    total_deaths=data.deaths;
    total_recovered=data.recovered;
    updated_at=new Date(data.updated);
    $("#total_countries").html(total_countries.toLocaleString());
    $("#total_cases").html(total_cases.toLocaleString());
    $("#total_deaths").html(total_deaths.toLocaleString());
    $("#total_recovered").html(total_recovered.toLocaleString());
    $(".updated_at").html(updated_at.toLocaleString());
    total_deaths_percent = (total_deaths/total_cases)*100.0;
    total_recovered_percent = (total_recovered/total_cases)*100.0;
    $("#total_deaths_percent").html(total_deaths_percent.toLocaleString());
    $("#total_recovered_percent").html(total_recovered_percent.toLocaleString());
  });

  $.getJSON(country_api_url).done(function(data){
    $.each(data, function(i, item){
      if(item.country == "World"){
        return true;
      }
      corona_global_data[item.countryInfo.iso2] = {
        "deaths":item.deaths,
        "country": item.country,
        "cases":item.cases,
        "recovered":item.recovered,
        "active":item.active
      }
      today_cases += item.todayCases;

      var country_row = "<tr>";
      country_row += "<td>";
      var country_flag = "";
      if(typeof(item.countryInfo.iso2)=="string"){
        countries.push([item.countryInfo.iso2, item.country]);
        if(item.deaths>highest_death){
          highest_death=item.deaths;
          highest_death_country=item.country;
        }
        country_flag = get_country_flag(item.countryInfo.iso2.toLowerCase());
      }
      country_row += "<img class='flag' src='"+country_flag+"' alt='"+item.country+"'/>";
      country_row += "</td>";

      country_row += "<td>";
      country_row += item.country;
      country_row += "</td>";

      country_row += "<td>";
      country_row += item.cases.toLocaleString();
      country_row += "</td>";

      country_row += "<td>";
      country_row += item.todayCases.toLocaleString();
      country_row += "</td>";

      country_row += "<td>";
      country_row += item.deaths.toLocaleString();
      country_row += "</td>";

      country_row += "<td>";
      country_row += item.todayDeaths.toLocaleString();
      country_row += "</td>";

      country_row += "<td>";
      country_row += item.recovered.toLocaleString();
      country_row += "</td>";

      country_row += "<td>";
      country_row += item.active.toLocaleString();
      country_row += "</td>";

      country_row += "<td>";
      country_row += item.critical.toLocaleString();
      country_row += "</td>";

      country_row += "<td>";
      country_row += item.casesPerOneMillion;
      country_row += "</td>";

      country_row += "<td>";
      country_row += item.deathsPerOneMillion;
      country_row += "</td>";

      country_row += "</tr>";
      $("#corona_country_rows").append(country_row);
    });

    var corona_country_table = $('#corona_country_table').DataTable({"columnDefs": [ {
      "targets"  : 'no-sort',
      "orderable": false,
    }]});

    $('#topbar_search').on( 'keydown', function () {
      corona_country_table.search( this.value ).draw();
    });

    var colors_deaths = get_calculated_colors("deaths");
    var colors_cases = get_calculated_colors("cases");
    var colors_active = get_calculated_colors("active");
    var colors_recovered = get_calculated_colors("recovered");

    set_map_data("#corona_world_map_deaths", colors_deaths);
    set_map_data("#corona_world_map_cases", colors_cases);
    set_map_data("#corona_world_map_active", colors_active);
    set_map_data("#corona_world_map_recovered", colors_recovered);


    highest_death_country_summary = highest_death_country+" ("+highest_death.toLocaleString()+")";
    $("#highest_death_country_summary").html(highest_death_country_summary);
    $("#today_cases").html(today_cases.toLocaleString());

    countries.sort(function(a,b){
      return a[1] - b[1];
    });

    for(var i=0;i<countries.length;i++){
      country_short_code = countries[i][0];
      country_name = countries[i][1];
      $("#country_search").append("<option value='"+country_short_code+"'>"+country_name+"</option>");
    }
  });

  $('#country_search').on('change', function () {
      var searched_country_code = $(this).val();
      alert("You have searched for "+searched_country_code);
  });

  sizeMap();
  $(window).on("resize", sizeMap);
});
