const sharp = require('sharp')
const path = require('path')
const Jimp = require('jimp')
const fs = require('fs')
const Vibrant = require('node-vibrant')

const imgEndDir = 'C:/Users/ASUS/Desktop/MKTPLACE/finalEdit'
const imgbgdir = 'C:/Users/ASUS/Desktop/MKTPLACE/bgRemoved'
const overlaysDir = 'C:/Users/ASUS/Desktop/MKTPLACE/overlays';
const testImg = 'C:/Users/ASUS/Desktop/MKTPLACE/wtspImages';

const ly2 = fs.readFileSync(path.join(overlaysDir,'ly2.png'));//'C:/Users/ASUS/Desktop/MKTPLACE/overlays/ly2.png');
const ly3 = fs.readFileSync(path.join(overlaysDir,'ly3.png'));//'C:/Users/ASUS/Desktop/MKTPLACE/overlays/ly3.png');

/*
async function joinImages(images){
  let endImg = []
  let matchColors = [] 
  await Vibrant.from(path.join(imgbgdir,images[0])).getPalette()
  .then((palette) => {
    matchColors = Object.values(palette).map((swatch) => swatch.hex);
  });
  let color = matchColors[0]
  console.log("🚀 ~ file: pruebas.js:24 ~ joinImages ~ color:", color)
  //const bg = await Jimp.read(path.join(imgbgdir,'PrintMerge2-1.jpg'))// new Jimp(2190,3000,{ r: color[0], g: color[1], b: color[2], alpha: 1 })
  const bg = new Jimp(256, 256,color)//{ r: color[0], g: color[1], b: color[2]}) 
  
  const font = await Jimp.loadFont(Jimp.FONT_SANS_128_BLACK); 
  bg.resize(2190,3000)
  bg.composite(await (await Jimp.read(ly2)),25,500)
  bg.composite(await (await Jimp.read(ly3)),25,500)
  bg.print(font, 300,500,'category')
  bg.print(font, 500,600,'description')
  bg.print(font, 600,700,'size')
  bg.print(font, 700,800,'cost')
  bg.print(font, 800,900,'xMayor')
  bg.print(font, 900,1000,'Price')
  bg.print(font, 1000,1100,'qtyxBox')
  bg.write('C:/Users/ASUS/Desktop/MKTPLACE/finalEdit/fin.jpg');

  //lastImg = await Jimp.read(path.join(imgbgdir,images[0]));
  //console.log("🚀 ~ file: pruebas.js:27 ~ joinImages ~ lastImg:", lastImg)

  if (images.length % 2 !== 0){
    /*bg.composite(await Jimp.read(ly2),50,0)
    bg.composite(Jimp.read(ly3),50,0)
    //bg.composite(lastImg,50,0)
    bg.write(imgEndDir)
    endImg.push(bg)
    return;
  }
  for(let i = 0; i < images.length - 1; i += 2 ){
    const imgEven= path.join(imgbgdir,images[i]);
    console.log("🚀 ~ file: test.js:49 ~ imgToEdit ~ imgEven:", imgEven)
    const imgOdd= path.join(imgbgdir,images[i+1]);
    console.log("🚀 ~ file: test.js:51 ~ imgToEdit ~ imgOdd:", imgOdd)
    //const jly2 = await Jimp.read('C:/Users/ASUS/Desktop/MKTPLACE/overlays/ly2.jpg')
    //bg.composite(jly2)
    //bg.composite(ly3,50,0)
    //bg.composite(lastImg,50,0)
    //endImg.push(bg)
    //bg.write(imgEndDir)
    //.toFile(path.join(imgEndDir,images[i]))
  }
}
*/

