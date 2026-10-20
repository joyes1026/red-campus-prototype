document.body.dataset.gameBoot='start';
const $=s=>document.querySelector(s),$$=s=>[...document.querySelectorAll(s)];
const C={hero:{name:'落雨',role:'心理系研究生／24 歲',sprite:'assets/sprite-luoyu.png'},junior:{name:'李明朗',role:'電機系研究生／23 歲',sprite:'assets/sprite-liminglang.png'},senior:{name:'溫晨',role:'心理系準博士候選人／27 歲',sprite:'assets/sprite-wenchen.png'},professor:{name:'許安',role:'物理系副教授／36 歲',sprite:'assets/sprite-xuan.png'},narrator:{name:'東濱大學',role:'封鎖紀錄'},phone:{name:'手機訊息',role:'殘餘通訊'}};
const B={library:'assets/bg-library-day.png',reading:'assets/bg-library-reading.png',archive:'assets/bg-library-archive.png',staff:'assets/bg-library-lounge.png',rooftop:'assets/bg-library-rooftop.png',lab:'assets/bg-physics-lab.png',cafeteria:'assets/bg-cafeteria.png',clinic:'assets/bg-clinic.png',stadium:'assets/bg-boss-arena.png'};
const N={library:'校總圖書館',reading:'停電後的閱覽區',archive:'地下密集書庫',staff:'館員休息室',rooftop:'跨樓撤離線',lab:'理化研究室',cafeteria:'中央食堂',clinic:'西校區保健室',stadium:'校體育場'};
const CG={library:['assets/cg-library-night.png','圖書館夜守','第一日'],junior:['assets/cg-bond-liminglang.png','借來的肩膀','李明朗羈絆'],rooftop:['assets/cg-rooftop-signal.png','隔樓燈號','第二日'],lab:['assets/cg-antidote-crisis.png','臨時研究隊','第二日'],wenprotect:['assets/cg-wenchen-protect.png','她站在危險之前','溫晨羈絆'],lihand:['assets/cg-liminglang-hand.png','不要鬆手','李明朗羈絆'],xublush:['assets/cg-xuan-blush.png','理性失溫','許安羈絆'],senior:['assets/cg-bond-wenchen.png','分手半年後','溫晨羈絆'],professor:['assets/cg-bond-xuan.png','模型之外','許安羈絆'],mutant:['assets/cg-mutant-k01.png','K-01 變異感染者','第七日'],fire:['assets/cg-fire-ending.png','封鎖線燃燒','一般 HE'],helicopter:['assets/cg-helicopter-ending.png','晨光救援','隱藏個人結局']};
const KEY='redCampusSaveV6';
const gallery=()=>{try{return [...new Set([...JSON.parse(localStorage.getItem('redCampusGalleryV3')||'[]'),...JSON.parse(localStorage.getItem('redCampusGalleryV5')||'[]')])]}catch{return[]}};
const fresh=()=>({day:1,phase:'library',time:'第一日 · 15:52',hp:100,food:4,phone:61,location:'library',objective:'封鎖圖書館並撐過第一夜',aff:{junior:0,senior:0,professor:0},solved:{},items:['手機','巧克力棒'],unlocked:gallery(),broadcaster:false,introduced:{},day3Partner:null,day4Partner:null,day4Route:null,bondEvents:{},radioTrail:0});
let S=fresh(),Q=[],Qend=null,timer=null,audio=null,sound=true,retry=null;
const TRACKS={daily:{src:'assets/music-daily.mp3',volume:.36},battle:{src:'assets/music-battle.mp3',volume:.48}};
const MUSIC_PLAYERS=Object.fromEntries(Object.entries(TRACKS).map(([key,track])=>{const player=new Audio(track.src);player.loop=true;player.preload='auto';player.volume=track.volume;return[key,player]}));
let music={scene:'',track:'',player:null};
const sceneForLocation=()=> 'daily';
const trackForScene=scene=>['danger','battle'].includes(scene)?'battle':'daily';
function soundContext(){if(!sound)return null;const A=window.AudioContext||window.webkitAudioContext;if(!A)return null;audio||=new A();if(audio.state==='suspended')audio.resume();return audio}
function musicStop(){if(music.player){music.player.pause();music.player.currentTime=0}music={scene:'',track:'',player:null}}
function musicSet(scene){
 if(!sound)return;const track=trackForScene(scene),player=MUSIC_PLAYERS[track];
 if(music.track===track&&music.player){music.scene=scene;if(player.paused)player.play().catch(()=>{});return}
 musicStop();player.currentTime=0;music={scene,track,player};player.play().catch(()=>{})
}
const shuffle=a=>[...a].sort(()=>Math.random()-.5);
function ui(){setScreen(true);$('#hpText').textContent=S.hp;$('#hpBar').style.width=S.hp+'%';$('#resourceText').textContent=S.food;$('#chapterLabel').textContent=S.time;$('#objectiveText').textContent=S.objective;$('#locationLabel').textContent=N[S.location]||'東濱大學'}
function setScreen(g){$('#titleScreen').classList.toggle('hidden',g);$('#gameScreen').classList.toggle('hidden',!g)}
function bg(k){S.location=k;$('#background').style.backgroundImage=`url('${B[k]}')`;$('#locationLabel').textContent=N[k];musicSet(sceneForLocation(k))}
function actor(k){const c=C[k];$('#speaker').textContent=c.name;$('#role').textContent=c.role;const s=$('#sprite');if(!c.sprite)return s.classList.add('hidden');s.classList.remove('hidden');s.querySelector('img').src=c.sprite}
function say(k,t){actor(k);$('#dialogueText').textContent=t;$('#nextBtn').classList.remove('hidden');$('#choices').innerHTML=''}
function run(lines,end){Q=[...lines];Qend=end;advance()}
function advance(){if(Q.length){const [k,t,cue]=Q.shift();if(cue){sfx(cue);if(cue==='door'){const stage=$('#stage');stage.classList.remove('shake');void stage.offsetWidth;stage.classList.add('shake')}}return say(k,t)}$('#nextBtn').classList.add('hidden');const f=Qend;Qend=null;f?.()}
function choose(opts){$('#nextBtn').classList.add('hidden');$('#choices').innerHTML='';opts.forEach(o=>{const b=document.createElement('button');b.textContent=o[0];b.onclick=()=>{if(o[1]){S.aff[o[1]]+=(o[2]||1);toast(`${C[o[1]].name} 羈絆 +${o[2]||1}`)}o.at(-1)()};$('#choices').append(b)})}
function intro(k,next){const c=C[k];$('#sprite').classList.add('hidden');$('#introPortrait').src=c.sprite;$('#introName').textContent=c.name;$('#introRole').textContent=c.role;$('#introText').textContent={hero:'研究依附與創傷。她擅長替別人的恐懼命名，卻仍在學習如何不被自己的恐懼帶走。',junior:'靠工讀與獎學金留在學校。嘴比刀快，手比話誠實；越害怕失去，越先假裝不在乎。',senior:'落雨的前女友。果斷、有主見，習慣站到危險前面，也習慣替所有人決定方向。',professor:'冷靜得近乎刻薄的物理學家。把世界拆成數據，卻沒算進自己的體力與心跳。'}[k];$('#introContinue').textContent=`認識${c.name}`;$('#characterIntro').classList.remove('hidden');$('#introContinue').onclick=()=>{$('#characterIntro').classList.add('hidden');S.introduced[k]=1;next()}}
function unlock(id){if(!S.unlocked.includes(id))S.unlocked.push(id);localStorage.setItem('redCampusGalleryV5',JSON.stringify([...new Set([...gallery(),...S.unlocked])]))}
function cg(id,next){unlock(id);const c=CG[id],former=music.scene||sceneForLocation(S.location),theme=['junior','wenprotect','lihand','xublush','senior','professor'].includes(id)?'bond':['mutant'].includes(id)?'battle':['fire','helicopter'].includes(id)?'ending':former;musicSet(theme);$('#eventCgImage').src=c[0];$('#eventCgTag').textContent=c[2];$('#eventCgCaption').textContent=c[1];$('#eventCg').classList.remove('hidden');$('#eventCgContinue').onclick=()=>{$('#eventCg').classList.add('hidden');musicSet(former);next?.()}}
function sfx(k){const ctx=soundContext();if(!ctx)return;const strike=(delay=0,f1=80,f2=28,d=.28,gain=.25)=>{const o=ctx.createOscillator(),g=ctx.createGain(),n=ctx.currentTime+delay;o.connect(g);g.connect(ctx.destination);o.frequency.setValueAtTime(f1,n);o.frequency.exponentialRampToValueAtTime(f2,n+d);g.gain.setValueAtTime(gain,n);g.gain.exponentialRampToValueAtTime(.001,n+d);o.start(n);o.stop(n+d)};if(k==='door'){strike(0,72,24,.34,.34);strike(.48,66,21,.4,.38);strike(1.03,58,18,.52,.44);return}const v={boom:[55,25,.65],hit:[130,42,.25],alarm:[700,330,.35]}[k]||[220,110,.12];strike(0,...v,.25)}
function toast(t){$('#toast').textContent=t;$('#toast').classList.remove('hidden');setTimeout(()=>$('#toast').classList.add('hidden'),1700)}
function panelClose(){$$('.panel').forEach(x=>x.classList.add('hidden'))}
function start(){S=fresh();ui();bg('library');$('#ending').classList.add('hidden');intro('hero',()=>run([
 ['narrator','星期日下午，陽光把圖書館切成一格一格的蜂蜜色。落雨坐在三樓靠窗的位置，筆電上只有論文題目和一條倔強閃爍的游標。'],
 ['hero','她研究威脅知覺與依附創傷。說得好聽，是想知道人在失去安全感時如何重新信任；說得難聽，是花研究經費替自己的舊傷取一個比較體面的名字。'],
 ['hero','做研究很累。問卷會說謊，受試者會退出，教授會在凌晨兩點回覆「請再釐清理論框架」。可每當她想放棄，又會被某個問題拉回去：人為什麼明知一扇門可能關上，還是願意走進另一個人的房間？'],
 ['narrator','操場上的跑者忽然逆著方向奔跑。第一個人跌倒時，旁邊的人沒有扶；第二個人撲上去時，動作裡少了人類看見痛苦時會有的那一瞬遲疑。'],
 ['hero','那不是恐慌。恐慌會擴散、會彼此模仿；眼前的人群卻像被同一條看不見的線往中心拖。'],
 ['narrator','巨響拍上玻璃帷幕。原子筆從桌面滾落，尖叫隔著厚玻璃傳來，薄得像一段接觸不良的廣播。','boom'],
 ['hero','她的手比思考先動。拉下防火門、推過借書車、扣死消防鎖。最後才抬頭看見玻璃外那張沾血的臉——上週還替她刷過咖啡折扣的學生。'],
 ['hero','有些畫面看第二次，理智就會被拖進去。她只看了一眼，卻知道那一眼會在很多個夜晚重新長出來。']
 ],()=>intro('junior',()=>run([
 ['junior','「學姊，妳鎖門的樣子比口試老師還狠。」李明朗抱著工具箱撞進側門，額角有汗，語氣卻照例欠揍。'],
 ['hero','落雨向來不太喜歡這個直屬學弟。他總把關心說成嘲諷，把求助說成通知，像每一句柔軟的話都要先裹上一層砂紙。'],
 ['junior','「看什麼？再看要收門票。」'],
 ['hero','「確認你有沒有被咬。很遺憾，嘴壞不是感染症狀。」'],
 ['junior','「那學姊安全了，妳本來就這樣。」'],
 ['narrator','兩人合力推書車時，他的袖口滑下。前臂散著新舊不一的燙痕，有些已淡成白線，有些仍紅得像剛寫下的註腳。'],
 ['junior','他察覺她的視線，立刻把袖子扯回去。「廚房出餐口窄。工讀而已，別替我寫病例。」'],
 ['hero','「我還沒問。」她抬起書車另一端，「你先自首，只會讓刑期變長。」'],
 ['hero','先發制人。把別人的疑問搶過來，用玩笑改寫成自己能承受的版本。她在教科書裡讀過這種防衛，也在鏡子裡見過。'],
 ['narrator','日光燈閃了兩次。第一次，落雨的背脊僵住；第二次，她已經聽不見李明朗說了什麼。空調停下，黑暗從書架深處漫出來。'],
 ['hero','黑暗沒有顏色，記憶卻有。它是七歲那年客廳窗簾的深藍，是冰箱壞掉後漸漸消失的嗡鳴，是她喊到聲音沙啞，仍沒有人從門外回答。'],
 ['narrator','她站在原地，手指緊扣借書車邊緣。直到李明朗沒有碰她，只把手電筒放到她視線能看見的位置。'],
 ['junior','「學姊，先看光。要罵我也等呼吸完。」'],
 ['hero','她討厭他看見。更討厭的是，他竟然知道不要突然碰她。']
 ],()=>{bg('reading');libraryHub()}))))}
