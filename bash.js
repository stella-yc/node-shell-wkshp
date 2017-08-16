const fs = require('fs');
const chalk = require('chalk');

const cat = (err, data, stdin) => {
  printOrPipe(data, stdin);
};

const head = (err, data, stdin) => {
  printOrPipe(getFilePart(data, 'head'), stdin);
}

const tail = (err, data) => {
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

const printOrPipe = (result, stdin) => {
  const print = (result) => {
    process.stdout.write(chalk.green(result));
    process.stdout.write('\nprompt > ');
  };
  if (!stdin) {
    print(result);
  } else {
    if (stdin === 'cat') {
      cat(null, result);
    }
    if (stdin === 'head') {
      head(null, result);
    }
    if (stdin === 'tail') {
      tail(null, result);
    }
  }
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

const runCmd = (cmd, arg, stdin, done) => {
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
      cat(stdin, arg, done);
      break;
    case 'head':
      head(stdin, arg, done);
      break;
    case 'tail':
      tail(stdin, arg, done);
      break;
    default:
      console.log('oh no error ERROR');
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

// const printFile = (err, data) => {
//   if (err) throw err;
//   if (!type || type === 'cat') {
//     done(data, stdin, runCmd);
//   } else {
//     done(getFilePart(data, type), stdin, runCmd);
//   }
// };





process.stdout.write(chalk.yellow('prompt > '));
process.stdin.on('data', (data) => {
  let cmdString = data.toString().trim();
  let [cmd, arg, stdin] = cmdString.split(/[\s|]+/);
  console.log('cmd', cmd);
  runCmd(cmd, arg, stdin, printOrPipe);
});

