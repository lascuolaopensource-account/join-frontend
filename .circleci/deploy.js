// deploy.js
const fs = require('fs');
const sftp = require('ssh2-sftp-client');
const glob = require('glob');

const basePath = './dist';
const destinationPath = '/upload';

const localConfig = {
  host: null,
  username: null,
  password: null,
  port: null,
};

const IS_LOG_ENABLED = true;
const LOG_SUCCESS = true;
const LOG_FAILED = true;

const localLog = (isSuccess, log) => {
  if(!IS_LOG_ENABLED) return false;

  if(LOG_SUCCESS && isSuccess) {
    console.log(`SUCCESS => ${log}`);
  }
  
  if(LOG_FAILED && !isSuccess) {
    console.log(`FAILED => ${log}`);
  }
} 
const client = new sftp('test');

async function createDirectory(destination) {
  try {
    localLog(true, `mkdir: ${destination}`);
    await client.mkdir(destination, true);
    localLog(true, `mkdir: ${destination}`);
    return true;
  } catch(err) {
    localLog(false, `mkdir: ${destination}`);
    localLog(false, err);
    return false;
  }
}

async function uploadFile(file, destination) {
  try {
    localLog(true, `fastPut: ${destination}`);
    await client.fastPut(file, destination);
    localLog(true, `fastPut: ${file} => ${destination}`);
    return true;
  } catch(err) {
    localLog(false, `fastPut: ${file} => ${destination}`);
    localLog(false, err);
    return false;
  }
}

async function handlePath(path) {
  const relativeFile = path.replace(`${basePath}/`, '');
  let destination = null;
  try {
    destination = await client.realPath(`${destinationPath}/${relativeFile}`);
  } catch(err) {
    localLog(`realPath: ${destinationPath}/${relativeFile}: FAILED!`);
  }
  if (fs.lstatSync(path).isDirectory()) {
    return destination ? await createDirectory(destination) : false;
  }
  return destination ? await uploadFile(path, destination) : false;
}

(async function() {
  await client.connect(localConfig);
  localLog(true, `connessione a ${localConfig.host}`);
  const paths = glob.sync(`${basePath}/**/*`);
  for(let path of paths) {
    await handlePath(path);
  }
  localLog(true, `chiusura connessione a ${localConfig.host}`);
  await client.end();
})();
