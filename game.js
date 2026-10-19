document.body.dataset.gameBoot='start';
window.addEventListener('error',e=>document.body.dataset.gameError=e.message||'unknown');
const $=s=>document.querySelector(s),$$=s=>[...document.querySelectorAll(s)];

const characters={
 hero:{name:'落雨',role:'心理系研究生／24 歲',sprite:'assets/sprite-luoyu.png',intro:'情緒與創傷研究組。溫柔、敏銳，習慣先照顧所有人；真正的堅強，是在恐懼裡仍能做出選擇。'},
 senior:{name:'溫晨',role:'心理系準博士候選人／27 歲',sprite:'assets/sprite-wenchen.png',intro:'落雨分手半年的前女友。霸道、果斷，是隊伍的領導者；已獲海外博士班預錄取，卻仍想和落雨重新開始。'},
 junior:{name:'李明朗',role:'電機系研究生／23 歲',sprite:'assets/sprite-liminglang.png',intro:'落雨的直屬學弟。嘴硬、敏感，戰鬥與機械能力最強；靠工讀與獎學金獨自負擔學業。'},
 professor:{name:'許安',role:'物理系副教授／36 歲',sprite:'assets/sprite-xuan.png',intro:'冷靜理智的團隊大腦。負責整理感染者共同特徵與變異原因，計算精準，體力卻是四人中最差。'},
 phone:{name:'手機訊息',role:'外界通訊'},narrator:{name:'東濱大學',role:'封鎖紀錄'}
};
const backgrounds={library:'assets/bg-library-day.png',libraryNight:'assets/bg-library-reading.png',reading:'assets/bg-library-reading.png',archive:'assets/bg-library-archive.png',staff:'assets/bg-library-lounge.png',rooftop:'assets/bg-library-rooftop.png',lab:'assets/bg-physics-lab.png',cafeteria:'assets/bg-cafeteria.png',clinic:'assets/bg-clinic.png',stadium:'assets/bg-boss-arena.png'};
const names={library:'校總圖書館',libraryNight:'停電後的圖書館',reading:'一樓閱覽區',archive:'地下密集書庫',staff:'館員休息室',rooftop:'圖書館頂樓',lab:'物理實驗室',cafeteria:'中央餐廳',clinic:'系館保健室',stadium:'校體育場'};
const cgData={
 library:{src:'assets/cg-library-night.png',title:'圖書館夜守',tag:'第一日 · 21:18',caption:'落雨與李明朗用僅存的手機電量拼起正在崩壞的外界。',alt:'落雨與李明朗在圖書館書車後查看手機'},
 junior:{src:'assets/cg-bond-liminglang.png',title:'不必再獨自撐著',tag:'羈絆事件 · 李明朗',caption:'落雨睡著後，李明朗偷偷攬住她的肩，讓她靠得安穩一點。',alt:'李明朗在夜間圖書館輕輕攬住睡著的落雨'},
 rooftop:{src:'assets/cg-rooftop-signal.png',title:'隔樓燈號',tag:'第二日 · 06:18',caption:'四束微弱的光越過感染者佔據的中庭。',alt:'兩棟校舍的四名倖存者用手機燈光打暗號'},
 senior:{src:'assets/cg-bond-wenchen.png',title:'分手半年後',tag:'羈絆事件 · 溫晨',caption:'溫晨伸出手，這一次不替落雨決定，只問她願不願意重新開始。',alt:'溫晨向前女友落雨伸出手'},
 lab:{src:'assets/cg-antidote-crisis.png',title:'臨時研究隊',tag:'第二日 · 物理實驗室',caption:'危機中，四個人第一次像一支真正的隊伍。',alt:'四人在感染者突破時製作候選抑制劑'},
 professor:{src:'assets/cg-bond-xuan.png',title:'模型之外的變數',tag:'羈絆事件 · 許安',caption:'落雨扶住他顫抖的手，也讓許安第一次承認理性有極限。',alt:'落雨與許安共同握住藍色抑制劑'},
 boss:{src:'assets/cg-zombie-king.png',title:'喪屍王',tag:'最終觀察 · 變異體 K-01',caption:'牠會學習、指揮，也會在刺激中斷的瞬間暴露核心。',alt:'四人在體育場面對巨大變異喪屍王'},
 fire:{src:'assets/cg-fire-ending.png',title:'封鎖線燃燒',tag:'終章 · 19:42',caption:'烈火吞沒喪屍群。沒有人被留下。',alt:'四人逃離燃燒的體育場'}
};
const savedGallery=()=>{try{return JSON.parse(localStorage.getItem('redCampusGalleryV3')||'[]')}catch{return[]}};
const fresh=()=>({phase:'library',time:'第一日 · 15:52',hp:100,resources:2,location:'library',objective:'確認操場的異常並封鎖入口',inventory:['手機（電量 61%）','巧克力棒'],affection:{senior:0,junior:0,professor:0},solved:{reading:false,archive:false,staff:false,lab:false,cafeteria:false,clinic:false},unlocked:savedGallery(),introduced:{hero:false,junior:false,senior:false,professor:false}});
let state=fresh(),queue=[],onQueueEnd=null,battleTimer=null,audioCtx=null,soundOn=true;