const lib={reading:[
 ['narrator','月光貼著桌沿爬行，散落的紙像來不及飛走的蛾。館員把消防門密碼拆進借閱紀錄，像早已預料有人會在斷電後需要逃命。'],
 ['junior','「妳猜人的心，我尊重數學。」'],['hero','「數學要是可靠，你剛才不會把二樓說成三樓。」'],['junior','「那是標示不清。」'],['hero','「你對錯誤的忠誠令人敬佩。」'],
 ['hero','他每隔幾秒看一次出口。不是膽小，而是必須永遠先確認退路的人才有的習慣。落雨沒有點破，只移到不會遮住門的位置。'],
 ['junior','李明朗看她一眼，沒有道謝。可肩膀放低了一點。對他而言，這已經接近一句完整的信任。']
 ],archive:[
 ['narrator','密集書庫像一排咬緊的牙。深處的撞擊不急，卻很有耐心。每次燈光掃過軌道，落雨都覺得黑暗在更深處換了一個姿勢。'],
 ['junior','「國中器材室也這麼窄。他們把我關進去，拿走手機，看窮鬼能求救幾次。」'],
 ['hero','他說得像在轉述別人的新聞。只有握手電筒的指節泛白，替那個被關住的少年承認了恐懼。'],
 ['hero','她把光源交給他。「燈在你手上。什麼時候往前，由你決定。」'],['junior','「妳不問後來怎樣？」'],['hero','「你想說的時候，我會聽。不是每道傷口都欠旁觀者一份報告。」'],
 ['junior','他笑了一聲，很輕。「學姊，妳這種人很犯規。」'],['hero','「活著出去再申訴。」']
 ],staff:[
 ['narrator','館員室留著半杯冷茶和沒關的抽屜。電腦螢幕停在請假表，桌曆圈著下週女兒的生日。災難把人趕走，卻忘了替生活收尾。'],
 ['hero','李明朗的手機亮起。薪資入帳後緊跟著房東催租，他抹掉通知，熟練得像擦去桌上一滴水。'],
 ['junior','「白天助教，晚上廚房。少一筆獎學金，我就在論文和房租裡選一個。」'],['hero','「所以你把自己用到快壞掉，還說零件本來就會發燙。」'],
 ['junior','「讀電機至少有工作。畢業薪水寫在招生簡章上，不像心理系，研究完自己還要付諮商費。」'],['hero','「你對心理系的理解，和你對樓層一樣準確。」'],
 ['junior','「那妳為什麼讀？」'],['hero','落雨望向熄黑的窗。她可以說對人有興趣，可以說想幫助別人。那些都是真的，卻不是最早的真相。'],
 ['hero','「因為我想知道，一個人被留下以後，為什麼還會相信別人會回來。」'],['junior','他沒有追問，只看向她一直沒敢撥出的家人電話。「門可以晚點開，不代表永遠不開。」']
 ]};
