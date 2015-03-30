module.exports = Action;

function Action(siren, entity, data) {
  // private
  this._siren = siren;
  this._parent = entity;
  this._data = data;

  // public
  this.name = data.name;
  this.title = data.title;
  this.fields = data.fields;
  this.href = data.href;
  this.method = data.method;
}