function playSfx(kind){
 if(!soundOn)return;
 audioCtx ||= new (window.AudioContext||window.webkitAudioContext)();
 const ctx=audioCtx,now=ctx.currentTime,g=ctx.createGain(),o=ctx.createOscillator();
 g.connect(ctx.destination);o.connect(g);
 const settings={boom:[54,28,.72,.9,'sine'],alarm:[720,410,.28,.75,'sawtooth'],power:[150,38,.45,.65,'square']}[kind]||[220,110,.15,.3,'sine'];
 o.type=settings[4];o.frequency.setValueAtTime(settings[0],now);o.frequency.exponentialRampToValueAtTime(settings[1],now+settings[2]);
 g.gain.setValueAtTime(.0001,now);g.gain.exponentialRampToValueAtTime(settings[3],now+.025);g.gain.exponentialRampToValueAtTime(.0001,now+settings[2]);
 o.start(now);o.stop(now+settings[2]);
}
function blackout(next){playSfx('power');state.time='第一日 · 16:18';$('#chapterLabel').textContent=state.time;$('#redFlash').classList.add('blackout');setTimeout(()=>{bg('libraryNight');$('#redFlash').classList.remove('blackout');next()},620)}

const intro=[
 ['narrator','星期日下午三點五十二分，陽光把圖書館切成一格一格的蜂蜜色。假日館裡的人少，連翻頁聲都顯得有禮貌。'],
 ['hero','落雨盯著螢幕上的「依附關係與威脅知覺」第十四次眨眼。研究很像追一隻躲進牆縫的蟲——累得想放棄，偏偏知道牠還在裡面。'],
 ['hero','她揉了揉眉心。人為什麼明知一扇門會夾傷手，還是一次次把手伸回去？她就是為了這種問題，心甘情願把自己困在文獻堆裡。'],
 ['narrator','窗外的操場原先只是週末的遠景。慢跑的人沿著紅色跑道繞圈，像鐘面上安分的秒針。'],
 ['hero','然後其中一根秒針逆著方向跑了起來。又一根。人群並沒有散開，反而朝同一點塌陷。'],
 ['narrator','落雨合上筆電。不是因為看清了什麼，而是那些人的動作裡，少了一種人類會有的猶豫。'],
 ['narrator','巨響撞上玻璃帷幕，整座閱覽室像被一隻看不見的手猛拍了一下。桌上的原子筆滾落，久久沒有停。','boom'],
 ['narrator','尖叫聲隔著兩層玻璃傳來，薄得像壞掉的廣播。有人從操場奔向校門，也有人追在他們後面——姿勢不像奔跑，更像被飢餓拖著。','alarm'],
 ['hero','落雨沒有再看第二眼。她拔下門禁旁的磁吸固定器，拉上玻璃門，將消防鎖扣死；動作快得像替某段研究下了一個不容修改的句點。'],
 ['junior','「學姊，妳鎖門的樣子比口試老師還狠。」側梯門被撞開，李明朗抱著工具箱滾進來，反手把門栓上。'],
 ['hero','她一向不喜歡這個直屬學弟。聰明是真，嘴壞也是真；每一句關心都要先裹一層砂紙才肯遞出來。'],
 ['hero','他抬手推書車，袖口滑到手肘。新舊燙痕沿著小臂散開，像有人用火寫過一串不肯說明的註腳。'],
 ['junior','「看什麼？廚房出餐口窄，我又不是每次都記得戴袖套。」他把袖子扯回去，「工讀而已，沒有妳腦內那麼精彩。」'],
 ['hero','「我還什麼都沒問。」落雨握住書車另一端，「你先自首，通常只會讓刑期變長。」'],
 ['junior','他怔了一下，像沒料到她會把玩笑接回去。「……先堵門。等活到明天，再讓妳判。」'],
 ['phone','手機同時震動。校安通知只有冷冰冰兩行：留在室內；勿接觸出現攻擊行為者。第三行尚未載入，訊號便斷了。'],
 ['narrator','日光燈先閃了一次。空調的低鳴慢慢沉下去，像某頭巨獸在地底咽下最後一口氣。黑暗從書架深處漫出來。','power']
];
const libraryScenes={
 reading:[['narrator','停電後的閱覽區換了一副骨架。月光貼著桌沿爬行，散落的便條紙像一群來不及飛走的白蛾。'],['hero','館員把消防門密碼拆進四筆借閱紀錄：樓層、續借次數、分區與出口編號。不是防賊，更像留給懂規則的人一條細繩。'],['junior','「四張紙，四個數字。妳負責猜館員的心，我負責尊重數學。」'],['hero','「數學要是可靠，你剛才就不會把二樓說成三樓。」'],['junior','「那是地板震了。」他答得太快，又看了一眼出口。第三次。'],['hero','落雨沒有說「你在緊張」。她只是把手機燈調暗，站到他與出口之間不會被遮住的位置。「這樣呢？」'],['junior','他的肩線往下落了一點。「勉強不礙事。再靠近半步也行——我是說，妳看紙會比較清楚。」']],
 archive:[['narrator','密集書庫的軌道在黑暗裡延伸，像一排咬緊的牙。深處每隔十幾秒便傳來一次撞擊，不急，卻很有耐心。'],['hero','李明朗擠進兩列書櫃之間，手背擦過鐵皮。他沒有喊痛，只是忽然數起螺絲，一顆、兩顆、三顆。'],['hero','落雨想起那截滿是燙痕的手臂。舊傷不會說話，身體卻總比人誠實。'],['junior','「國中器材室也這麼窄。」他盯著門縫，「他們拿走我的手機，說窮鬼的求救反正不值錢。」'],['hero','她沒有替他說「都過去了」。那句話像把門重新關一次。她把行動電源遞過去：「幫我拿著。燈在你手上，什麼時候往前，由你決定。」'],['junior','他沉默很久，接過去時指尖冰涼。「學姊，妳這種人很犯規。」'],['hero','「寫進申訴書。我活著出去會看。」'],['junior','黑暗裡傳來一聲很輕的笑。「那妳最好別死。」']],
 staff:[['narrator','館員室還留著下午的生活：半杯冷掉的茶、沒關的抽屜、椅背上一件來不及帶走的薄外套。災難把人趕走，卻忘了替他們收尾。'],['hero','李明朗的手機亮了一瞬。薪資入帳，緊接著是房東催租。他用拇指抹掉通知，熟練得像擦去水漬。'],['junior','「白天助教，晚上廚房，週末修機器。獎學金要是少一筆，我就得在論文和房租裡選一個。」'],['hero','「所以你總把自己用到快壞掉。」落雨拆開巧克力，掰了一半給他，「還假裝零件本來就會發燙。」'],['junior','「至少零件不會問我爸媽為什麼不匯錢。」他咬了一口，語氣平得像在談別人的家。'],['hero','手機上的家人群組也亮著。母親最後一句仍是：有空就回來。落雨把螢幕扣在桌上。'],['junior','「想回就回。怕聽見什麼，就先別打。」他看著別處，「門可以晚一點開，不代表永遠不開。」'],['hero','她抬眼看他。這句話不像安慰，倒像他從自己身上硬拆下一小塊能用的東西，擱到她面前。'],['hero','「你偶爾也會說人話。」'],['junior','「停電造成的。來電後就恢復。」']]
};
const departmentScenes={
 lab:[['narrator','物理實驗室亮著幾盞應急燈。藍白色光線從儀器間切過，把每個人的臉都照得像一張尚未判讀的底片。'],['professor','許安摘下防護鏡，露出一雙過分冷靜的眼睛。「速度、瞳孔、聲源反應、群聚方向。形容詞不要，時間與距離給我。」'],['hero','落雨愣了半拍。世界都快完了，這位物理老師居然還長得像會讓學生自願重修的類型。'],['hero','她在心裡乾笑：雙性戀的好處，大概是末日裡仍能平等欣賞所有漂亮的人；壞處是漂亮的人通常都很麻煩。'],['professor','許安抬眼。「我臉上有數據？」'],['hero','「沒有。只是確認教授的觀察力沒有跟體力一起下降。」'],['narrator','他把紀錄排成時間軸。感染者追逐重複聲源，強光後轉向遲滯；受刺激越多，牠們越像在修改自己的答案。'],['professor','「不是隨機突變，是學習。體育場那一隻正在用低頻訊號替整個屍群作答。」'],['hero','「那就給牠一份前後矛盾的考卷。」落雨指尖沿著曲線移動，「先讓牠預測，再在牠最確定的時候撤掉線索。」'],['professor','許安唇角動了一下。「心理學偶爾也有可測量的浪漫。」'],['hero','下一秒，他扶住桌沿。額角冷汗比任何數字都誠實。']],
 cafeteria:[['junior','冷藏庫有水和罐頭。我去就好。'],['hero','「一個人去是逞強，不是效率。」'],['junior','誰逞強了？我是嫌妳跑得慢。……跟緊，別踩碎玻璃。'],['hero','兩人用餐盤聲響把感染者引向北側，再從西側貨梯搬回物資。'],['junior','這箱很重。不是不讓妳拿，是妳負責看路比較重要。']],
 clinic:[['narrator','保健室的簾子忽然被風掀起。有人從陰影裡扣住落雨的手腕，她反射性往後一撞，剪刀已抵上對方肩口。'],['senior','「半年不見，招呼變得很熱情。」那聲音太熟，熟得讓落雨的心先於理智認出來。'],['hero','她抬頭，看見溫晨。驚嚇還停在指尖，另一種更舊的疼已沿著骨頭醒來。'],['hero','原來前女友和喪屍一樣，都擅長在你以為門已經鎖好的時候出現。不同的是，喪屍不會用這種眼神看她。'],['senior','溫晨抽走剪刀，順手替她別回急救箱。「裝沒看見我之前，至少先把手放開。」'],['hero','落雨這才發現自己仍抓著她。那隻手曾替她改過研究計畫、量過發燒的體溫，也曾握著海外博士班的錄取信。'],['senior','「我說過會回來。妳卻替我把我們的結局先寫完了。」'],['hero','「我只是……不擅長等船。」她望向窗外，「家裡教我的都是：聽見汽笛，就先假設人不會回岸。」'],['senior','「那這次別替海下結論。」溫晨向前一步，仍舊霸道，聲音卻放輕了，「小雨，我想復合。答案可以以後給，今天先跟我活出去。」']]
};
const mapSets={
 library:{area:'第一日 · 校總圖書館',title:'在入夜前完成封鎖',tip:'完成三處調查後，與李明朗度過停電的夜晚。',nodes:[['reading','一樓閱覽區','借閱紀錄與撤離密碼'],['archive','地下密集書庫','備援電源與創傷記憶'],['staff','館員休息室','物資、家人與夜間對話'],['rooftop','頂樓觀測台','度過一夜後等待日出']]},
 department:{area:'第二日 · 理學系館',title:'建立變異模型',tip:'完成研究、補給與心理準備後，前往體育場迎戰變異體。',nodes:[['lab','物理實驗室','彙整特徵與推導變異原因'],['cafeteria','中央餐廳','尋找食物與誘導器材'],['clinic','保健室與諮商室','處理傷勢與未完的感情'],['stadium','校體育場','迎戰正在集結屍群的喪屍王']]}
};