function libraryHub(){const ready=Object.keys(lib).every(k=>S.solved[k]);S.objective=ready?'撐過停電後的第一夜':'完成圖書館三處調查';ui();if(ready&&!S.solved.libraryNight)return libraryNight();say('narrator',S.objective+'。');$('#nextBtn').classList.add('hidden');$('#choices').innerHTML='<button id="openMapInline">開啟圖書館地圖</button>';$('#openMapInline').onclick=openMap}
function libraryNight(){S.time='第一日 · 23:36';S.objective='在黑暗中守住彼此';bg('reading');ui();run([
 ['narrator','夜深以後，圖書館大得不像建築，更像一頭睡著的獸。每隔幾分鐘，玻璃外便有影子擦過；兩人都假裝沒有看見。'],
 ['junior','李明朗拆開巧克力棒，精確分成一大一小兩截，把大的遞給她。「別感動，我只是不吃太甜。」'],
 ['hero','「包裝寫低糖。」'],['junior','「學姊，世界都這樣了，妳可不可以偶爾配合一下謊言？」'],['hero','「看品質。」'],
 ['narrator','緊急燈在此刻耗盡。黑暗落下來的瞬間，落雨聞到記憶裡發酸的牛奶味。七歲的她又坐在客廳地板上，門外沒有腳步，電話線被拔掉，時鐘每走一格都像有人決定再晚一點回來。'],
 ['hero','那一次，是鄰居聽見哭聲報警。警察撞開門時，她已經在沒有電的屋子裡待了兩天。後來家人說只是「臨時有事」，彷彿兩天可以被一句話折小，塞進誰都不必負責的抽屜。'],
 ['narrator','她知道自己在圖書館，知道身邊有人，知道這不是童年。知識一條條列得清楚，身體卻仍把膝蓋縮到胸前。'],
 ['junior','「落雨。」李明朗第一次沒有叫她學姊。「妳要我開燈，還是說話？」']
 ],()=>choose([
 ['告訴他：「先說話。讓我知道你還在。」','',0,()=>cg('library',libraryTruth)],
 ['開玩笑：「唱歌免了，你的聲音會引來更多。」','',0,libraryDeflect],
 ['只把手電筒拿回來','',0,libraryDeflect]
 ]))}
function libraryTruth(){run([
 ['hero','「我小時候被留在家裡。不是幾個小時，是兩天。最後是警察找到我。」'],
 ['junior','黑暗裡，他很久沒有說話。落雨幾乎後悔，直到他的肩膀輕輕碰上她的。'],
 ['junior','「那不是妳太怕黑。」'],['hero','「心理系標準答案：創傷會把現在誤認成過去。」'],['junior','「我的答案是，他們不該把妳留下。」'],
 ['hero','這句話太簡單，簡單得穿過所有理論。她忽然明白，有些安慰不是重新解釋痛苦，只是終於有人肯說，那件事本來就不應該發生。'],
 ['junior','「換妳問。不是說要聊天？」'],['hero','「為什麼讀電機？」'],['junior','「賺錢。」他答得毫不浪漫，「因為窮過的人選科系，先看薪資中位數，不看命中注定。」'],
 ['hero','「很誠實。」'],['junior','「我妹想讀設計。總得有一個人先把房租變成小問題。」'],
 ['hero','她曾以為他的尖銳來自傲慢。現在才看見，那更像一面自己焊起來的甲：被嘲笑過貧窮、被關進器材室、被迫太早知道錢能決定一扇門開不開。']
 ],()=>choose([
 ['對他說：「你可以想賺錢，也可以喜歡你做的東西。」','junior',2,()=>cg('junior',librarySleep)],
 ['稱讚電機系確實比較實際','',0,librarySleep],
 ['提醒他先睡，明天再談','',0,librarySleep]
 ]))}
function libraryDeflect(){run([
 ['junior','「行，我說話。今天本來來學校修助教課的板子，順便等廚房晚班。現在晚班大概永久取消。」'],['hero','「你可以申請非自願離職。」'],['junior','「理由寫喪屍？」'],['hero','「勞動法沒規定不能。」'],['narrator','他們一來一往，把黑暗切成可以吞嚥的小塊。落雨沒有說出舊事，卻第一次允許另一個人的聲音留在裡面。']
 ],librarySleep)}
function librarySleep(){run([
 ['narrator','後半夜，落雨終於抵不過疲倦。醒來以前，她曾短暫感覺自己落回七歲的客廳；隨後聞到巧克力包裝的甜味，聽見身旁平穩的呼吸。'],
 ['narrator','李明朗睡著前把肩膀挪近，讓她的額頭不至於撞上書櫃。手仍鬆鬆搭在她肩外，像一道不敢收緊、也沒有撤走的欄杆。'],
 ['hero','黑暗仍在。可這一次，她醒來時，有人也在。']
 ],()=>{S.solved.libraryNight=1;libraryHub()})}
function openMap(){panelClose();const p=$('#mapPanel');p.classList.remove('hidden');$('#mapArea').textContent=S.time;$('#mapTitle').textContent=S.phase==='library'?'停電後的圖書館':S.phase==='day3'?'今天和誰一起出發':S.phase==='day5'?'西校區搜索線':S.phase==='day6'?'工程館撤離線':'行動路線';let nodes=[];
 if(S.phase==='library')nodes=[['reading','閱覽區','消防密碼'],['archive','密集書庫','備援電源'],['staff','館員室','夜間物資'],['rooftop','頂樓','前往第二日',!Object.keys(lib).every(k=>S.solved[k])]];
 if(S.phase==='day3')nodes=[['food','和溫晨去生活區','補充食物與飲水'],['family','和李明朗上訊號平台','試著聯絡家人'],['research','留在實驗室陪許安','重建遺失的研究資料']];
 if(S.phase==='day5')nodes=[['clinic','西側保健室','藥物與舊同學'],['day6','工程館地下入口','準備離開系館',!S.solved.clinic]];
 if(S.phase==='day6')nodes=[['tunnel','工程館管線','RPG 討伐'],['generator','備用發電室','手機已耗盡'],['day7','前往體育場','最後一日',!S.solved.tunnel||!S.solved.generator]];
 $('#mapTip').textContent=S.phase==='day3'?'今天只能選一位同行者；夜間將與對方分在同一個房間值守。':'地區名稱只代表可抵達的位置，未探索事件不會預先標示。';
 $('#mapGrid').innerHTML=nodes.map(([k,n,d,l])=>`<button class="map-node ${S.solved[k]?'done':''} ${l?'locked':''}" data-loc="${k}" style="--node-bg:url('${B[k]||B.lab}')"><span class="map-node-copy"><b>${n}</b><span>${d}</span><em>${S.solved[k]?'已完成':l?'尚未開放':'出發'}</em></span></button>`).join('');$$('[data-loc]').forEach(b=>b.onclick=()=>{if(b.classList.contains('locked'))return toast('還有必要的準備沒有完成');visit(b.dataset.loc)})}
