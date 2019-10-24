'use strict';

const assert = require('assert');
const sinon = require('sinon');
const { describe, before, after, it } = require('mocha');

let gitlab = new (require('../lib/gitlab'))('http://example.com', 'secret');

/**
 * Tests for 'Gitab' class
 */
describe('Gitlab', function() {

  before(function() {
    // Create gitlab client stub
    this.projectsAllStub = sinon.stub(gitlab.client.Projects, 'all');
    this.projectsAllStub.withArgs({'membership': true}).resolves([
      {
        'id': '123',
        'name_with_namespace': 'Sample group / Sample project',
      }
    ]);
  });

  after(function() {
    // Restore gitlab client stub
    this.projectsAllStub.restore();
  });

  /**
   * Test for 'Gitlab#createTimeEntry' method
   */
  describe('#createTimeEntry(timeEntry)', function() {
    it('should create new time entry', async function() {
      let data = {
        'id': 582566690,
        'wid': 1552930,
        'pid': 19463126,
        'billable': false,
        'start': '2017-04-21T12:19:22+00:00',
        'stop': '2017-04-21T13:05:14+00:00',
        'duration': 2752,
        'description': 'Sample issue title (#123) · Issues · Sample group / Sample project · GitLab',
        'duronly': false,
        'at': '2017-04-21T13:05:15+00:00',
        'uid': 2344416,
      };

      // Create gitlab client stub
      let createTimeEntry = sinon.stub(gitlab.client.IssueNotes, 'create');
      createTimeEntry.resolves(data);

      // Run method under test
      let result = await gitlab.createTimeEntry(data);

      createTimeEntry.restore();
      assert.equal(result, true);
    });
  });

  /**
   * Test for 'Gitlab#taskEntryFromToggl' method
   */
  describe('#taskEntryFromToggl(data)', function() {
    it(`should convert toggl time entry data into \
        gitlab task entry data`, async function() {
      let data = {
        'id': 582566690,
        'wid': 1552930,
        'pid': 19463126,
        'billable': false,
        'start': '2017-04-21T12:19:22+00:00',
        'stop': '2017-04-21T13:05:14+00:00',
        'duration': 2752,
        'description': 'Sample issue title (#123) · Issues · Sample group / Sample project · GitLab',
        'duronly': false,
        'at': '2017-04-21T13:05:15+00:00',
        'uid': 2344416,
      };

      let expected = {
        'issue_id': '123',
        'project_id': '123',
        'body': 'Working on the issue\n\n/spend 2752s 2017-04-21',
      };

      // Run method under test
      let result = await gitlab.taskEntryFromToggl(data);

      assert.deepEqual(result, expected);
    });

    it(`should convert toggl time entry data into \
        gitlab task entry data with comments`, async function() {
      let data = {
        'id': 582566690,
        'wid': 1552930,
        'pid': 19463126,
        'billable': false,
        'start': '2017-04-21T12:19:22+00:00',
        'stop': '2017-04-21T13:05:14+00:00',
        'duration': 2752,
        'description': 'Sample issue title (#123) · Issues · Sample group / Sample project · GitLab : Sample comment',
        'duronly': false,
        'at': '2017-04-21T13:05:15+00:00',
        'uid': 2344416,
      };

      let expected = {
        'issue_id': '123',
        'project_id': '123',
        'body': 'Sample comment\n\n/spend 2752s 2017-04-21',
      };

      // Run method under test
      let result = await gitlab.taskEntryFromToggl(data);

      assert.deepEqual(result, expected);
    });
  });
});