function setScreen(game){$('#titleScreen').classList.toggle('hidden',game);$('#gameScreen').classList.toggle('hidden',!game)}
function bg(loc){state.location=loc;$('#background').className='layer background';$('#background').style.backgroundImage=`url('${backgrounds[loc]||backgrounds.library}')`;$('#locationLabel').textContent=names[loc]||'東濱大學'}
function actor(key){const c=characters[key];$('#speaker').textContent=c.name;$('#role').textContent=c.role;const sp=$('#sprite');if(!c.sprite){sp.classList.add('hidden');return}sp.classList.remove('hidden');sp.querySelector('img').src=c.sprite}
function say(key,text){actor(key);$('#dialogueText').textContent=text;$('#choices').innerHTML='';$('#nextBtn').classList.remove('hidden')}
function run(lines,end){queue=[...lines];onQueueEnd=end||null;advance()}
function advance(){if(queue.length){const [k,t,cue]=queue.shift();if(cue)playSfx(cue);say(k,t);return}if(onQueueEnd){const f=onQueueEnd;onQueueEnd=null;f()}else enterExplore()}
function choice(options){$('#nextBtn').classList.add('hidden');const box=$('#choices');box.innerHTML='';options.forEach(o=>{const b=document.createElement('button');b.textContent=o.label;b.onclick=()=>{if(o.aff){state.affection[o.aff]+=o.value||1;toast(`${characters[o.aff].name} 羈絆 +${o.value||1}`)}o.next()};box.append(b)})}
function introduce(key,next){const c=characters[key];state.introduced[key]=true;$('#sprite').classList.add('hidden');$('#introPortrait').src=c.sprite;$('#introPortrait').alt=c.name;$('#introName').textContent=c.name;$('#introRole').textContent=c.role;$('#introText').textContent=c.intro;$('#introContinue').textContent=`認識${c.name}`;$('#characterIntro').classList.remove('hidden');$('#introContinue').onclick=()=>{$('#characterIntro').classList.add('hidden');next()}}
function unlockCg(id){if(!state.unlocked.includes(id)){state.unlocked.push(id);localStorage.setItem('redCampusGalleryV3',JSON.stringify([...new Set([...savedGallery(),id])]))}}
function showCg(id,next,replay=false){const c=cgData[id];if(!replay)unlockCg(id);$('#eventCgImage').src=c.src;$('#eventCgImage').alt=c.alt;$('#eventCgTag').textContent=c.tag;$('#eventCgCaption').textContent=c.caption;$('#eventCg').classList.remove('hidden');$('#eventCgContinue').onclick=()=>{$('#eventCg').classList.add('hidden');next?.()}}
function triggerAttack(cb){$('#redFlash').classList.remove('flash');$('#stage').classList.remove('shake');void $('#stage').offsetWidth;$('#redFlash').classList.add('flash');$('#stage').classList.add('shake');setTimeout(cb,620)}