function visit(k){panelClose();if(k==='rooftop')return day2();if(k==='day4')return day4();if(k==='day6')return day6();if(k==='day7')return day7();if(S.solved[k])return toast('這條路已經搜索過');bg(({food:'cafeteria',family:'rooftop',research:'lab',broadcast:'staff',tunnel:'archive',generator:'lab'})[k]||k);if(lib[k])return run(lib[k],()=>simplePuzzle(k));({food:foodRun,family:familyRun,research:researchRun,clinic:clinicRun,broadcast:broadcastRun,tunnel:tunnelRun,generator:generatorRun})[k]()}
const PUZZLES={
 reading:[
  {clue:'館員便條寫著：「密碼不是日期，是最後一筆仍由本人歸還的書。」三張單據中，只有《依附理論》有櫃台指紋與完整磁條紀錄。',q:'哪一筆借閱紀錄可信？',a:'《依附理論》／04:27',o:['《群體心理》／04:72','《夢的解析》／07:24','《依附理論》／04:27']},
  {clue:'鍵盤磨損集中在 0、2、4、7；門旁鏡面便條寫著「別把時間倒過來」。',q:'輸入哪組四位數？',a:'0427',o:['7240','0472','0427','2704']},
  {clue:'電子鎖會先解除門磁，再發出確認音。感染者對尖銳聲最敏感。',q:'輸入後應立刻做什麼？',a:'用外套包住蜂鳴器',o:['拉門確認是否解鎖','用外套包住蜂鳴器','打開手機手電筒','敲玻璃通知外面']}
 ],
 archive:[
  {clue:'備援箱標示：警報 4A、軌道 7A、低照明 2A。電池只剩 9A；啟動軌道後峰值會多出 2A。',q:'第一個必須切斷的迴路？',a:'警報',o:['低照明','軌道','警報','全部保留']},
  {clue:'軌道移動會讓書架靠攏。李明朗量出兩人所在縫隙只有六十公分。',q:'安全的第二步？',a:'先退出軌道，再接電池',o:['先退出軌道，再接電池','站在縫隙內啟動','同時開兩組軌道','先恢復警報']},
  {clue:'備援電量只能撐一夜。出口在北側，地圖顯示每隔兩排有一盞方向燈。',q:'最後保留哪個負載？',a:'北側間隔低照明',o:['全館主燈','空調與飲水機','北側間隔低照明','電梯照明']}
 ],
 staff:[
  {clue:'兩人都已清醒超過十四小時。落雨容易在凌晨三點注意力下降；明朗五點要檢查門鎖。',q:'哪個輪值最不容易同時失守？',a:'落雨先睡，明朗 02:30 交班',o:['兩人一起撐到天亮','落雨先睡，明朗 02:30 交班','明朗睡到六點','每半小時互相叫醒']},
  {clue:'手機剩 61%。行動網路反覆搜尋基地台時，耗電比飛航模式高四倍。',q:'保留外界消息的方式？',a:'飛航模式，每小時短暫連線',o:['持續播放新聞直播','把亮度調高等待訊息','飛航模式，每小時短暫連線','兩支手機都保持熱點']},
  {clue:'門外撞擊每九十秒一次，會在兩次撞擊後停二十秒。水與急救箱在走廊七步外。',q:'何時取回物資？',a:'第二次撞擊後的靜默期',o:['第一次撞擊時衝出去','完全沒有聲音五分鐘後','第二次撞擊後的靜默期','現在立刻出去']}
 ]
};
function simplePuzzle(k){const p=$('#puzzlePanel');p.classList.remove('hidden');let step=0;const draw=()=>{const x=PUZZLES[k][step];const opts=shuffle(x.o);p.innerHTML=`<div class="panel-head"><div><span>推理 ${step+1}／3</span><h2>${x.q}</h2></div></div><div class="puzzle-body"><p class="clue">${x.clue}</p><div class="puzzle-actions puzzle-grid">${opts.map(v=>`<button data-answer="${v===x.a?'ok':'bad'}">${v}</button>`).join('')}</div><p class="sequence">錯誤會製造聲響；選項每次都會重新排列。</p></div>`;$$('[data-answer]').forEach(b=>b.onclick=()=>{if(b.dataset.answer==='ok'){step++;sfx('hit');if(step===3){S.solved[k]=1;S.items.push({reading:'消防門密碼',archive:'備援電池',staff:'夜間物資'}[k]);p.classList.add('hidden');return libraryHub()}draw()}else{S.hp=Math.max(1,S.hp-7);ui();triggerRed();toast('推理失誤，聲音沿著走廊傳開');draw()}})};draw()}
function day2(){S.day=2;S.phase='escape';S.time='第二日 · 06:34';S.objective='趁日照穿越中庭，抵達理化研究室';bg('rooftop');ui();run([
 ['narrator','清晨的校園像退潮後的海床。陽光照亮操場中央遺落的書包、水瓶和一隻沒有主人的球鞋；感染者躲進樹影與騎樓，並沒有消失。'],
 ['hero','落雨站在頂樓邊緣，第一次看清災難的尺度。昨天以前，校園只需要從宿舍走到研究室；現在每一棵樹、每一道遮雨棚，都可能把十公尺變成遺言。'],
 ['junior','「對面理化樓有人。」李明朗指向遠處。玻璃後閃了三短、三長、三短，停頓後又換成兩長一短。'],
 ['hero','第一組是求救。第二組不是標準摩斯碼，更像他們系上社團曾用過的燈號。要不要回應，意味著要不要讓未知的人知道圖書館裡還有活人。']
 ],()=>choose([
 ['用館內燈號回覆「兩人，準備移動」','',0,()=>cg('rooftop',day2Crossing)],
 ['只記下對方位置，不暴露圖書館','',0,day2Crossing],
 ['關掉手電筒，立刻下樓','',0,day2Crossing]
 ]))}
function day2Crossing(){run([
 ['phone','手機在此時震動。溫晨：不要去系館主樓。食堂昨晚爆發感染，我和許教授撤到理化研究室五樓。沿日照走。'],
 ['junior','「她命令人的口氣隔著斷訊都沒變。」'],
 ['hero','落雨沒有回答。那個名字在胸口敲了一下。半年以前，她最熟悉溫晨的每一種標點：句號代表決定，問號通常只是比較禮貌的句號。'],
 ['hero','她以為分手能先一步避開被留下。可真正收到溫晨的訊息時，安心仍比自尊更早抵達。身體從來不配合人維持體面。'],
 ['junior','「前女友？」'],['hero','「你怎麼知道？」'],['junior','「妳看到訊息的表情像收到錄取通知又發現學費沒減免。」'],['hero','「李明朗，你如果把觀察力用在電路上，板子可能早就修好了。」'],
 ['narrator','他們推開消防門。陰影裡的人影快得不像飢餓，更像一枚被彈出的釘子。']
 ],()=>qte('陰影伏擊','感染者撲倒落雨。李明朗一腳將它踹開——連續按對三次按鍵才能起身。',()=>run([
 ['narrator','視野在地面與天空之間劇烈翻轉。紅色沿著邊緣收縮，李明朗抓住她的後領，把她從那排牙齒前拖開。'],
 ['junior','「看我！別研究牠，先站起來！」'],
 ['hero','她在顫抖。知道杏仁核如何接管身體，並不能讓身體免於被接管；就像知道自己害怕被丟下，也沒有讓分手那天的她更勇敢。'],
 ['hero','李明朗站在光裡，手伸得很直，沒有催。她想起昨夜他問的是「開燈，還是說話」，不是擅自替她決定。'],
 ['junior','「剩下的路，不准鬆。」']
 ],()=>choose([
 ['握住他的手：「那你也別先放。」','junior',1,()=>cg('lihand',day2SecondAttack)],
 ['自己撐著牆站起來','',0,day2SecondAttack]
 ]))))}
function day2SecondAttack(){qte('理化樓入口','第二隻感染者從柱後衝出。按對三次，穿過防火門。',arriveLab)}
function qte(title,desc,next){reactionEncounter('escape',title,desc,next)}
function triggerRed(){$('#redFlash').classList.remove('flash');$('#stage').classList.remove('shake');void $('#stage').offsetWidth;$('#redFlash').classList.add('flash');$('#stage').classList.add('shake')}
function death(t){panelClose();musicSet('danger');$('#ending').classList.remove('hidden');$('#ending').innerHTML=`<div class="ending-card"><h2>封鎖紀錄中斷</h2><p>${t}</p><button id="retry">從遭遇前重試</button></div>`;$('#retry').onclick=()=>{$('#ending').classList.add('hidden');S.hp=Math.max(55,S.hp);ui();retry?.()}}
function arriveLab(){S.time='第二日 · 09:10';bg('lab');ui();run([
 ['narrator','理化樓門內站著一個穿社團外套的感染者。落雨認得那枚歪掉的胸章——張雅亭，上個月還借過她統計課筆記。'],['hero','她知道眼前只剩刺激、反射與飢餓；可名字仍在。名字讓「樣本」重新變回一個會笑、會遲到、會抱怨報告的人。'],['junior','「落雨。」李明朗沒有催她，只把鐵管橫到兩人之間。'],['hero','「我知道。」她說。聲音卻不像知道。']
 ],()=>rpg('昔日同學',()=>run([
 ['narrator','門關上後，落雨在樓梯間吐了。理論沒有背叛她，只是理論從未承諾能讓悲傷變輕。'],['senior','「小雨？」一隻手從側面扣住她，她反肘撞回去，才在半途認出溫晨。'],['senior','「半年不見，招呼變得很熱情。」'],['hero','前女友和喪屍一樣，都擅長在門鎖好後出現。不同的是，喪屍不會用這種眼神看她。']
 ],()=>intro('senior',()=>intro('professor',()=>run([
 ['professor','「重逢稍後。先說你們遇到的速度、聲源反應與瞳孔變化。」'],['hero','許安摘下護目鏡。末日裡仍長得像會讓學生自願重修，實在很不合時宜。'],['hero','雙性戀的好處，是能平等欣賞所有漂亮的人；壞處是漂亮的人通常都很麻煩。'],['senior','「昨晚食堂一亂，我先把能拿的罐頭全掃進推車。許教授只記得抱研究硬碟。」'],['professor','「資料能重建食物分配。反過來不行。」'],['junior','「難怪教授看起來像一頓沒吃過。」'],['narrator','四個人第一次在同一張桌邊分罐頭。外頭是感染者，桌上卻仍有人嫌豆子太甜。平凡沒有消失，只是變得很昂貴。']
 ],()=>{cg('lab',day3)}))))))}
