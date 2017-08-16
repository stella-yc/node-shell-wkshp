const fs = require('fs');
const chalk = require('chalk');

const bash = {
  pwd: (stdin, file, done) => {
    done(process.env.PWD);
  },

};
const pwd = (stdin, file, done) => {
  done(process.env.PWD);
};

const echo = (stdin, file, done) => {
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
};

const ls = (stdin, file, done) => {
  fs.readdir('.', (err, data) => {
    if (err) throw err;
    done(data.toString());
  });
};

const getDateString = (stdin, file, done) => {
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
};

const runCmd = (cmd, arg, stdin, done, piped) => {
  if (piped) {
    switch (cmd) {
      case 'cat':
        cat(null, arg, null);
        break;
      case 'head':
        head(null, arg, null);
        break;
      case 'tail':
        tail(null, arg, null);
        break;
      default:
        console.log('that cannot be piped');
    }
  } else {
    switch (cmd) {
      case 'pwd':
        pwd(stdin, arg, done);
        break;
      case 'echo':
        echo(stdin, arg, done);
        break;
      case 'ls':
        ls(stdin, arg, done);
        break;
      case 'date':
        getDateString(stdin, arg, done);
        break;
      case 'cat':
        readFile('cat', stdin, arg, done);
        break;
      case 'head':
        readFile('head', stdin, arg, done);
        break;
      case 'tail':
        readFile('tail', stdin, arg, done);
        break;
      default:
        console.log('oh no error ERROR');
    }
  }
};

const printOrPipe = (result, stdin) => {
  const print = (result) => {
    process.stdout.write(chalk.green(result));
    process.stdout.write('\nprompt > ');
  };
  if (!stdin) {
    print(result);
  } else {
    runCmd(stdin, result, null, printOrPipe, true);
  }
};

const getFilePart = (data, type) => {
  let str = data.toString().split('\n');
  if (type === 'head') {
    return str.slice(0, 5).join('\n');
  } else {
    return str.slice(-5).join('\n');
  }
};

const cat = (err, data, stdin) => {
  printOrPipe(data, stdin);
};

const head = (err, data, stdin) => {
  printOrPipe(getFilePart(data, 'head'), stdin);
}

const tail = (err, data, stdin) => {
  printOrPipe(getFilePart(data, 'tail'), stdin);
}

const readFile = (type, stdin, file, done) => {
  if (type === 'cat') {
    fs.readFile(file, cat, stdin);
  }
  if (type === 'head') {
    fs.readFile(file, head, stdin);
  }
  if (type === 'tail') {
    fs.readFile(file, tail, stdin);
  }
};

process.stdout.write(chalk.yellow('prompt > '));
process.stdin.on('data', (data) => {
  let cmdString = data.toString().trim();
  let [cmd, arg, stdin] = cmdString.split(/[\s|]+/);
  console.log('cmd', cmd);
  runCmd(cmd, arg, stdin, printOrPipe);
});