function startNew(){state=fresh();setScreen(true);bg('library');$('#ending').classList.add('hidden');$('#eventCg').classList.add('hidden');introduce('hero',()=>run(intro.slice(0,9),()=>introduce('junior',()=>run(intro.slice(9),()=>blackout(enterExplore)))))}
function phaseComplete(){const keys=state.phase==='library'?['reading','archive','staff']:['lab','cafeteria','clinic'];return keys.every(k=>state.solved[k])}
function enterExplore(){state.objective=state.phase==='library'?(phaseComplete()?'回到館員室度過夜晚，再上頂樓':'完成圖書館三處調查'):(phaseComplete()?'前往體育場阻止喪屍王集結屍群':'研究變異原因並完成撤離準備');$('#objectiveText').textContent=state.objective;$('#chapterLabel').textContent=state.time;$('#sprite').classList.add('hidden');$('#speaker').textContent='探索';$('#role').textContent=state.phase==='library'?'第一日 · 圖書館':'第二日 · 理學系館';$('#dialogueText').textContent=state.objective+'。打開地圖選擇下一個地點。';$('#nextBtn').classList.add('hidden');$('#choices').innerHTML='<button id="openMapInline">開啟探索地圖</button>';$('#openMapInline').onclick=()=>openPanel('mapPanel');updateUI()}
function openPanel(id){closePanels();$(`#${id}`).classList.remove('hidden');if(id==='mapPanel')renderMap();if(id==='inventoryPanel')renderInventory();if(id==='bondPanel')renderBonds();if(id==='galleryPanel')renderGallery();if(id==='savePanel')renderSave()}
function closePanels(){$$('.panel').forEach(p=>p.classList.add('hidden'))}
function renderMap(){const set=mapSets[state.phase];$('#mapArea').textContent=set.area;$('#mapTitle').textContent=set.title;$('#mapTip').textContent=set.tip;$('#mapGrid').innerHTML=set.nodes.map(([key,name,desc])=>{const terminal=['rooftop','stadium'].includes(key),locked=terminal&&!phaseComplete();return `<button class="map-node ${state.solved[key]?'done':''} ${locked?'locked':''}" data-location="${key}" style="--node-bg:url('${backgrounds[key]}')"><span class="map-node-copy"><b>${name}</b><span>${desc}</span><em>${state.solved[key]?'已完成':locked?'尚未開放':terminal?'可前往':'未調查'}</em></span></button>`}).join('');$$('.map-node').forEach(b=>b.onclick=()=>{if(b.classList.contains('locked'))return toast('先完成目前區域的三項準備');visit(b.dataset.location)})}
function visit(loc){closePanels();bg(loc);if(loc==='rooftop')return nightAndRooftop();if(loc==='stadium')return bossSequence();if(state.solved[loc])return run([['narrator','這裡已完成調查，沒有必要再冒一次風險。']],enterExplore);run((state.phase==='library'?libraryScenes:departmentScenes)[loc],()=>afterScene(loc))}
function afterScene(loc){
 if(loc==='reading')return choice([{label:'不點破他的緊張，只把燈與出口都留在他視線裡',aff:'junior',value:2,next:()=>openPuzzle(loc)},{label:'催他別再東張西望，趕快解開密碼',next:()=>openPuzzle(loc)}]);
 if(loc==='archive')return choice([{label:'把光源交給他，讓他決定何時往前',aff:'junior',value:2,next:()=>openPuzzle(loc)},{label:'拉著他直接穿過書櫃，證明這裡沒有什麼',next:()=>openPuzzle(loc)}]);
 if(loc==='staff')return openPuzzle(loc);
 if(loc==='lab')return showCg('lab',()=>choice([{label:'不戳破他的逞強，把椅子推到他膝後：「坐著算比較不浪費能量。」',aff:'professor',value:2,next:()=>professorBond(loc)},{label:'假裝沒看見冷汗，讓他繼續站著主持研究',next:()=>openPuzzle(loc)}]));
 if(loc==='cafeteria')return choice([{label:'相信李明朗的近身能力，自己專注觀察屍群',aff:'junior',value:1,next:()=>openPuzzle(loc)},{label:'命令他留在後方',next:()=>openPuzzle(loc)}]);
 if(loc==='clinic')return choice([{label:'沒有說對不起，只把一直攥著的手慢慢鬆開，留在她掌心',aff:'senior',value:3,next:()=>seniorBond(loc)},{label:'抽回手，說等離開校園再談',next:()=>openPuzzle(loc)}])
}
function professorBond(loc){if(state.affection.professor>=3)return showCg('professor',()=>openPuzzle(loc));openPuzzle(loc)}
function seniorBond(loc){if(state.affection.senior>=3)return showCg('senior',()=>openPuzzle(loc));openPuzzle(loc)}
function juniorNightBond(next){choice([{label:'把毯子往他那邊推一半：「今晚不用值班換住宿。」',aff:'junior',value:2,next:()=>{if(state.affection.junior>=4)showCg('junior',next);else next()}},{label:'叫他先睡，明天還需要他的戰鬥力',next}])}

