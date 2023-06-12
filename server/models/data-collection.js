"use strict";

// THIS IS THE STRETCH GOAL ...
// It takes in a schema in the constructor and uses that instead of every collection
// being the same and requiring their own schema. That's not very DRY!

class DataCollection {
  constructor(model) {
    this.model = model;
  }

  async get(id) {
    try {
      if (id) {
        return await this.model.findOne({ where: { id } });
      } else {
        return await this.model.findAll({});
      }
    } catch (error) {
      console.log("Error fetching collection object: ", error.message);
      return "That item could not be found.";
    }
  }

  async create(record) {
    try {
      return await this.model.create(record);
    } catch (error) {
      console.log("Error creating collection object: ", error.message);
      return "That item could not be created.";
    }
  }

  async update(id, data) {
    try {
      const record = await this.model.findOne({ where: { id } });
      return record.update(data);
    } catch (error) {
      console.log("Error updating collection object: ", error.message);
      return "That item could not be updated.";
    }
  }

  async delete(id) {
    try {
      return await this.model.destroy({ where: { id } });
    } catch (error) {
      console.log("Error deleting collection object: ", error.message);
      return "That item could not be deleted.";
    }
  }
}

module.exports = DataCollection;
