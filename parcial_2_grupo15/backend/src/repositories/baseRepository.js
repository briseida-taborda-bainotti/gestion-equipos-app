export class BaseRepository {
  constructor(model) {
    this.model = model;
  }

  findById(id, options = {}) {
    return this.model.findByPk(id, options);
  }

  findAll(options = {}) {
    return this.model.findAll(options);
  }

  findOne(options = {}) {
    return this.model.findOne(options);
  }

  create(data) {
    return this.model.create(data);
  }

  count(options = {}) {
    return this.model.count(options);
  }

  findAndCountAll(options = {}) {
    return this.model.findAndCountAll(options);
  }
}