function openPuzzle(loc){$('#nextBtn').classList.add('hidden');$('#choices').innerHTML='';const p=$('#puzzlePanel');p.classList.remove('hidden');const data={
 reading:['被拆散的密碼','讓借閱紀錄重新說話','館員留下四句：先回到「零」號分區；電梯停在四樓；長鈴響過兩次；最後的人從七號門離開。','code'],
 archive:['備援電源','在不驚動黑暗的情況下恢復電力','控制箱旁寫著：讓尖叫先閉嘴，心臟才可重新跳動；醒來後，只准留一盞眼睛。','steps'],
 staff:['夜間生存計畫','從五項安排中選出三項','感染者會被持續聲光吸引。兩人都需要睡眠，而手機電量必須撐到日出。','plan'],
 lab:['刺激—反應模型','重排喪屍王暴露核心的三個瞬間','牠依賴聲源預測方向；強光會延遲轉身；失去預測依據後，胸腔才會張開重新定位。','model'],
 cafeteria:['無聲取糧','規劃最低風險路線','東門碎玻璃、北側有屍群、西側貨梯可載貨。','route'],
 clinic:['五感著地法','替恐慌中的倖存者排回現實','不要先命令他冷靜。從最遠的視覺開始，一層層回到身體，最後才是呼吸。','care']
 }[loc];
 const controls={code:['0427','0472','4027','0247'].map(n=>`<button data-answer="${n==='0427'}">${n}</button>`).join(''),steps:'<button data-seq="警報">關閉警報</button><button data-seq="電池">啟動電池</button><button data-seq="照明">低照明</button><div id="seq" class="sequence">尚未操作</div>',plan:'<button data-plan data-good="true">關閉閱覽區主燈</button><button data-plan data-good="true">每三小時交換輪值</button><button data-plan data-good="true">手機只在整點連線</button><button data-plan data-good="false">持續播放新聞確認狀況</button><button data-plan data-good="false">兩人同時保持清醒</button><button data-plan-submit>確認安排</button>',model:'<button data-seq="靜音">突然切斷聲源</button><button data-seq="強光">用強光迫使轉向</button><button data-seq="核心">射擊張開的胸腔</button><div id="seq" class="sequence">尚未操作</div>',route:'<button data-answer="true">南側廚房 → 西側貨梯</button><button data-answer="false">北側大廳 → 東門</button>',care:'<button data-seq="看見">說出五樣看見的東西</button><button data-seq="觸碰">確認四種觸感</button><button data-seq="聽見">辨認三個聲音</button><button data-seq="呼吸">最後數四拍呼吸</button><div id="seq" class="sequence">尚未操作</div>'}[data[3]];
 p.innerHTML=`<div class="panel-head"><h2>${data[0]}</h2></div><div class="puzzle-body"><h3>${data[1]}</h3><p class="clue">${data[2]}</p><div class="puzzle-actions">${controls}</div><p id="puzzleMsg"></p></div>`;bindPuzzle(loc)
}
function bindPuzzle(loc){let seq=[];const rules={archive:['警報','電池','照明'],lab:['靜音','強光','核心'],clinic:['看見','觸碰','聽見','呼吸']};$$('[data-answer]').forEach(b=>b.onclick=()=>b.dataset.answer==='true'?solve(loc):fail('這個答案和現場留下的線索接不上。'));$$('[data-seq]').forEach(b=>b.onclick=()=>{const rule=rules[loc];seq.push(b.dataset.seq);b.disabled=true;$('#seq').textContent=seq.join(' → ');if(seq.length===rule.length)(seq.join(',')===rule.join(',')?solve(loc):fail('順序錯了。某個步驟被放在它發生之前。',()=>{seq=[];$$('[data-seq]').forEach(x=>x.disabled=false);$('#seq').textContent='尚未操作'}))});$$('[data-plan]').forEach(b=>b.onclick=()=>{b.classList.toggle('selected');b.setAttribute('aria-pressed',b.classList.contains('selected'))});const submit=$('[data-plan-submit]');if(submit)submit.onclick=()=>{const picked=$$('[data-plan].selected');const good=picked.length===3&&picked.every(b=>b.dataset.good==='true');good?solve(loc):fail('這份安排不是耗盡電力，就是耗盡人。請重新取捨。')}}
const rewards={reading:['消防通行卡','取得頂樓與消防門通行卡。'],archive:['行動電源','低照明與插座恢復。'],staff:['收音機','兩人完成夜間輪值計畫。'],lab:['行為弱點模型','落雨與許安完成喪屍王刺激—反應模型。'],cafeteria:['燃料與三日份物資','取得食物、飲水與場務燃料。'],clinic:['急救包','隊伍完成傷勢與壓力處置。']};
function solve(loc){state.solved[loc]=true;const [item,msg]=rewards[loc];if(!state.inventory.includes(item))state.inventory.push(item);if(['staff','cafeteria'].includes(loc))state.resources+=2;$('#puzzlePanel').innerHTML=`<div class="panel-head"><h2 class="success">調查完成</h2></div><div class="puzzle-body"><p>${msg}</p><div class="puzzle-actions"><button data-puzzle-close>繼續</button></div></div>`;$('[data-puzzle-close]').onclick=()=>{$('#puzzlePanel').classList.add('hidden');enterExplore()};updateUI()}
function fail(msg,reset){state.resources=Math.max(0,state.resources-1);state.hp=Math.max(20,state.hp-4);$('#puzzleMsg').textContent=msg;$('#puzzleMsg').className='error';reset?.();updateUI()}

