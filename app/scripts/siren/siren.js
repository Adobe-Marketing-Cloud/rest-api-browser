module.exports = Siren;

function Siren(config) {
  this.url = config.url;
  this.get = config.get;
}

module.exports.link = link;
module.exports.entity = entity;

function link(sirenObject, rel) {
  var results = [];
  var links = sirenObject.links;
  console.log('link', links, rel);
  for (var i = 0; i <  links.length; i++) {
    if (links[i].rel.indexOf(rel) > -1) {
      console.log('found link', links[i]);
      results.push(links[i]);
    }
  }
  return results.length > 0 ? results[0] : null;
}

function entity(sirenObject, name) {
  var results = [];
  console.log('entity', sirenObject, name);
  if (sirenObject.entities) {
    for (var i = 0; i < sirenObject.entities.length; i++) {
      if (sirenObject.entities[i].properties.name === name) {
        console.log('found entity', sirenObject.entities[i]);
        results.push(sirenObject.entities[i]);
      }
    }
  }
  return results.length > 0 ? results[0] : null;
}

/*
{
  "class": [
    "core/services"
  ],
  "links": [
    {
      "rel": [
        "self"
      ],
      "href": "http://localhost:9000/api.json"
    },
    {
      "rel": [
        "content"
      ],
      "href": "http://localhost:9000/api/content.json"
    },
    {
      "rel": [
        "assets"
      ],
      "href": "http://localhost:9000/api/assets.json"
    }
  ],
  "properties": {
    "name": "api"
  }
}
*/

