var Handlebars = require("handlebars/runtime");  var template = Handlebars.template, templates = Handlebars.templates = Handlebars.templates || {};
templates['base'] = template({"1":function(container,depth0,helpers,partials,data) {
    var stack1, helper, lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return "    \"RoomNumber\": \""
    + ((stack1 = ((helper = (helper = lookupProperty(helpers,"short_description") || (depth0 != null ? lookupProperty(depth0,"short_description") : depth0)) != null ? helper : container.hooks.helperMissing),(typeof helper === "function" ? helper.call(depth0 != null ? depth0 : (container.nullContext || {}),{"name":"short_description","hash":{},"data":data,"loc":{"start":{"line":6,"column":19},"end":{"line":6,"column":42}}}) : helper))) != null ? stack1 : "")
    + "\",\r\n";
},"3":function(container,depth0,helpers,partials,data) {
    var stack1, helper, lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return "    \"Description\": \""
    + ((stack1 = ((helper = (helper = lookupProperty(helpers,"long_description") || (depth0 != null ? lookupProperty(depth0,"long_description") : depth0)) != null ? helper : container.hooks.helperMissing),(typeof helper === "function" ? helper.call(depth0 != null ? depth0 : (container.nullContext || {}),{"name":"long_description","hash":{},"data":data,"loc":{"start":{"line":9,"column":20},"end":{"line":9,"column":42}}}) : helper))) != null ? stack1 : "")
    + "\",\r\n";
},"5":function(container,depth0,helpers,partials,data) {
    var stack1, helper, lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return "    \"Size\": "
    + ((stack1 = ((helper = (helper = lookupProperty(helpers,"square_metres") || (depth0 != null ? lookupProperty(depth0,"square_metres") : depth0)) != null ? helper : container.hooks.helperMissing),(typeof helper === "function" ? helper.call(depth0 != null ? depth0 : (container.nullContext || {}),{"name":"square_metres","hash":{},"data":data,"loc":{"start":{"line":12,"column":12},"end":{"line":12,"column":31}}}) : helper))) != null ? stack1 : "")
    + ",\r\n";
},"7":function(container,depth0,helpers,partials,data) {
    var stack1, helper, lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return "    \"Capacity\": "
    + ((stack1 = ((helper = (helper = lookupProperty(helpers,"capacity") || (depth0 != null ? lookupProperty(depth0,"capacity") : depth0)) != null ? helper : container.hooks.helperMissing),(typeof helper === "function" ? helper.call(depth0 != null ? depth0 : (container.nullContext || {}),{"name":"capacity","hash":{},"data":data,"loc":{"start":{"line":15,"column":16},"end":{"line":15,"column":30}}}) : helper))) != null ? stack1 : "")
    + ",\r\n";
},"9":function(container,depth0,helpers,partials,data) {
    var stack1, helper, lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return "    \"RoomType\": \""
    + ((stack1 = ((helper = (helper = lookupProperty(helpers,"room_type") || (depth0 != null ? lookupProperty(depth0,"room_type") : depth0)) != null ? helper : container.hooks.helperMissing),(typeof helper === "function" ? helper.call(depth0 != null ? depth0 : (container.nullContext || {}),{"name":"room_type","hash":{},"data":data,"loc":{"start":{"line":18,"column":17},"end":{"line":18,"column":32}}}) : helper))) != null ? stack1 : "")
    + "\",\r\n";
},"11":function(container,depth0,helpers,partials,data) {
    var stack1, helper, lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return "            ,\r\n            {\r\n                \"Name\" : \"RoomTypeDescription\",\r\n                \"value\" : \""
    + ((stack1 = ((helper = (helper = lookupProperty(helpers,"room_type_description") || (depth0 != null ? lookupProperty(depth0,"room_type_description") : depth0)) != null ? helper : container.hooks.helperMissing),(typeof helper === "function" ? helper.call(depth0 != null ? depth0 : (container.nullContext || {}),{"name":"room_type_description","hash":{},"data":data,"loc":{"start":{"line":35,"column":27},"end":{"line":35,"column":54}}}) : helper))) != null ? stack1 : "")
    + "\"\r\n            }\r\n";
},"compiler":[8,">= 4.3.0"],"main":function(container,depth0,helpers,partials,data) {
    var stack1, helper, alias1=depth0 != null ? depth0 : (container.nullContext || {}), alias2=container.hooks.helperMissing, alias3="function", lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return "{\r\n    \"RefId\": \""
    + ((stack1 = ((helper = (helper = lookupProperty(helpers,"ref_id") || (depth0 != null ? lookupProperty(depth0,"ref_id") : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"ref_id","hash":{},"data":data,"loc":{"start":{"line":2,"column":14},"end":{"line":2,"column":26}}}) : helper))) != null ? stack1 : "")
    + "\",\r\n    \"SchoolInfoRefId\": \""
    + ((stack1 = ((helper = (helper = lookupProperty(helpers,"school_ref_id") || (depth0 != null ? lookupProperty(depth0,"school_ref_id") : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"school_ref_id","hash":{},"data":data,"loc":{"start":{"line":3,"column":24},"end":{"line":3,"column":43}}}) : helper))) != null ? stack1 : "")
    + "\",\r\n    \"LocalId\": \""
    + ((stack1 = ((helper = (helper = lookupProperty(helpers,"local_id") || (depth0 != null ? lookupProperty(depth0,"local_id") : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"local_id","hash":{},"data":data,"loc":{"start":{"line":4,"column":16},"end":{"line":4,"column":30}}}) : helper))) != null ? stack1 : "")
    + "\",\r\n"
    + ((stack1 = lookupProperty(helpers,"if").call(alias1,(depth0 != null ? lookupProperty(depth0,"short_description") : depth0),{"name":"if","hash":{},"fn":container.program(1, data, 0),"inverse":container.noop,"data":data,"loc":{"start":{"line":5,"column":4},"end":{"line":7,"column":11}}})) != null ? stack1 : "")
    + ((stack1 = lookupProperty(helpers,"if").call(alias1,(depth0 != null ? lookupProperty(depth0,"long_description") : depth0),{"name":"if","hash":{},"fn":container.program(3, data, 0),"inverse":container.noop,"data":data,"loc":{"start":{"line":8,"column":4},"end":{"line":10,"column":11}}})) != null ? stack1 : "")
    + ((stack1 = lookupProperty(helpers,"if").call(alias1,(depth0 != null ? lookupProperty(depth0,"square_metres") : depth0),{"name":"if","hash":{},"fn":container.program(5, data, 0),"inverse":container.noop,"data":data,"loc":{"start":{"line":11,"column":4},"end":{"line":13,"column":11}}})) != null ? stack1 : "")
    + ((stack1 = lookupProperty(helpers,"if").call(alias1,(depth0 != null ? lookupProperty(depth0,"capacity") : depth0),{"name":"if","hash":{},"fn":container.program(7, data, 0),"inverse":container.noop,"data":data,"loc":{"start":{"line":14,"column":4},"end":{"line":16,"column":11}}})) != null ? stack1 : "")
    + ((stack1 = lookupProperty(helpers,"if").call(alias1,(depth0 != null ? lookupProperty(depth0,"room_type") : depth0),{"name":"if","hash":{},"fn":container.program(9, data, 0),"inverse":container.noop,"data":data,"loc":{"start":{"line":17,"column":4},"end":{"line":19,"column":11}}})) != null ? stack1 : "")
    + "    \"AvailableForTimetable\": \""
    + ((stack1 = ((helper = (helper = lookupProperty(helpers,"can_be_timetabled") || (depth0 != null ? lookupProperty(depth0,"can_be_timetabled") : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"can_be_timetabled","hash":{},"data":data,"loc":{"start":{"line":20,"column":30},"end":{"line":20,"column":53}}}) : helper))) != null ? stack1 : "")
    + "\",\r\n    \"SIF_ExtendedElements\" : {\r\n        \"SIF_ExtendedElement\": [\r\n            {\r\n                \"Name\" : \"Status\",\r\n                \"value\" : \""
    + ((stack1 = ((helper = (helper = lookupProperty(helpers,"status") || (depth0 != null ? lookupProperty(depth0,"status") : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"status","hash":{},"data":data,"loc":{"start":{"line":25,"column":27},"end":{"line":25,"column":39}}}) : helper))) != null ? stack1 : "")
    + "\"\r\n            },\r\n            {\r\n                \"Name\" : \"Source\",\r\n                \"value\" : \""
    + ((stack1 = ((helper = (helper = lookupProperty(helpers,"source") || (depth0 != null ? lookupProperty(depth0,"source") : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"source","hash":{},"data":data,"loc":{"start":{"line":29,"column":27},"end":{"line":29,"column":39}}}) : helper))) != null ? stack1 : "")
    + "\"\r\n            }\r\n"
    + ((stack1 = lookupProperty(helpers,"if").call(alias1,(depth0 != null ? lookupProperty(depth0,"room_type_description") : depth0),{"name":"if","hash":{},"fn":container.program(11, data, 0),"inverse":container.noop,"data":data,"loc":{"start":{"line":31,"column":12},"end":{"line":37,"column":19}}})) != null ? stack1 : "")
    + "        ]\r\n    }\r\n}\r\n";
},"useData":true});
templates['roomInfo'] = template({"compiler":[8,">= 4.3.0"],"main":function(container,depth0,helpers,partials,data) {
    var stack1, lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return "{\r\n    \"RoomInfo\": "
    + ((stack1 = container.invokePartial(lookupProperty(partials,"base"),depth0,{"name":"base","data":data,"helpers":helpers,"partials":partials,"decorators":container.decorators})) != null ? stack1 : "")
    + "\r\n}";
},"usePartial":true,"useData":true});
templates['roomInfoList'] = template({"1":function(container,depth0,helpers,partials,data) {
    var stack1, lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return "            "
    + ((stack1 = lookupProperty(helpers,"if").call(depth0 != null ? depth0 : (container.nullContext || {}),(data && lookupProperty(data,"index")),{"name":"if","hash":{},"fn":container.program(2, data, 0),"inverse":container.noop,"data":data,"loc":{"start":{"line":5,"column":12},"end":{"line":5,"column":35}}})) != null ? stack1 : "")
    + "\r\n"
    + ((stack1 = container.invokePartial(lookupProperty(partials,"base"),depth0,{"name":"base","data":data,"indent":"            ","helpers":helpers,"partials":partials,"decorators":container.decorators})) != null ? stack1 : "");
},"2":function(container,depth0,helpers,partials,data) {
    return ", ";
},"compiler":[8,">= 4.3.0"],"main":function(container,depth0,helpers,partials,data) {
    var stack1, lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return "{\r\n  \"RoomInfos\": {\r\n    \"RoomInfo\": [\r\n"
    + ((stack1 = lookupProperty(helpers,"each").call(depth0 != null ? depth0 : (container.nullContext || {}),depth0,{"name":"each","hash":{},"fn":container.program(1, data, 0),"inverse":container.noop,"data":data,"loc":{"start":{"line":4,"column":8},"end":{"line":7,"column":17}}})) != null ? stack1 : "")
    + "    ]\r\n  }\r\n}";
},"usePartial":true,"useData":true});
