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
    repos.forEach(function(repo) {
      tasks.push(function(done) {
        repo.status(function(err, status) {
          if (err) return done(err);
          repo.branch(function(err, head) {
            if (err) return done(err);
            done(null, {status: status, head: head});
          });
        });
      });
    });
    async.series(tasks, function(err, results) {
      var row,
          col,
          res,
          file,
          head = [],
          table,
          symbol;

      head.push('Repo');
      if (argv.b) {
        head.push('Branch');
      }
      head.push('Status');

      table = new Table({
        head: head,
        style: {
          compact: true,
          'padding-left': 1,
          'padding-right': 1,
          head: ['white', 'bold']
        }
      });

      results.forEach(function(res) {
        var row = [];

        row.push(res.status.repo.path.replace(cwd + '/', ''));
        if (argv.b) {
          row.push(res.head.name);
        }
        row.push(res.status.clean ? 'Clean'.green : 'Changed'.red);
        table.push(row);

        if (argv.v) {
          for (var name in res.status.files) {
            row = [];
            row.push('');
            if (argv.b) {
              row.push('');
            }
            console.log(res.status.files[name]);
            switch (res.status.files[name].type) {
              case 'A':
                symbol = '+'.green; break;
              case 'D':
                symbol = '-'.red; break;
              case 'M':
                symbol = '*'.yellow; break;
              default:
                symbol = '~'.grey; break;
            }
            row.push(' ' + symbol + ' ' + name);
            table.push(row);
          }
        }
      });

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

    var repos = [];
    files.forEach(function(file) {
      if (fs.existsSync(path.join(cwd, file, '.git'))) {
        repos.push(path.join(cwd, file));
      }
    });

    if (repos.length === 0) {
      return callback(new Error('No repositories found'));
    }

    repos.forEach(function(dir) {
      tasks.push(function(done) {
        done(err, git(dir));
      });
    });

    async.series(tasks, function(err, results) {
      callback(err, results);
    });
  });
}
