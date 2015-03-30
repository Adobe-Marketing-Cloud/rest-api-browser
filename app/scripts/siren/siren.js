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

  //this._cache = {};
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

Siren.prototype.loadEntity = function loadEntity(url, parentEntity) {
  var self = this;
  //if (self._cache.hasOwnProperty(url)) {
  //  var deferred = defer();
  //  deferred.resolve(self._cache[url]);
  //  return deferred.promise;
  //}
  return self.config.http.get(url).then(function successLoadEntity(response) {
    entity = new Entity(self, parentEntity, response.data);
    //self._cache[url] = entity;
    return entity;
  });
};

function resolvePath(siren, url, pathSegments, parentEntity) {
  var deferred = defer();
  siren.loadEntity(url, parentEntity).then(
    function successLoadEntity(entity) {
      if (pathSegments.length > 0) {
        var segment = pathSegments.shift();
        // TODO: the top-level API call returns only links, it should return entities instead
        var link = entity.link(segment);
        var apiLink = link && link.href();
        if (apiLink) {
          resolvePath(siren, apiLink, pathSegments, entity)
            .then(function resolveSuccess(childEntity) {
              deferred.resolve(childEntity);
            })
          ;
        } else {
          entity
            .children(function filterByName(jsonEntity) {
              return jsonEntity.properties && jsonEntity.properties.name === segment;
            })
            .then(function descendIntoChildren(children) {
              if (children.length !== 1) {
                throw "Expected one child called " + segment;
              }
              var link = children[0].link('self');
              var url = link && link.href();
              resolvePath(siren, url, pathSegments, entity)
                .then(function resolveSuccess(childEntity) {
                  deferred.resolve(childEntity);
                });
            });
        }


      } else {
        deferred.resolve(entity);
      }
    },
    function failLoadEntity(err) {
      deferred.reject(err);
    }
  );
  return deferred.promise;
}
