'use strict';

const assert = require('assert');
const sinon = require('sinon');
const { describe, it } = require('mocha');

let toggl = new (require('../lib/toggl'))('secret');

/**
 * Tests for 'Toggl' class
 */
describe('Toggl', function() {
  /**
   * Test for 'Toggl#fetchTimeEntries' method
   *   - without grouping
   *   - without workspace filtering
   */
  describe('#fetchTimeEntries(false, null)', function() {
    it('should return entries without \'gitlab\' tag', async function() {
      let timeEntries = [
        {id: 1, tags: ['sample-tag']},
        {id: 2, tags: ['gitlab']},
        {id: 3, tags: ['sample-tag', 'gitlab']},
      ];

      // Create toggl client stub
      let getTimeEntries = sinon.stub(toggl.client, 'getTimeEntries');
      getTimeEntries.yields(null, timeEntries);

      // Run method under test
      let result = await toggl.fetchTimeEntries(null, null, false, null);

      getTimeEntries.restore();
      assert.deepEqual(result, timeEntries.slice(0, 1));
    });
  });

  /**
   * Test for 'Toggl#fetchTimeEntries' method
   *   - without grouping
   *   - with workspace filtering
   */
  describe('#fetchTimeEntries(false, 1234)', function() {
    it('should return entries without \'gitlab\' tag', async function() {
      let timeEntries = [
        {id: 1, wid: 1234, tags: ['sample-tag']},
        {id: 2, wid: '1234', tags: ['gitlab']},
        {id: 3, wid: 4321, tags: ['sample-tag', 'gitlab']},
      ];

      // Create toggl client stub
      let getTimeEntries = sinon.stub(toggl.client, 'getTimeEntries');
      getTimeEntries.yields(null, timeEntries);

      // Run method under test
      let result = await toggl.fetchTimeEntries(null, null, false, 1234);

      getTimeEntries.restore();
      assert.deepEqual(result, timeEntries.slice(0, 1));
    });
  });

  /**
   * Test for 'Toggl#fetchTimeEntries' method
   *   - with grouping
   *   - without workspace filtering
   */
  describe('#fetchTimeEntries(true, null)', function() {
    it('should return entries without \'gitlab\' tag', async function() {
      let timeEntries = [
        {id: 1, duration: 1000, tags: ['sample-tag']},
        {id: 2, duration: 2000, tags: ['gitlab']},
        {id: 3, duration: 500, tags: ['sample-tag', 'gitlab']},
        {id: 4, duration: 1200, tags: ['sample-tag']},
        {id: 5, duration: 3600},
        {id: 6, duration: 2500, tags: ['other-tag', 'sample-tag']},
        {id: 7, duration: 200},
        {id: 8, duration: 1900, tags: ['sample-tag', 'other-tag']},
      ];

      // Create toggl client stub
      let getTimeEntries = sinon.stub(toggl.client, 'getTimeEntries');
      getTimeEntries.yields(null, timeEntries);

      // Run method under test
      let result = await toggl.fetchTimeEntries(null, null, true, null);

      // Expected timeEntries
      let expectedTimeEntries = [
        {id: 1, duration: 2200, tags: ['sample-tag'], ids: [1, 4]},
        {id: 5, duration: 3800, ids: [5, 7]},
        {id: 6, duration: 4400, tags: ['other-tag', 'sample-tag'], ids: [6, 8]},
      ];

      getTimeEntries.restore();
      assert.deepEqual(result, expectedTimeEntries);
    });
  });

  /**
   * Test for 'Toggl#addTagToTimeEntry' method
   */
  describe('#addTag(timeEntry)', function() {
    it('should add \'gitlab\' tag to given time entry', async function() {
      let data = {
        id: 4,
      };

      // Create toggl client stub
      let addTimeEntriesTags = sinon.stub(toggl.client, 'addTimeEntriesTags');
      addTimeEntriesTags.withArgs([4], ['gitlab']).yields(null);

      // Run method under test
      let result = await toggl.addTag(data);

      addTimeEntriesTags.restore();
      assert.equal(result, null);
    });
  });
});
