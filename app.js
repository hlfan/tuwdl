let $=(s,i=document)=>i.querySelector(s),
	$_=(s,f=l=>l)=>[...$(s).children].filter(f),
	a2o=(a,s,r)=>$(s,r).append(a),
	d=(...l)=>new Date(...l),
	j=()=>new Date(),
	o=(l,e,a)=>l.addEventListener(e,a),
	cd=n=>!n||d(...n.v.slice(5,-1).split(',')),
	fmt=document.createDocumentFragment(),
	texts=$('html').lang==='de'?' Tagen,einem Tag ,Zur Tabelle,Filter merken,Filter zurücksetzen':' days,a day ,to the table,save filter,restore filter',
	toggl=document.createDocumentFragment(),
	sfy="FullYear,Month,Date".split(',').map(v=>'get'+v),
	svo=$('style').textContent,rush=!1,hcl='',uth=[],
	hchars='0123456789bcdfghjklmnpqrstvwxyz ',
	bchars='ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/',
	iarr=i=>(c=i.length.toString(2).length-1,Object.entries(i).map(l=>[l[1],('0'.repeat(c)+(l[0]>>0).toString(2)).slice(-c)])),
	hobj=Object.fromEntries(iarr(hchars)),
	bobj=Object.fromEntries(iarr(bchars).map(l=>l.reverse())),
	filters=JSON.parse(localStorage.filters||'{}'),
	done=JSON.parse(localStorage.done||'[]');
texts=texts.split(',');
$('aside a').href=$('script[src*="gviz"]').src.split('gviz')[0]+'edit';
$('aside a').textContent=texts[2];
$('aside label').title=texts[3];
$('aside span').title=texts[4];
toggl.append($('input'));
toggl.append($('label'));
fmt.append($('section input'));
fmt.append($('section label'));
$('#save').checked=JSON.stringify(filters)!='{}';
fd=[
	['Sans','Mono'],
	[{n:'Regular'},{n:'Bold',i:700}],
	[{n:'woff2'},{n:'woff'},{n:'ttf',long:"'truetype'"}],
	'//www.redditstatic.com/mona-lisa/assets/fonts/Reddit'];
fd[1]=fd[0].map((width)=>
	fd[1].map((weight)=>
		({width,weight})
	)
).flat();
fd[1]=fd[1].map((font)=>
	`@font-face{font-family:"Reddit ${font.width}";src:${
		fd[2].map((format)=>
			`url("${fd[3]+font.width}-${font.weight.n}.${format.n}") format(${format.long||`"${format.n}"`})`
		).join(`,`)+(font.weight.i?`;font-weight:`+font.weight.i:'')
	};}`
).join('');
o($('#save'),'change',saveFilter);
o($('aside span'),'click',()=>{delete localStorage.filters;delete localStorage.done});
s=navigator.serviceWorker;if(s)s.register('sw.js');

if(JSON.stringify(resp)=='{}'){
	google.visualization.Query.setResponse=q=>{resp=q;init(q)}
}else{
	init(resp)};

function f(timestamp){
	let time=timestamp-j(),
		count=d(time).toJSON().slice(11,-5),
		days=time/27e5>>5;
	if(time<0)setTimeout(()=>init(resp));
	rush|=days<2;
	count=days>1?days+texts[0]:days>0?texts[1]+count:count;
	return'in '+count
}
function hashDL(row){
	let binS='',blocks=[],
		term=row[11].v.slice(4);
	binS+=(row[5].v=='TRUE')*1;
	binS+=('0'.repeat(20)+(row[3].v*1).toString(2)).slice(-19);
	binS+=((row[11].v.slice(0,4)-2020)*2+['S','W'].indexOf(term)).toString(2);
	binS+=[...row[2].v.toLowerCase().replaceAll(/\b\W+?\b/g,' ')].map(l=>hobj[l]).join('');
	let p=(binS+'0'.repeat(6)).slice(0,-binS.length%6||9**9);
	for(let i=0;i<p.length;i+=6)
		blocks.push(p.slice(i,i+6))
	return blocks.map(l=>bobj[l]).join('');
}
function saveFilter(){
	if(!$('#save').checked)return;
	$_('main',l=>l.id).forEach(l=>filters[l.id]=l.checked);
	localStorage.filters=JSON.stringify(filters);
	done=$_('section',l=>l.checked).map(l=>l.id);
	localStorage.done=JSON.stringify(done);
}
function update(){
	rush=!1;
	for(let i in list){
		ntxt=f(list[i].d);
		el=$('.days',$_('section')[1+2*i]);
		if(el.innerText!=ntxt)el.innerText=ntxt;
	}
	let delay=1005-j()%1e3;
	if(!rush){
		delay=list.map(l=>d(l.d).setFullYear(...sfy.map(v=>j()[v]())));
		delay=delay.map(n=>n>j()?n:d(n).setDate(d(n).getDate()+1));
		delay=d([...new Set([...delay,...list.map(l=>l.e)])].sort()[0]);
		delay-=j();
	}
	let i=(Math.round(performance.now()%1e3*1e3)/1e6).toString().slice(2);
	uth[i]=1+uth[i]||1;
	setTimeout(()=>update(),delay);
}
function init(q){
	list=q.table.rows;
	list.forEach(l=>(l.d=cd(l.c[0]),l.e=cd(l.c[1])));
	list=list.filter(l=>Math.max(l.d,l.e)>j());
	lvas=[...new Set(list.map(l=>l.c[6].v))].sort().reverse();
	$('section').innerHTML="";
	for(let l of list){
		dl=fmt.cloneNode(!0);
		zt=l.c[0].f.replace('. ',' ').split(' ');
		hash=hashDL(l.c);
		a2o(zt[0],'.day',dl);
		a2o(zt[1],'.date',dl);
		a2o(zt[2],'.time',dl);
		a2o(l.c[6].v,'.lva',dl);
		a2o(l.c[2].v,'.name',dl);
		$('a',dl).href=l.c[12].v.replace(/(?:https?:)?\/\/rebrand\.ly/,'go');
		a2o(f(l.d),'.days',dl);
		dl.lastChild.classList.add(l.c[6].v);
		if(l.c[5].v=='TRUE')dl.lastChild.classList.add('pruefung');
		if(l.e>j())dl.lastChild.classList.add('soon');
		dl.firstChild.id=hash;
		dl.lastChild.htmlFor=hash;
		dl.firstChild.ariaLabel=hash;
		dl.lastChild.title=((l.c[14]?.v||'')+' '+(l.c[7]?.v||'')).trim();
		o(dl.firstChild,'change',saveFilter);
		$('section').append(dl);
	}
	$_('main',l=>l.hasAttributes()).forEach(l=>{l.remove()});
	for(let l of lvas){
		lb=toggl.cloneNode(!0);
		lb.firstChild.id=l;
		lb.lastChild.htmlFor=l;
		lb.firstChild.ariaLabel=l;
		hcl+=`#${l}:checked~section .${l},`;
		o(lb.firstChild,'change',saveFilter);
		$('main').prepend(lb);
	}
	$('style').textContent=hcl+svo+fd[1];
	if(JSON.stringify(filters)!='{}')
		$_('main',l=>l.id).forEach(l=>(filters[l.id]+1)?l.checked=filters[l.id]:l);
	if(JSON.stringify(done)!='[]')
		$_('section',l=>l.id).forEach(l=>l.checked=done.includes(l.id));
	update();
}