async function createImage(colors){
  const color = colors[0];
  
  const ly1Path = path.join(overlaysDir,'ly2.png')
  const ly2Path = path.join(overlaysDir,'ly3.png')
  const bg = new Jimp(2190,3000,color);
  const ly1 = (await Jimp.read(ly1Path)).resize(2000,2000)
  const ly2 = (await Jimp.read(ly2Path)).resize(2000,2400)
  const ly1Left = (bg.getWidth()-ly1.getWidth())/2
  const ly1Top = (bg.getHeight()-ly1.getHeight())/2
  bg.composite(ly1,ly1Left,ly1Top)
  
  bg.composite(ly2,ly1Left+((ly1.getWidth()-ly2.getWidth())/2),ly1Top)//ly1Top+((ly2.getHeight()-ly1.getHeight())/2))
  
  return bg
  /*
  const color = colors[1];
  const bg = sharp({
    create: {
      width: 2190,
      height: 3000,
      channels: 4,
      background: { r: color[0], g: color[1], b: color[2], alpha: 1 }
    }
  });
  return bg*/
}

async function joinImages(images,imgMetadata,phNm){

const font = await Jimp.loadFont(Jimp.FONT_SANS_128_WHITE)

if(images.length % 2 !== 0){
  let matchColors = [] 
  const imgPath = path.join(imgbgdir,images[images.length-1])
  const lastImg = Jimp.read(imgPath)
  await Vibrant.from(imgPath).getPalette().then((pallette) => {
    matchColors = Object.values(pallette).map((swatch) => swatch.hex);
  })
  const bg = await createImage(matchColors)
  //bg.composite((await lastImg).resize(600,600),20,600)
  bg.composite((await lastImg).resize(1900,2000),650,600)
  bg.composite((await lastImg).resize(1000,1000),100,1500)

  for(let i = 0; i< bg.getWidth() ;i+=200){
    for (let j = 0; j< bg.getHeight() ;j+=200){
      //bg.print( await Jimp.loadFont(Jimp.FONT_SANS_32_BLACK),i,j,`h:${i},w: ${j}`)
      //console.log("🚀 ~ file: pruebas.js:154 ~ joinImages ~ `value height: ${i}, width: ${j}`:", `value height: ${i}, width: ${j}`)
    }
  }

  for(let prop in imgMetadata){
    if (prop == 'Measure'){
      bg.print(font,imgMetadata[prop].left,imgMetadata[prop].top,imgMetadata[prop].value.split('x')[0])
      console.log("🚀 ~ file: pruebas.js:122 ~ joinImages ~ imgMetadata[prop].value.split('x'):", imgMetadata[prop].value.split('x'))
      bg.print(font,imgMetadata[prop].left + 200,imgMetadata[prop].top,imgMetadata[prop].value.split('x')[1])

      //return;
    }else{
    bg.print(font,imgMetadata[prop].left,imgMetadata[prop].top,imgMetadata[prop].value)
    }
  }

  bg.write(`C:/Users/ASUS/Desktop/MKTPLACE/finalEdit/${phNm}_${(images.length-1)/2}.jpg`);
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
  bg.composite(imgEven.resize(1900,2000),650,600)
  bg.composite(imgOdd.resize(1000,1000),100,1500)

  for(let prop in imgMetadata){
    if (prop == 'Measure'){
      bg.print(font,imgMetadata[prop].left,imgMetadata[prop].top,imgMetadata[prop].value.split('x')[0])
      console.log("🚀 ~ file: pruebas.js:122 ~ joinImages ~ imgMetadata[prop].value.split('x'):", imgMetadata[prop].value.split('x'))
      bg.print(font,imgMetadata[prop].left + 200,imgMetadata[prop].top,imgMetadata[prop].value.split('x')[1])

      //return;
    }else{
    bg.print(font,imgMetadata[prop].left,imgMetadata[prop].top,imgMetadata[prop].value)
    }
  }
  bg.write(`C:/Users/ASUS/Desktop/MKTPLACE/finalEdit/${phNm}_${i/2}.jpg`);
}
}


async function main() {
  const font = await Jimp.loadFont(Jimp.FONT_SANS_128_WHITE);
  const image = await Jimp.read('C:/Users/ASUS/Desktop/MKTPLACE/overlays/ly4.jpg');

  image.print(font, 10, 10, "Hello World!").write('C:/Users/ASUS/Desktop/MKTPLACE/finalEdit/fin.jpg');

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

joinImages(a,imgMetadata,'935403277')
//main();