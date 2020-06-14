const Discord = require('discord.js');
const request = require('request');
const client = new Discord.Client();
const fs = require('fs');
const path = require('path');
const config = JSON.parse(fs.readFileSync(path.join(__dirname, "config.json")))

client.on('ready', () => {
  console.log(`코로나봇 준비 완료!`);
});

client.on('message', msg => {
  if(msg.author.bot) return;
  if(msg.channel.type == "dm") return;
  if(!msg.channel.name == "디스코드-봇-만드는-곳") return;
  if(!msg.content.startsWith("!")) return;

  let command = msg.content.split("!");
  command = command[1].split(" ");

  if(msg.content == "!") {
    msg.reply("사용법 : ![명령어] \n더 많은 설명을 찾고싶다면 !help 또는 !도움말 을 쳐주세요!")
  }

  if(msg.content == "!도움말" || msg.content == "!help") {
    let HelpEmbed = new Discord.MessageEmbed()
      .setColor('#00ff9d')
      .setTitle('코로나봇 사용법')
      .setAuthor('Created By Team Koreal KRChungwol')
      .addFields(
        { name: '!도움말', value: '코로나봇 도움말을 가져옵니다.'},
        { name: '!코로나', value: '국내 총 코로나19 현황을 가져옵니다.'},
        { name: '!지역코로나', value: '지역별 총 코로나19 현황을 가져옵니다.'},
        { name: '!지역코로나 [지역이름]', value: '인자로 전달한 지역이름의 코로나19 현황을 가져옵니다.\n지역이름은 광역시(서울, 인천, 제주 등...)를 제외하고 도 단위입니다.'}
      )
    msg.channel.send(HelpEmbed)
  }

  if(command[0] == "코로나") {
    request('https://rok-corona19-api.herokuapp.com/domestic', (err, res, body) => {
      let json = JSON.parse(body);

      let COVIDEmbed = new Discord.MessageEmbed()
        .setColor('#00ff9d')
        .setTitle('국내 코로나19 현황')
        .setURL('http://ncov.mohw.go.kr/')
        .setAuthor('보건복지부 공식 홈페이지 정보')
        .addFields(
          { name: '국내 총 확진자', value: `${json.accumulated} (${json.accumulatedsum})`},
          { name: '국내 총 격리자', value: `${json.onControl} (${json.onControlsum})`},
          { name: '국내 총 완치자', value: `${json.healed} (${json.healedsum})`},
          { name: '국내 총 사망자', value: `${json.death} (${json.deathsum})`}
        )
        .setFooter('코로나19 종식을 위해 힘쓰시는 대한민국 정부 관계자분들과 의료진분들을 응원합니다.', 'http://ncov.mohw.go.kr/static/image/header/shim.png')
      
        msg.channel.send(COVIDEmbed);
    })
  }

  if(command[0] == "지역코로나" && command.length == 1) {
      request('https://rok-corona19-api.herokuapp.com/local', (err, res, body) => {
        let json = JSON.parse(body);
        let localData = [];

        for (let i = 0; i < 18; i++) {
          let data = { name: json[i].cityname, value: `${json[i].accumulated} (${json[i].accumulatedsum}) / ${json[i].onSeperate} / ${json[i].healed} / ${json[i].death}`};
          localData.push(data);
        }

        let LocalEmbed = new Discord.MessageEmbed()
        .setColor('#00ff9d')
        .setTitle('국내 지역단위 코로나19 현황 (확진자 / 격리자 / 완치자 / 사망자)')
        .setURL('http://ncov.mohw.go.kr/')
        .setAuthor('보건복지부 공식 홈페이지 정보')
        .setFooter('코로나19 종식을 위해 힘쓰시는 대한민국 정부 관계자분들과 의료진분들을 응원합니다.', 'http://ncov.mohw.go.kr/static/image/header/shim.png')
        
        localData.forEach(element => {
          LocalEmbed.addField(element.name, element.value, true);
        });

        msg.channel.send(LocalEmbed)
      });
  }

  if(command[0] == "지역코로나" && command[1]) {
    request('https://rok-corona19-api.herokuapp.com/local', (err, res, body) => {
        let json = JSON.parse(body);
        let localData = [];

        for (let i = 0; i < 18; i++) {
          if(json[i].cityname != command[1]) continue ;
          let data = { name: json[i].cityname, value: `${json[i].accumulated} (${json[i].accumulatedsum}) / ${json[i].onSeperate} / ${json[i].healed} / ${json[i].death}`};
          localData.push(data);
        }

        let LocalEmbed = new Discord.MessageEmbed()
        .setColor('#00ff9d')
        .setTitle('국내 지역단위 코로나19 현황 (확진자 / 격리자 / 완치자 / 사망자)')
        .setURL('http://ncov.mohw.go.kr/')
        .setAuthor('보건복지부 공식 홈페이지 정보')
        .setFooter('코로나19 종식을 위해 힘쓰시는 대한민국 정부 관계자분들과 의료진분들을 응원합니다.', 'http://ncov.mohw.go.kr/static/image/header/shim.png')
        .addFields(localData)
        
        msg.channel.send(LocalEmbed)
      });
  }
});

client.login(config.token);