const { Client, LocalAuth, MessageMedia, Message } = require('whatsapp-web.js');
const sharp = require('sharp')
const path = require('path')
const Jimp = require('jimp')
const fs = require('fs')
const Vibrant = require('node-vibrant')
const gm = require('gm');

const imgEndDir = 'C:/Users/ASUS/Desktop/MKTPLACE/finalEdit'
const imgbgdir = 'C:/Users/ASUS/Desktop/MKTPLACE/bgRemoved'
const overlaysDir = 'C:/Users/ASUS/Desktop/MKTPLACE/overlays';

const ly2 = fs.readFileSync(path.join(overlaysDir,'ly2.png'));//'C:/Users/ASUS/Desktop/MKTPLACE/overlays/ly2.png');
const ly3 = fs.readFileSync(path.join(overlaysDir,'ly3.png'));//'C:/Users/ASUS/Desktop/MKTPLACE/overlays/ly3.png');

module.exports ={
  imgToEdit: imgToEdit,
  //imgToPdf: imgToPdf,
  removeImgBg: removeImgBg
}

async function removeImgBg(image, filename){
  try{
  console.log('buffer: ',image)
  const imgNoBg = await new Promise((resolve,reject) => {
    gm(image)
    .fuzz(0.2 * 100 + '%')
    .resize(800,800)
    .transparent('black')
    .transparent('white')
    .write(path.join(imgbgdir,filename),(err)=>{
      if (err) {
        reject(err)
        console.error(err);
        } else {
          resolve(image);
        console.log('Background removed and saved as output.png');}
    })
  })
//return imgNoBg
} catch (error) {
  console.error('Error in removeImgBg:', error);
  throw error;
}
}

async function createImage(colors){
  const color = colors[0];
  /*
  const ly1Path = path.join(overlaysDir,'ly2.png')
  const ly2Path = path.join(overlaysDir,'ly3.png')*/
  const bg = new Jimp(2190,3000,color);/*
  const ly1 = (await Jimp.read(ly1Path)).resize(2000,2000)
  const ly2 = (await Jimp.read(ly2Path)).resize(2000,2400)
  const ly1Left = (bg.getWidth()-ly1.getWidth())/2
  const ly1Top = (bg.getHeight()-ly1.getHeight())/2
  bg.composite(ly1,ly1Left,ly1Top)
  bg.composite(ly2,ly1Left+((ly1.getWidth()-ly2.getWidth())/2),ly1Top)//ly1Top+((ly2.getHeight()-ly1.getHeight())/2))
  */
  return bg
}


async function mapNumberToLetters(number) {
  const mapping = {
    0: 'L', 
    1: 'Y', 
    2: 'Q', 
    3: 'Y', 
    4: 'M', 
    5: 'P', 
    6: 'O', 
    7: 'R', 
    8: 'T', 
    9: 'S'
  };
  const numberAsString = parseFloat(number).toFixed(2).replace('.', '');
  let letters = '';

  for (let i = 0; i < numberAsString.length; i++) {
    letters += mapping[numberAsString[i]];
  }

  return letters;
}

