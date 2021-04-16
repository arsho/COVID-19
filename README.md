# COVID-19

A data visualization project to show current situation of COVID-19 worldwide. This application can be accessed from: [https://arshovon.com/apps/c19/](https://arshovon.com/apps/c19/).

## Features
- Summary of worldwide status of COVID-19 specifying number of affected countries, total cases, total deaths and total recovered cases, total tests, total deaths per million, total cases per million and total tests per million.
- Sortable and instant searchable data table of all countries.
- World map of confirmed cases and top countries chart with most confirmed cases.
- World map of death cases and top countries chart with most death cases.
- World map of active cases and top countries chart with most active cases.
- World map of recovered cases and top countries chart with most recovered cases.
- View details of a specific country.
    - Summary information of the country.
    - Line charts for total confirmed cases, total death cases, total recovered cases of the searched country.
    - Bar charts for daily confirmed cases, daily death cases, daily recovered cases of the searched country.

## Dependencies

- [Bootstrap v4.4.1](https://getbootstrap.com/docs/4.4/getting-started/introduction/)
- [jQuery v3.4.1](https://jquery.com/)
- [Datatables v1.10.20](https://datatables.net/)
- [jQuery Vector Map Library v1.5.1](https://github.com/10bestdesign/jqvmap)
- [ChartJS v2.9.3 bundled build including Moment.js](https://www.chartjs.org/)
- [Font Awesome Free v5.13.0](https://fontawesome.com)
- [Google Web Font: Source Sans Pro](https://fonts.google.com/specimen/Source+Sans+Pro)

## Installation

- Clone the repository.
- The required JS/CSS files will be loaded from relevant CDN. No need to download the above dependencies locally.

## Demonstration

- Summary of worldwide COVID-19 status

![alt Summary of worldwide COVID-19 status](/screenshots/summary.png?style=center)

- Sortable and instant searchable data table

![alt Sortable and instant searchable data table](/screenshots/data_table.png?style=center)

- Worldmap of confirmed cases

![alt Worldmap of recovered cases](/screenshots/confirmed_world_map.png?style=center)

- Worldmap of death cases

![alt Worldmap of recovered cases](/screenshots/deaths_world_map.png?style=center)

- Worldmap of active cases

![alt Worldmap of recovered cases](/screenshots/active_world_map.png?style=center)

- Worldmap of recovered cases

![alt Worldmap of recovered cases](/screenshots/recovered_world_map.png?style=center)

- Top countries with most recovered cases

![alt top countries with most recovered cases](/screenshots/top_countries_with_most_recovered_cases.png?style=center)

- Search by country

![alt Search by country](/screenshots/search_by_country.png?style=center)

- Day wise cases of a country (example: confirmed cases)

![alt Day wise cases of a country](/screenshots/country_wise_daily_confirmed_case.png?style=center)


- Mobile view

![alt Mobile View](/screenshots/mobile.png?style=center)

## Support

Please [open an issue](https://github.com/arsho/COVID-19/issues/new) for support.

## Contributing

Please contribute using [Github Flow](https://guides.github.com/introduction/flow/). Create a branch, add commits, and [open a pull request](https://github.com/arsho/COVID-19/compare/).

### Git methods

- To check local changes:
  ```
  git status -s
  ```
- To fetch from upstream repository:
  ```
  git fetch
  ```
- To reset local files to upstream repository `master` branch after fetching the changes:
  ```
  git reset --hard origin/master
  ```

### Generate app folder for Hugo

- Github actions workflow is added to generate an app folder which can be added to any Hugo project. The workflow file is available in [.github/workflows/main.yml](.github/workflows/main.yml)
- For each push to `master` branch or pull request to `master` branch the `c19` folder is updated.
- Copy the `c19` folder to any Hugo site's `content` folder.
- After each push to `master` branch or pull request to `master` branch, update the local branch by:
  ```
  git fetch
  git reset --hard origin/master
  ```

### References

- [jQuery $.each method](https://api.jquery.com/jquery.each/)


## Influenced by

- [NOVELCovid API](https://corona.lmao.ninja/)
- [NC-19SRIM](https://www.smreza.com/projects/covid-19/)
- [NOVEL CORONA VIRUS DISEASE \(COVID-19\)](http://corona.drmwahiduzzaman.info/)
