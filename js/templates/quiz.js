(function() {
  var template = Handlebars.template, templates = Handlebars.templates = Handlebars.templates || {};
templates['quiz'] = template({"compiler":[7,">= 4.0.0"],"main":function(container,depth0,helpers,partials,data) {
    var helper, alias1=depth0 != null ? depth0 : {}, alias2=helpers.helperMissing, alias3="function", alias4=container.escapeExpression;

  return "<div class=\"col-xs-12 col-md-8 col-lg-8 col-lg-offset-2\">\n    <form action=\"\" id=\"answerForm\">\n        <div class=\"row\">\n            <h2>Who is the the singer and name of the song behind the following lyrics?</h2>\n        </div>\n        <div class=\"row lyricsDiv\">\n          <div class=\"col-xs-12 col-md-8 col-lg-8\"><h3>"
    + alias4(((helper = (helper = helpers.lyrics || (depth0 != null ? depth0.lyrics : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"lyrics","hash":{},"data":data}) : helper)))
    + "</h3></div>\n          <div class=\"col-xs-12 col-md-4 col-lg-4\"><span class=\"glyphicon glyphicon-play-circle playbutton\"></span></div>\n        </div>\n        <div class=\"row\">\n            <div class=\"btn-toolbar artists col-centered\" data-toggle=\"buttons\">\n                <label class=\"btn btn-primary\" id=\"radio1\">\n                    <input type=\"radio\" name=\"options\" autocomplete=\"off\" value=\"1\"><h4>"
    + alias4(((helper = (helper = helpers.song1 || (depth0 != null ? depth0.song1 : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"song1","hash":{},"data":data}) : helper)))
    + "<br>"
    + alias4(((helper = (helper = helpers.artist1 || (depth0 != null ? depth0.artist1 : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"artist1","hash":{},"data":data}) : helper)))
    + "</h4>\n                </label>\n                <label class=\"btn btn-primary\" id=\"radio2\">\n                    <input type=\"radio\" name=\"options\" autocomplete=\"off\" value=\"2\"><h4>"
    + alias4(((helper = (helper = helpers.song2 || (depth0 != null ? depth0.song2 : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"song2","hash":{},"data":data}) : helper)))
    + "<br>"
    + alias4(((helper = (helper = helpers.artist2 || (depth0 != null ? depth0.artist2 : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"artist2","hash":{},"data":data}) : helper)))
    + "</h4>\n                </label>\n                <label class=\"btn btn-primary\" id=\"radio3\">\n                    <input type=\"radio\" name=\"options\" autocomplete=\"off\" value=\"3\"><h4>"
    + alias4(((helper = (helper = helpers.song3 || (depth0 != null ? depth0.song3 : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"song3","hash":{},"data":data}) : helper)))
    + "<br>"
    + alias4(((helper = (helper = helpers.artist3 || (depth0 != null ? depth0.artist3 : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"artist3","hash":{},"data":data}) : helper)))
    + "</h4>\n                </label>\n                <label class=\"btn btn-primary\" id=\"radio4\">\n                    <input type=\"radio\" name=\"options\" autocomplete=\"off\" value=\"4\"><h4>"
    + alias4(((helper = (helper = helpers.song4 || (depth0 != null ? depth0.song4 : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"song4","hash":{},"data":data}) : helper)))
    + "<br>"
    + alias4(((helper = (helper = helpers.artist4 || (depth0 != null ? depth0.artist4 : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"artist4","hash":{},"data":data}) : helper)))
    + "</h4>\n                </label>\n            </div>\n        </div>\n        <div class=\"row\">\n            <br>\n            <div class=\"col-centered artist-submit\">\n                <input type=\"submit\" name=\"submit\" class=\"btn btn-default btn-primary\" value=\"Submit\">\n            </div>\n        </div>\n    </form>\n</div>\n";
},"useData":true});
})();