async function joinImages(images,imgMetadata,phNm){
console.log("🚀 ~ file: imgProc.js:66 ~ joinImages ~ imgMetadata:", imgMetadata)
console.log("🚀 ~ file: imgProc.js:66 ~ joinImages ~ images:", images)

const font = await Jimp.loadFont(Jimp.FONT_SANS_128_WHITE)
let finalImgs = []
const ly1Path = path.join(overlaysDir,'ly2.png')
const ly2Path = path.join(overlaysDir,'ly3.png')
const ly1 = (await Jimp.read(ly1Path)).resize(2000,2000)
const ly2 = (await Jimp.read(ly2Path)).resize(2000,2400)
if(images.length % 2 !== 0){
  let matchColors = [] 
  const imgPath = path.join(imgbgdir,images[images.length-1])
  const lastImg = Jimp.read(imgPath)
  await Vibrant.from(imgPath).getPalette().then((pallette) => {
    matchColors = Object.values(pallette).map((swatch) => swatch.hex);
  })
  const bg = await createImage(matchColors)
  const ly1Left = (bg.getWidth()-ly1.getWidth())/2
  const ly1Top = (bg.getHeight()-ly1.getHeight())/2
  //bg.composite((await lastImg).resize(600,600),20,600)
  bg.composite(ly1,ly1Left,ly1Top)
  bg.composite((await lastImg).resize(1900,2000),650,600)
  bg.composite((await lastImg).resize(1000,1000),100,1500)
  bg.composite(ly2,ly1Left+((ly1.getWidth()-ly2.getWidth())/2),ly1Top)
  for(let i = 0; i< bg.getWidth() ;i+=200){
    for (let j = 0; j< bg.getHeight() ;j+=200){
      //bg.print( await Jimp.loadFont(Jimp.FONT_SANS_32_BLACK),i,j,`h:${i},w: ${j}`)
      //console.log("🚀 ~ file: pruebas.js:154 ~ joinImages ~ `value height: ${i}, width: ${j}`:", `value height: ${i}, width: ${j}`)
    }
  }

  for(let prop in imgMetadata){
    switch (prop) {
      case 'Measure':
        bg.print(font,imgMetadata[prop].left,imgMetadata[prop].top,imgMetadata[prop].value.split('x')[0])
        console.log("🚀 ~ file: pruebas.js:122 ~ joinImages ~ imgMetadata[prop].value.split('x'):", imgMetadata[prop].value.split('x'))
        bg.print(font,imgMetadata[prop].left + 320,imgMetadata[prop].top,imgMetadata[prop].value.split('x')[1])
        break;
      case 'Cost':
        bg.print(font,imgMetadata[prop].left,imgMetadata[prop].top,await mapNumberToLetters(imgMetadata[prop].value))
        console.log("🚀 ~ file: imgProc.js:121 ~ joinImages ~ await mapNumberToLetters(imgMetadata[prop].value):", await mapNumberToLetters(imgMetadata[prop].value))
        break;
      default:
        bg.print(font,imgMetadata[prop].left,imgMetadata[prop].top,imgMetadata[prop].value)
        break;;
    }
  }
  await bg.writeAsync(`C:/Users/ASUS/Desktop/MKTPLACE/finalEdit/${phNm}_${(images.length-1)/2}.png`);
  finalImgs.unshift(`${phNm}_${(images.length-1)/2}.png`)
  console.log("🚀 ~ file: imgProc.js:104 ~ joinImages ~ finalImgs:", finalImgs)
  if (images.length === 1) {
    return finalImgs;
  } else {
    console.log(`Images = ${images.length}`);
  }
}

for(let i = 0; i < images.length - 1; i += 2 ){
  const imgEvenPath= path.join(imgbgdir,images[i]);
  const imgOddPath= path.join(imgbgdir,images[i+1]);
  
  const imgEven= await Jimp.read(imgEvenPath);
  const imgOdd= await Jimp.read(imgOddPath);

  let matchColors = [] 
  await Vibrant.from(imgEvenPath).getPalette().then((pallette) => {
    matchColors = Object.values(pallette).map((swatch) => swatch.hex);
  })
  const bg = await createImage(matchColors)
  const ly1Left = (bg.getWidth()-ly1.getWidth())/2
  const ly1Top = (bg.getHeight()-ly1.getHeight())/2
  bg.composite(ly1,ly1Left,ly1Top)
  bg.composite(imgEven.resize(1900,2000),650,600)
  bg.composite(imgOdd.resize(1000,1000),100,1500)
  bg.composite(ly2,ly1Left+((ly1.getWidth()-ly2.getWidth())/2),ly1Top)

  for(let prop in imgMetadata){
    switch (prop) {
      case 'Measure':
        bg.print(font,imgMetadata[prop].left,imgMetadata[prop].top,imgMetadata[prop].value.split('x')[0])
        console.log("🚀 ~ file: pruebas.js:122 ~ joinImages ~ imgMetadata[prop].value.split('x'):", imgMetadata[prop].value.split('x'))
        bg.print(font,imgMetadata[prop].left + 320,imgMetadata[prop].top,imgMetadata[prop].value.split('x')[1])
  
        break
      case 'Cost':
        bg.print(font,imgMetadata[prop].left,imgMetadata[prop].top,await mapNumberToLetters(imgMetadata[prop].value))
        console.log("🚀 ~ file: imgProc.js:157 ~ joinImages ~ await mapNumberToLetters(imgMetadata[prop].value):", await mapNumberToLetters(imgMetadata[prop].value))
        break
      default:
        bg.print(font,imgMetadata[prop].left,imgMetadata[prop].top,imgMetadata[prop].value)
        break;
    }
  }
  await bg.writeAsync(`C:/Users/ASUS/Desktop/MKTPLACE/finalEdit/${phNm}_${i/2}.png`);
  finalImgs.push(`${phNm}_${i/2}.png`)
  console.log("🚀 ~ file: imgProc.js:104 ~ joinImages ~ finalImgs:", finalImgs)
  return finalImgs
}
}

async function imgToEdit(phNm, users){
  imagesId = users[phNm]['services']['fbmkt']['imagesId']
  const imgMetadata = users[phNm]['services']['fbmkt']['imgMetadata']
  if(imagesId.length <= 0){
    return;
  }
  const finalImgs =  await joinImages(imagesId,imgMetadata, phNm)
  console.log("🚀 ~ file: imgProc.js:177 ~ imgToEdit ~ finalImgs:", finalImgs)
  return finalImgs
}

let a  = []
a = ['51962252080_0.png','51962252080_1.png','51962252080_2.png','51962252080_3.png','51962252080_4.png']
const imgMetadata= {
"Category": {
    "value":"Category Base",
    "top":50,
    "left":100
},
"Description": {
    "value":"Default Desc",
    "top":300,
    "left":100
},
"Measure": {
    "value": "999.99 x 999.99",
    "top":500,
    "left":600
},
"Cost": {
    "value":"SSS.SS",
    "top": 750,
    "left": 200
},
"wholeSale": {
    "value":"199.99",
    "top":1400,
    "left":680
},
"Price": {
    "value":"999.99",
    "top":2650,
    "left":200
},
"Box": {
    "value":"9999",
    "top":2700,
    "left":1250
}
}

//joinImages(a,imgMetadata,'935403277')