# Àlacarte : A ReactJS restaurant review App

![presentation banner](./readme-banner.png)
Àlacarte is a ReactJS based app where you can browse a map and search for restaurants either at your location or manually.

[Online version](https://alacarte.danly.co/)

# Pre-Requisite and Warnings

This is a school project for [OpenClassrooms](https://openclassrooms.com/) Front-end app developer course.
Given the nature of the project, all user interactions are local and won't be exchanged with a server,
if you add a restaurant or a review, only you can view it and it won't be there if you refresh the page.

However, if you decide to share your location, please keep in mind that Àlacarte uses Google Maps API services.

## Install

Use the package manager [npm](https://www.npmjs.com/get-npm) to install dependencies.

Inside **alacarte** folder, do the following

```bash
npm install
```

Then add your API to two main files to make the app work :

[**./src/boostrapURLKeys.js**](./src/boostrapURLKeys.js) (used for GoogleMapReact module and to get Google Street View photos inside cards)
line 2

```bash
key:  'yourAPIKEY',
```

[**./public/index.html**](./public/index.html) (used to get results from search API when adding a new restaurant OR manually browsing cities)
line 20

```bash
<script  src="https://maps.googleapis.com/maps/api/js?libraries=places&key=yourAPIkey">
```

## Running it locally

**After installing dependencies**, inside **alacarte** folder, do the following

```bash
npm start
```
