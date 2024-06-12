function Todo(title) {
  this.title = title;
  this.description = "";
  this.dueDate = "";
  this.priority = 1;
  this.done = false;
  this.nested = [];
}

Todo.prototype.setDescription = function (description) {
  this.description = description;
};

Todo.prototype.isProject = function () {
  return this.nested.length > 0;
};