function rpg(name,next){reactionEncounter('battle',`討伐：${name}`,'讀出牠的假動作，在時間耗盡前完成三次反制。',next)}
function reactionEncounter(mode,title,desc,next){
 const returnScene=sceneForLocation(S.location);musicSet(mode==='battle'?'battle':'danger');retry=()=>reactionEncounter(mode,title,desc,next);clearInterval(timer);triggerRed();sfx('boom');
 const p=$('#puzzlePanel');p.classList.add('hidden');
 let round=0,target='',deadline=0,accepting=false;const keys=['W','A','S','D'];
 const fail=reason=>{if(!accepting)return;accepting=false;clearInterval(timer);S.hp-=mode==='battle'?28:18;ui();triggerRed();if(S.hp<=0){removeEventListener('keydown',onKey);return death(reason)}round=0;toast('反應失誤，連擊歸零');setTimeout(draw,260)};
 const chooseKey=k=>{if(!accepting)return;accepting=false;if(k!==target){accepting=true;return fail(mode==='battle'?`${title}抓住落雨判斷遲疑的瞬間。`:'感染者壓住她的肩膀，牙齒近得能聞到血。')}clearInterval(timer);sfx('hit');round++;if(round>=3){removeEventListener('keydown',onKey);p.classList.add('hidden');musicSet(returnScene);return next()}draw()};
 const onKey=e=>{const k=e.key.toUpperCase();if(keys.includes(k))chooseKey(k)};
 const draw=()=>{clearInterval(timer);accepting=true;target=keys[Math.floor(Math.random()*keys.length)];const seconds=[3,2,1][round],actions=shuffle(keys);deadline=performance.now()+seconds*1000;p.innerHTML=`<div class="reaction-top"><div class="danger-clock"><i id="dangerFill"></i></div><div class="combat-bars"><span>落雨 <b>${Math.max(0,S.hp)}</b><i><em style="width:${Math.max(0,S.hp)}%"></em></i></span><span>${mode==='battle'?'感染者':'脫困'} <b>${3-round}</b><i><em class="enemy" style="width:${(3-round)/3*100}%"></em></i></span></div></div><div class="puzzle-body reaction-body"><span class="reaction-round">第 ${round+1} 次反應 · ${seconds} 秒</span><h2>${title}</h2><p>${desc}</p><kbd>${target}</kbd><div class="reaction-keys">${actions.map(k=>`<button data-key="${k}" aria-label="按下 ${k}">${k}</button>`).join('')}</div><p>必須連續成功三次；失誤會從第一輪重新開始。</p></div>`;$$('[data-key]').forEach(b=>b.onclick=()=>chooseKey(b.dataset.key));timer=setInterval(()=>{const remain=Math.max(0,deadline-performance.now()),bar=$('#dangerFill');if(bar)bar.style.width=`${remain/(seconds*1000)*100}%`;if(remain<=0)fail(mode==='battle'?`${title}在倒數結束時撞破了防線。`:'她慢了半秒，陰影便整個覆下來。')},30)};
 setTimeout(()=>{p.innerHTML=`<div class="threat-reveal"><img src="assets/cg-mutant-k01.png" alt="感染者從陰影撲出"><div><span>接觸警報</span><h2>${title}</h2><p>${desc}</p></div></div>`;p.classList.remove('hidden');setTimeout(()=>{addEventListener('keydown',onKey);draw()},720)},460)
}
function day3(){S.day=3;S.phase='day3';S.time='第三日 · 07:12';S.objective='選擇今天唯一的同行者';S.food-=1;bg('lab');ui();run([
 ['narrator','理化系館五樓在疫情爆發時沒有排課。溫晨和許安把實驗桌、氣瓶推車與整排鐵櫃堵在兩座樓梯口，只留下能容一個人側身通過的暗門。'],
 ['narrator','於是這一層成了一艘擱淺的船：東側實驗室是廚房，儀器準備室成了臥房，走廊盡頭則堆著從食堂帶回來的米、罐頭與六箱水。'],
 ['narrator','第三天清晨，樓梯門突然傳來三下撞擊。第一下像有人敲門，第二下像有人後悔太客氣，第三下讓燒杯彼此碰出細碎的牙齒聲。','door'],
 ['junior','李明朗從睡袋裡坐起來，頭髮翹得像訊號不良。「如果是外送，我給五星；如果不是，我給它一棍。」'],
 ['hero','「你昨晚打呼，可能是它循聲來退貨。」'],
 ['junior','「我沒打呼。」'],
 ['professor','許安沒有抬頭。「五十三分貝。間隔十一秒。嚴格來說，是規律性噪音。」'],
 ['junior','「教授，世界末日還幫人量打呼，研究經費用得真好。」'],
 ['senior','溫晨把鐵棍擱在門旁，先確認落雨手腕沒有傷，才去看障礙物。「門沒移。都回去吃東西。」'],
 ['hero','她說「都」，手卻仍扣著落雨的腕骨。那是溫晨一貫的保護方式：把關心偽裝成一道不接受申訴的命令。'],
 ['professor','「還有一件事。」許安盯著空白螢幕，語氣比門外的撞擊更冷，「昨夜跳電，三年的粒子追蹤資料和今天的感染樣本紀錄都不見了。」'],
 ['senior','「備份？」'],
 ['professor','「備份碟在另一棟樓。雲端需要網路。紙本被李同學拿去墊門。」'],
 ['junior','「那疊寫著『廢棄版本』。」'],
 ['professor','「學術上，廢棄不等於可以踩。」'],
 ['hero','許安把隨身碟插進去、拔出來，再插一次，像理性若重複得夠多，世界就會羞愧地恢復正常。落雨忽然覺得他有點怪可愛。世界末日還能想這些，證明她的腦大概也沒有很正常。'],
 ['senior','溫晨看了她一眼。「妳在笑什麼？」'],
 ['hero','「在確認人類的注意力很有韌性。」'],
 ['junior','「翻譯：她在看帥哥。」'],
 ['hero','「你今天的早餐可以只吃你的觀察力。」'],
 ['narrator','笑聲很短，短得像門縫裡漏進來的一小片日光。可四個人都安靜了一瞬，彷彿想起這裡原本也可以只是普通的一天。'],
 ['senior','「今天分組。一個人留守，兩個人外出，另一個整理撤離線。」她把地圖推到落雨面前，「妳選同行者。只選一個。」']
 ],hub)}
function hub(){ui();say('narrator',S.objective);$('#nextBtn').classList.add('hidden');$('#choices').innerHTML='<button id="openMapInline">選擇行動路線</button>';$('#openMapInline').onclick=openMap}
function foodRun(){if(S.day3Partner)return toast('今天的同行者已經決定');S.day3Partner='senior';run([
 ['senior','「生活區在北側。只拿高熱量、水和醫療用品。妳走我右後方。」'],['hero','「我有自己的方向感。」'],['senior','「妳上次在車站迷路四十分鐘。」'],['hero','「那是動線設計不良。」'],['senior','「妳最後打電話叫我去接。」'],['hero','「那是善用既有資源。」'],['narrator','溫晨沒有笑，只把較厚的外套披到她肩上。拉鍊拉到下巴，動作熟練得令半年的分手像一張薄紙。'],['hero','「妳不用一直把我放在身後。」'],['senior','「我知道。」'],['hero','「妳說知道的時候，通常完全沒有要改。」'],['senior','「那妳就活著回來跟我吵。」'],['narrator','冷藏庫前的感染者從貨架陰影撲出。溫晨將落雨壓進懷裡，鐵棍擦過她肩側；她連痛都沒出聲，只先確認落雨有沒有被抓傷。']
 ],()=>rpg('生活區感染者',()=>cg('wenprotect',()=>run([
 ['hero','落雨替她包紮。繃帶繞過肩膀時，溫晨難得沒有下命令。'],['senior','「我去國外，不等於把妳留下。」'],['hero','「但妳連害怕的時間表都替我排好了。」'],['senior','「因為妳一不安，就會先把自己從別人的未來刪掉。」'],['hero','「妳也一樣。一想保護誰，就把對方的選擇一起保護沒了。」'],['senior','溫晨垂眼看著她的手。「那我們各改一件。妳別替我說分手，我別替妳說留下。」']
 ],()=>completeBondDay('food','senior',5)))))}
