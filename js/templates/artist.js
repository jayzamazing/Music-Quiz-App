(function() {
  var template = Handlebars.template, templates = Handlebars.templates = Handlebars.templates || {};
templates['artist'] = template({"compiler":[7,">= 4.0.0"],"main":function(container,depth0,helpers,partials,data) {
    var helper, alias1=depth0 != null ? depth0 : {}, alias2=helpers.helperMissing, alias3="function", alias4=container.escapeExpression;

  return "<div class=\"col-xs-12 col-md-4 col-lg-4 col-lg-offset-4\">\n  <div class=\"correct col-centered\"><h2>"
    + alias4(((helper = (helper = helpers.correct || (depth0 != null ? depth0.correct : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"correct","hash":{},"data":data}) : helper)))
    + "</h2></div>\n  <div class=\"singername col-centered\"><h3>"
    + alias4(((helper = (helper = helpers.artistName || (depth0 != null ? depth0.artistName : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"artistName","hash":{},"data":data}) : helper)))
    + "</h3></div>\n  <div class=\"albumopic col-centered\"><img src=\""
    + alias4(((helper = (helper = helpers.songUrl || (depth0 != null ? depth0.songUrl : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"songUrl","hash":{},"data":data}) : helper)))
    + "\" alt=\"artist pic\" class=\"img-responsive\"></div>\n</div>\n";
},"useData":true});
})();