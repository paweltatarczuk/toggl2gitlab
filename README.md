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

```
toggl2gitlab$ node index.js -h
Usage: index [options] <date>

Options:
  -g, --group      group similar entries together (default: true)
  -w, --wid <wid>  limit entries to specific Toggl workspace
  -h, --help       output usage information
```
