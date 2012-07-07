/**
 * Multi-Git
 *
 * Command-line tools to work with directories of git repositories.
 */

var optimist = require('optimist'),
    colors = require('colors'),
    Table = require('cli-table'),
    git = require('gift'),
    path = require('path'),
    fs = require('fs'),
    async = require('async');

exports.commands = {
  status: status
};

var argv = optimist.argv;

// Output the status of found git repositories.
function status() {
  var tasks = [],
      cwd = process.cwd();

  findRepos(function(err, repos) {
    if (err) return console.log(err);
    for (var i in repos) {
      (function(repo) {
        tasks.push(function(done) {
          repo.status(done);
        });
      })(repos[i]);
    }
    async.series(tasks, function(err, results) {
      var row,
          col,
          res,
          file,
          table = new Table({
            head: ['Repo', 'Status'],
            style: {
              compact: true,
              'padding-left': 1,
              'padding-right': 1,
              head: ['white', 'bold']
            }
          });

      for (var i in results) {
        res = results[i];
        dir = res.repo.path.replace(cwd + '/', '');
        if (res.clean) {
          table.push([dir, 'Clean'.green]);
        }
        else {
          table.push([dir, 'Changed'.red]);
          if (argv.v) {
            for (var name in res.files) {
              table.push(['', '  ' + name]);
            }
          }
        }
      }

      console.log(table.toString());
    });
  });
}

// Find and open all git repositories in the CWD.
function findRepos(callback) {
  var cwd = process.cwd(),
      tasks = [];

  fs.readdir(cwd, function(err, files) {
    if (err) return callback(err);

    var repos = [], i;
    for (i = 0; i < files.length; i++) {
      if (fs.existsSync(path.join(cwd, files[i], '.git'))) {
        repos.push(path.join(cwd, files[i]));
      }
    }

    if (repos.length === 0) {
      return callback(new Error('No repositories found'));
    }

    for (var i in repos) {
      (function(dir) {
        tasks.push(function(done) {
          done(err, git(dir));
        });
      })(repos[i]);
    }

    async.series(tasks, function(err, results) {
      callback(err, results);
    });
  });
}
