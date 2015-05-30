module.exports = Link;

function Link(siren, data) {
  this.siren = siren;
  this.data = data;
}

Link.prototype.href = function href() {
  return this.data.href;
};

Link.prototype.entity = function entity() {
  return this.siren.loadEntity(this);
};