function nightAndRooftop(){state.time='第一日 · 23:47';showCg('library',()=>run([
 ['narrator','午夜以後，雨終於落下來。它敲著整片玻璃牆，替圖書館蓋上一層密不透風的白噪音。'],
 ['hero','兩人背靠書車坐著。李明朗把工具箱抱在膝上，睡意一來，手仍扣著提把，像窮人連夢裡也不敢把行李放遠。'],
 ['hero','「你每次說好話之前，都一定要先咬人一口嗎？」'],
 ['junior','「好話通常都有後半句。以前他們說『我們是朋友』，後半句是把我鎖進器材室，看我求幾次才哭。」'],
 ['hero','落雨沒有碰他，只將自己的鞋尖移到他視線裡。「現在門開著。燈在你左手。我的鞋在這裡。你不用急著相信別的。」'],
 ['junior','他低頭看了很久。「學姊，妳是不是也不敢打給家裡？」'],
 ['hero','手機貼在掌心，像一塊沒有溫度的炭。「我怕沒人接。也怕有人接。」'],
 ['junior','「那就讓它今晚只是一支手機。」他把聲音放得很低，「不是審判，不是誰離開妳的證據。」'],
 ['hero','她原本想笑他偷用了心理系的句型，最後只說：「明天記得付引用費。」'],
 ['junior','「可以分期嗎？」'],
 ['narrator','她笑了一下。很輕，卻是停電以後，這棟樓裡第一個不像求救的聲音。']
],()=>juniorNightBond(()=>{state.time='第二日 · 06:12';bg('rooftop');run([
 ['narrator','清晨，感染者增加了三倍。白天讓牠們遲鈍，卻沒有讓牠們消失。'],
 ['junior','理學系館四樓，有人在用燈打短短長。'],['hero','對面破窗後立著一道高挑身影。她打燈號時習慣先停半拍——那個動作像一個太舊的夢，落雨沒有讓自己辨認。'],
 ['narrator','燈號：白天行動。沿陰影走。三分鐘後開門。'],['narrator','第二束光補上：帶齊觀察紀錄。其他東西可以丟。']
],()=>showCg('rooftop',()=>choice([{label:'相信溫晨的指揮，趁日照最強穿越',aff:'senior',value:1,next:crossCampus},{label:'採用許安的時間模型，精確等三分鐘',aff:'professor',value:1,next:crossCampus},{label:'讓李明朗決定門禁時機',aff:'junior',value:1,next:crossCampus}])))})))}
function crossCampus(){startQuickBattle('穿越中庭',()=>{state.phase='department';state.time='第二日 · 07:05';bg('lab');run([
 ['narrator','防火門剛合上，一隻手忽然從側面扣住落雨的肩。她反肘撞回去，對方早一步托住她的手腕。'],
 ['hero','她抬頭，呼吸像被人從中間剪斷。'],
 ['senior','「小雨。」溫晨的手還停在她腕上，語氣和半年前一樣篤定，「妳真的過來了。」']
],()=>introduce('senior',()=>introduce('professor',()=>run([
 ['hero','落雨抽回手，低頭檢查根本沒有問題的門鎖。原來有些人只要站在面前，半年就會薄得像一張紙。'],
 ['professor','「如果兩位的重逢需要配樂，晚點再找。」白袍男人推了推眼鏡，「先把你們記得的每一隻感染者說給我聽。」'],
 ['senior','「隊形我排，模型交給許教授，明朗顧火力。」溫晨看向落雨，聲音短暫地軟了一度，「妳看懂牠們，也看著我們。」'],
 ['hero','於是四個人有了位置：溫晨像舵，許安像羅盤，李明朗是撞開暗礁的槳。落雨不知道自己像什麼；也許只是那條不讓船員在風暴裡彼此走失的繩。']
],enterExplore))))})}
function startQuickBattle(title,next){triggerAttack(()=>{const p=$('#puzzlePanel');p.classList.remove('hidden');p.innerHTML=`<div class="panel-head"><h2>${title}</h2><b id="battleTime">8.0 秒</b></div><div class="puzzle-body"><p>點中三個安全落點，保持隊形穿越。</p><div id="battleField" class="battle-field"><button id="hitTarget" class="hit-target">前進</button></div><p id="battleStatus">0 / 3</p></div>`;let hits=0,remain=80;const move=()=>{const t=$('#hitTarget');t.style.left=`${5+Math.random()*76}%`;t.style.top=`${7+Math.random()*66}%`};move();$('#hitTarget').onclick=()=>{hits++;$('#battleStatus').textContent=`${hits} / 3`;if(hits>=3)return endMini(next);move()};battleTimer=setInterval(()=>{remain--;$('#battleTime').textContent=`${(remain/10).toFixed(1)} 秒`;if(remain<=0){state.hp=Math.max(20,state.hp-20);endMini(next)}},100)})}
function endMini(next){clearInterval(battleTimer);$('#puzzlePanel').innerHTML='<div class="panel-head"><h2>成功突圍</h2></div><div class="puzzle-body"><p>隊伍沒有散開。</p><div class="puzzle-actions"><button data-battle-next>繼續</button></div></div>';$('[data-battle-next]').onclick=()=>{$('#puzzlePanel').classList.add('hidden');next()}}

