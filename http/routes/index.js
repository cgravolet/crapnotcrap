var express     = require("express");
var router      = express.Router();
var All         = require("./all");
var Crap        = require("./crap");
var Home        = require("./home");
var NotCrap     = require("./notcrap");
var Recent      = require("./recent");
var Search      = require("./search");
var Thunderdome = require("./thunderdome");

module.exports = function (app) {

	// Initialize route delegates
	var all         = Object.create(All).init(app);
	var crap        = Object.create(Crap).init(app);
	var home        = Object.create(Home).init(app);
	var notcrap     = Object.create(NotCrap).init(app);
	var recent      = Object.create(Recent).init(app);
	var search      = Object.create(Search).init(app);
	var thunderdome = Object.create(Thunderdome).init(app);

	// Define routes
	router.get("/",                   home.get.bind(home));
	router.post("/",                  home.post.bind(home));
	router.get("/search",             search.noTerm.bind(search));
	router.get("/search/:term",       search.results.bind(search));
	router.get("/search/:term/:page", search.resultsWithPage.bind(search));
	router.get("/all",                all.results.bind(all));
	router.get("/all/:page",          all.resultsWithPage.bind(all));
	router.get("/crap",               crap.results.bind(crap));
	router.get("/crap/:page",         crap.resultsWithPage.bind(crap));
	router.get("/notcrap",            notcrap.results.bind(notcrap));
	router.get("/notcrap/:page",      notcrap.resultsWithPage.bind(notcrap));
	router.get("/recent",             recent.results.bind(recent));
	router.get("/recent/:page",       recent.resultsWithPage.bind(recent));
	router.get("/thunderdome",        thunderdome.results.bind(thunderdome));
	router.get("/thunderdome/:page",  thunderdome.resultsWithPage.bind(thunderdome));

	// REST service
	router.get("/all/:page/.json",          all.resultsJSON.bind(all));
	router.get("/crap/:page/.json",         crap.resultsJSON.bind(crap));
	router.get("/notcrap/:page/.json",      notcrap.resultsJSON.bind(notcrap));
	router.get("/recent/:page/.json",       recent.resultsJSON.bind(recent));
	router.get("/search/:term/:page/.json", search.resultsJSON.bind(search));
	router.get("/thunderdome/:page/.json",  thunderdome.resultsJSON.bind(thunderdome));

	return router;
};
