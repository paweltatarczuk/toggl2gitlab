'use strict';

require('dotenv').config()

const program = require('commander');
const Toggl = require('./lib/toggl');
const Gitlab = require('./lib/gitlab');

program
  .option('-g, --group', 'group similar entries together', true)
  .option('-w, --wid <wid>', 'limit entries to specific Toggl workspace')
  // .option('-d, --date <date>', 'limit entries to specific date' )
  .arguments('<date>')
  .action(async function (date) {
    // Prepare start and end date
    let startDate = new Date(Date.parse(date));
    let endDate = new Date(Date.parse(date));
    startDate.setHours(0, 0, 0, 0);
    endDate.setHours(23, 59, 59, 999);

    let toggl = new Toggl(process.env.TOGGL_TOKEN);
    let gitlab = new Gitlab(process.env.GITLAB_URL, process.env.GITLAB_TOKEN);

    // Fetch toggl time entries
    let entries = await toggl.fetchTimeEntries(
      startDate,
      endDate,
      program.group,
      program.wid
    );

    // Create gitlab entries
    entries.forEach(async function(entry) {
      // Push time spent to gitlab
      let result = await gitlab.createTimeEntry(entry);

      if (!result) {
        console.log('Entry ' + entry.description + ' skipped');
        return;
      }

      await toggl.addTag(entry);
    });
  });

program.parse(process.argv);