function bossSequence(){state.time='第二日 · 18:56';bg('stadium');run([
 ['narrator','體育場中央站著一個比人更像「意志」的東西。每一次低吼，散亂的感染者便同時轉頭，像草被同一陣風壓向一邊。'],
 ['professor','「K-01。實驗廢液沒有讓牠變強，只是讓牠比其他個體更早學會利用刺激。」許安的聲音很穩，呼吸卻已經碎了。'],
 ['hero','落雨盯著牠的頭部轉向。先找聲源，再追亮處；一旦世界忽然安靜，牠會停下半秒，像失去觀眾的演員忘了下一句台詞。'],
 ['hero','「牠不是王。」她說，「只是最害怕沒有人回應牠的那一隻。」'],
 ['senior','溫晨將發射器交給李明朗。「那就讓牠知道，舞台不是牠的。」'],
 ['junior','「學姊，妳負責看穿牠。」李明朗扣上護目鏡，「妳說哪裡，我就讓哪裡閉嘴。」']
],()=>showCg('boss',()=>choice([{label:'先切斷重複聲源，再用強光製造預測錯誤',next:()=>startBossBattle(true)},{label:'持續提高音量，逼牠正面衝撞',next:()=>startBossBattle(false)}])))}
function startBossBattle(correctPlan){if(!correctPlan){state.hp=Math.max(25,state.hp-20);toast('刺激判斷錯誤，隊伍受到衝擊')}const phases=[{name:'切斷聲源',target:'擴音器',decoys:['喪屍王','屍群']},{name:'破壞追蹤',target:'泛光燈',decoys:['跑道','看台']},{name:'核心暴露',target:'胸腔核心',decoys:['手臂','腿部']}];let phase=0,hits=0,remain=260;const p=$('#puzzlePanel');p.classList.remove('hidden');const draw=()=>{const x=[8,42,70].sort(()=>Math.random()-.5);const opts=[phases[phase].target,...phases[phase].decoys];p.innerHTML=`<div class="panel-head"><div><span>落雨的行為模型</span><h2>${phases[phase].name}</h2></div><b id="bossTime">${(remain/10).toFixed(1)} 秒</b></div><div class="puzzle-body"><p>依刺激—反應順序射擊正確目標。階段 ${phase+1} / 3</p><div class="boss-field">${opts.map((o,i)=>`<button class="shot-target ${i===0?'correct':''}" style="left:${x[i]}%;top:${18+i*24}%" data-shot="${i===0?'correct':'wrong'}">${o}</button>`).join('')}</div><div class="boss-health"><i style="width:${100-((phase*2+hits)/6)*100}%"></i></div><p id="bossStatus">${hits} / 2 命中</p></div>`;$$('[data-shot]').forEach(b=>b.onclick=()=>{if(b.dataset.shot==='wrong'){state.hp=Math.max(10,state.hp-8);$('#bossStatus').textContent='錯誤目標！重新觀察刺激反應。';updateUI();return}hits++;if(hits>=2){phase++;hits=0;if(phase>=3)return winBoss()}draw()})};battleTimer=setInterval(()=>{remain--;const t=$('#bossTime');if(t)t.textContent=`${(remain/10).toFixed(1)} 秒`;if(remain<=0){clearInterval(battleTimer);state.hp=Math.max(10,state.hp-30);winBoss()}},100);draw()}
function winBoss(){clearInterval(battleTimer);$('#puzzlePanel').innerHTML='<div class="panel-head"><h2 class="success">變異核心崩解</h2></div><div class="puzzle-body"><p>落雨的行為模型命中三次預測窗口。喪屍王失去指揮能力，屍群陷入混亂。</p><div class="puzzle-actions"><button data-boss-next>執行燃燒計畫</button></div></div>';$('[data-boss-next]').onclick=()=>{$('#puzzlePanel').classList.add('hidden');fireSequence()}}
function fireSequence(){run([
 ['senior','「所有人一起走。」溫晨掃過三張臉，「今天不准任何人把自己寫成犧牲的那一頁。」'],['professor','「東南風，每秒三點二公尺。四十七秒後，火線會合。」許安抱著紀錄，像抱著他唯一承認的信仰。'],
 ['hero','落雨把舞台音響留在燃料圈中央。屍群追著反覆播放的心跳聲聚攏，像一群終於找到錯誤神明的信徒。'],['junior','「線路好了。」李明朗回頭，火光尚未亮起，眼睛裡已經有了紅色，「落雨，妳數。」'],
 ['hero','一。溫晨握住她。二。許安報出最後的風速。三——她沒有閉眼。李明朗按下點火器，整座體育場在他們身後開成一朵過於明亮的花。','boom']
],()=>showCg('fire',finish))}
function topBond(){return Object.entries(state.affection).sort((a,b)=>b[1]-a[1])[0][0]}
function finish(){setScreen(false);$('#ending').classList.remove('hidden');const k=topBond(),c=characters[k],ep={junior:'越過校門後，李明朗第一次沒有把道謝說成「順便」。他望著尚未亮起的街燈，問她：等城市重新有了晚上，能不能再陪他走一次校園。',senior:'溫晨沒有再追問答案，只把手留在她伸手可及的地方。這一次，落雨沒有因為害怕船會離岸，就先鬆開纜繩。',professor:'許安把行為模型的署名留了兩格。他說人從來不是最穩定的變數；落雨回他，也因此才值得研究。'};$('#ending').innerHTML=`<div class="ending-card"><h2>焚盡封鎖線</h2><h3>四人全員生還 · HE</h3><p>火沒有替任何人辨認姓名，只把追逐他們的影子一併吞沒。四個人跨過校門時，天還沒有亮；但在他們身後，那座被封鎖的校園終於不再發出飢餓的聲音。</p><p>${ep[k]}</p><p>最高羈絆：${c.name}｜已解鎖 CG ${state.unlocked.length} / ${Object.keys(cgData).length}</p><button id="endingGallery">CG 回放</button> <button id="endingTitle">返回標題</button></div>`;$('#endingTitle').onclick=()=>location.reload();$('#endingGallery').onclick=()=>openPanel('galleryPanel')}