function familyRun(){if(S.day3Partner)return toast('今天的同行者已經決定');S.day3Partner='junior';run([
 ['junior','「先說好，我不是需要心理輔導。我只需要屋頂那格訊號。」'],['hero','「放心，收費很貴，你付不起。」'],['junior','「學姊講話這麼毒，難怪只剩論文陪妳。」'],['hero','「論文至少不會把電線剪短三公分還怪尺。」'],['junior','「那是預留誤差。」'],['hero','「你的人生是不是也都用誤差在活？」'],['narrator','李明朗哼了一聲，卻在每個轉角先探頭。他讓她走日照最亮的內側，自己貼著陰影，像嘴上的刺與身體的誠實分屬兩個人。'],['junior','屋頂只剩一格訊號。他撥了三次，沒有人接。「我妹會以為我又故意不回家。」'],['hero','「那就留下訊息。不是交代後事，是告訴她你正在回去。」'],['junior','「如果回不去呢？」'],['hero','「那也是下一分鐘的你要煩惱。現在的你只負責讓她知道，你沒有不要她。」'],['junior','他錄了很久，最後只說：冰箱上層的錢先拿去，別省飯。說完又罵了一句訊號，像只要先對世界生氣，世界就不能先傷他。'],['narrator','回程的遮雨棚下傳來拖行聲。李明朗偏頭：「學姊，這次別研究，跑就對了。」'],['hero','「你如果跑太慢，我會把你寫進研究限制。」']
 ],()=>qte('屋頂追逐','陰影裡的感染者撞開鐵門。跟上李明朗的節奏。',()=>cg('lihand',()=>run([
 ['narrator','他牽住她的手，一路沒有鬆開。安全後反而先放開，耳尖紅得比警示燈更不專業。'],['junior','「別誤會。妳跌倒會拖慢我。」'],['hero','「你心跳這麼快，也是怕我影響行軍速度？」'],['junior','「……樓梯太多。」'],['hero','「嗯。你的嘴也爬了很多層。」']
 ],()=>completeBondDay('family','junior',5)))))}
function researchRun(){if(S.day3Partner)return toast('今天的同行者已經決定');S.day3Partner='professor';run([
 ['professor','「先聲明，留下不代表比較安全。也不代表妳可以碰那台離心機。」'],['hero','「教授邀請人幫忙的方式，很像在驅逐。」'],['professor','「我沒有邀請。是妳選的。」'],['narrator','許安把損壞的硬碟排成一列。每一個標籤都寫著日期，整齊得像他拒絕承認資料已經死去。'],['professor','「三年。四百二十七組軌跡。審稿人要的補充實驗也在裡面。」'],['hero','「你不是只在煩惱解藥資料。」'],['professor','「世界末日不會自動延長論文期限。」'],['hero','他說得太認真，落雨忍不住笑了一聲。'],['professor','「哪裡可笑？」'],['hero','「沒有。只是覺得教授很……敬業。」'],['professor','「妳原本要用的形容詞不是這個。」'],['hero','「心理系的職業倫理禁止我回答。」'],['narrator','他皺著眉重新焊接接口，睫毛被工作燈照出一圈淡影。末日、失聯、飢餓都在門外；落雨卻還能覺得一個為資料煩躁的人怪可愛。人腦對不合時宜的念頭，向來有驚人的生存力。'],['professor','「找到了。K-01 並不是怪物，是神經傳導速度被放大的感染者。牠會從重複動作預測下一步。」'],['hero','「那就餵給牠假的習慣。先重複，再在關鍵點背叛模式。」'],['professor','許安終於抬頭。「這個假設值得留下。」'],['hero','「比那四百二十七組資料更值得？」'],['professor','「不要得寸進尺。」']
 ],()=>run([
 ['narrator','午後餘震般的撞門聲傳來時，許安下意識護住硬碟，起身太快，額角撞上櫃門。'],['hero','落雨替他貼上紗布。距離近得能看見他眼下連日失眠的青色。'],['professor','「距離太近，會影響觀察。」'],['hero','「教授臉紅也屬於資料嗎？」'],['professor','「……刪除那筆。」'],['hero','「資料不是都不能刪？」'],['professor','「這筆可以。」']
 ],()=>cg('xublush',()=>completeBondDay('research','professor',5))))}
function completeBondDay(node,partner,value){S.solved[node]=1;if(!S.bondEvents.day3){S.bondEvents.day3=partner;S.aff[partner]+=value;toast(`${C[partner].name} 羈絆 +${value}`)}if(node==='food')S.food+=5;day3Night(partner)}
function finishNode(k){S.solved[k]=1;hub()}
function day3Night(partner){S.time='第三日 · 23:48';S.objective=`與${C[partner].name}守完夜班`;bg('lab');ui();const common=[
 ['narrator','夜裡，四個人把研究室分成兩間臨時睡房。白板架橫在走廊中央，誰白天同行，晚上就負責同一區的值守。'],['narrator','門外偶爾傳來指甲刮過鐵皮的聲音。每一下都很輕，像有人仍記得禮貌，卻忘了自己為什麼敲門。'],['senior','溫晨重新巡過障礙物，替每一只推車的輪子塞進木楔。'],['junior','李明朗用壞掉的示波器接門磁，嘴上說只是因為睡不著。'],['professor','許安把重建出的感染數據抄到紙上。電子資料會消失，紙至少只會被人拿去墊門。'],['hero','他們沒有說「晚安」。那兩個字太像對明天有把握。']
 ];const rooms={
 senior:[['senior','「小雨，睡裡面。我靠門。」'],['hero','「妳肩膀有傷。」'],['senior','「所以更不會睡熟。」'],['hero','「溫晨，保護不是把妳自己放在可以犧牲的位置。」'],['senior','她沉默很久，最後把睡袋往落雨旁邊拖近半尺。「那妳醒著的時候，記得保護我。」']],
 junior:[['junior','「妳睡覺會不會說夢話？」'],['hero','「你打呼五十三分貝，沒有資格採集別人的睡眠資料。」'],['junior','「教授那是儀器誤差。」'],['hero','「嗯，誤差還會流口水。」'],['narrator','他把外套捲成枕頭扔給她，自己靠著門坐下。半夜落雨驚醒時，兩人的手還隔著睡袋碰在一起。誰都沒有先收回去。']],
 professor:[['professor','「床墊給妳。我不需要。」'],['hero','「連續清醒會降低判斷力，這是你的數據。」'],['professor','「我可以坐著休息。」'],['hero','「教授，如果你昏倒，我會把『拒絕睡覺』寫進研究限制。」'],['narrator','許安終於躺下，仍把硬碟抱在胸前。落雨替他關掉桌燈時想，一個人最放不下的東西，往往比告白誠實。']]
 }[partner];run([...common,...rooms],day4)}
function day4(){panelClose();S.day=4;S.phase='day4';S.time='第四日 · 08:05';S.objective='決定今日搜索方式';S.phone=9;bg('lab');ui();run([
 ['narrator','第四天早上，手機只剩百分之九。窗外的感染者開始避開正午，躲進連通道與樹蔭；校園像一張把安全區慢慢擦掉的地圖。'],
 ['junior','李明朗把最後一條家人訊息抄到紙上。「不是紀念。只是手機沒電時比較方便罵人。」'],
 ['hero','「你妹妹如果看見，一定先罵你的字。」'],
 ['junior','「至少她看得懂。妳的論文標題像密碼學。」'],
 ['professor','許安把新畫的路線圖鋪開。「西側還有藥品、電池，以及舊行政區。日落前必須回來。」'],
 ['senior','「兩人一組。從今天起，任何人都不准單獨出去。」'],
 ['hero','落雨看著地圖上最窄的那條線。人有時不是不知道危險，只是不願再讓別人替自己承擔。']
 ],chooseDay4Action)}
function chooseDay4Action(){choose([
 ['先去西側舊教學區查看','',0,soloAttempt],
 ['和李明朗搜索保健室外圍','',0,()=>day4Normal('junior')],
 ['和許安檢查工程館電力','',0,()=>day4Normal('professor')]
])}
function soloAttempt(){run([
 ['hero','「我自己去西側。人少，聲音也少。」'],['senior','「不行。」'],['hero','「妳至少可以先問理由。」'],['senior','「答案不會因為理由漂亮就改變。」'],['junior','「學姊，妳一個人出去，是打算讓我們三個比誰先瘋嗎？」'],['professor','「單人搜索沒有交叉觀察，也無法搬運傷者。效益為負。」'],['hero','三種語氣，說的是同一句話。落雨忽然明白，被需要有時也像一道門：不是關住她，是不准她消失。'],['senior','溫晨把三枚不同顏色的路標放到桌上。「選一個人。這次不是命令，是妳答應我們的方式。」']
 ],()=>choose([
 ['和溫晨走紅色路標','',0,()=>hiddenTrail('senior')],['和李明朗走黃色路標','',0,()=>hiddenTrail('junior')],['和許安走藍色路標','',0,()=>hiddenTrail('professor')]
]))}
function day4Normal(partner){S.day4Partner=partner;run([
 ['narrator',`${C[partner].name}與落雨沿著日照搜索。舊教室裡仍留著沒擦完的板書，日期停在災難發生前一天。`],['hero','她找到兩包電池與半箱繃帶，卻沒有找到能把校園重新接回世界的東西。'],['narrator','傍晚回到五樓時，門後又響了兩下。這一次，四個人都知道該拿什麼、站在哪裡。恐懼沒有變小，只是不再需要一個人搬。']
 ],day5)}
