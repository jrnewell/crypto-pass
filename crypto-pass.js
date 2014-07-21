#!/usr/bin/env node

var crypto = require('crypto');
var prompt = require('prompt');
var jsonfile = require('jsonfile');
var commander = require('commander');
var path = require('path');
var fs = require('fs');
var exec = require('child_process').exec;

var cache = {};
var cacheFile;

commander
  .version(require('./package.json').version)
  .option('-c, --config <path>', 'configuration file path');

commander
  .command('get [entry]')
  .description('retrieve password entry')
  .action(runCommand(getPassword));

commander
  .command('new [entry]')
  .description('create new password entry')
  .action(runCommand(newPassword));

commander
  .command('list')
  .description('list password entries')
  .action(runCommand(listEntries));

commander
  .command('meta [entry]')
  .description('output encryption metadata for password entry')
  .action(runCommand(entryMetadata));

commander
  .command('del [entry]')
  .description('delete password entry')
  .action(runCommand(deleteEntry));

commander
  .command('backup')
  .description('backup config file using sftp')
  .action(runCommand(backupCache));

commander
  .command('*')
  .description('output usage information')
  .action(commander.help);

commander.parse(process.argv);

if (commander.args.length < 1) {
  runCommand(getPassword)();
}

function getUserHome() {
  return process.env[(process.platform == 'win32') ? 'USERPROFILE' : 'HOME'];
}

function runCommand(cmd) {
  return function() {
    cacheFile = (commander.config ? commander.config : path.join(getUserHome(), ".crypto-pass"));

    if (fs.existsSync(cacheFile)) {
      cache = jsonfile.readFileSync(cacheFile);
    }
    cmd.apply(this, arguments);
  }
}

prompt.message = "(crypto-pass)";

function confirmPrompt(message, callback) {
  var promptConfig = {
    name: 'yesno',
    message: (message || 'are you sure?'),
    validator: /y[es]*|n[o]?/,
    warning: 'Must respond yes or no',
    default: 'no'
  };

  prompt.get(promptConfig, function (err, results) {
    if (err) {
      return callback(err);
    }
    confirm = (results.yesno && (results.yesno === 'yes' || results.yesno === 'y')) ? true : false;
    return callback(null, confirm);
  });
}

function getPassword(name) {
  var promptConfig = {
    properties: {
      name: {
        description: "Type in entry name",
        type: "string",
        required: true,
        conform: function (value) {
          return cache.hasOwnProperty(value);
        }
      },
      password: {
        description: "Type in your password",
        type: "string",
        hidden: true,
        required: true
      }
    }
  };

  if (name && cache.hasOwnProperty(name)) {
    console.log("Retrieving password for entry " + name);
    delete promptConfig.properties.name;
  }
  else {
    console.log("Retrieving password");
    name = null;
  }

  prompt.start();
  prompt.get(promptConfig, function (err, results) {
    if (err) {
      console.error(err);
      process.exit(1);
    }
    var cacheEntry = (name ? cache[name] : cache[results.name]);
    var password = results.password;
    var salt = new Buffer(cacheEntry.salt, 'base64');
    var keyLength = cacheEntry.keyLength;
    var iterations = cacheEntry.iterations;

    key = crypto.pbkdf2Sync(password, salt, iterations, keyLength);
    console.log("Generated Key");
    console.log("------------------");
    console.log("Key: " + key.toString('base64'));

    process.exit(0);
  });
}

function newPassword(name) {
  var promptConfig = {
    properties: {
      name: {
        description: "Type in entry name",
        type: "string",
        required: true
      },
      password: {
        description: "Type in your password",
        type: "string",
        hidden: true,
        required: true
      },
      passwordConfirm: {
        message: "Retype in your password",
        type: "string",
        hidden: true,
        required: true,
        warning: 'Password must be the same as the previous password',
        conform: function(value) {
          var name = prompt.history('password').value;
          return (value === name);
        }
      },
      keyLength: {
        description: "Length of generated key in bytes",
        pattern: /^[0-9]+$/,
        default: 32,
        required: true
      },
      iterations: {
        description: "Number of iterations in PBKDF2",
         pattern: /^[0-9]+$/,
        default: 100000,
        required: true
      }
    }
  };

  if (name && cache.hasOwnProperty(name)) {
    console.log("Creating new password for entry " + name);
    delete promptConfig.properties.name;
  }
  else {
    console.log("Creating new password");
    name = null;
  }

  prompt.start();
  prompt.get(promptConfig, function (err, results) {
    if (err) {
      console.error(err);
      process.exit(1);
    }

    var _name = (name ? name : results.name);
    var setNewPassword = function() {
      var password = results.password;
      var salt = crypto.randomBytes(16);
      var keyLength = parseInt(results.keyLength);
      var iterations = parseInt(results.iterations);

      console.log("Storing data in " + cacheFile);
      cache[_name] = {
        salt: salt.toString('base64'),
        keyLength: keyLength,
        iterations: iterations
      };
      jsonfile.writeFileSync(cacheFile, cache);

      key = crypto.pbkdf2Sync(password, salt, iterations, keyLength);
      console.log("Generated Key");
      console.log("------------------");
      console.log("Key: " + key.toString('base64'));

      console.log("\nEntry Metadata");
      console.log("------------------");
      console.log("Salt: " + salt.toString('base64'));
      console.log("Key Length: " + keyLength);
      console.log("Iterations: " + iterations);
      process.exit(0);
    };

    if (cache.hasOwnProperty(_name)) {
      confirmPrompt("Entry '" + _name + "' already exists.  Are you sure you want to overwrite?", function(err, confirm) {
        if (err) {
          console.error(err);
          process.exit(1);
        }

        if (confirm) {
          setNewPassword();
        }
      });
    }
    else {
      setNewPassword();
    }
  });
}

