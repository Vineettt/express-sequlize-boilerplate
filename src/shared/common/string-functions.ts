const removeExtension = (fileName: string) => {
  return fileName.split(".").slice(0, -1).join(".");
};

const lastElement = (fileName: string, separator: string) => {
  let array = fileName.split(separator);
  if(array.length > 0){
    return array[array.length-1];
  }
  return ""
}

const replaceStringPlaceHolder =(text: string, rSArray: any[]) =>{
  for (let index = 0; index < rSArray?.length; index++) {
    text = text.replace(`%%${index+1}`, rSArray[index]);
  }
  return text;
}

module.exports = { removeExtension, lastElement, replaceStringPlaceHolder };
