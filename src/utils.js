
import fs from 'fs'

/* Helper function to create dirs if necessary
 *  @directory - directory to be emptied
 */
 export async function createDirIfDoesntExist(dir) {
  console.log("I am creating "+dir);
  if (!fs.existsSync(dir)){
      fs.mkdirSync(dir);
  }
}

/* Helper function to delete files from dir
 * this should be error checked to make sure only files in  this project can be removed
 *  @directory - directory to be emptied
 */
export function removeAllFilesFromDir(directory) {

  fs.readdir(UPLOAD_PATH+directory, (err, files) => {
    files.forEach(file => {
      fs.unlink(UPLOAD_PATH+directory+"/"+file, (err) => {
        if (err) {
            console.log("Failed to delete local file from "+UPLOAD_PATH+" "+directory+": "+err);
        } else {
            // console.log("successfully deleted local file from ./uploads/"+directory);                                
        }
      });
    });
  });
}

module.exports.createDirIfDoesntExist = createDirIfDoesntExist;
module.exports.removeAllFilesFromDir = removeAllFilesFromDir;