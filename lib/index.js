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
    exec = require('child_process').exec,
    async = require('async');

exports.commands = {
  status: status,
  pull: pull
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
          if (argv.b) {
            repo.branch(function(err, head) {
              if (err) return done(err);
              done(null, {status: status, head: head});
            });
          }
          else {
            done(null, {status: status});
          }
        });
      });
    });
    async.series(tasks, function(err, results) {
      if (err) return console.log(err);

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

// Pull and rebase all CLEAN git repos in the CWD.
function pull() {
  var tasks = [],
      cwd = process.cwd();

  findRepos(function(err, repos) {
    if (err) return console.log(err);
    repos.forEach(function(repo) {
      tasks.push(function(done) {
        repo.status(function(err, status) {
          var name = status.repo.path.replace(cwd + '/', '');
          if (!status.clean) {
            console.log('Skipped '.red + name.bold + ' (not clean)'.grey);
            done();
          }
          else {
            console.log('Pulling '.green + name.bold);
            process.chdir(status.repo.path);
            exec('git fetch', function(err, stdout, stderr) {
              if (err) return done(stderr);
              if (stdout && argv.v) console.log(indent(stdout));
              exec('git rebase', function(err, stdout, stderr) {
                if (err) return done(stderr);
                if (stdout && argv.v) console.log(indent(stdout));
                done(null);
              });
            });
          }
        });
      });
    });

    async.series(tasks, function(err, results) {
      if (err) {
        console.log('Error:'.red);
        console.log(err);
      }
      else {
        console.log('Done!');
      }
    });
  });
}

// Indent a block of text.
function indent(str, prefix) {
  prefix = prefix || '   ';
  var lines = str.split("\n");
  lines.forEach(function(line, i) {
    lines[i] = prefix + line;
  });
  return lines.join("\n");
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
