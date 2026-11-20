import TelegramBot from 'node-telegram-bot-api';
import { createServer } from 'node:http';

const token=process.env.TELEGRAM_BOT_TOKEN;
if(!token){console.error('Set TELEGRAM_BOT_TOKEN in the environment.');process.exit(1)}
const bot=new TelegramBot(token,{polling:true});
const feed=[];
bot.on('message',message=>{
  const body=message.text??message.caption??'';
  if(!body)return;
  const chat=message.chat;
  // TODO: score message priority, recency and duplicate content before storing.
  feed.unshift({source:chat.title??chat.username??'Forwarded message',summary:body.slice(0,64),text:body.slice(0,450),time:new Date(message.date*1000).toISOString(),score:50});
  if(feed.length>50)feed.length=50;
});
bot.onText(/\/start/,msg=>bot.sendMessage(msg.chat.id,'Heads-Up Digest companion. Add me to chats you control or forward messages here. I can only see messages in chats where I am present and messages sent to me.'));
const server=createServer((req,res)=>{res.setHeader('Access-Control-Allow-Origin','*');res.setHeader('Content-Type','application/json');if(req.url==='/feed'){res.end(JSON.stringify(feed));return}res.statusCode=404;res.end(JSON.stringify({error:'not found'}))});
server.listen(Number(process.env.PORT??8787),()=>console.log(`Feed listening on ${process.env.PORT??8787}`));
