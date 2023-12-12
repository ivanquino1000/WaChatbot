const { Client, LocalAuth, MessageMedia } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
const fs = require('fs')
const path = require('path');
const { removeImgBg, imgToEdit, imgToPdf } = require('./imgProc.js');

// Define the directory to save the images
let allwUsr= ['51935403277','51958190331','51973182574','51962252080','51918483587','51973293108','51913927106'];
const initUser = JSON.parse(fs.readFileSync('initUser1.json'))
const imgEndDir = 'C:/Users/ASUS/Desktop/MKTPLACE/finalEdit'

const client = new Client({
    authStrategy: new LocalAuth({ clientId: "client-one" }),
});

client.on('qr', qr => {
    qrcode.generate(qr, {small: true});
});

client.on('ready', () => {
    console.log('Client is ready!');
});

//flow => if not created add , send start, sent fbmkt, send fbmkt requirements
/*MS 0 - nothing MS = 1 choose service, Ms>=2 Service Logic */
client.on('message', async message => {
	if(!message.isStatus){
		if (message.type !== 'chat' && message.type !== 'image'){
			console.log("🚀 ~ file: bot.js:32 ~ message.type:", message.type)
			return;
		}
		let users = JSON.parse(fs.readFileSync('users.json'))
		console.log("🚀 ~ file: waBot.js:34 ~ message.from:", message.from)
		const phNm = message.from.match(/\d+/gm)[0] || '51935403277';
		console.log("not Status ~ file: bot.js:29 ~ phNm:", phNm)
		
		if(!allwUsr.includes(phNm)){
			console.log("not allowed User ~ file: bot.js:32 ~ phNm:", phNm)
			return;
		}
		
		if(!users.hasOwnProperty(phNm)){
			users[phNm]=initUser
			fs.writeFileSync('users.json',JSON.stringify(users,null,2))
			console.log("alldUsr Saved as: ~ file: bot.js:37 ~ phNm:", phNm)
			return;
		}
		const user = users[phNm];
		const mainState = user['mainstate']
		console.log("🚀 ~ file: bot.js:46 ~ mainState:", mainState)
		console.log("🚀 ~ file: bot.js:48 ~ message.body.toLocaleLowerCase().trim() :", message.body.toLocaleLowerCase().trim() )
		
		if(message.body.toLocaleLowerCase().trim() !== 'start'){
			if(mainState == 0){
				console.log(`No start msg: ${message.body}, MS = ${mainState}`)
				return;
			}
			if(mainState !== 1){
				await serviceLogic(client, message, user, users)
				return;
			}
			//MS = 1 
		await selectService(client, message, user, users)
			return;
		}

		//start , MS = 0
		for (const key in initUser){
			//init or update
			if(!user.hasOwnProperty(key)){
				user = initUser
				return;
			}
			user[key] = initUser[key]
		}
		user['mainstate']= 1
		users[phNm]['mainstate'] = 1
		fs.writeFileSync('users.json',JSON.stringify(users,null,2))

		//send service options
		const services = []
		for (const prop in initUser['services']){
			services.push(prop)
		};

		client.sendMessage(message.from, `Escribe Cualquiera: ${services}, `)

	return;
	};
	//msg status handle
});

client.initialize();
 


async function selectService(client, message, user, users){
	const phNm = message.from.match(/\d+/)[0]
	switch(message.body.toLowerCase().trim()){
		case 'fbmkt':
			console.log("fbmkt:", message.body.toLowerCase().trim())
            let imgOptions = []
            for(e in initUser.services.fbmkt.imgMetadata){
                imgOptions.push(e)
            }
			client.sendMessage(message.from, `INGRESA: ${imgOptions}, `)  
			user["mainstate"] = 2
			users[phNm] = user
			fs.writeFileSync('users.json',JSON.stringify(users,null,2))
			break;
		case 'catalog':
			console.log("catalog:", message.body.toLowerCase().trim())

			user["mainstate"] = 3
			users[phNm] = user
			fs.writeFileSync('users.json',JSON.stringify(users,null,2))

			break;
		case 'ubicacion':
			console.log("ubicacion:", message.body.toLowerCase().trim())
			user["mainstate"] = 4
			users[phNm] = user
			fs.writeFileSync('users.json',JSON.stringify(users,null,2))
			break;
		default:
			console.log("ERROR ~ file: bot.js:89 ~ selectService ~ message.body.toLowerCase().trim():", message.body.toLowerCase().trim())
			user["mainstate"] = 1
			users[phNm] = user
			fs.writeFileSync('users.json',JSON.stringify(users,null,2))
			break;
	}

}


async function serviceLogic(client, message, user, users){
	const mainState = user['mainstate']
	switch(mainState){
		case 2:
			await fbmkt(client, message, user, users);
			break;
		case 3:
			await fbmkt(client, message, user, users);
			break;
		default:
			break;
	}

}

