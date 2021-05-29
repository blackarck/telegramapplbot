const dotenv = require('dotenv');
const TeleBot = require('telebot');
const jo =require('./jobopening');
const fs=require('fs');
var dayjs = require('dayjs');
const dbhelper = require('./dbhelper');
var connection = dbhelper.getconnection();
var http = require('https');


dotenv.config();

const bot = new TeleBot({
    token: process.env.apitoken,
    usePlugins: ['askUser']
});

//global variables
let jobid;
let chatid;
let emailid;
/*
bot.on('text', (msg) => {
    console.log("Recieved message "+msg.text);
    msg.reply.text(msg.text)
});//end of botonText
*/

bot.on('document',(msg) => {
    console.log(" Document name is "+ JSON.stringify(msg));
   //let resume will come here
    if(chatid==msg.chat.id){
        //update table again
        https://api.telegram.org/file/bot1488389500:AAFPvraCaEvlRVKW-WAzO4moqmLCPXMv-Hk/?file_id=BQACAgUAAxkBAAICiWCyVWq8TP7Jnz5eUb8Bf1oCwiy6AAKrAgACWPSZVQekXGrjseuXHwQ
        var fileurl="https://api.telegram.org/bot" + process.env.apitoken + "/getFile?file_id=" + msg.document.file_id;

        http.get(fileurl, (res) => {
       console.log("res is "+ res);

  res.on('data', (d) => {
    console.log("data os " + d);
    console.log("File path is "+ JSON.parse(d).result.file_path);
    var fileurl1="https://api.telegram.org/file/bot" + process.env.apitoken + "/"+JSON.parse(d).result.file_path;

        var rsmfile = fs.createWriteStream("./resume/"+msg.document.file_name);
        var dwlrequest = http.get(fileurl1, function(response) {
            response.pipe(rsmfile);
            rsmfile.on('finish', function() {
                rsmfile.close();
            });
          });

  });

}).on('error', (e) => {
  console.error(e);
});


        var stmt = "update  applicant set file_name=?,file_type=?,file_path=? where jobid=? and telegramid=?";
     var qryinput=[msg.document.file_name,msg.document.mime_type,msg.document.file_id, jobid,msg.chat.id];
     connection.query(stmt, qryinput, function(err, rows, fields) {
         if (err) {
             console.log("DB Error in /index/emailid :" + err);
         } else {
             
                bot.sendMessage(msg.from.id,'Updated resume in Job Opening, thanks for applying !!');
                
                
         } //end of else
     }); //end of query execution

    }

})

bot.on(['/jobs','/job'],(msg)=>{
    var repltext="<b>Current job openings with us</b>";
    var k=1;
    var replymarkuparr=[];
    for(i in jo){
       // console.log("i is "+i+", content-"+JSON.stringify(jo[i]));
        repltext=repltext+"\n" +k+". Job Title :"+jo[i].job_title;
        replymarkuparr.push( bot.inlineButton(''+k, {callback: i}));
        k++;
    }
   
   bot.sendMessage(msg.from.id,repltext, {parseMode:"HTML"});

   let replyMarkup = bot.inlineKeyboard([replymarkuparr]);

   bot.sendMessage(msg.from.id, 'Make a selection', {replyMarkup});

});


bot.on('callbackQuery', msg => {
    // User message alert
    //console.log("The data is " + msg.data);
    switch(msg.data){
        case '0':
        case '1':
            jobid=jo[msg.data].job_ID;

    let replytext='<b>'+jo[msg.data].job_title+"</b>";
    replytext=replytext+"\n "+jo[msg.data].job_ID;
    replytext=replytext+"\n "+jo[msg.data].Job_descr;

    //send job description
    bot.sendMessage(msg.from.id,replytext,{parseMode:"HTML"});
    //send apply now button
    let replyMarkup = bot.inlineKeyboard([[bot.inlineButton('Apply', {callback: '3'})]]);
    bot.sendMessage(msg.from.id, 'Apply now', {replyMarkup});
    //disable button loading thingy
     //not working yet 
     //bot.deleteMessage(msg.from.id,msg.id);
    
    break;
    case '3':
      
     //console.log("Apply now was pressed");
     bot.sendMessage(msg.from.id, `Hello ${ msg.from.first_name } ${ msg.from.last_name}, Your email please`, {ask: 'emailid',replyMarkup: {'name':'jhonny boy'}});
    break;
    }
    //set it to true for showing alertbox
    //return bot.answerCallbackQuery(msg.id, {text:'Inline button callback: ${ msg.data }', showAlert:true});
    return bot.answerCallbackQuery(msg.id);
});

// Ask email event
bot.on('ask.emailid', msg => {

    const id = msg.from.id;
    const email = msg.text;
    chatid=msg.chat.id;
    //console.log(" ask email is "+ JSON.stringify(msg));
    // Ask user age
    //save email in db
     //run a query in user and figure out whether user exists or not
     var stmt = "insert into applicant (appl_name,jobid,file_name,file_type,file_path,create_time,comment,telegramid,emailid) values (?,?,?,?,?,STR_TO_DATE(?,'%d-%m-%Y %H:%i:%s'),?,?,?)";
     var qryinput=[msg.from.first_name +' '+msg.from.last_name,jobid,'','','',dayjs().format('DD-MM-YYYY HH:mm:ss'),'Telegram',msg.chat.id,email];
     connection.query(stmt, qryinput, function(err, rows, fields) {
         if (err) {
             console.log("DB Error in /index/emailid :" + err);
         } else {
             
                bot.sendMessage(id,'Applicant ID created await email confirmation');
                
         } //end of else
     }); //end of query execution
     
    return bot.sendMessage(id, `Got it, ${ email }! Submit your resume`, {ask: 'resume'});

});


// Ask resume event
bot.on('ask.resume', msg => {
   
  // console.log("in ask resume "+JSON.stringify(msg));

});

bot.on(['/start', '/help'], (msg) => msg.reply.text('Welcome to Acme Inc. To browse open jobs type /jobs '));
bot.start();

const f=()=>{
    //console.log("Total job openings are "+ JSON.stringify(jo));
    for(i in jo){
        console.log("i is "+i+", content-"+JSON.stringify(jo[i].job_title));
    }
};

f();

//cRm ATS technical