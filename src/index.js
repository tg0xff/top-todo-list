function Todo(title) {
  this.title = title;
  this.priority = 1;
}

Todo.prototype.setDescription = function (description) {
  this.description = description;
};