function day5(){S.day=5;S.phase='day5';S.time='第五日 · 10:15';S.objective='搜索西校區，補齊撤離物資';S.phone=0;S.food-=2;bg('clinic');ui();run([
 ['narrator','第五天，最後一支手機熄滅。黑色螢幕照出四張疲憊的臉，像一扇再也打不開的窗。'],['junior','「以前剩百分之一，我會覺得世界末日。」'],['professor','「現在可以修正假設。」'],['senior','「兩位如果還有力氣講笑話，就各多背一瓶水。」'],['hero','他們開始像真正的隊伍。溫晨看路，許安報距離，明朗清障；落雨記住每隻感染者先看聲音、再追移動物的習慣。'],['hero','熟練沒有讓事情變得不恐怖，只讓恐怖變成可以分工的事。'],['narrator','離開前，李明朗在門內畫下一條粉筆線。溫晨逐一檢查護具，許安把紙本數據塞進胸前，落雨則回頭看了這層樓一眼。它不像家，卻收留了他們三個夜晚。']
 ],hub)}
function clinicRun(){run([['narrator','保健室名冊上還有熟人的名字。有人在爆發前替同學領過止痛藥，最後一筆簽名停在昨天。'],['hero','平凡生活留下的證據比血跡更可怕。'],['senior','「難過可以。別一個人掉隊。」']],()=>rpg('走廊變異者',()=>finishNode('clinic',0,null)))}
function hiddenTrail(partner){S.day4Partner=partner;const talk={
 senior:[['senior','「走我後面。」'],['hero','「妳剛才說這不是命令。」'],['senior','「選人的部分不是。隊形是。」'],['hero','「溫晨，妳的民主只活了十五秒。」']],
 junior:[['junior','「妳真的很會挑麻煩。正常人會選保健室。」'],['hero','「正常人也不會在門上接自製警報。」'],['junior','「那叫工程。」'],['hero','「會在半夜尖叫的工程，通常叫麻煩。」']],
 professor:[['professor','「妳選這條路的依據？」'],['hero','「直覺。」'],['professor','「不可重現、不可驗證。」'],['hero','「但教授還是跟來了。」'],['professor','「那是風險控制，不是認同。」']]
 }[partner];run([...talk,
 ['narrator','舊教學區的樓牌被雨水泡爛，只剩牆上的疏散箭頭。遠處傳來斷續金屬聲，既不像風，也不像感染者。'],['hero','落雨注意到每一個箭頭旁都有被人重新描過的粉筆記號。有人在災難後來過，而且刻意避開主走廊。']
 ],()=>trailPuzzle(partner))}
function trailPuzzle(partner){const p=$('#puzzlePanel');p.classList.remove('hidden');let step=0;const data=[
 {clue:'疏散圖的北箭頭被撕掉；窗外下午日影正落向右側。粉筆三角的缺口卻都朝相反方向。',q:'粉筆記號指向哪裡？',a:'朝日影相反的西側樓梯',o:['沿日影走東側長廊','朝日影相反的西側樓梯','返回中央大廳','往地下停車場']},
 {clue:'樓梯間有三扇門。左門後風聲穩定；中門有規律刮擦；右門門縫飄出陳舊紙屑。金屬聲從高處傳來。',q:'哪扇門最可能通往未被堵死的上層？',a:'左門：有穩定穿堂風',o:['中門：規律刮擦','右門：飄出紙屑','左門：有穩定穿堂風','原地敲門測試']},
 {clue:'牆上殘字只剩「……播」、「器材」、「頂層天線」。最近的腳印卻朝反方向延伸，像有人刻意把追蹤者引走。',q:'接下來應該跟隨什麼？',a:'逆著腳印，往殘字指向的夾層',o:['順著腳印追人','逆著腳印，往殘字指向的夾層','拆開最近的教室門','回到陽光最亮處']}
 ];const draw=()=>{const x=data[step];p.innerHTML=`<div class="panel-head"><div><span>無標記區域 · ${step+1}／3</span><h2>${x.q}</h2></div></div><div class="puzzle-body"><p class="clue">${x.clue}</p><div class="puzzle-actions puzzle-grid">${shuffle(x.o).map(v=>`<button data-trail="${v===x.a?'ok':'bad'}">${v}</button>`).join('')}</div><p class="sequence">這條路沒有標在行動地圖上。</p></div>`;$$('[data-trail]').forEach(b=>b.onclick=()=>{if(b.dataset.trail==='ok'){step++;if(step===data.length){p.classList.add('hidden');return run([
 ['narrator','夾層盡頭是一間沒有門牌的舊控制室。玻璃後方擺著一只軍綠色金屬箱，天線折在側邊。'],['hero','她還來不及靠近，天花板上方忽然垂下一雙沾血的手。'],[partner,'「退後！」'],['narrator','感染者撞落通風板，正好截斷回頭的路。']
 ],()=>rpg('控制室伏擊者',()=>broadcastRun(partner)))}draw()}else{p.classList.add('hidden');toast('記號在轉角消失了');day4Normal(partner)}})};draw()}
function broadcastRun(partner){run([
 ['narrator','控制室裡的機器覆著厚灰。軍綠色金屬箱沒有標籤，只有旋鈕旁一排手寫頻率與一張燒掉半邊的值班紀錄。'],['professor','許安在對講機裡說：「先別通電。舊電容若反向充電，會把最後的電池燒掉。」'],['junior','李明朗的聲音插進來：「看線色。黑線接地，紅線別碰外殼。」'],['senior','溫晨只問：「小雨，有沒有受傷？」'],['hero','三個人的聲音擠在雜訊裡。世界沒有回來，但至少他們還在同一個頻道。']
 ],()=>radioPuzzle(partner))}
function radioPuzzle(partner){const p=$('#puzzlePanel');p.classList.remove('hidden');let step=0;const data=[
 {clue:'值班紀錄：104.7 在停播後仍每十五分鐘出現一次短脈衝；107.4 只有連續白噪音。',q:'先鎖定哪個頻率？',a:'104.7 MHz',o:['107.4 MHz','88.1 MHz','104.7 MHz','全部同時掃描']},
 {clue:'機殼旁寫著「先讓訊號有路，再讓電流有路」。紅線旁則有燒焦痕跡。',q:'正確接續順序？',a:'展開天線 → 接地 → 裝入電池',o:['裝入電池 → 展開天線 → 接地','展開天線 → 接地 → 裝入電池','接紅線到機殼 → 裝電池','先按發話鍵 → 再接地']},
 {clue:'短脈衝為三短、兩長、一短。紙條背面寫著：「不要說姓名；回覆樓號、人數、傷患。」',q:'應如何回覆？',a:'理化五樓，四人，無咬傷',o:['落雨，心理系，請立刻救援','理化五樓，四人，無咬傷','有人嗎？收到請回答','持續按住發話鍵播放聲音']}
 ];const draw=()=>{const x=data[step];p.innerHTML=`<div class="panel-head"><div><span>不明通訊設備 · ${step+1}／3</span><h2>${x.q}</h2></div></div><div class="puzzle-body"><p class="clue">${x.clue}</p><div class="puzzle-actions puzzle-grid">${shuffle(x.o).map(v=>`<button data-radio="${v===x.a?'ok':'bad'}">${v}</button>`).join('')}</div><p class="sequence">錯誤接線會耗掉僅存的電力。</p></div>`;$$('[data-radio]').forEach(b=>b.onclick=()=>{if(b.dataset.radio==='ok'){step++;if(step===data.length){S.broadcaster=true;S.items.push('舊式手提廣播器');S.solved.broadcast=1;p.classList.add('hidden');return run([
 ['phone','「……收到。保持設備關機。第七日清晨，若航線未封鎖，將巡過理化樓頂。」'],['hero','聲音只維持四秒就被雜訊吞沒。短得像幻覺，卻讓房間裡每個人的呼吸都停了一拍。'],[partner,`「先別把它叫希望。」${C[partner].name}接過金屬箱，「叫撤離方案。」`],['narrator','他們沒有慶祝，只把那只箱子包進兩層防水布。真正重要的東西，往往要假裝得不重要。']
 ],()=>day4Normal(partner))}draw()}else{S.hp=Math.max(1,S.hp-6);ui();sfx('alarm');triggerRed();toast('尖銳雜訊洩出，電量正在流失');draw()}})};draw()}
