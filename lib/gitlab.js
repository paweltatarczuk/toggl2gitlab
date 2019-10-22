'use strict';

const GitlabClient = require('gitlab').Gitlab;

/**
 * Gitlab class
 *
 * @class Gitlab
 */
class Gitlab {
  /**
   * Constructor
   *
   * @param {String} url
   * @param {String} token
   */
  constructor(url, token) {
    this.client = new GitlabClient({
      host: url,
      token: token,
    });

    // Map { projectFullName => projectId }
    this.projectsMap = null;
  }

  /**
   * Get project id by full name
   *
   * @param {String} name
   */
  async getProjectIdByFullName(name) {
    if (this.projectsMap === null) {
      this.projectsMap = this.client.Projects.all({'membership': true})
        .then(function(projects) {
          let map = {};

          projects.forEach(function(project) {
            map[project['name_with_namespace']] = project['id'];
          });

          return map;
        });
    }

    let map = await this.projectsMap;
    return map[name];
  }

  /**
   * Create time entry
   *
   * @param {Object} togglEntry
   * @param {Callable} callback
   */
  async createTimeEntry(togglEntry) {
    let entry = await this.taskEntryFromToggl(togglEntry);

    if (!entry) {
      return false;
    }

    await this.client.IssueNotes.create(entry.project_id, entry.issue_id, entry.body);
    return true;
  }

  /**
   * Converts toggl time entry to gitlab time entry
   *
   * @param {Object} data
   */
  async taskEntryFromToggl(data) {
    let description = data.description || '';
    let descriptionMatch = description.match(/\(#(\d+)\) · Issues · ([^·]+) · GitLab(\s*:\s*(.+))?/);

    if (!descriptionMatch) {
      return false;
    }

    let projectId = await this.getProjectIdByFullName(descriptionMatch[2]);
    let comment = descriptionMatch[4] ? descriptionMatch[4] : '';
    let date = data.start.replace(/T.+$/, '');

    let body = comment ? comment : 'Working on the issue';
    body += "\n\n";
    body += '/spend ' + data.duration + 's ' + date;

    return {
      'project_id': projectId,
      'issue_id': descriptionMatch[1],
      'body': body,
    };
  }

}

module.exports = Gitlab;