function renderGallery(){const unlocked=new Set([...savedGallery(),...state.unlocked]);$('#galleryGrid').innerHTML=Object.entries(cgData).map(([id,c])=>`<button class="gallery-item ${unlocked.has(id)?'':'locked'}" data-cg="${id}" ${unlocked.has(id)?'':'disabled'}><img src="${unlocked.has(id)?c.src:'assets/bg-library-archive.png'}" alt=""><span><b>${unlocked.has(id)?c.title:'尚未解鎖'}</b><small>${unlocked.has(id)?c.tag:'在劇情中做出關鍵選擇'}</small></span></button>`).join('');$$('[data-cg]:not(:disabled)').forEach(b=>b.onclick=()=>{closePanels();showCg(b.dataset.cg,()=>openPanel('galleryPanel'),true)})}
function updateUI(){$('#hpText').textContent=state.hp;$('#hpBar').style.width=`${state.hp}%`;$('#resourceText').textContent=state.resources;$('#objectiveText').textContent=state.objective;$('#chapterLabel').textContent=state.time}
function renderInventory(){const notes={'手機（電量 61%）':'通訊、燈號與錄音','巧克力棒':'第一夜僅有的食物','消防通行卡':'開啟頂樓與防火門','行動電源':'維持手機與照明','收音機':'接收災防資訊','行為弱點模型':'落雨與許安建立的刺激—反應預測','燃料與三日份物資':'包含體育場燃燒計畫所需燃料','急救包':'止血、消毒與壓力處置'};$('#inventoryList').innerHTML=state.inventory.map(x=>`<div class="inventory-item"><b>${x}</b><span>${notes[x]||'關鍵物品'}</span></div>`).join('')}
function renderBonds(){$('#bondList').innerHTML=Object.entries(state.affection).map(([k,v])=>`<div class="bond-item"><b>${characters[k].name}</b><span>${characters[k].role}</span><div class="bond-meter"><i style="width:${Math.min(100,12+v*14)}%"></i></div></div>`).join('')}
function renderSave(){const raw=localStorage.getItem('redCampusSaveV4');if(!raw){$('#saveSummary').textContent='尚無存檔';$('#loadSaveBtn').disabled=true;return}const s=JSON.parse(raw);$('#saveSummary').textContent=`已有存檔｜${s.time}｜生命 ${s.hp}`;$('#loadSaveBtn').disabled=false}
function save(){localStorage.setItem('redCampusSaveV4',JSON.stringify(state));localStorage.setItem('redCampusGalleryV3',JSON.stringify([...new Set([...savedGallery(),...state.unlocked])]));toast('進度與 CG 回放已儲存')}
function load(){const raw=localStorage.getItem('redCampusSaveV4');if(!raw)return toast('找不到新版存檔');state={...fresh(),...JSON.parse(raw)};setScreen(true);$('#ending').classList.add('hidden');$('#eventCg').classList.add('hidden');bg(state.location);closePanels();enterExplore();toast('讀取完成')}
function toast(msg){const t=$('#toast');t.textContent=msg;t.classList.remove('hidden');setTimeout(()=>t.classList.add('hidden'),1800)}

$('#newGameBtn').onclick=startNew;$('#continueBtn').onclick=load;$('#chapterBtn').onclick=()=>alert('完整篇章：圖書館異變與夜談 → 頂樓燈號 → 前任重逢 → 變異研究與物資準備 → 心理行為模型射擊戰 → 火燒喪屍王。\n\n三位羈絆角色各有一張必須做出理解其內心的選擇才能解鎖的專屬 CG。');$('#nextBtn').onclick=advance;$('#mapBtn').onclick=()=>openPanel('mapPanel');$('#galleryBtn').onclick=()=>openPanel('galleryPanel');$('#soundBtn').onclick=()=>{soundOn=!soundOn;$('#soundBtn').textContent=`聲音：${soundOn?'開':'關'}`;$('#soundBtn').setAttribute('aria-pressed',soundOn);if(soundOn)playSfx('tap')};$('#inventoryBtn').onclick=()=>openPanel('inventoryPanel');$('#bondBtn').onclick=()=>openPanel('bondPanel');$('#saveBtn').onclick=()=>openPanel('savePanel');$('#writeSaveBtn').onclick=save;$('#loadSaveBtn').onclick=load;$('#titleBtn').onclick=()=>location.reload();$$('[data-close]').forEach(b=>b.onclick=()=>b.closest('.panel').classList.add('hidden'));updateUI();document.body.dataset.gameBoot='bound';