function day6(){panelClose();S.day=6;S.phase='day6';S.time='第六日 · 16:30';S.objective='穿過工程館地下管線，準備最終撤離';bg('archive');ui();run([['narrator','第六天，感染者學會在聲音消失後繼續追逐。人也學會了不必說話就知道彼此要往哪裡。'],['junior','李明朗抬起三根手指。三隻。'],['senior','溫晨點向左側。'],['professor','許安在掌心寫下十二秒。'],['hero','落雨看見他們的恐懼，也看見恐懼不再各自為政。']],hub)}
function tunnelRun(){rpg('高速變異者 A',()=>rpg('高速變異者 B',()=>{S.solved.tunnel=1;hub()}))}
function generatorRun(){run([['narrator','備用發電室裡，他們把最後一顆手機電池拆給廣播器。'],['junior','「以前我覺得沒電就是世界末日。」'],['professor','「現在只是世界末日的一項小問題。」'],['senior','「兩位笑完就搬電池。」']],()=>{S.solved.generator=1;hub()})}
function day7(){panelClose();S.day=7;S.phase='final';S.time='第七日 · 05:48';S.objective='突破 K-01 的狩獵範圍';bg('stadium');ui();run([
 ['narrator','第七天，K-01 沿著看台陰影移動。它仍有人的輪廓，只是速度把那輪廓撕成一道道殘影。'],['professor','「別叫牠怪物。牠是感染者，也是我們可能變成的樣子。」'],['hero','牠先讀聲音，再讀光，最後開始讀人的習慣。'],['hero','「那就讓牠看見一群不再照習慣行動的人。」']
 ],()=>cg('mutant',()=>rpg('K-01 變異感染者',finale)))}
function finale(){if(S.broadcaster)return helicopter();run([['senior','「燃料圈完成。所有人一起走，沒有人殿後。」'],['hero','音響反覆播放心跳，屍群追向錯誤的神明。'],['narrator','火在身後開成過分明亮的花。四個人穿過東門時，校園終於不再發出飢餓的聲音。']],()=>cg('fire',()=>ending(false)))}
function helicopter(){const k=topBond(),c=C[k];run([['narrator','廣播器裡傳來人聲時，四個人都以為那是幻聽。'],['phone','救援機將於七分鐘後經過理化樓頂。只停留九十秒。'],['senior','「上樓。現在。」'],['narrator','旋翼撕開晨霧。七天以來第一次，風聲不是某種東西追來，而是有人來接他們。']],()=>cg('helicopter',()=>ending(true,k,c)))}
function topBond(){return Object.entries(S.aff).sort((a,b)=>b[1]-a[1])[0][0]}
function ending(secret,k=topBond(),c=C[k]){musicSet('ending');setScreen(false);$('#ending').classList.remove('hidden');const future={junior:'數月後，李明朗把修好的耳機分她一邊。「這次不會走丟了吧？」落雨扣住他的手：「你要是少說兩句難聽的，大概不會。」',senior:'溫晨最後仍去了國外。登機前她問：「這次還要替我決定結局嗎？」落雨握緊她：「不了。害怕的時候，我會先告訴妳。」',professor:'許安把研究報告署上兩人的名字。「人不是穩定變數。」他說。落雨替他推回滑落的眼鏡：「所以教授臉紅這筆資料，不能刪。」'}[k];$('#ending').innerHTML=`<div class="ending-card"><h2>${secret?'晨光航線':'焚盡封鎖線'}</h2><h3>${secret?`${c.name} · 個人隱藏結局`:'四人逃離 · 一般 HE'}</h3><p>${secret?'廣播器讓四人等到直升機。校園在下方縮成一張濕透的地圖，而活下來的人終於有資格談明天。':'四個人靠自己的腳穿過封鎖線。沒有奇蹟，只有七天裡一次次沒有鬆開的手。'}</p><p>${secret?future:''}</p><button id="endingGallery">CG 回放</button> <button onclick="location.reload()">返回標題</button></div>`;$('#endingGallery').onclick=()=>openGallery()}
function openGallery(){panelClose();$('#galleryPanel').classList.remove('hidden');const u=new Set([...gallery(),...S.unlocked]);$('#galleryGrid').innerHTML=Object.entries(CG).map(([k,c])=>`<button class="gallery-item ${u.has(k)?'':'locked'}" data-cg="${k}" ${u.has(k)?'':'disabled'}><img src="${u.has(k)?c[0]:B.archive}" alt=""><span><b>${u.has(k)?c[1]:'尚未解鎖'}</b><small>${u.has(k)?c[2]:'繼續七日生存篇'}</small></span></button>`).join('');$$('[data-cg]:not(:disabled)').forEach(b=>b.onclick=()=>{const fromEnding=!$('#ending').classList.contains('hidden');panelClose();if(fromEnding){$('#ending').classList.add('hidden');setScreen(true)}cg(b.dataset.cg,()=>{if(fromEnding){setScreen(false);$('#ending').classList.remove('hidden')}openGallery()})})}
function save(){localStorage.setItem(KEY,JSON.stringify(S));toast('七日篇進度已儲存')}
function load(){const r=localStorage.getItem(KEY);if(!r)return toast('找不到新版七日篇存檔');const raw=JSON.parse(r);S={...fresh(),...raw,aff:{...fresh().aff,...raw.aff},solved:{...raw.solved},bondEvents:{...raw.bondEvents}};if(S.phase==='day3'&&S.day3Partner&&!S.bondEvents.day3)S.day3Partner=null;ui();bg(S.location);if(S.phase==='library')libraryHub();else if(['day3','day5','day6'].includes(S.phase))hub();else if(S.phase==='escape')day2();else if(S.phase==='day4')day4();else if(S.phase==='final')day7()}
$('#newGameBtn').onclick=start;$('#continueBtn').onclick=load;$('#chapterBtn').onclick=()=>{musicSet('title');panelClose();$('#chapterPanel').classList.remove('hidden');$('#chapterPanel .close-btn').focus()};$('#chapterStartBtn').onclick=()=>{$('#chapterPanel').classList.add('hidden');start()};$('#nextBtn').onclick=advance;$('#mapBtn').onclick=openMap;$('#galleryBtn').onclick=openGallery;$('#bondBtn').onclick=()=>{panelClose();$('#bondPanel').classList.remove('hidden');$('#bondList').innerHTML=Object.entries(S.aff).map(([k,v])=>`<div class="bond-item"><b>${C[k].name}</b><span>${C[k].role}</span><div class="bond-meter"><i style="width:${Math.min(100,10+v*14)}%"></i></div></div>`).join('')};$('#inventoryBtn').onclick=()=>{panelClose();$('#inventoryPanel').classList.remove('hidden');$('#inventoryList').innerHTML=S.items.map(x=>`<div class="inventory-item"><b>${x}</b></div>`).join('')};$('#saveBtn').onclick=()=>{panelClose();$('#savePanel').classList.remove('hidden');$('#saveSummary').textContent=`第 ${S.day} 日｜${S.time}｜生命 ${S.hp}｜${localStorage.getItem(KEY)?'已有存檔':'尚未存檔'}`;$('#loadSaveBtn').disabled=!localStorage.getItem(KEY)};$('#writeSaveBtn').onclick=save;$('#loadSaveBtn').onclick=load;$('#titleBtn').onclick=()=>location.reload();$('#soundBtn').onclick=()=>{sound=!sound;$('#soundBtn').textContent=`聲音：${sound?'開':'關'}`;$('#soundBtn').setAttribute('aria-pressed',String(sound));if(!sound)return musicStop();const scene=!$('#ending').classList.contains('hidden')?'ending':!$('#gameScreen').classList.contains('hidden')?sceneForLocation(S.location):'title';musicSet(scene)};$$('[data-close]').forEach(b=>b.onclick=()=>b.closest('.panel').classList.add('hidden'));document.body.dataset.gameBoot='bound';
