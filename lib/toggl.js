'use strict';

let TogglClient = require('toggl-api');

/**
 * Toggl class
 *
 * @class Toggl
 */
class Toggl {
  /**
   * Constructor
   *
   * @param {String} token - API token key to authenticate with
   */
  constructor(token) {
    this.client = new TogglClient({
      'apiToken': token,
    });
  }

  /**
   * Fetches time entries without tag 'gitlab'
   *
   * @param {Date} startDate
   * @param {Date} endDate
   * @param {Boolean} group
   * @param {Integer} wid Filter by workspace id.
   */
  async fetchTimeEntries(startDate, endDate, group, wid) {
    let self = this;

    let entries = await new Promise(function(resolve, reject) {
      self.client.getTimeEntries(startDate, endDate, function(error, response) {
        if (error) {
          return reject(error);
        }

        return resolve(response);
      });
    });

    // Filter out entries by workspace
    if (wid) {
      entries = entries.filter(function(entry) {
        return Object.prototype.hasOwnProperty.call(entry, 'wid') &&
                entry['wid'] == wid;
      });
    }

    // Filter out entries with 'gitlab' tag
    entries = entries.filter(function(entry) {
      return !Object.prototype.hasOwnProperty.call(entry, 'tags') ||
              entry['tags'].indexOf('gitlab') === -1;
    });

    if (group) {
      // Goupe time entries
      entries = this.groupTimeEntires(entries);
    }

    return entries;
  }

  /**
   * Groups time entires
   *
   * Groups entries by:
   * - description
   * - tags
   *
   * @param {Array} entries
   * @return {Array}
   */
  groupTimeEntires(entries) {
    let grouped = {};

    entries.forEach(function(entry) {
      // Calculate entry group identifier
      let groupId = entry.description +
        ((entry['tags'] || []).sort().join(' - ') || '');

      if (!Object.prototype.hasOwnProperty.call(grouped, groupId)) {
        // Initialize group if needed
        grouped[groupId] = entry;
        entry.ids = [entry.id];
      } else {
        // Merge time entries
        grouped[groupId].ids.push(entry.id);
        grouped[groupId].duration += entry.duration;
      }
    });

    return Object.keys(grouped).map(function(key) {
      return grouped[key];
    });
  }

  /**
   * Adds 'gitlab' tag to given time entry
   *
   * @param {Object} entry
   */
  async addTag(entry) {
    let self = this;

    // Add 'gitlab' tag to all grouped time entries
    // if grouped or to the single time entry otherwise
    await new Promise(function(resolve, reject) {
      self.client.addTimeEntriesTags(entry.ids || [entry.id], ['gitlab'], function(error, response) {
        if (error) {
          return reject(error);
        }

        return resolve(response);
      });
    });
  }
}

module.exports = Toggl;
