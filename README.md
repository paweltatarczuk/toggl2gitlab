# Toggl2Gitlab [![Build Status](https://travis-ci.org/trawiasty/toggl2gitlab.svg?branch=master)](https://travis-ci.org/trawiasty/toggl2gitlab)

Simple tool for migrating Toggle time entries into Gitlab as time spents.

## Installation

1. Clone this repo

```
$ git clone https://github.com/trawiasty/toggl2gitlab
```

2. Install npm dependencies

```
toggl2gitlab$ npm install --no-dev .
```

3. Copy and update environment file

```
toggl2gitlab$ cp .env.example .env
toggl2gitlab$ edit .env
```

## Usage

All entries that match the regular expression below will be send to Gitlab as a time spent.

_Regular expression_: `/\(#(\d+)\) · Issues · ([^·]+) · GitLab(\s*:\s*(.+))?/`

For example, entry:

`... #(224) · Issues · Foo / Bar · Gitlab : Working on bar`

will be logged to issue `#224` in project `Bar` under group `Foo` with an additional description `Working on bar`.

The description (following `:`) is optional.

After the toggl entry is sent it will be tagged with `gitlab` label, ensuring the time spent is only added once.

```
toggl2gitlab$ node index.js -h
Usage: index [options] <date>

Options:
  -g, --group      group similar entries together (default: true)
  -w, --wid <wid>  limit entries to specific Toggl workspace
  -h, --help       output usage information
```

### Bash alias

You can use this simple bash alias, just replace `PATH/TO` with valid path:

```
File: ~/.bash_aliases
---
toggl2gitlab() {
        INPUT="day ago"
        if [ $# -ne 0 ]; then
                INPUT="$@"
        fi

        DATE="$(date -d "$INPUT" +%m-%d-%Y)"

        bash -c "cd /PATH/TO/toggl2gitlab && node index.js $DATE"
}
````

### How to use with Toggle extension

1. Download official Toggl Button extension for your broser.
2. Do not enable integration with gitlab.com, it produces incorrect title
3. Visit an issue page you want to track time for
4. Press right mouse button -> Start Timer
5. When done working on the issue, stop the Toggl timer
6. Run script with today's date
