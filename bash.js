const fs = require('fs');
const chalk = require('chalk');

const bash = {
  pwd: function (stdin, file, done) {
    done(process.env.PWD);
  },

  echo: function (stdin, file, done) {
    if (file[0] === '$') {
      file = file.slice(1);
      if (Object.keys(process.env).includes(file)) {
        done(process.env[file]);
      } else {
        throw 'env variable not found';
      }
    } else {
      done(file);
    }
  },

  ls: function (stdin, file, done) {
    fs.readdir('.', (err, data) => {
      if (err) throw err;
      done(data.toString());
    });
  },

  getDateString: function (stdin, file, done) {
    let today = new Date();
    let dd = today.getDate();
    let mm = today.getMonth() + 1; //January is 0!
    let yyyy = today.getFullYear();
    if (dd < 10) {
      dd = '0' + dd
    }
    if (mm < 10) {
      mm = '0' + mm
    }
    today = mm + '/' + dd + '/' + yyyy;
    done(today);
  },

  getFilePart: function (data, type, done) {
    let str = data.toString();
    if (type === 'head') {
      str = str.split('\n').slice(0, 5).join('\n');
    }
    if (type === 'tail') {
      str = str.split('\n').slice(-5).join('\n');
    }
    if (done) {
      if (type !== 'head' && type !== 'tail' && type !== 'cat') {
        done('Unfortunately we cannot pipe with that command');
      } else {
        done(str);
      }
    } else {
      return str;
    }
  },

  cat: function (stdin, file, done) {
    fs.readFile(file, (err, data) => {
      if (err) throw err;
      let str = this.getFilePart(data, 'cat');
      done.call(this, str, stdin);
    });
  },

  head: function (stdin, file, done) {
    fs.readFile(file, (err, data) => {
      if (err) throw err;
      let str = this.getFilePart(data, 'head');
      done.call(this, str, stdin);
    });
  },

  tail: function (stdin, file, done) {
    fs.readFile(file, (err, data) => {
      if (err) throw err;
      let str = this.getFilePart(data, 'head');
      done(str, stdin);
    });
  },

  printOrPipe: function (result, stdin) {
    const print = (data) => {
      process.stdout.write(chalk.green(data));
      process.stdout.write(chalk.yellow('\nprompt > '));
    };
    if (!stdin) {
      print(result);
    } else {
      this.getFilePart(result, stdin, this.printOrPipe);
    }
  },

  runCmd: function (cmd, arg, stdin, done, piped) {
    switch (cmd) {
      case 'pwd':
        this.pwd(stdin, arg, done);
        break;
      case 'echo':
        this.echo(stdin, arg, done);
        break;
      case 'ls':
        this.ls(stdin, arg, done);
        break;
      case 'date':
        this.getDateString(stdin, arg, done);
        break;
      case 'cat':
        this.cat(stdin, arg, done);
        break;
      case 'head':
        this.head(stdin, arg, done);
        break;
      case 'tail':
        this.tail(stdin, arg, done);
        break;
      default:
        console.log('oh no error ERROR');
    }
  },

  init: function () {
    process.stdout.write(chalk.yellow('prompt > '));
    process.stdin.on('data', (data) => {
      let cmdString = data.toString().trim();
      let [cmd, arg, stdin] = cmdString.split(/[\s|]+/);
      this.runCmd(cmd, arg, stdin, this.printOrPipe);
    });
  }
};

bash.init();
