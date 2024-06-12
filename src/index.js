function Todo(title) {
  this.title = title;
  this.description = "";
  this.dueDate = "";
  this.priority = 1;
  this.nested = [];
}

Todo.prototype.setDescription = function (description) {
  this.description = description;
};
