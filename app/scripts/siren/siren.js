var Entity = require('./entity');
var Link = require('./link');
var defer = require('./defer');

module.exports = createSiren;

function createSiren(config) {
  return new Siren(config);
}

function Siren(config) {
  // TODO: merge with defaults
  this.config = {
    url: config.url,
    http: {
      get: config.http.get
    }
  };
}

Siren.map = {
  link:  function mapLink(rel) {
    return function (entity) {
      return entity.link(rel);
    };
  }
};

Siren.prototype.entity = function entity(path) {
  var self = this;
  var pathSegments = path.split('/');
  return resolvePath(this, this.config.url, pathSegments, null);
};

Siren.prototype.search = function search(entity, query) {
  var self = this;
  var q = 'SELECT [a].* FROM [dam:Asset] AS [a] WHERE CONTAINS([a].*, \'' + query + '\')';
  var encodedQuery = encodeURIComponent(q);
  var url = entity.link('self').href() + "?query=" + encodedQuery;
  return self.config.http.get(url).then(
    function successSearch(response) {
      var entities = response.data.entities || [];
      return self.loadAllEntities(entity, entities);
    }
  );
};

Siren.prototype.loadAllEntities = function loadAllEntities(parentEntity, jsonEntities) {
  var self = this;
  var entities = jsonEntities
    .map(jsonEntityToUrl)
    .map(function loadEntity(url) {
      return self.loadEntity(url, parentEntity);
    });
  return Promise.all(entities);
};

function jsonEntityToUrl(jsonEntity) {
  var link = filterLinksByRel(jsonEntity.links, 'self');
  return link && link.href;
}

function filterLinksByRel(links, rel) {
  var link = links.filter(function (link) {
    return link.rel.indexOf(rel) != -1;
  });
  if (link.length > 1) {
    throw "Expected only one link with rel=" + rel;
  }
  return link.length === 0 ? undefined : link[0];
}

Siren.prototype.loadEntity = function loadEntity(url, parentEntity) {
  var self = this;
  return self.config.http.get(url).then(
    function successLoadEntity(response) {
      entity = new Entity(self, parentEntity, response.data);
      return entity;
    },
    function failLoadEntity(err) {
      console.log('failed to load entity ' + url, err);
    }
  );
};

function resolvePath(siren, url, pathSegments, parentEntity) {
  var deferred = defer();
  function failLoadEntity(err) {
    deferred.reject(err);
  }
  siren.loadEntity(url, parentEntity).then(
    function successLoadEntity(entity) {
      if (pathSegments.length > 0) {
        var segment = pathSegments.shift();
        // TODO: the top-level API call returns only links, it should return entities instead
        var link = entity.link(segment);
        var apiLink = link && link.href();
        if (apiLink) {
          resolvePath(siren, apiLink, pathSegments, entity).then(
            function resolveSuccess(childEntity) {
              deferred.resolve(childEntity);
            },
            failLoadEntity
          );
        } else {
          entity
            .children(function filterByName(jsonEntity) {
              return jsonEntity.properties && jsonEntity.properties.name === segment;
            })
            .then(function descendIntoChildren(children) {
              if (children.length !== 1) {
                deferred.reject({ msg: "Expected one child called " + segment, parentPath: entity.path()});
              }
              var link = children[0].link('self');
              var url = link && link.href();
              resolvePath(siren, url, pathSegments, entity).then(
                function resolveSuccess(childEntity) {
                  deferred.resolve(childEntity);
                },
                failLoadEntity
              );
            },
            failLoadEntity
          );
        }


      } else {
        deferred.resolve(entity);
      }
    },
    failLoadEntity
  );
  return deferred.promise;
}
