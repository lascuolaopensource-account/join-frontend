// deploy.js
const fs = require('fs');
const Client = require('ssh2-sftp-client');
const glob = require('glob');

const basePath = './dist';
const destinationPath = '/httpdocs/sos';
const config = {
  // We store the credentials for
  // our SFTP server as environemnt
  // variables for security reasons.
  host: process.env.SFTPHOST,
  port: process.env.SFTPPORT,
  password: process.env.SFTPPASS,
  user: process.env.SFTPUSERNAME,
};
const sftpClient = new Client();

console.log("ci provo");

sftpClient.connect(config);

sftpClient.on('ready', () => {
  console.log("connesso!");
  // Get an array of all files and directories
  // in the given base path and send them to the
  // `handlePath()` function to decide if a
  // directory is created on the server or the
  // file is uploaded.
  glob.sync(`${basePath}/**/*`).forEach(handlePath);
  //cleanupRemoteDirectory(destinationPath);
});

function createDirectory(destination) {
  return sftpClient.mkdir(destination, true, (error) => {
    if (error) throw error;

    sftpClient.end();
  });
}

function uploadFile(file, destination) {
  
  sftpClient.connect(config);
  sftpClient.put(file, destination, (error) => {
    if (error) throw error;

    console.log(`${file} => ${destination}`);
    sftpClient.end();
  });
}

// Check if the path is a directory and
// either create the directory on the server
// if it is a directory, or upload the file
// if it is a file.
function handlePath(path) {
  const relativeFile = path.replace(`${basePath}/`, '');
  const destination = `${destinationPath}/${relativeFile}`;

  if (fs.lstatSync(path).isDirectory()) {
    return createDirectory(destination);
  }

  return uploadFile(path, destination);
}

const EXPIRATION_DATE_IN_DAYS = 7;

function isExpired(date) {
  const oneDayInMilliseconds = 86400000;
  const timestamp = new Date(date).getTime();
  const expirationTimestamp = Date.now() - (oneDayInMilliseconds * EXPIRATION_DATE_IN_DAYS);

  return timestamp < expirationTimestamp;
}

function cleanup(pathObject, directory) {
  if (pathObject.name === '.' || pathObject.name === '..') return;

  const path = `${directory}/${pathObject.name}`;

  // If the current path is a directory
  // we recursively check the files in it.
  if (pathObject.type === 'd') {
    return cleanupRemoteDirectory(path);
  }

  if (isExpired(pathObject.date)) {
    sftpClient.delete(path, (error) => {
      if (error) throw error;

      console.log(`Removed: ${path}`);
      sftpClient.end();
    });
  }
}

function cleanupRemoteDirectory(directory) {
  return sftpClient.list(directory, (error, pathObjects) => {
    if (error) throw error;

    pathObjects.forEach(pathObject => cleanup(pathObject, directory));
    sftpClient.end();
  });
}

