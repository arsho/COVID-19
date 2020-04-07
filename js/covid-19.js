$(document).ready(function(){
  var countries_api_url = "https://corona.lmao.ninja/countries?sort=cases";
  var global_summary_api_url = "https://corona.lmao.ninja/all";
  var country_summary_api_base_url = "https://corona.lmao.ninja/countries/";
  var country_historical_api_base_url = "https://corona.lmao.ninja/v2/historical/";

  var corona_global_data = {};
  var total_countries = 0;
  var total_deaths = 0;
  var total_cases = 0;
  var total_recovered = 0;
  var today_cases = 0;
  var today_deaths = 0;
  var total_active = null;
  var total_critical = null;
  var total_tests = null;
  var total_cases_per_million = null;
  var total_deaths_per_million = null;
  var total_tests_per_million = null;
  var highest_death = 0;
  var highest_death_country = "";
  var countries = [];
  var confirmed_case_color = "#17a2b8";
  var death_case_color = "#dc3545";
  var recovered_case_color = "#28a745";
  var active_case_color = "#ffc107";


  /**
  * Creates a date object from a specific formatted string
  * @param {STRING} date_string: e.g. "1/22/20" where parts are month, date, year
  * @return {STRING} date_string: e.g. "22/01/2020" where parts are DD/MM/YYYY
  */
  function get_formatted_date(date_string){
    var parts = date_string.split('/');
    // Please pay attention to the month (parts[0]); JavaScript counts months from 0:
    // January - 0, February - 1, etc.
    var date_object = new Date("20"+parts[2], parts[0] - 1, parts[1]);
    var dd = date_object.getDate();
    var mm = date_object.getMonth()+1;
    var yyyy = date_object.getFullYear();
    if(dd<10)
    {
      dd='0'+dd;
    }
    if(mm<10)
    {
      mm='0'+mm;
    }
    return dd+'/'+mm+'/'+yyyy;
  }

  function sizeMap() {
    $page_width = $('#content').width();
    var containerWidth = $page_width-($page_width/10.0),
    containerHeight = (containerWidth / 3);
    $('.world_map').css({
      'width': containerWidth,
      'height': containerHeight,
      'margin': "0 auto"
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

  function set_country_chart_data(country, html_id, labels, confirmed_cases, death_cases, recovered_cases){
    var data = {
      labels: labels,
      datasets: [{
        label: 'Confirmed Cases',
        backgroundColor: "#17a2b8",
        borderColor: "#17a2b8",
        data: confirmed_cases,
        fill: false,
        pointRadius: 5,
        pointHoverRadius: 10,
      }, {
        label: 'Death Cases',
        fill: false,
        backgroundColor: "#dc3545",
        borderColor: "#dc3545",
        data: death_cases,
        pointRadius: 5,
        pointHoverRadius: 10,
      }, {
        label: 'Recovered Cases',
        fill: false,
        backgroundColor: "#28a745",
        borderColor: "#28a745",
        data: recovered_cases,
        pointRadius: 5,
        pointHoverRadius: 10,
      }]
    }
    var config = {
      type: 'line',
      data: data,
      options: {
        responsive: true,
        maintainAspectRatio: true,
        aspectRatio: 3,
        title: {
          display: true,
          text: 'COVID-19 Scenario in '+country
        },
        tooltips: {
          mode: 'index',
          intersect: false,
        },
        hover: {
          mode: 'average',
          intersect: false
        },
        scales: {
          xAxes: [{
            display: true,
            scaleLabel: {
              display: true,
              labelString: 'Date'
            }
          }],
          yAxes: [{
            display: true,
            scaleLabel: {
              display: true,
              labelString: 'Number of Cases'
            }
          }]
        }
      }
    };

    var ctx = document.getElementById(html_id).getContext('2d');
    if(window.country_chart_canvas != undefined){
      window.country_chart_canvas.destroy();
    }
    window.country_chart_canvas = new Chart(ctx, config);
  }

  function set_single_dataset_bar_chart(html_id, title, dataset_label, bar_color, x_axes_label, y_axes_label, labels, dataset){
    var data = {
      labels: labels,
      datasets: [{
        label: dataset_label,
        backgroundColor: bar_color,
        borderColor: bar_color,
        data: dataset,
        fillOpacity: .3,
        borderWidth: 2
      }]
    }
    var config = {
      type: 'bar',
      data: data,
      options: {
        responsive: true,
        title: {
          display: true,
          text: title
        },
        tooltips: {
          mode: 'index',
          intersect: false,
        },
        hover: {
          mode: 'average',
          intersect: false
        },
        scales: {
          xAxes: [{
            display: true,
            scaleLabel: {
              display: true,
              labelString: x_axes_label
            }
          }],
          yAxes: [{
            display: true,
            scaleLabel: {
              display: true,
              labelString: y_axes_label
            }
          }]
        }
      }
    };

    var ctx = document.getElementById(html_id).getContext('2d');
    new Chart(ctx, config);
  }

  function load_searched_country_data(country_code){
    var country_summary_api_url = country_summary_api_base_url+country_code;
    var country_historical_api_url = country_historical_api_base_url+country_code+"?lastdays=1000";
    var chart_labels = [];
    var confirmed_series = [];
    var death_series = [];
    var recovered_series = [];
    var found_first_case_date = false;
    var found_first_death_date = false;
    var found_first_recovery_data = false;


    /* Fetching the sumamry data of the searched country */
    $.getJSON(country_summary_api_url).done(function(data){
      var country_name_searched_country = data.country;
      var country_flag_searched_country = get_country_flag(country_code);
      var total_cases_searched_country=data.cases;
      var today_cases_searched_country=data.todayCases;
      var total_deaths_searched_country=data.deaths;
      var today_deaths_searched_country=data.todayDeaths;
      var total_recovered_searched_country=data.recovered;
      var total_active_searched_country=data.active;
      var total_critical_searched_country=data.critical;
      var updated_at_searched_country=new Date(data.updated);
      var total_tests_searched_country=data.tests;
      var total_tests_per_million_searched_country=data.testsPerOneMillion;
      var total_cases_per_million_searched_country=data.casesPerOneMillion;
      var total_deaths_per_million_searched_country=data.deathsPerOneMillion;



      $("#country_name_searched_country").html(country_name_searched_country);
      $("#country_flag_searched_country").attr("src", country_flag_searched_country);
      $("#country_flag_searched_country").attr("alt", country_name_searched_country);

      $("#total_active_searched_country").html(total_active_searched_country.toLocaleString());
      $("#total_critical_searched_country").html(total_critical_searched_country.toLocaleString());
      $("#total_cases_searched_country").html(total_cases_searched_country.toLocaleString());
      $("#today_cases_searched_country").html(today_cases_searched_country.toLocaleString());
      $("#total_deaths_searched_country").html(total_deaths_searched_country.toLocaleString());
      $("#today_deaths_searched_country").html(today_deaths_searched_country.toLocaleString());
      $("#total_recovered_searched_country").html(total_recovered_searched_country.toLocaleString());
      total_deaths_percent_searched_country = (total_deaths_searched_country/total_cases_searched_country)*100.0;
      total_recovered_percent_searched_country = (total_recovered_searched_country/total_cases_searched_country)*100.0;
      $("#total_deaths_percent_searched_country").html(total_deaths_percent_searched_country.toLocaleString());
      $("#total_recovered_percent_searched_country").html(total_recovered_percent_searched_country.toLocaleString());
      $("#total_cases_per_million_searched_country").html(total_cases_per_million_searched_country.toLocaleString());
      $("#total_deaths_per_million_searched_country").html(total_deaths_per_million_searched_country.toLocaleString());
      $("#total_tests_searched_country").html(total_tests_searched_country.toLocaleString());
      $("#total_tests_per_million_searched_country").html(total_tests_per_million_searched_country.toLocaleString());

    });

    /* Fetching the time series data of the searched country */
    $.getJSON(country_historical_api_url).done(function(data){
      var country_name_searched_country = data.country;
      var cases_by_date_searched_country = data.timeline.cases;
      var deaths_by_date_searched_country = data.timeline.deaths;
      var recovered_by_date_searched_country = data.timeline.recovered;
      var first_case_date_searched_country = null;
      var first_death_date_searched_country = null;
      var first_recovery_date_searched_country = null;
      // We will show the chart only after the first confirmed case date
      var first_confirmed_case_index = 0;
      var counter = 0;

      $.each(cases_by_date_searched_country, function(key, value){
        chart_labels.push(get_formatted_date(key));
        confirmed_series.push(value);
        if(found_first_case_date==false && value>0){
          first_case_date_searched_country = get_formatted_date(key);
          found_first_case_date = true;
          first_confirmed_case_index = counter;
        }
        counter++;
      });

      $.each(deaths_by_date_searched_country, function(key, value){
        death_series.push(value);
        if(found_first_death_date == false && value>0){
          first_death_date_searched_country = get_formatted_date(key);
          found_first_death_date = true;
        }
      });

      $.each(recovered_by_date_searched_country, function(key, value){
        recovered_series.push(value);
        if(found_first_recovery_data == false && value>0){
          first_recovery_date_searched_country = get_formatted_date(key);
          found_first_recovery_data = true;
        }
      });

      $("#first_case_date_searched_country").html(first_case_date_searched_country);
      $("#first_death_date_searched_country").html(first_death_date_searched_country);
      $("#first_recovery_date_searched_country").html(first_recovery_date_searched_country);

      // Strip the series and chart labels to have data only after first confirmed case date
      chart_labels.splice(0, first_confirmed_case_index);
      confirmed_series.splice(0, first_confirmed_case_index);
      death_series.splice(0, first_confirmed_case_index);
      recovered_series.splice(0, first_confirmed_case_index);


      set_country_chart_data(country_name_searched_country, "country_chart", chart_labels, confirmed_series, death_series, recovered_series);

    });
    $("#country_search_result").fadeOut("slow");
    $("#country_search_result").fadeIn("slow");
  }

  $.getJSON(global_summary_api_url).done(function(data){
    total_countries=data.affectedCountries;
    total_cases=data.cases;
    total_deaths=data.deaths;
    total_recovered=data.recovered;
    total_critical = data.critical;
    total_active = data.active;
    total_tests = data.tests;
    total_cases_per_million = data.casesPerOneMillion;
    total_deaths_per_million = data.deathsPerOneMillion;
    total_tests_per_million = data.testsPerOneMillion;
    today_cases = data.todayCases;
    today_deaths = data.todayDeaths;


    updated_at=new Date(data.updated);
    $("#total_countries").html(total_countries.toLocaleString());
    $("#total_cases").html(total_cases.toLocaleString());
    $("#total_deaths").html(total_deaths.toLocaleString());
    $("#total_recovered").html(total_recovered.toLocaleString());
    $("#total_deaths").html(total_deaths.toLocaleString());
    $("#total_recovered").html(total_recovered.toLocaleString());
    $("#total_active").html(total_active.toLocaleString());
    $("#total_critical").html(total_critical.toLocaleString());
    $("#total_tests").html(total_tests.toLocaleString());
    $("#total_tests_per_million").html(total_tests_per_million.toLocaleString());
    $("#total_cases_per_million").html(total_cases_per_million.toLocaleString());
    $("#total_deaths_per_million").html(total_deaths_per_million.toLocaleString());
    $("#today_cases").html(today_cases.toLocaleString());
    $("#today_deaths").html(today_deaths.toLocaleString());
    $(".updated_at").html(updated_at.toLocaleString());
    total_deaths_percent = (total_deaths/total_cases)*100.0;
    total_recovered_percent = (total_recovered/total_cases)*100.0;
    $("#total_deaths_percent").html(total_deaths_percent.toLocaleString());
    $("#total_recovered_percent").html(total_recovered_percent.toLocaleString());
  });

  $.getJSON(countries_api_url).done(function(data){
    var countries_data = [];
    var chart_labels = [], confirmed_series = [], death_series = [], active_series = [], recovered_series = [];
    var country_counter = 0;
    var max_country = 10;

    $.each(data, function(i, item){
      if(item.country == "World"){
        return true;
      }
      corona_global_data[item.countryInfo.iso2] = {
        "country": item.country,
        "cases":item.cases,
        "today_cases":item.todayCases,
        "deaths":item.deaths,
        "today_deaths":item.todayDeaths,
        "recovered":item.recovered,
        "active":item.active,
        "critical":item.critical,
        "tests":item.tests,
        "tests_per_million":item.testsPerOneMillion,
        "cases_per_million":item.casesPerOneMillion,
        "deaths_per_million":item.deathsPerOneMillion
      }

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

      country_row += "<td class='table-info'>";
      country_row += item.todayCases.toLocaleString();
      country_row += "</td>";

      country_row += "<td>";
      country_row += item.casesPerOneMillion;
      country_row += "</td>";

      country_row += "<td>";
      country_row += item.deaths.toLocaleString();
      country_row += "</td>";

      country_row += "<td class='table-danger'>";
      country_row += item.todayDeaths.toLocaleString();
      country_row += "</td>";

      country_row += "<td>";
      country_row += item.deathsPerOneMillion;
      country_row += "</td>";

      country_row += "<td>";
      country_row += item.tests.toLocaleString();
      country_row += "</td>";

      country_row += "<td>";
      country_row += item.testsPerOneMillion.toLocaleString();
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

      country_row += "</tr>";
      $("#corona_country_rows").append(country_row);
    });

    $.each(corona_global_data, function(key, value){
      countries_data.push(value);
    });

    countries_data.sort(function(a, b){
      if(a["cases"] > b["cases"]){
        return -1;
      }
      else if(a["cases"] < b["cases"]){
        return 1;
      }
      else{
        if(a["deaths"] > b["deaths"]){
          return -1;
        }
        else if(a["deaths"] < b["deaths"]){
          return 1;
        }
        else{
          if(a["recovered"] > b["recovered"]){
            return -1;
          }
          else if(a["recovered"] < b["recovered"]){
            return 1;
          }
          return 0;
        }
      }
    });


    $.each(countries_data, function(key, value){
      if(country_counter == max_country){
        return true;
      }
      chart_labels.push(value.country);
      confirmed_series.push(value.cases);
      death_series.push(value.deaths);
      active_series.push(value.active);
      recovered_series.push(value.recovered);
      country_counter++;
    });

    set_single_dataset_bar_chart("summary_cases_chart", "Total Cases", "Confirmed Cases", confirmed_case_color, "Countries", "Number of confirmed cases", chart_labels, confirmed_series);
    set_single_dataset_bar_chart("summary_death_chart", "Total Deaths", "Death Counts", death_case_color, "Countries", "Number of death cases", chart_labels, death_series);
    set_single_dataset_bar_chart("summary_active_chart", "Total Active Cases", "Active Cases", active_case_color, "Countries", "Number of active cases", chart_labels, active_series);
    set_single_dataset_bar_chart("summary_recovered_chart", "Total Recovered", "Recovered Cases", recovered_case_color, "Countries", "Number of recovered cases", chart_labels, recovered_series);


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

    countries.sort(function(a,b){
      if (a[1] < b[1]) return -1;
      else if (a[1] > b[1]) return 1;
      return 0;
    });

    for(var i=0;i<countries.length;i++){
      var selected = "";
      country_short_code = countries[i][0];
      country_name = countries[i][1];
      if(country_short_code == "BD"){
        selected = "selected";
      }
      $("#country_search").append("<option "+selected+" value='"+country_short_code+"'>"+country_name+"</option>");
    }
    var searched_country_code = $('#country_search').val();
    load_searched_country_data(searched_country_code);

  });

  $('#country_search').on('change', function () {
    var searched_country_code = $(this).val();
    load_searched_country_data(searched_country_code);
  });

  sizeMap();
  $(window).on("resize", sizeMap);
});