function listEntries() {
  console.log("Entry Names");
  console.log("------------------");
  for (var key in cache) {
    console.log(key);
  }
}

function entryMetadata(name) {
  var promptConfig = {
    properties: {
      name: {
        description: "Type in entry name",
        type: "string",
        required: true,
        conform: function (value) {
          return cache.hasOwnProperty(value);
        }
      }
    }
  };

  if (name && cache.hasOwnProperty(name)) {
    console.log("Retrieving encryption metadata for entry " + name);
    delete promptConfig.properties.name;
  }
  else {
    console.log("Retrieving encryption metadata");
    name = null;
  }

  prompt.start();
  prompt.get(promptConfig, function (err, results) {
    if (err) {
      console.error(err);
      process.exit(1);
    }
    var cacheEntry = (name ? cache[name] : cache[results.name]);
    var salt = new Buffer(cacheEntry.salt, 'base64');
    var keyLength = cacheEntry.keyLength;
    var iterations = cacheEntry.iterations;

    console.log("Entry Metadata");
    console.log("------------------");
    console.log("Salt: " + salt.toString('base64'));
    console.log("Key Length: " + keyLength);
    console.log("Iterations: " + iterations);
    process.exit(0);
  });
}

function deleteEntry(name) {
  var promptConfig = {
    properties: {
      name: {
        description: "Type in entry name",
        type: "string",
        required: true,
        conform: function (value) {
          return cache.hasOwnProperty(value);
        }
      }
    }
  };

  if (name && cache.hasOwnProperty(name)) {
    console.log("Deleting password for entry " + name);
    delete promptConfig.properties.name;
  }
  else {
    console.log("Deleting password");
    name = null;
  }

  prompt.start();
  prompt.get(promptConfig, function (err, results) {
    if (err) {
      console.error(err);
      process.exit(1);
    }

    var _name = (name ? name: results.name);
    confirmPrompt("Are you sure you want to delete entry '" + _name + "' ?", function(err, confirm) {
      if (err) {
        console.error(err);
        process.exit(1);
      }

      if (confirm) {
        console.log("Deleting Entry");
        console.log("------------------");
        console.log(_name);

        delete cache[_name];
        jsonfile.writeFileSync(cacheFile, cache);
      }
    });
  });
}

function pad(num, size) {
  if (size > 10) {
    throw new Error("can only pad up to size 10");
  }
  var s = "0000000000" + num;
  return s.substr(s.length - size);
}

function backupCache() {
  var backupConfig = config.backupConfig;
  var backupConfigUsage = function() {
    console.log("config file needs the following json property:");
    console.log("'backupConfig': {");
    console.log("    'directory': 'Directory to copy file on remote machine'");
    console.log("    'host': 'Name of host (PuTTY session name for win, user@host for linux/mac)'");
    console.log("    'sftp': 'Option path of sftp program'");
    console.log("}");
    process.exit(1);
  }

  if (!backupConfig || !backupConfig.directory || !backupConfig.host) {
    backupConfigUsage();
  }

  console.log("Backing up config file to " + backupConfig.host);

  var now = new Date();
  var suffix = "" + now.getFullYear() + pad((now.getMonth() + 1), 2) + pad(now.getDate(), 2) +
    pad(now.getHours(), 2) + pad(now.getMinutes(), 2) + pad(now.getSeconds(), 2);

  var cmd;
  if (backupConfig.sftp) {
    cmd = backupConfig.sftp;
  }
  else {
    cmd = (process.platform == 'win32') ? "\"C:\\Program Files\\PuTTY\\psftp.exe\"" : "sftp";
  }

  cmd += (process.platform == 'win32' ? " -load " : " ") + backupConfig.host;

  console.log(cmd);
  var child = exec(cmd + backupConfig.host, function(err, stdout, stderr){
    if (err) {
      console.error(err);
      process.exit(1);
    }
    console.error('stderr: ' + stderr);
    console.log('stdout: ' + stdout);
  });

  child.stdin.write("cd " + backupConfig.directory + "\n");
  child.stdin.write("put " + cacheFile + "\n");
  child.stdin.write("ren .crypto-pass crypto-pass." + suffix + "\n");
  child.stdin.end("bye\n");
}