async function fbmkt(client, message, user, users){
	const usersUp = await JSON.parse(fs.readFileSync('users.json'))
	const phNm = message.from.match(/\d+/)[0]
	const fbmkt = user['services']['fbmkt']
	const fbState = fbmkt['state']
	const imgCount = usersUp[phNm]['services']['fbmkt']['imgCount'] 
	console.log("🚀 ~ file: bot.js:117 ~ fbmkt ~ fbState:", fbState)
	switch(fbState){
		case 0:
			if(message.type !== 'chat'){
				console.log("fbState 0 metaData not allowd type ~ file: bot.js:120 ~ fbmkt ~ message.type :", message.type )
				return;
			}

			const regexes = [/\w+/gm,
			/\w+/gm, 
			/\d{0,4}.?[\d{0,6}]?\s{0,5}x\s{0,5}\d{0,4}.?[\d{0,4}]?/gm, 
			/\d+\.?\d*/gm, 
			/\d+\.?\d*/gm,  
			/\d+\.?\d*/gm, 
			/\d+\.?\d*/gm] 
			console.log('init split')
			const metaData = message.body.split(',')
			console.log('splitted:' , metaData)

			// map with data
			if(metaData.length !== 7){
			  console.log('incorrect number of elements: ',metaData.length)
			  client.sendMessage(message.from, 'Error: reenvia imagen info')
			  return;
			}

			const fixMetaData = metaData.map((part,i)=>{
			  const regex = new RegExp(regexes[i]);
			  const trimparts = part.trim();
			  return regex.test(trimparts) ? trimparts.match(regex)[0] : null;
			}).filter(part=>part !== null);

			//check length
			if(fixMetaData.length !== 7){
			  console.log('error in map:' , fixMetaData, fixMetaData.length)
			  return;
			}
			let imgObj = initUser.services.fbmkt.imgMetadata
			let i = 0
			for(e in initUser.services.fbmkt.imgMetadata){
				console.log("🚀 ~ file: waBot.js:198 ~ e:", e)
				console.log("🚀 ~ file: waBot.js:200 ~ imgObj:", imgObj)
				console.log("🚀 ~ file: waBot.js:199 ~ imgObj.e:", imgObj[e])
				console.log("🚀 ~ file: waBot.js:199 ~ imgObj.e.value:", imgObj[e]['value'])
				imgObj[e]['value']= fixMetaData[i] 
				i++
			}
			users[phNm]['services']['fbmkt']['imgMetadata'] = imgObj
			users[phNm]['services']['fbmkt']['state']  = 1
			fs.writeFileSync('users.json',JSON.stringify(users,null,2))
			client.sendMessage(message.from,`datos correctos, envie sus imagenes para : ${fixMetaData[1]} de ${fixMetaData[6]}` )
			break;

		case 1:
		console.log("case1 start ~ file: bot.js:158 ~ fbmkt ~ imgCount:", imgCount)
		const imgMetadata = users[phNm]['services']['fbmkt']['imgMetadata'] 
		
		if(message.type !== 'image'){
		  if (message.type !=='chat'){
			console.log('message type neither chat or image')
			return;
		  }
		  // if not end key word error not image or keyword
		  if (message.body.toLocaleLowerCase().trim() !=='fin'){
			client.sendMessage(message.from,`ERROR: solo envie imagenes sin texto para ${imgMetadata[1]}`)
			return;
		  }
		  let finalImgs = await imgToEdit(phNm,users)
				
			finalImgs.forEach(e => {
			const res =  MessageMedia.fromFilePath(path.join(imgEndDir,e))
			client.sendMessage(message.from ,res)
		  }); 
		  let imgOptions = []
		  for(e in initUser.services.fbmkt.imgMetadata){
			  imgOptions.push(e)
		  }
		  client.sendMessage(message.from, `INGRESA: ${imgOptions}, o Start`)  
		  user["services"]["fbmkt"]["state"] = 0
		  users[phNm] = user
		  fs.writeFileSync('users.json',JSON.stringify(users,null,2))
		  return;
		}
        
		// image received for the imgMetadata fbstate 1 

		let media = await message.downloadMedia();
		const Data = media && media.data;
		//if (Data) {
		const imgFromMsg = await Buffer.from(Data, 'base64');
		let imgId = `${phNm}_${imgCount}.png`
		await removeImgBg(imgFromMsg,imgId)
		users[phNm]['services']['fbmkt']['imgCount']=imgCount + 1
		users[phNm]['services']['fbmkt']['imagesId'].push(imgId)
		fs.writeFileSync('users.json',JSON.stringify(users,null,2))

		if(imgCount < 6){
		  console.log('number of images counted: ',imgCount)
		return;
		}else{
		users[phNm]["services"]['fbmkt']['state'] = 2 
		fs.writeFileSync('users.json',JSON.stringify(users,null,2));
		}
		case 2:
			console.log('you have exceeded the images maximum limit so will be auto executed imgCount:', imgCount)
		 	break;
		default:
			console.log('fbState out of range fbS: ', fbState)
			break;
	}

}
